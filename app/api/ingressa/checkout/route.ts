import { NextRequest, NextResponse } from 'next/server'
import { elysium } from '@/app/lib/api/axios'
import { prisma } from '@/app/lib/prisma'
import { buildInscriptionPayload } from '@/app/lib/api/create-inscription'
import type { MarketplaceInscriptionData } from '@/app/lib/api/create-inscription-marketplace'
import type { OfferDetails, PosPaymentMethod } from '@/app/lib/api/get-offer-details'
import { CAMPAIGN_CHARGE_AMOUNT_CENTS, campaignChargeDescription } from '@/app/lib/checkout/campaign-charge'
import { DADOS_ADMIN_PADRAO } from '@/app/lib/checkout/dados-admin-padrao'
import { CAMPAIGN_CHECKOUT_FLOW, type CampaignConfirmBlob } from '@/app/lib/checkout/confirm-campaign'
import {
  META_ATTRIBUTION_KEY,
  metaAttributionFromRequest,
  type MetaBrowserIds,
} from '@/app/lib/analytics/meta-attribution'
import { capturePostHogServerEvent } from '@/app/lib/analytics/posthog-server'

/**
 * POST /api/ingressa/checkout — passo 1 do checkout pago da campanha
 * ingressa.digital (Cogna/Anhanguera, SÓ app/lp/**): cria a cobrança de
 * R$ 58,90 no Elysium (PIX ou cartão) e persiste tudo que a confirmação
 * (/api/ingressa/checkout/confirm) precisa para criar a inscrição na Cogna
 * DEPOIS do pagamento — nunca antes.
 *
 * Irmã de app/api/checkout/route.ts (genérico, portal principal): mesmo
 * contrato de cobrança no Elysium, mas amountInCents é FIXO aqui (nunca
 * confia no valor que o cliente manda) e o payload de inscrição vai para
 * Transaction.metadata.campaign (chave própria — nunca `metadata.confirm`,
 * que é do fluxo confirmPaidMatricula do portal).
 */

interface CreditCard {
  holderName: string
  number: string
  expiryMonth: string
  expiryYear: string
  ccv: string
}

interface CreditCardHolderInfo {
  name: string
  email: string
  cpfCnpj: string
  postalCode: string
  addressNumber: string
  addressComplement?: string
  phone?: string
  mobilePhone?: string
}

interface CampaignCheckoutBody {
  name: string
  cpf: string
  email: string
  phone: string
  /** DD-MM-YYYY (mesmo formato do checkout principal). */
  birthDate: string
  ingressType?: 'ENEM' | 'VESTIBULAR'
  offerDetails: OfferDetails
  paymentMethod: 'pix' | 'card'
  installmentCount?: number
  creditCard?: CreditCard
  creditCardHolderInfo?: CreditCardHolderInfo
  partner: string
  partnerName?: string
  visitorId?: string
  utm?: Record<string, string>
  /** `_fbp`/`_fbc` do navegador, para o Purchase que sai da confirmação. */
  metaIds?: MetaBrowserIds
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

/**
 * Pós-graduação (e profissionalizante) exigem `inscription.paymentMethod`
 * (parcela + dia de vencimento) no create-inscription — sem isso a Cogna
 * recusa a inscrição (MS de plano de pagamento ausente). Este checkout
 * (campanha) não tem UI de escolha de parcela, então replica o auto-select
 * do checkout principal (app/checkout/matricula/page.tsx: "Auto-selecionar
 * boleto 18x pra pós-graduação") — BOLETO com 18x quando existir, senão a
 * 1ª parcela do 1º método disponível. `dueDay: '10'` é o mesmo valor fixo
 * que o checkout principal sempre envia (não é dado inventado aqui — é o
 * default já em produção). Sem voucher: a campanha não tem essa etapa.
 */
function defaultPosPaymentMethod(
  offerDetails: OfferDetails,
): { id: string; dueDay: string } | undefined {
  if (offerDetails.academicLevel === 'GRADUACAO') return undefined
  const methods = offerDetails.paymentMethods as PosPaymentMethod[] | undefined
  if (!methods?.length) return undefined
  const chosenMethod = methods.find((pm) => pm.type === 'BOLETO') ?? methods[0]
  const installment =
    chosenMethod.installments.find((i) => i.number === 18) ?? chosenMethod.installments[0]
  if (!installment) return undefined
  return { id: installment.id, dueDay: '10' }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CampaignCheckoutBody
    const {
      name,
      cpf,
      email,
      phone,
      birthDate,
      ingressType,
      offerDetails,
      paymentMethod,
      installmentCount,
      creditCard,
      creditCardHolderInfo,
      partner,
      partnerName,
      visitorId,
      utm,
      metaIds,
    } = body

    if (
      !isNonEmptyString(name) ||
      !isNonEmptyString(cpf) ||
      !isNonEmptyString(email) ||
      !isNonEmptyString(phone) ||
      !isNonEmptyString(birthDate) ||
      !isNonEmptyString(partner) ||
      !offerDetails
    ) {
      return NextResponse.json(
        { error: 'Dados incompletos para gerar a cobrança.' },
        { status: 400 },
      )
    }

    if (!offerDetails.dmhId) {
      return NextResponse.json(
        { error: 'Essa oferta não está disponível para inscrição no momento. Escolha outra opção.' },
        { status: 422 },
      )
    }

    if (paymentMethod === 'card' && (!creditCard || !creditCardHolderInfo)) {
      return NextResponse.json(
        { error: 'creditCard e creditCardHolderInfo são obrigatórios para paymentMethod=card' },
        { status: 400 },
      )
    }

    const cleanCpf = cpf.replace(/\D/g, '')
    const cleanPhone = phone.replace(/\D/g, '')
    const resolvedIngressType = offerDetails.academicLevel === 'GRADUACAO' ? (ingressType || 'VESTIBULAR') : undefined

    // Payload de inscrição na Cogna — montado agora (com os dados do
    // formulário em mãos), mas SÓ EXECUTADO depois de o pagamento confirmar
    // (ver confirm-campaign.ts). Mesmo helper do checkout principal.
    const inscriptionPayload = buildInscriptionPayload(
      {
        name,
        cpf,
        birthDate,
        email,
        phone,
        gender: DADOS_ADMIN_PADRAO.gender,
        schoolYear: DADOS_ADMIN_PADRAO.schoolYear,
        rg: DADOS_ADMIN_PADRAO.rg,
        address: DADOS_ADMIN_PADRAO.address,
        addressNumber: DADOS_ADMIN_PADRAO.addressNumber,
        neighborhood: DADOS_ADMIN_PADRAO.neighborhood,
        city: DADOS_ADMIN_PADRAO.city,
        state: DADOS_ADMIN_PADRAO.state,
        cep: DADOS_ADMIN_PADRAO.cep,
      },
      {
        dmhId: offerDetails.dmhId,
        businessKey: offerDetails.businessKey,
        dmhSource: offerDetails.dmhSource,
        academicLevel: offerDetails.academicLevel,
        ingressType: resolvedIngressType ? [resolvedIngressType] : offerDetails.ingressType,
        schedules: offerDetails.schedules,
        shift: offerDetails.shift,
      },
      defaultPosPaymentMethod(offerDetails),
    )

    // Inscrição no marketplace ATHENAS (segunda chamada, só quando a oferta é
    // dessa fonte) — mesmo formato do checkout principal, canal de vendas
    // próprio da campanha (88, não 141 — ver confirm-campaign.ts).
    const isAthenasSource = offerDetails.dmhSource?.source === 'ATHENAS'
    const marketplace: CampaignConfirmBlob['marketplace'] =
      isAthenasSource && offerDetails.idDmhElastic
        ? {
            data: {
              name,
              cpf,
              email,
              phone,
              birthDate,
              rg: DADOS_ADMIN_PADRAO.rg,
              gender: DADOS_ADMIN_PADRAO.gender,
              cep: DADOS_ADMIN_PADRAO.cep,
              address: DADOS_ADMIN_PADRAO.address,
              addressNumber: DADOS_ADMIN_PADRAO.addressNumber,
              neighborhood: DADOS_ADMIN_PADRAO.neighborhood,
              city: DADOS_ADMIN_PADRAO.city,
              state: DADOS_ADMIN_PADRAO.state,
              ingressType: resolvedIngressType || 'VESTIBULAR',
              schoolYear: DADOS_ADMIN_PADRAO.schoolYear,
              acceptTerms: true,
              acceptEmail: true,
              acceptSms: true,
              acceptWhatsapp: true,
            } satisfies MarketplaceInscriptionData,
            offerDetails,
          }
        : null

    const campaignBlob: CampaignConfirmBlob = {
      inscriptionPayload,
      marketplace,
      attio: {
        brand: offerDetails.brand || partnerName,
        courseName: offerDetails.course,
        modality: offerDetails.modality,
        city: offerDetails.unitCity,
        shift: offerDetails.shift,
        monthlyPrice: offerDetails.montlyFeeTo,
        enrollmentFee: offerDetails.subscriptionValue,
      },
      partner,
      partnerName,
      visitorId,
    }

    const amountInCents = CAMPAIGN_CHARGE_AMOUNT_CENTS
    const description = campaignChargeDescription(offerDetails.course)

    // Instituição/curso da oferta — vão no metadata pro Elysium anexar no
    // e-mail de confirmação de pagamento (collegeName / courseName). `brand`
    // aqui é a marca do SITE (ingressa.digital) pro Elysium escolher
    // logo/cor/remetente — não confundir com offerDetails.brand, que é o
    // nome da instituição (ex. "Anhanguera"), enviado à parte em institutionName.
    const institutionName = offerDetails.brand || partnerName
    const checkoutPayload = {
      name,
      cpf: cleanCpf,
      email,
      phone: cleanPhone,
      amountInCents,
      description,
      paymentMethod,
      brand: 'ingressa',
      ...(installmentCount && { installmentCount }),
      ...(creditCard && {
        creditCard: { ...creditCard, number: creditCard.number.replace(/\D/g, '') },
      }),
      ...(creditCardHolderInfo && { creditCardHolderInfo }),
      metadata: {
        source: 'ingressa',
        partner,
        institutionName,
        courseName: offerDetails.course,
        ...(utm ? { utm } : {}),
      },
    }

    console.log(`💳 Criando cobrança de campanha ${paymentMethod.toUpperCase()} no Elysium (ingressa/${partner})...`, {
      email,
      amountInCents,
    })

    const response = await elysium.post('/checkout', checkoutPayload)

    const externalTransactionId: string | undefined = response.data?.transactionId
    if (externalTransactionId) {
      try {
        const pixQrCode = response.data?.pixQrCode
        // Atribuição da Meta capturada AQUI, com o navegador ainda presente. O
        // `Purchase` sai da confirmação (webhook/polling), quando não há mais
        // cookie `_fbc` nem headers do visitante. Ver `meta-attribution.ts`.
        const transactionMetadata = {
          checkoutFlow: CAMPAIGN_CHECKOUT_FLOW,
          campaign: campaignBlob,
          elysium: response.data,
          [META_ATTRIBUTION_KEY]: metaAttributionFromRequest(request, metaIds),
        }
        await prisma.transaction.upsert({
          where: { externalTransactionId },
          update: {
            pixBrCode: pixQrCode?.brCode ?? undefined,
            pixQrCodeBase64: pixQrCode?.brCodeBase64 ?? undefined,
            metadata: transactionMetadata as object,
          },
          create: {
            name,
            cpf: cleanCpf,
            email,
            phone: cleanPhone,
            amountInCents,
            paymentMethod,
            status: 'PENDING',
            externalTransactionId,
            courseId: offerDetails.courseId,
            courseName: offerDetails.course,
            institutionName,
            pixBrCode: pixQrCode?.brCode ?? undefined,
            pixQrCodeBase64: pixQrCode?.brCodeBase64 ?? undefined,
            metadata: transactionMetadata as object,
          },
        })
      } catch (persistError) {
        console.error('⚠️ Falha ao persistir Transaction local do checkout de campanha:', persistError)
      }

      try {
        await capturePostHogServerEvent({
          event: 'campaign_payment_created',
          distinctId: cleanPhone,
          eventId: `${externalTransactionId}_created`,
          properties: {
            transaction_id: externalTransactionId,
            value: amountInCents / 100,
            currency: 'BRL',
            course_name: offerDetails.course || null,
            brand: offerDetails.brand || partnerName || null,
            partner,
            payment_method: paymentMethod,
          },
          personProperties: { name, phone: cleanPhone, email },
        })
      } catch (e) {
        console.error('⚠️ PostHog campaign_payment_created falhou:', e)
      }
    }

    return NextResponse.json(response.data)
  } catch (error: unknown) {
    console.error('❌ Erro ao criar cobrança de campanha:', error)

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { error?: string; message?: string }; status?: number } }
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Erro ao criar cobrança'
      return NextResponse.json({ error: errorMessage }, { status: axiosError.response?.status || 500 })
    }

    return NextResponse.json({ error: 'Erro interno ao criar cobrança' }, { status: 500 })
  }
}
