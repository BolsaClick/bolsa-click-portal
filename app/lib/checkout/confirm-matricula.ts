import { prisma } from '@/app/lib/prisma'
import { getCheckoutStatus } from '@/app/lib/api/checkout-status'
import {
  createInscription,
  getCognaErrorMessage,
  getCognaErrorDetails,
  type CreateInscriptionRequest,
} from '@/app/lib/api/create-inscription'
import {
  createMarketplaceInscription,
  type MarketplaceInscriptionData,
} from '@/app/lib/api/create-inscription-marketplace'
import type { OfferDetails } from '@/app/lib/api/get-offer-details'
import { sendUtmifyOrder, paymentMethodToUtmify } from '@/app/lib/api/utmify'
import { capturePostHogServerEvent } from '@/app/lib/analytics/posthog-server'
import { upsertCandidato } from '@/app/lib/api/attio'
import { isServerFlagEnabled } from '@/app/lib/analytics/server-flags'
import { refundElysiumCharge } from '@/app/lib/api/elysium-refund'

/**
 * Confirmação do checkout Cogna/ATHENAS (`/checkout/matricula`): a taxa de
 * matrícula do Bolsa Click (R$ 19,90, ver `taxa-cogna.ts`) é cobrada ANTES e a
 * inscrição na Cogna — e a do marketplace — só acontece AQUI, depois de o
 * pagamento confirmar.
 *
 * Irmã de `confirm-estacio.ts`, com o mesmo desenho: claim atômico em chave
 * própria no metadata (`cognaClaimedAt`), resultado persistido
 * (`confirmResult`) e estorno quando o parceiro recusa.
 *
 * Chamada pelos DOIS caminhos de confirmação, via `confirm-payment.ts`:
 *  - webhook do Elysium (`/api/payments/webhook`) — funciona com a aba fechada;
 *  - polling do cliente (`/api/checkout/matricula/confirm`) — acelera o tab-open.
 */

/**
 * Metadata.checkoutFlow que marca uma Transaction como do fluxo Cogna.
 *
 * `confirm-payment.ts` continua mandando para cá tudo que NÃO é 'estacio' —
 * este valor é explícito para telemetria e leitura do metadata, não para mudar
 * o roteamento.
 */
export const COGNA_MATRICULA_CHECKOUT_FLOW = 'cogna_matricula'

/**
 * Dados montados no checkout (cliente) e guardados em Transaction.metadata.confirm
 * para que a confirmação de pagamento — server-side, no webhook OU no polling do
 * cliente — consiga criar a inscrição e atualizar o CRM sem depender do navegador.
 */
export interface MatriculaConfirmBlob {
  inscriptionPayload: CreateInscriptionRequest
  marketplace?: { data: MarketplaceInscriptionData; offerDetails: OfferDetails } | null
  utmify?: {
    productId: string
    productName: string
    tracking?: {
      utmSource: string | null
      utmMedium: string | null
      utmCampaign: string | null
      utmContent: string | null
      utmTerm: string | null
      src: string | null
      sck: string | null
    } | null
  }
}

export interface ConfirmResult {
  ok: boolean
  status?: string
  alreadyDone?: boolean
  reason?: string
  /** Id da inscrição no parceiro — a tela de sucesso gera o payment-link com ele. */
  inscriptionId?: string | null
  /** Preenchidos só quando a Cogna recusa depois do pagamento. */
  errorCode?: string | null
  refunded?: boolean
}

const PROMOTER_ID = process.env.NEXT_PUBLIC_PROMOTER_ID || '6716698cb4d33b0008a18001'

/**
 * Janela depois da qual um claim sem resultado é considerado órfão.
 *
 * Cenário real: o processo morre (timeout da função, deploy) entre o claim
 * atômico e a gravação do resultado. Sem isto a transação ficaria PAID, sem
 * inscrição e sem estorno — para sempre, porque o claim nunca mais é vencido.
 * Passados 5 minutos, a próxima confirmação (webhook em retry ou o cliente)
 * refaz a inscrição. Repetir é seguro: a Cogna recusa CPF já inscrito na mesma
 * oferta, e essa recusa é tratada como sucesso (ver `isJaInscritoNaCogna`).
 */
const CLAIM_ORFAO_MS = 5 * 60 * 1000

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

/**
 * "CPF já inscrito nesta oferta" NÃO é falha: é a resposta esperada quando uma
 * segunda confirmação (webhook em retry, claim órfão reassumido) refaz a
 * inscrição que já existe. Tratar como recusa aqui estornaria a taxa de alguém
 * que ESTÁ inscrito.
 *
 * A Cogna não expõe código de erro estável para isso — o que chega é a
 * mensagem. Por isso o casamento é por texto, conservador: qualquer coisa que
 * não bata cai no caminho de recusa (que estorna), nunca o contrário.
 */
function isJaInscritoNaCogna(mensagem: string | undefined): boolean {
  if (!mensagem) return false
  const normalizada = mensagem
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  return (
    normalizada.includes('ja possui inscricao') ||
    normalizada.includes('ja esta inscrito') ||
    normalizada.includes('ja inscrito') ||
    normalizada.includes('inscricao ja existe') ||
    normalizada.includes('inscricao existente')
  )
}

/**
 * Assume a inscrição desta transação de forma ATÔMICA, carimbando
 * `cognaClaimedAt`. Devolve true só para quem ganhou.
 *
 * Assume quando NINGUÉM está dentro dela: sem marca de claim (a transação
 * virou PAID por fora — sync de status, ajuste no admin — e nenhuma
 * confirmação está rodando), ou marca velha o bastante para ser órfã.
 *
 * É compare-and-swap em SQL de propósito. A versão óbvia — ler o metadata,
 * decidir em JS, depois escrever — NÃO é um claim: dois callers que leem "sem
 * claim" no mesmo instante passam os dois e inscrevem o candidato duas vezes.
 * O webhook e o polling do cliente chegando juntos é exatamente isso. Um único
 * UPDATE com a condição no WHERE trava a linha e elege um só.
 *
 * `jsonb_set` altera apenas esta chave, então metadata escrito em paralelo por
 * outro caminho não é sobrescrito — o que o spread em JS faria.
 */
async function assumirClaim(txId: string, externalTransactionId: string): Promise<boolean> {
  const agora = new Date()
  const corte = new Date(agora.getTime() - CLAIM_ORFAO_MS).toISOString()
  try {
    const linhas = await prisma.$executeRaw`
      UPDATE "Transaction"
      SET metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{cognaClaimedAt}',
        to_jsonb(${agora.toISOString()}::text),
        true
      )
      WHERE id = ${txId}
        AND (
          metadata->>'cognaClaimedAt' IS NULL
          OR metadata->>'cognaClaimedAt' < ${corte}
        )
    `
    if (linhas === 1) {
      console.warn(
        '⚠️ confirm-matricula: transação paga sem inscrição — assumindo e criando a inscrição',
        { externalTransactionId },
      )
      return true
    }
    return false
  } catch (e) {
    // Sem claim não há garantia de execução única: devolver `pending` (webhook
    // e cliente repetem) é melhor que arriscar inscrição em dobro.
    console.error('⚠️ confirm-matricula: falha ao assumir o claim', externalTransactionId, e)
    return false
  }
}

async function persistResult(
  txId: string,
  metadata: Record<string, unknown>,
  result: ConfirmResult,
): Promise<void> {
  try {
    await prisma.transaction.update({
      where: { id: txId },
      data: { metadata: { ...metadata, confirmResult: result } as object },
    })
  } catch (e) {
    // Não é cosmético: sem o resultado gravado, uma segunda confirmação pode
    // refazer a inscrição depois da janela de claim órfão.
    console.error('🚨 confirm-matricula: falha ao persistir confirmResult', txId, e)
  }
}

/**
 * Confirma o pagamento da taxa (idempotente) e só então cria a inscrição na
 * Cogna. Recusa do parceiro → estorno best-effort + CRM `inscricao_recusada`.
 *
 * Idempotência em duas camadas (mesmo desenho de `confirm-estacio`):
 *  1. Claim atômico `status != PAID → PAID` — só um caller passa daqui para os
 *     efeitos colaterais, mesmo com webhook e polling chegando juntos.
 *  2. Resultado persistido em `metadata.confirmResult` — qualquer chamada
 *     posterior devolve o mesmo resultado sem tocar na Cogna de novo.
 *
 * NUNCA fazer o cliente deste fluxo pollar `/api/checkout/status/[id]`: aquela
 * rota sincroniza o status local para PAID e roubaria o claim, deixando a
 * inscrição sem ninguém para criá-la.
 */
export async function confirmPaidMatricula(
  externalTransactionId: string,
  opts?: { trustPaid?: boolean }
): Promise<ConfirmResult> {
  const tx = await prisma.transaction.findFirst({ where: { externalTransactionId } })
  if (!tx) return { ok: false, reason: 'not_found' }

  const metadata = asObject(tx.metadata)
  const existing = metadata.confirmResult as ConfirmResult | undefined

  // Já processado (por esta ou por outra chamada) — devolve o mesmo resultado.
  if (existing) return { ...existing, alreadyDone: true }

  if (tx.status !== 'PAID') {
    // Fonte da verdade do pagamento: Elysium (salvo quando o webhook é confiável).
    if (!opts?.trustPaid) {
      try {
        const s = await getCheckoutStatus(externalTransactionId)
        const paid = String(s.status).toUpperCase() === 'PAID' || s.paid === true
        if (!paid) return { ok: false, status: 'PENDING' }
      } catch {
        return { ok: false, status: 'PENDING' }
      }
    }

    // Claim atômico: só um caller passa daqui para os efeitos colaterais.
    const claim = await prisma.transaction.updateMany({
      where: { externalTransactionId, status: { not: 'PAID' } },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        metadata: { ...metadata, cognaClaimedAt: new Date().toISOString() } as object,
      },
    })

    if (claim.count === 0) {
      // Perdemos a corrida: outra chamada está processando agora (ou acabou de
      // processar). Devolve o resultado se já existir; senão o cliente repete.
      const fresh = await prisma.transaction.findFirst({ where: { externalTransactionId } })
      const freshResult = asObject(fresh?.metadata).confirmResult as ConfirmResult | undefined
      if (freshResult) return { ...freshResult, alreadyDone: true }
      if (!(await assumirClaim(tx.id, externalTransactionId))) {
        return { ok: false, status: 'PENDING' }
      }
    }
  } else if (!(await assumirClaim(tx.id, externalTransactionId))) {
    // Já PAID e sem resultado: ou outra chamada está dentro da inscrição agora,
    // ou o claim falhou. Nos dois casos o certo é o caller repetir.
    //
    // Este ramo é o buraco que o claim `status != PAID → PAID` sozinho não
    // cobre: quando a linha já chega PAID por outro caminho, `claim.count` é 0
    // para TODOS os callers e ninguém inscreveria nunca.
    return { ok: false, status: 'PENDING' }
  }

  const cpfDigits = tx.cpf.replace(/\D/g, '')
  const phoneDigits = tx.phone.replace(/\D/g, '')
  const blob = metadata.confirm as MatriculaConfirmBlob | undefined
  const offerDetails = blob?.marketplace?.offerDetails

  // PostHog: taxa paga (distinto de "inscrição criada" — a Cogna ainda pode
  // recusar, e nesse caso a taxa volta).
  try {
    await capturePostHogServerEvent({
      event: 'cogna_taxa_paid',
      distinctId: cpfDigits,
      eventId: `${externalTransactionId}_paid`,
      properties: {
        transaction_id: externalTransactionId,
        value: tx.amountInCents / 100,
        currency: 'BRL',
        course_name: tx.courseName || offerDetails?.course || null,
        brand: offerDetails?.brand || null,
        payment_method: tx.paymentMethod,
        flow: COGNA_MATRICULA_CHECKOUT_FLOW,
      },
    })
  } catch (e) {
    console.error('⚠️ confirm-matricula: PostHog cogna_taxa_paid falhou', externalTransactionId, e)
  }

  // ── Sem blob: pagamos e não sabemos o que inscrever → estorna ───────────
  if (!blob?.inscriptionPayload) {
    console.error('🚨 confirm-matricula: taxa paga sem blob de inscrição', externalTransactionId)
    const refund = await refundElysiumCharge(externalTransactionId)
    const result: ConfirmResult = {
      ok: false,
      status: 'REFUSED',
      reason:
        'Cobrança confirmada, mas faltam os dados da inscrição. Nosso time foi avisado e a taxa será devolvida.',
      errorCode: null,
      refunded: refund.ok,
      inscriptionId: null,
    }
    await persistResult(tx.id, metadata, result)
    return result
  }

  // ── 1) Inscrição na Cogna (Tartarus), a partir do payload salvo ─────────
  let inscriptionId: string | null = null
  let recusa: { message: string; errorCode: string | null } | null = null

  try {
    const r = await createInscription(blob.inscriptionPayload, PROMOTER_ID, 'DC')
    if (r.success || r.id) {
      inscriptionId = r.id ?? null
      console.log('✅ confirm-matricula: inscrição criada', { externalTransactionId, id: r.id })
    } else {
      recusa = { message: 'A instituição não confirmou a inscrição.', errorCode: null }
    }
  } catch (e) {
    const cognaMsg = getCognaErrorMessage(e)
    const detalhes = getCognaErrorDetails(e)
    const mensagem = cognaMsg ?? (e instanceof Error ? e.message : String(e))

    if (isJaInscritoNaCogna(mensagem)) {
      // Repetição da mesma inscrição (claim órfão reassumido, webhook em
      // retry). Não é recusa: a pessoa está inscrita. Segue como sucesso, sem
      // `inscriptionId` — a tela de sucesso trata a ausência dele.
      console.warn(
        '⚠️ confirm-matricula: CPF já inscrito nesta oferta — tratando como sucesso',
        { externalTransactionId, mensagem },
      )
    } else {
      console.error('❌ confirm-matricula: inscrição recusada', externalTransactionId, e)
      recusa = { message: mensagem, errorCode: detalhes.status ? String(detalhes.status) : null }
    }
  }

  // ── Recusa: estorna a taxa e registra no CRM ────────────────────────────
  if (recusa) {
    const refund = await refundElysiumCharge(externalTransactionId)

    try {
      await upsertCandidato({
        phone: phoneDigits,
        name: tx.name,
        email: tx.email,
        cpf: cpfDigits,
        brand: offerDetails?.brand,
        courseName: offerDetails?.course || blob?.utmify?.productName,
        modality: offerDetails?.modality,
        city: offerDetails?.unitCity,
        estagio: 'inscricao_recusada',
        origemFluxo: 'checkout-matricula',
        motivoRecusa: `Taxa paga (R$ ${(tx.amountInCents / 100).toFixed(2)}), inscrição recusada pela Cogna${
          recusa.errorCode ? ` (${recusa.errorCode})` : ''
        }: ${recusa.message}. Estorno ${
          refund.ok ? 'confirmado no Elysium' : 'FALHOU — estornar manualmente no gateway'
        }.`,
        taxaPaga: new Date(),
        shift: offerDetails?.shift,
        monthlyPrice: offerDetails?.montlyFeeTo,
        enrollmentFee: offerDetails?.subscriptionValue,
      })
    } catch (e) {
      console.error('❌ confirm-matricula: Attio (recusa) falhou', externalTransactionId, e)
    }

    try {
      await capturePostHogServerEvent({
        event: 'cogna_enrollment_refused',
        distinctId: cpfDigits,
        eventId: `${externalTransactionId}_refused`,
        properties: {
          transaction_id: externalTransactionId,
          error_code: recusa.errorCode,
          error_message: recusa.message,
          refunded: refund.ok,
          course_name: offerDetails?.course || null,
          course_id: offerDetails?.courseId || null,
          brand: offerDetails?.brand || null,
          flow: COGNA_MATRICULA_CHECKOUT_FLOW,
        },
      })
    } catch (e) {
      console.error(
        '⚠️ confirm-matricula: PostHog cogna_enrollment_refused falhou',
        externalTransactionId,
        e,
      )
    }

    const result: ConfirmResult = {
      ok: false,
      status: 'REFUSED',
      reason: recusa.message,
      errorCode: recusa.errorCode,
      refunded: refund.ok,
      inscriptionId: null,
    }
    await persistResult(tx.id, metadata, result)
    return result
  }

  // ── 2) Marketplace ATHENAS ──────────────────────────────────────────────
  //
  // Mesma condição que ficava no cliente antes de a cobrança entrar na frente
  // (`isAthenasSource && offerDetails?.idDmhElastic`), agora avaliada sobre o
  // `offerDetails` persistido no blob — o navegador pode já ter fechado.
  //
  // Kill switch (decisão de negócio, 2026-08): createMarketplaceInscription
  // está DESATIVADA — ela duplicava a inscrição na Cogna para ofertas ATHENAS
  // (uma via createInscription, logo acima, + outra via
  // marketplace/canalVendas.id=141). Nasce OFF; religa subindo a flag PostHog
  // 'marketplace_enabled' pra 100%. NÃO apagar createMarketplaceInscription
  // nem o endpoint — só parar de chamar enquanto a flag está off.
  const isAthenasSource = offerDetails?.dmhSource?.source === 'ATHENAS'
  let marketplaceCreated = false

  if (blob.marketplace?.data && isAthenasSource && offerDetails?.idDmhElastic) {
    const marketplaceEnabled = await isServerFlagEnabled('marketplace_enabled', false)
    if (marketplaceEnabled) {
      try {
        const m = await createMarketplaceInscription(blob.marketplace.data, offerDetails)
        marketplaceCreated = m.success
        if (!m.success) {
          console.error('⚠️ confirm-matricula: marketplace ATHENAS falhou', {
            externalTransactionId,
            error: m.error,
          })
        }
      } catch (e) {
        console.error('❌ confirm-matricula: marketplace ATHENAS falhou', externalTransactionId, e)
      }
    }

    // Evento preservado do fluxo antigo (era client-side em
    // createInscriptionAfterPayment). Sai do servidor agora porque é aqui que a
    // chamada acontece; sem isto, desligar a cobrança no cliente teria apagado
    // o sinal do marketplace do PostHog.
    if (marketplaceCreated) {
      try {
        await capturePostHogServerEvent({
          event: 'marketplace_inscription_created',
          distinctId: cpfDigits,
          eventId: `${externalTransactionId}_marketplace`,
          properties: {
            transaction_id: externalTransactionId,
            course_id: offerDetails.courseId,
            course_name: offerDetails.course,
            idDmhElastic: offerDetails.idDmhElastic,
            source_side: 'server',
            flow: COGNA_MATRICULA_CHECKOUT_FLOW,
          },
        })
      } catch (e) {
        console.error(
          '⚠️ confirm-matricula: PostHog marketplace_inscription_created falhou',
          externalTransactionId,
          e,
        )
      }
    }
  }

  // ── 3) CRM: estágio "inscrito" + a data do pagamento da taxa ────────────
  //
  // NÃO é "matriculado": pagar a taxa aqui não faz a pessoa ser aluna. Quem
  // confirma a matrícula é o parceiro, e isso vai chegar por reconciliação.
  // Marcar matriculado aqui inflaria o número e tiraria das campanhas de
  // ativação justamente quem pagou e não se matriculou.
  try {
    await upsertCandidato({
      phone: phoneDigits,
      name: tx.name,
      email: tx.email,
      cpf: cpfDigits,
      brand: offerDetails?.brand,
      courseName: offerDetails?.course || blob?.utmify?.productName,
      modality: offerDetails?.modality,
      city: offerDetails?.unitCity,
      estagio: 'inscrito',
      origemFluxo: 'checkout-matricula',
      taxaPaga: new Date(),
      // Número da inscrição no parceiro: é a chave que permite consultar o
      // pagamento depois e cobrar quem ficar pelo caminho.
      //
      // `business_key` fica de fora de propósito. O `offerDetails.businessKey`
      // é a chave da OFERTA, não da inscrição — a da inscrição tem o formato
      // CPF_<cpf>_OFFER_..._TIMESTAMP_... e só existe na resposta do parceiro.
      // Mandar a da oferta aqui encheria o campo com um valor que o endpoint
      // de cobrança recusa, e o erro só apareceria na hora de cobrar.
      inscriptionId: inscriptionId ?? undefined,
      shift: offerDetails?.shift,
      monthlyPrice: offerDetails?.montlyFeeTo,
      enrollmentFee: offerDetails?.subscriptionValue,
      inscribedAt: new Date(),
    })
  } catch (e) {
    console.error('❌ confirm-matricula: Attio falhou', externalTransactionId, e)
  }

  // ── 4) UTMify — pedido pago (atribuição/Orders) ─────────────────────────
  //
  // Depois da inscrição aceita, de propósito: um pedido cuja taxa foi
  // estornada não é receita, e contá-lo faria a atribuição comprar mídia
  // baseada em venda que não existiu.
  try {
    const t = blob?.utmify?.tracking
    await sendUtmifyOrder({
      orderId: externalTransactionId,
      paymentMethod: paymentMethodToUtmify(tx.paymentMethod),
      status: 'paid',
      createdAt: tx.createdAt,
      approvedDate: new Date(),
      customer: {
        name: tx.name,
        email: tx.email,
        phone: phoneDigits || null,
        document: cpfDigits,
      },
      products: [
        {
          id: blob?.utmify?.productId || tx.courseId || externalTransactionId,
          name: blob?.utmify?.productName || tx.courseName || 'Taxa da plataforma',
          quantity: 1,
          priceInCents: tx.amountInCents,
        },
      ],
      trackingParameters: t
        ? {
            utm_source: t.utmSource,
            utm_medium: t.utmMedium,
            utm_campaign: t.utmCampaign,
            utm_content: t.utmContent,
            utm_term: t.utmTerm,
            src: t.src,
            sck: t.sck,
          }
        : undefined,
      commission: { totalPriceInCents: tx.amountInCents },
    })
  } catch (e) {
    console.error('❌ confirm-matricula: UTMify falhou', externalTransactionId, e)
  }

  // ── 5) Meta — Purchase REMOVIDO daqui de propósito (2026-09-10) ─────────
  //
  // Até aqui, o Purchase ia pro Meta CAPI por este arquivo E pelo navegador
  // (MatriculaCheckoutClient.tsx), com o MESMO event_id (externalTransactionId)
  // — a Meta dedupava os dois como uma venda só. Isso mudou quando a UTMify
  // ligou a integração dela com o Meta Ads no mesmo pixel (3830716730578943):
  // ela manda o PRÓPRIO Purchase pro CAPI a partir do pedido que o item (4)
  // acima já envia (sendUtmifyOrder, status 'paid') — com um event_id gerado
  // por ela, que NUNCA vai bater com o nosso. Sem controle sobre o event_id
  // da UTMify, manter os dois lados fazia a mesma venda contar 2x pro Meta.
  //
  // Decisão do negócio: a UTMify vira a ÚNICA fonte de Purchase pro Meta neste
  // fluxo (ela existe justamente pra pegar venda que o pixel perde — melhor
  // fit pro problema real do que manter os dois). O Purchase do navegador
  // também foi removido, em MatriculaCheckoutClient.tsx.
  //
  // NÃO se aplica ao Estácio nem à campanha ingressa: nenhum dos dois chama
  // sendUtmifyOrder, então a UTMify não vê essas vendas — o Purchase deles
  // continua sendo só nosso, sem duplicação.

  // ── 6) PostHog — conversão server-side ──────────────────────────────────
  // O funil browser perde quem fecha a aba antes da página de sucesso.
  // distinct_id = CPF, mesmo id do identify feito no checkout;
  // $insert_id = externalTransactionId dedupa retries de webhook.
  try {
    await capturePostHogServerEvent({
      event: 'enrollment_paid_confirmed',
      distinctId: cpfDigits,
      eventId: externalTransactionId,
      properties: {
        transaction_id: externalTransactionId,
        value: tx.amountInCents / 100,
        currency: 'BRL',
        course_name: tx.courseName || offerDetails?.course || 'Taxa da plataforma',
        course_id: tx.courseId || null,
        payment_method: tx.paymentMethod,
        inscription_id: inscriptionId,
        marketplace_created: marketplaceCreated,
        flow: COGNA_MATRICULA_CHECKOUT_FLOW,
      },
    })
  } catch (e) {
    console.error('❌ confirm-matricula: PostHog capture falhou', externalTransactionId, e)
  }

  const result: ConfirmResult = { ok: true, status: 'PAID', inscriptionId }
  await persistResult(tx.id, metadata, result)
  return result
}
