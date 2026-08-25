import { prisma } from '@/app/lib/prisma'
import { getCheckoutStatus } from '@/app/lib/api/checkout-status'
import {
  createInscription,
  getCognaErrorMessage,
  type CreateInscriptionRequest,
} from '@/app/lib/api/create-inscription'
import {
  createMarketplaceInscription,
  type MarketplaceInscriptionData,
} from '@/app/lib/api/create-inscription-marketplace'
import type { OfferDetails } from '@/app/lib/api/get-offer-details'
import { sendUtmifyOrder, paymentMethodToUtmify } from '@/app/lib/api/utmify'
import { sendFacebookEvent } from '@/app/lib/analytics/fb-capi'
import { capturePostHogServerEvent } from '@/app/lib/analytics/posthog-server'
import { upsertCandidato } from '@/app/lib/api/attio'
import { isServerFlagEnabled } from '@/app/lib/analytics/server-flags'

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
}

const PROMOTER_ID = process.env.NEXT_PUBLIC_PROMOTER_ID || '6716698cb4d33b0008a18001'

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

/**
 * Confirma o pagamento da matrícula de forma idempotente e cria a inscrição +
 * atualiza o CRM. Pode ser chamada pelo webhook do gateway/Elysium (trustPaid)
 * ou pelo polling do cliente (valida o pagamento no Elysium antes de agir).
 *
 * Idempotência: um "claim" atômico move status != PAID → PAID; apenas o caller
 * que vencer a corrida executa os efeitos colaterais (inscrição/CRM).
 */
export async function confirmPaidMatricula(
  externalTransactionId: string,
  opts?: { trustPaid?: boolean }
): Promise<ConfirmResult> {
  const tx = await prisma.transaction.findFirst({ where: { externalTransactionId } })
  if (!tx) return { ok: false, reason: 'not_found' }

  // Já confirmado antes — nada a fazer.
  if (tx.status === 'PAID') return { ok: true, alreadyDone: true, status: 'PAID' }

  // Fonte da verdade do pagamento: Elysium (salvo quando o webhook é confiável).
  if (!opts?.trustPaid) {
    try {
      const s = await getCheckoutStatus(externalTransactionId)
      const paid = String(s.status).toUpperCase() === 'PAID' || s.paid === true
      if (!paid) return { ok: false, status: 'PENDING' }
    } catch {
      return { ok: false, status: 'UNKNOWN' }
    }
  }

  // Claim atômico: só um caller passa daqui para os efeitos colaterais.
  const claim = await prisma.transaction.updateMany({
    where: { externalTransactionId, status: { not: 'PAID' } },
    data: { status: 'PAID', paidAt: new Date() },
  })
  if (claim.count === 0) return { ok: true, alreadyDone: true, status: 'PAID' }

  const metadata = asObject(tx.metadata)
  const blob = metadata.confirm as MatriculaConfirmBlob | undefined
  const results: Record<string, unknown> = {}

  // 1) Inscrição no Tartarus (+ marketplace ATHENAS), a partir do payload salvo.
  if (blob?.inscriptionPayload) {
    try {
      const r = await createInscription(blob.inscriptionPayload, PROMOTER_ID, 'DC')
      results.inscriptionId = r.id ?? null
      console.log('✅ confirm: inscrição criada', { externalTransactionId, id: r.id })
    } catch (e) {
      results.inscriptionError =
        getCognaErrorMessage(e) ?? (e instanceof Error ? e.message : String(e))
      console.error('❌ confirm: inscrição falhou', externalTransactionId, e)
    }

    // Kill switch (decisão de negócio, 2026-08): createMarketplaceInscription
    // está DESATIVADA — ela duplicava a inscrição na Cogna para ofertas
    // ATHENAS (uma via createInscription, logo acima, + outra via
    // marketplace/canalVendas.id=141). Nasce OFF; religa subindo a flag
    // PostHog 'marketplace_enabled' pra 100% (mesma flag do lado cliente, em
    // useMarketplaceFeatureFlag / checkout/matricula/page.tsx). NÃO apagar
    // createMarketplaceInscription nem o endpoint — só parar de chamar
    // enquanto a flag está off.
    if (blob.marketplace?.data && blob.marketplace.offerDetails) {
      const marketplaceEnabled = await isServerFlagEnabled('marketplace_enabled', false)
      if (marketplaceEnabled) {
        try {
          const m = await createMarketplaceInscription(
            blob.marketplace.data,
            blob.marketplace.offerDetails
          )
          results.marketplace = m.success
        } catch (e) {
          console.error('❌ confirm: marketplace ATHENAS falhou', externalTransactionId, e)
        }
      } else {
        results.marketplaceSkipped = 'flag_off'
      }
    }
  } else {
    results.inscriptionSkipped = 'no_blob'
    console.warn('⚠️ confirm: sem blob de inscrição para', externalTransactionId)
  }

  const cpfDigits = tx.cpf.replace(/\D/g, '')
  const phoneDigits = tx.phone.replace(/\D/g, '')

  // 2) CRM: estágio "inscrito" + a data do pagamento da taxa.
  //
  // NÃO é "matriculado": pagar a taxa aqui não faz a pessoa ser aluna. Quem
  // confirma a matrícula é o parceiro, e isso vai chegar por reconciliação
  // (cron a construir). Marcar matriculado aqui inflaria o número e tiraria
  // das campanhas de ativação justamente quem pagou e não se matriculou.
  const offerDetails = blob?.marketplace?.offerDetails
  // Origem: gravada no `metadata` de nível superior no momento do checkout
  // (client conhece o host; o webhook do gateway, não — ele chega do lado do
  // Elysium, não do navegador da pessoa). Hoje só existe um valor não-padrão:
  // `landing_anhanguera`, setado por app/checkout/matricula/page.tsx quando o
  // checkout roda em campanha.anhangueracursos.com.br.
  const origemSite = typeof metadata.origemSite === 'string' ? metadata.origemSite : undefined
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
      origemSite,
      taxaPaga: new Date(),
      // Número da inscrição no parceiro: é a chave que permite consultar o
      // pagamento depois e cobrar quem ficar pelo caminho.
      //
      // `business_key` fica de fora de propósito. O `offerDetails.businessKey`
      // é a chave da OFERTA, não da inscrição — a da inscrição tem o formato
      // CPF_<cpf>_OFFER_..._TIMESTAMP_... e só existe na resposta do parceiro.
      // Mandar a da oferta aqui encheria o campo com um valor que o endpoint
      // de cobrança recusa, e o erro só apareceria na hora de cobrar.
      inscriptionId: (results.inscriptionId as string | null) ?? undefined,
      shift: offerDetails?.shift,
      monthlyPrice: offerDetails?.montlyFeeTo,
      enrollmentFee: offerDetails?.subscriptionValue,
      inscribedAt: new Date(),
    })
  } catch (e) {
    console.error('❌ confirm: Attio falhou', externalTransactionId, e)
  }

  // 3) UTMify — pedido pago (atribuição/Orders).
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
          name: blob?.utmify?.productName || tx.courseName || 'Matrícula',
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
    console.error('❌ confirm: UTMify falhou', externalTransactionId, e)
  }

  // 4) Meta Conversions API — Purchase server-side (chega mesmo com aba fechada).
  // event_id = externalTransactionId dedupa com o Purchase do pixel disparado
  // no MatriculaPayment (mesmo id).
  try {
    const [firstName, ...rest] = tx.name.trim().split(/\s+/)
    await sendFacebookEvent({
      eventName: 'Purchase',
      eventId: externalTransactionId,
      userData: {
        email: tx.email,
        phone: phoneDigits,
        externalId: cpfDigits,
        firstName: firstName || undefined,
        lastName: rest.length ? rest.join(' ') : undefined,
      },
      customData: {
        currency: 'BRL',
        value: tx.amountInCents / 100,
        content_name: tx.courseName || 'Matrícula',
        content_type: 'product',
        ...(tx.courseId ? { content_ids: [tx.courseId] } : {}),
      },
    })
  } catch (e) {
    console.error('❌ confirm: Meta CAPI Purchase falhou', externalTransactionId, e)
  }

  // 5) PostHog — conversão server-side (o funil browser perde quem fecha a aba
  // antes da página de sucesso). distinct_id = CPF, mesmo id do identify feito
  // no checkout; $insert_id = externalTransactionId dedupa retries de webhook.
  try {
    await capturePostHogServerEvent({
      event: 'enrollment_paid_confirmed',
      distinctId: cpfDigits,
      eventId: externalTransactionId,
      properties: {
        transaction_id: externalTransactionId,
        value: tx.amountInCents / 100,
        currency: 'BRL',
        course_name: tx.courseName || 'Matrícula',
        course_id: tx.courseId || null,
        payment_method: tx.paymentMethod,
      },
    })
  } catch (e) {
    console.error('❌ confirm: PostHog capture falhou', externalTransactionId, e)
  }

  // Persistir resultados (best-effort) para auditoria.
  try {
    await prisma.transaction.update({
      where: { id: tx.id },
      data: { metadata: { ...metadata, confirmResults: results } as object },
    })
  } catch {
    /* ignore */
  }

  return { ok: true, status: 'PAID' }
}
