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
import { capturePostHogServerEvent } from '@/app/lib/analytics/posthog-server'
import { upsertCandidato } from '@/app/lib/api/attio'

/**
 * Canal de vendas próprio da campanha ingressa.digital (Cogna/Anhanguera).
 * NÃO é o canal 141 (herdado do fork, usado pelo portal principal) — decisão
 * do CEO 2026-08-26.
 */
/**
 * Discriminador gravado em `Transaction.metadata.checkoutFlow` na criação da
 * cobrança e lido por `confirm-payment.ts` para rotear a confirmação — é o que
 * faz o WEBHOOK do Elysium cair aqui e não no fluxo Cogna do portal principal,
 * que é o default histórico de quem não grava o campo.
 */
export const CAMPAIGN_CHECKOUT_FLOW = 'campaign'

const CAMPAIGN_CANAL_VENDAS_ID = 88

const PROMOTER_ID = process.env.NEXT_PUBLIC_PROMOTER_ID || '6716698cb4d33b0008a18001'

/**
 * Tudo que a confirmação (pós-pagamento) precisa pra criar a inscrição na
 * Cogna e atualizar CRM/analytics — montado em /api/ingressa/checkout (no
 * momento da cobrança, quando ainda temos o formulário em mãos) e persistido
 * em Transaction.metadata.campaign. Mesmo padrão de MatriculaConfirmBlob
 * (app/lib/checkout/confirm-matricula.ts), mas em chave própria (`campaign`,
 * não `confirm`) — nunca deve colidir com o fluxo do portal principal.
 */
export interface CampaignConfirmBlob {
  inscriptionPayload: CreateInscriptionRequest
  marketplace?: { data: MarketplaceInscriptionData; offerDetails: OfferDetails } | null
  attio: {
    brand?: string
    courseName?: string
    modality?: string
    city?: string
    shift?: string
    monthlyPrice?: number
    enrollmentFee?: number
  }
  partner: string
  partnerName?: string
  visitorId?: string
}

export type CampaignConfirmResult =
  | { status: 'ok'; inscriptionId: string | null; alreadyDone?: boolean }
  | { status: 'pending' }
  | { status: 'refused'; reason: string; alreadyDone?: boolean }

/**
 * Janela em que um claim é considerado "alguém está processando agora". Passado
 * isso, quem chegar assume a transação.
 *
 * Existe porque o claim atômico sozinho tem um buraco: ele só é vencido por
 * quem MUDA o status para PAID. Quando o status já vem PAID de outro lugar
 * — e vem: `/api/checkout/status/[transactionId]` sincroniza o status do
 * Elysium e grava PAID no banco antes de o cliente chamar a confirmação —
 * `claim.count` é 0 para todo mundo, para sempre. Sem esta janela, a transação
 * fica paga, sem inscrição e sem estorno, devolvendo `pending` eternamente.
 */
const CLAIM_ORFAO_MS = 5 * 60 * 1000

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

/**
 * Assume a transação de forma ATÔMICA, carimbando `campaignClaimedAt`.
 * Devolve true só para quem ganhou o direito de criar a inscrição.
 *
 * É um compare-and-swap em SQL de propósito. A versão óbvia — ler o metadata,
 * decidir em JS, depois escrever — não serve: dois callers que leem "sem
 * claim" no mesmo instante passam os dois e inscrevem o candidato duas vezes.
 * Um único UPDATE com a condição no WHERE trava a linha e elege um só.
 *
 * Bônus: `jsonb_set` altera apenas esta chave, então um metadata escrito em
 * paralelo por outro caminho não é sobrescrito — o que o spread em JS faria.
 */
async function assumirClaim(txId: string, externalTransactionId: string): Promise<boolean> {
  const agora = new Date()
  const corte = new Date(agora.getTime() - CLAIM_ORFAO_MS).toISOString()
  try {
    const linhas = await prisma.$executeRaw`
      UPDATE "Transaction"
      SET metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{campaignClaimedAt}',
        to_jsonb(${agora.toISOString()}::text),
        true
      )
      WHERE id = ${txId}
        AND (
          metadata->>'campaignClaimedAt' IS NULL
          OR metadata->>'campaignClaimedAt' < ${corte}
        )
    `
    if (linhas === 1) {
      console.warn(
        '⚠️ confirm-campaign: transação paga sem inscrição — assumindo e criando a inscrição',
        { externalTransactionId },
      )
      return true
    }
    return false
  } catch (e) {
    // Sem claim não há garantia de execução única: melhor devolver `pending`
    // (o cliente e o webhook repetem) do que arriscar inscrição em dobro.
    console.error('⚠️ confirm-campaign: falha ao assumir o claim', externalTransactionId, e)
    return false
  }
}

/**
 * Confirma o pagamento da campanha (idempotente) e, só então, cria a
 * inscrição na Cogna. Recusa da Cogna → a taxa NÃO é estornada: fica registrada
 * no Attio como "pago, inscrição recusada" (+ PostHog
 * `campaign_enrollment_refused`) para o time resolver na mão.
 *
 * Decisão do CEO em 2026-09-07, contrariando o padrão dos outros checkouts
 * pagos (Estácio e Cogna/matrícula estornam automaticamente): aqui a recusa
 * quase sempre é a oferta ter saído do ar, e o candidato continua querendo
 * estudar — o time reaproveita a taxa em outra oferta em vez de devolver e
 * perder a venda. O que NÃO pode acontecer é a recusa passar despercebida: por
 * isso o registro no CRM é o passo obrigatório deste caminho, não o estorno.
 *
 * Idempotência em três camadas:
 *  1. Resultado da inscrição persistido em `metadata.campaignResult` — uma
 *     retentativa do cliente (rede instável, duplo clique) devolve o resultado
 *     já calculado, sem nunca chamar `createInscription` duas vezes.
 *  2. Claim atômico (`status != PAID → PAID`) — entre os callers que chegam
 *     com a transação ainda não paga, só um passa para os efeitos colaterais.
 *  3. Janela de claim órfão (`campaignClaimedAt`, ver CLAIM_ORFAO_MS) — para
 *     quando a transação JÁ chega PAID e a camada 2 não elege ninguém.
 *
 * A camada 3 não é zelo extra, é o caso normal deste fluxo: o polling do
 * cliente bate em `/api/checkout/status/[transactionId]`, que sincroniza o
 * status do Elysium e grava PAID no banco ANTES de a confirmação rodar. Sem
 * ela, `claim.count` é 0 para todos os callers e a função devolve `pending`
 * para sempre — cobrado, sem inscrição e sem ninguém avisado.
 */
export async function confirmPaidCampaign(
  externalTransactionId: string,
): Promise<CampaignConfirmResult> {
  const tx = await prisma.transaction.findFirst({ where: { externalTransactionId } })
  if (!tx) return { status: 'refused', reason: 'not_found' }

  const metadata = asObject(tx.metadata)
  const existingResult = metadata.campaignResult as CampaignConfirmResult | undefined

  // Já processado antes (por esta ou por outra chamada) — devolve o mesmo
  // resultado, nunca reexecuta a inscrição. Independe do status: resultado
  // gravado é prova de que a inscrição já foi tentada.
  if (existingResult) {
    return { ...existingResult, alreadyDone: true } as CampaignConfirmResult
  }

  if (tx.status !== 'PAID') {
    // Fonte da verdade: Elysium. Nunca confia cegamente no cliente.
    try {
      const s = await getCheckoutStatus(externalTransactionId)
      const paid = String(s.status).toUpperCase() === 'PAID' || s.paid === true
      if (!paid) return { status: 'pending' }
    } catch {
      return { status: 'pending' }
    }

    // Claim atômico: só um caller passa daqui para os efeitos colaterais.
    const claim = await prisma.transaction.updateMany({
      where: { externalTransactionId, status: { not: 'PAID' } },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        metadata: { ...metadata, campaignClaimedAt: new Date().toISOString() } as object,
      },
    })

    if (claim.count === 0) {
      // Perdemos a corrida: outra chamada está processando, ou já processou.
      const fresh = await prisma.transaction.findFirst({ where: { externalTransactionId } })
      const freshMeta = asObject(fresh?.metadata)
      const freshResult = freshMeta.campaignResult as CampaignConfirmResult | undefined
      if (freshResult) return { ...freshResult, alreadyDone: true } as CampaignConfirmResult
      if (!(await assumirClaim(tx.id, externalTransactionId))) return { status: 'pending' }
    }
  } else if (!(await assumirClaim(tx.id, externalTransactionId))) {
    // Já PAID e sem resultado: ou outra chamada está dentro da inscrição agora,
    // ou o claim falhou. Nos dois casos o certo é o caller repetir.
    return { status: 'pending' }
  }

  const cpfDigits = tx.cpf.replace(/\D/g, '')
  const phoneDigits = tx.phone.replace(/\D/g, '')
  const blob = metadata.campaign as CampaignConfirmBlob | undefined

  // PostHog: pagamento confirmado (distinto de "inscrição criada" — a Cogna
  // ainda pode recusar).
  try {
    await capturePostHogServerEvent({
      event: 'campaign_payment_paid',
      distinctId: phoneDigits,
      eventId: `${externalTransactionId}_paid`,
      properties: {
        transaction_id: externalTransactionId,
        value: tx.amountInCents / 100,
        currency: 'BRL',
        course_name: tx.courseName || blob?.attio.courseName || null,
        brand: blob?.attio.brand || null,
        partner: blob?.partner || null,
        payment_method: tx.paymentMethod,
      },
    })
  } catch (e) {
    console.error('⚠️ confirm-campaign: PostHog campaign_payment_paid falhou', externalTransactionId, e)
  }

  if (!blob?.inscriptionPayload) {
    console.error('⚠️ confirm-campaign: sem blob de inscrição para', externalTransactionId)
    const result: CampaignConfirmResult = {
      status: 'refused',
      reason: 'Cobrança confirmada, mas faltam os dados da inscrição. Nosso time foi avisado.',
    }
    await persistResult(tx.id, metadata, result)
    return result
  }

  let inscriptionId: string | null = null
  let inscriptionError: string | undefined

  try {
    const response = await createInscription(blob.inscriptionPayload, PROMOTER_ID, 'DC')
    if (response.success || response.id) {
      inscriptionId = response.id != null ? String(response.id) : null
    } else {
      inscriptionError = 'Resposta da Cogna não indicou sucesso na inscrição.'
    }
  } catch (error) {
    inscriptionError =
      getCognaErrorMessage(error) ?? (error instanceof Error ? error.message : String(error))
    console.error('❌ confirm-campaign: inscrição recusada pela Cogna', externalTransactionId, {
      ...getCognaErrorDetails(error),
      message: inscriptionError,
    })
  }

  // Recusa: sem estorno (ver doc acima) — o dinheiro fica e a pendência vira
  // tarefa humana. Attio primeiro, porque é ele que faz alguém ver isso.
  if (!inscriptionId) {
    console.error(
      '💰 confirm-campaign: taxa PAGA e inscrição RECUSADA — registrado no Attio para resolução manual',
      { externalTransactionId, motivo: inscriptionError },
    )

    try {
      await upsertCandidato({
        phone: phoneDigits,
        name: tx.name,
        email: tx.email,
        cpf: cpfDigits,
        brand: blob.attio.brand,
        courseName: blob.attio.courseName,
        modality: blob.attio.modality,
        city: blob.attio.city,
        estagio: 'inscricao_recusada',
        origemFluxo: 'ingressa',
        motivoRecusa: `Pago (R$ ${(tx.amountInCents / 100).toFixed(2)}), inscrição recusada pela Cogna: ${inscriptionError}. Valor NÃO estornado — resolver com o candidato (outra oferta ou inscrição manual).`,
        taxaPaga: new Date(),
        shift: blob.attio.shift,
        monthlyPrice: blob.attio.monthlyPrice,
        enrollmentFee: blob.attio.enrollmentFee,
      })
    } catch (e) {
      console.error('❌ confirm-campaign: Attio (recusa) falhou', externalTransactionId, e)
    }

    try {
      await capturePostHogServerEvent({
        event: 'campaign_enrollment_refused',
        distinctId: phoneDigits,
        eventId: `${externalTransactionId}_refused`,
        properties: {
          transaction_id: externalTransactionId,
          reason: inscriptionError || null,
          // Sempre true: esta campanha não estorna. Mantido explícito pro
          // relatório distinguir da recusa dos outros checkouts, que estornam.
          charge_kept: true,
          course_name: blob.attio.courseName || null,
          brand: blob.attio.brand || null,
          partner: blob.partner,
        },
      })
    } catch (e) {
      console.error('⚠️ confirm-campaign: PostHog campaign_enrollment_refused falhou', externalTransactionId, e)
    }

    const result: CampaignConfirmResult = {
      status: 'refused',
      reason: inscriptionError || 'Não foi possível concluir sua inscrição.',
    }
    await persistResult(tx.id, metadata, result)
    return result
  }

  // Sucesso: marketplace ATHENAS (best-effort, não bloqueia) + Attio + PostHog.
  if (blob.marketplace?.data && blob.marketplace.offerDetails) {
    try {
      await createMarketplaceInscription(
        blob.marketplace.data,
        blob.marketplace.offerDetails,
        { canalVendasId: CAMPAIGN_CANAL_VENDAS_ID },
      )
    } catch (e) {
      console.error('⚠️ confirm-campaign: inscrição marketplace ATHENAS falhou (não bloqueante)', externalTransactionId, e)
    }
  }

  try {
    await upsertCandidato({
      phone: phoneDigits,
      name: tx.name,
      email: tx.email,
      cpf: cpfDigits,
      brand: blob.attio.brand,
      courseName: blob.attio.courseName,
      modality: blob.attio.modality,
      city: blob.attio.city,
      estagio: 'inscrito',
      origemFluxo: 'ingressa',
      taxaPaga: new Date(),
      inscriptionId,
      shift: blob.attio.shift,
      monthlyPrice: blob.attio.monthlyPrice,
      enrollmentFee: blob.attio.enrollmentFee,
      inscribedAt: new Date(),
    })
  } catch (e) {
    console.error('❌ confirm-campaign: Attio (sucesso) falhou', externalTransactionId, e)
  }

  try {
    await capturePostHogServerEvent({
      event: 'campaign_enrollment_created',
      distinctId: phoneDigits,
      eventId: `${externalTransactionId}_enrolled`,
      properties: {
        transaction_id: externalTransactionId,
        inscription_id: inscriptionId,
        course_name: blob.attio.courseName || null,
        brand: blob.attio.brand || null,
        partner: blob.partner,
      },
    })
  } catch (e) {
    console.error('⚠️ confirm-campaign: PostHog campaign_enrollment_created falhou', externalTransactionId, e)
  }

  const result: CampaignConfirmResult = { status: 'ok', inscriptionId }
  await persistResult(tx.id, metadata, result)
  return result
}

async function persistResult(
  txId: string,
  metadata: Record<string, unknown>,
  result: CampaignConfirmResult,
): Promise<void> {
  try {
    await prisma.transaction.update({
      where: { id: txId },
      data: { metadata: { ...metadata, campaignResult: result } as object },
    })
  } catch (e) {
    console.error('⚠️ confirm-campaign: falha ao persistir campaignResult', txId, e)
  }
}
