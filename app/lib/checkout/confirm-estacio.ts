import { prisma } from '@/app/lib/prisma'
import { getCheckoutStatus } from '@/app/lib/api/checkout-status'
import type { AthenaCheckoutResult, CreateEnrollmentInput } from '@/app/lib/api/athena-offers'
import { runAthenaEnrollment } from '@/app/lib/checkout/athena-enrollment'
import { refundElysiumCharge } from '@/app/lib/api/elysium-refund'
import { upsertCandidato } from '@/app/lib/api/attio'
import { capturePostHogServerEvent } from '@/app/lib/analytics/posthog-server'

/**
 * Confirmação do checkout Estácio: a taxa de matrícula do Bolsa Click
 * (R$ 19,90) é cobrada ANTES e a inscrição na Athena/YDUQS só acontece aqui,
 * depois de o pagamento confirmar.
 *
 * Irmã de `confirm-matricula.ts` (fluxo Cogna do portal): mesmo mecanismo de
 * claim atômico, mas em chave própria no metadata (`estacio`/`estacioResult`,
 * nunca `confirm`) e com estorno quando o parceiro recusa.
 *
 * Chamada pelos DOIS caminhos de confirmação, via `confirm-payment.ts`:
 *  - webhook do Elysium (`/api/payments/webhook`) — funciona com a aba fechada;
 *  - polling do cliente (`/api/athena-checkout/confirm`) — acelera o tab-open.
 */

/** Metadata.checkoutFlow que marca uma Transaction como do fluxo Estácio. */
export const ESTACIO_CHECKOUT_FLOW = 'estacio'

/**
 * Tudo que a confirmação precisa para criar a inscrição — montado em
 * `/api/athena-checkout/charge` (com o formulário em mãos) e persistido em
 * `Transaction.metadata.estacio`. O navegador não participa disso: quem fecha
 * a aba depois de pagar continua sendo inscrito pelo webhook.
 */
export interface EstacioConfirmBlob {
  enrollment: CreateEnrollmentInput
  /** Dados da oferta para CRM/analytics (a Athena não devolve isso). */
  offer: {
    offerId?: string
    courseName?: string
    brand?: string
    modality?: string
    city?: string
    state?: string
    academicLevel?: string
    /** Mensalidade já com desconto que o candidato viu na tela. */
    monthlyPrice?: number
  }
}

export type EstacioConfirmResult =
  | { status: 'ok'; checkout: AthenaCheckoutResult; alreadyDone?: boolean }
  | { status: 'pending' }
  | {
      status: 'refused'
      reason: string
      errorCode: string | null
      refunded: boolean
      alreadyDone?: boolean
    }

/**
 * Janela depois da qual um claim sem resultado é considerado órfão.
 *
 * Cenário real: o processo morre (timeout da função, deploy) entre o claim
 * atômico e a gravação do resultado. Sem isto a transação ficaria PAID, sem
 * inscrição e sem estorno — para sempre, porque o claim nunca mais é vencido.
 * Passados 5 minutos, a próxima confirmação (webhook em retry ou o cliente)
 * refaz a inscrição. Repetir é seguro: CPF já inscrito devolve ATL016, que o
 * `runAthenaEnrollment` trata como sucesso com a inscrição existente.
 */
const CLAIM_ORFAO_MS = 5 * 60 * 1000

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

/**
 * Assume a inscrição desta transação de forma ATÔMICA, carimbando
 * `estacioClaimedAt`. Devolve true só para quem ganhou.
 *
 * Assume quando NINGUÉM está dentro dela: sem marca de claim (a transação
 * virou PAID por fora — sync de status, ajuste no admin — e nenhuma
 * confirmação está rodando), ou marca velha o bastante para ser órfã.
 *
 * É compare-and-swap em SQL de propósito. A versão óbvia — ler o metadata,
 * decidir em JS, depois escrever — NÃO é um claim: dois callers que leem "sem
 * claim" no mesmo instante passam os dois. O webhook e o polling do cliente
 * chegando juntos é exatamente isso. Um único UPDATE com a condição no WHERE
 * trava a linha e elege um só.
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
        '{estacioClaimedAt}',
        to_jsonb(${agora.toISOString()}::text),
        true
      )
      WHERE id = ${txId}
        AND (
          metadata->>'estacioClaimedAt' IS NULL
          OR metadata->>'estacioClaimedAt' < ${corte}
        )
    `
    if (linhas === 1) {
      console.warn(
        '⚠️ confirm-estacio: transação paga sem inscrição — assumindo e criando a inscrição',
        { externalTransactionId },
      )
      return true
    }
    return false
  } catch (e) {
    // Sem claim não há garantia de execução única: devolver `pending` (webhook
    // e cliente repetem) é melhor que arriscar inscrição em dobro.
    console.error('⚠️ confirm-estacio: falha ao assumir o claim', externalTransactionId, e)
    return false
  }
}

/**
 * Confirma o pagamento da taxa (idempotente) e só então cria a inscrição na
 * Athena. Recusa do parceiro → estorno best-effort + CRM `inscricao_recusada`.
 *
 * Idempotência em duas camadas (mesmo desenho de `confirm-campaign` do
 * ingressa):
 *  1. Claim atômico `status != PAID → PAID` — só um caller passa daqui para os
 *     efeitos colaterais, mesmo com webhook e polling chegando juntos.
 *  2. Resultado persistido em `metadata.estacioResult` — qualquer chamada
 *     posterior devolve o mesmo resultado sem tocar na Athena de novo.
 *
 * NUNCA fazer o cliente deste fluxo pollar `/api/checkout/status/[id]`: aquela
 * rota sincroniza o status local para PAID e roubaria o claim, deixando a
 * inscrição sem ninguém para criá-la.
 */
export async function confirmPaidEstacio(
  externalTransactionId: string,
  opts?: { trustPaid?: boolean },
): Promise<EstacioConfirmResult> {
  const tx = await prisma.transaction.findFirst({ where: { externalTransactionId } })
  if (!tx) return { status: 'refused', reason: 'not_found', errorCode: null, refunded: false }

  const metadata = asObject(tx.metadata)
  const existing = metadata.estacioResult as EstacioConfirmResult | undefined

  // Já processado (por esta ou por outra chamada) — devolve o mesmo resultado.
  if (existing) return { ...existing, alreadyDone: true } as EstacioConfirmResult

  if (tx.status !== 'PAID') {
    // Fonte da verdade do pagamento: Elysium. Só o webhook autenticado é
    // confiável a ponto de pular esta checagem.
    if (!opts?.trustPaid) {
      try {
        const s = await getCheckoutStatus(externalTransactionId)
        const paid = String(s.status).toUpperCase() === 'PAID' || s.paid === true
        if (!paid) return { status: 'pending' }
      } catch {
        return { status: 'pending' }
      }
    }

    // Claim atômico: só um caller passa daqui para os efeitos colaterais.
    const claim = await prisma.transaction.updateMany({
      where: { externalTransactionId, status: { not: 'PAID' } },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        metadata: { ...metadata, estacioClaimedAt: new Date().toISOString() } as object,
      },
    })

    if (claim.count === 0) {
      // Perdemos a corrida: outra chamada está processando agora (ou acabou de
      // processar). Devolve o resultado se já existir; senão o cliente repete.
      const fresh = await prisma.transaction.findFirst({ where: { externalTransactionId } })
      const freshMeta = asObject(fresh?.metadata)
      const freshResult = freshMeta.estacioResult as EstacioConfirmResult | undefined
      if (freshResult) return { ...freshResult, alreadyDone: true } as EstacioConfirmResult
      if (!(await assumirClaim(tx.id, externalTransactionId))) return { status: 'pending' }
    }
  } else if (!(await assumirClaim(tx.id, externalTransactionId))) {
    // Já PAID e sem resultado: ou outra chamada está dentro da inscrição agora,
    // ou o claim falhou. Nos dois casos o certo é o caller repetir.
    return { status: 'pending' }
  }

  const cpfDigits = tx.cpf.replace(/\D/g, '')
  const phoneDigits = tx.phone.replace(/\D/g, '')
  const blob = metadata.estacio as EstacioConfirmBlob | undefined

  // PostHog: taxa paga (distinto de "inscrição criada" — a Estácio ainda pode
  // recusar).
  try {
    await capturePostHogServerEvent({
      event: 'estacio_taxa_paid',
      distinctId: cpfDigits,
      eventId: `${externalTransactionId}_paid`,
      properties: {
        transaction_id: externalTransactionId,
        value: tx.amountInCents / 100,
        currency: 'BRL',
        course_name: tx.courseName || blob?.offer.courseName || null,
        brand: blob?.offer.brand || null,
        payment_method: tx.paymentMethod,
        flow: 'estacio',
      },
    })
  } catch (e) {
    console.error('⚠️ confirm-estacio: PostHog estacio_taxa_paid falhou', externalTransactionId, e)
  }

  if (!blob?.enrollment) {
    console.error('🚨 confirm-estacio: taxa paga sem blob de inscrição', externalTransactionId)
    const refund = await refundElysiumCharge(externalTransactionId)
    const result: EstacioConfirmResult = {
      status: 'refused',
      reason:
        'Cobrança confirmada, mas faltam os dados da inscrição. Nosso time foi avisado e a taxa será devolvida.',
      errorCode: null,
      refunded: refund.ok,
    }
    await persistResult(tx.id, metadata, result)
    return result
  }

  const attempt = await runAthenaEnrollment(blob.enrollment)

  // ── Recusa: estorna a taxa e registra no CRM ────────────────────────────
  if (!attempt.accepted) {
    const refund = await refundElysiumCharge(externalTransactionId)

    try {
      await upsertCandidato({
        phone: phoneDigits,
        name: tx.name,
        email: tx.email,
        cpf: cpfDigits,
        brand: blob.offer.brand,
        courseName: blob.offer.courseName,
        modality: blob.offer.modality,
        city: blob.offer.city,
        state: blob.offer.state,
        estagio: 'inscricao_recusada',
        origemFluxo: 'checkout-estacio',
        motivoRecusa: `Taxa paga (R$ ${(tx.amountInCents / 100).toFixed(2)}), inscrição recusada pela Estácio${
          attempt.errorCode ? ` (${attempt.errorCode})` : ''
        }: ${attempt.providerMessage || attempt.message}. Estorno ${
          refund.ok
            ? 'confirmado no Elysium'
            : 'FALHOU — estornar manualmente no gateway'
        }.`,
        taxaPaga: new Date(),
        monthlyPrice: blob.offer.monthlyPrice,
      })
    } catch (e) {
      console.error('❌ confirm-estacio: Attio (recusa) falhou', externalTransactionId, e)
    }

    try {
      await capturePostHogServerEvent({
        event: 'estacio_enrollment_refused',
        distinctId: cpfDigits,
        eventId: `${externalTransactionId}_refused`,
        properties: {
          transaction_id: externalTransactionId,
          error_code: attempt.errorCode,
          refunded: refund.ok,
          course_name: blob.offer.courseName || null,
          brand: blob.offer.brand || null,
          offer_id: blob.offer.offerId || null,
          flow: 'estacio',
        },
      })
    } catch (e) {
      console.error(
        '⚠️ confirm-estacio: PostHog estacio_enrollment_refused falhou',
        externalTransactionId,
        e,
      )
    }

    const result: EstacioConfirmResult = {
      status: 'refused',
      reason: attempt.message,
      errorCode: attempt.errorCode,
      refunded: refund.ok,
    }
    await persistResult(tx.id, metadata, result)
    return result
  }

  // ── Aceite: CRM "inscrito" + conversão server-side ──────────────────────
  const checkout = attempt.result

  try {
    await upsertCandidato({
      phone: phoneDigits,
      name: tx.name,
      email: tx.email,
      cpf: cpfDigits,
      brand: blob.offer.brand,
      courseName: blob.offer.courseName,
      modality: blob.offer.modality,
      city: blob.offer.city,
      state: blob.offer.state,
      estagio: 'inscrito',
      origemFluxo: 'checkout-estacio',
      taxaPaga: new Date(),
      // `numeroInscricao` é a chave que permite consultar a cobrança da
      // Estácio depois e cobrar quem ficar pelo caminho.
      inscriptionId: checkout.numeroInscricao,
      // A URL de cobrança da Estácio é opaca — não dá pra reconstruir a partir
      // do número da inscrição. Se não guardar agora, some quando a aba fechar.
      paymentUrl: checkout.paymentUrl,
      monthlyPrice: blob.offer.monthlyPrice,
      enrollmentFee: checkout.amount,
      inscribedAt: new Date(),
    })
  } catch (e) {
    console.error('❌ confirm-estacio: Attio (sucesso) falhou', externalTransactionId, e)
  }

  // Mesmo nome de evento que o fluxo antigo emitia via
  // /api/leads/confirm-inscription — os painéis de conversão continuam valendo.
  try {
    await capturePostHogServerEvent({
      event: 'enrollment_completed_server',
      distinctId: cpfDigits,
      eventId: checkout.numeroInscricao || externalTransactionId,
      properties: {
        transaction_id: externalTransactionId,
        course_id: blob.offer.offerId ?? null,
        course_name: blob.offer.courseName ?? null,
        brand: blob.offer.brand ?? null,
        modality: blob.offer.modality ?? null,
        city: blob.offer.city ?? null,
        source: 'YDUQS',
        flow: 'estacio',
        inscription_id: checkout.numeroInscricao ?? null,
        already_enrolled: checkout.alreadyEnrolled,
        source_side: 'server',
      },
      personProperties: {
        cpf: cpfDigits,
        name: tx.name,
        email: tx.email,
        phone: phoneDigits,
        last_enrollment_status: 'succeeded',
        last_enrollment_course: blob.offer.courseName ?? null,
        last_enrollment_brand: blob.offer.brand ?? null,
        last_inscription_id: checkout.numeroInscricao ?? null,
      },
    })
  } catch (e) {
    console.error(
      '⚠️ confirm-estacio: PostHog enrollment_completed_server falhou',
      externalTransactionId,
      e,
    )
  }

  const result: EstacioConfirmResult = { status: 'ok', checkout }
  await persistResult(tx.id, metadata, result)
  return result
}

async function persistResult(
  txId: string,
  metadata: Record<string, unknown>,
  result: EstacioConfirmResult,
): Promise<void> {
  try {
    await prisma.transaction.update({
      where: { id: txId },
      data: { metadata: { ...metadata, estacioResult: result } as object },
    })
  } catch (e) {
    // Não é cosmético: sem o resultado gravado, uma segunda confirmação pode
    // refazer a inscrição depois da janela de claim órfão.
    console.error('🚨 confirm-estacio: falha ao persistir estacioResult', txId, e)
  }
}
