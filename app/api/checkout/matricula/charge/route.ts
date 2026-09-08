import { NextRequest, NextResponse } from 'next/server'
import { elysium } from '@/app/lib/api/axios'
import { prisma } from '@/app/lib/prisma'
import {
  TAXA_MATRICULA_COGNA_CENTAVOS,
  taxaMatriculaCognaDescription,
} from '@/app/lib/checkout/taxa-cogna'
import {
  COGNA_MATRICULA_CHECKOUT_FLOW,
  type MatriculaConfirmBlob,
} from '@/app/lib/checkout/confirm-matricula'
import { capturePostHogServerEvent } from '@/app/lib/analytics/posthog-server'
import {
  META_ATTRIBUTION_KEY,
  metaAttributionFromRequest,
  type MetaBrowserIds,
} from '@/app/lib/analytics/meta-attribution'

/**
 * POST /api/checkout/matricula/charge — passo 1 do checkout Cogna pago: cria a
 * cobrança da taxa de matrícula do Bolsa Click (R$ 19,90) no Elysium e
 * persiste tudo que a confirmação precisa para criar a inscrição na Cogna
 * DEPOIS do pagamento — nunca antes.
 *
 * Irmã de `/api/athena-checkout/charge` (fluxo Estácio) e substituta de
 * `/api/checkout` (genérico) neste fluxo: aqui o `amountInCents` é FIXO no
 * servidor — o cliente nem manda valor, e se mandasse seria ignorado — e o
 * payload da inscrição vai para `Transaction.metadata.confirm`, com
 * `metadata.checkoutFlow = 'cogna_matricula'`.
 *
 * A cobrança da PRÓPRIA instituição (matrícula e mensalidades do curso, via
 * payment-link da Cogna) continua existindo e é ADICIONAL: ela aparece na tela
 * de sucesso, depois da inscrição confirmada.
 */

/** Cartão (Asaas) — repassado ao gateway via Elysium. NUNCA logar/persistir. */
interface CreditCard {
  holderName: string
  number: string
  expiryMonth: string // "MM"
  expiryYear: string // "AAAA"
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

/** Dados do candidato/oferta usados só para identificar a cobrança e o CRM. */
interface CognaChargeCustomer {
  name: string
  cpf: string
  email: string
  phone: string
}

interface CognaChargeOffer {
  courseId?: string
  courseName?: string
  institutionName?: string
}

interface CognaChargeBody {
  customer: CognaChargeCustomer
  offer?: CognaChargeOffer
  confirm: MatriculaConfirmBlob
  paymentMethod: 'pix' | 'card'
  installmentCount?: number
  creditCard?: CreditCard
  creditCardHolderInfo?: CreditCardHolderInfo
  /** `_fbp`/`_fbc` do navegador, para o Purchase que sai da confirmação. */
  metaIds?: MetaBrowserIds
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CognaChargeBody
    const {
      customer,
      offer,
      confirm,
      paymentMethod = 'pix',
      installmentCount,
      creditCard,
      creditCardHolderInfo,
      metaIds,
    } = body || ({} as CognaChargeBody)

    // Validação dos obrigatórios da INSCRIÇÃO antes de cobrar: um dado que a
    // Cogna recusaria depois viraria taxa paga + estorno, com o candidato
    // achando que foi cobrado à toa.
    if (!customer?.name || !customer?.cpf || !customer?.email || !customer?.phone) {
      return NextResponse.json(
        { error: 'customer (name, cpf, email, phone) é obrigatório' },
        { status: 400 },
      )
    }
    if (!confirm?.inscriptionPayload?.personalData?.cpf) {
      return NextResponse.json(
        { error: 'confirm.inscriptionPayload é obrigatório' },
        { status: 400 },
      )
    }
    // Sem idDMH a Cogna recusa (@IsNotEmpty no backend) — falhar aqui é falhar
    // antes de o candidato pagar.
    if (!confirm.inscriptionPayload.inscription?.offers?.firstOption?.idDMH) {
      return NextResponse.json(
        { error: 'Essa oferta não está disponível para inscrição no momento.' },
        { status: 422 },
      )
    }
    if (paymentMethod === 'card' && (!creditCard || !creditCardHolderInfo)) {
      return NextResponse.json(
        { error: 'creditCard e creditCardHolderInfo são obrigatórios para paymentMethod=card' },
        { status: 400 },
      )
    }

    const cleanCpf = customer.cpf.replace(/\D/g, '')
    const cleanPhone = customer.phone.replace(/\D/g, '')

    // Valor FIXO, do servidor.
    //
    // NÃO usar `getMatriculaCharge()` aqui: ele devolve a matrícula/mensalidade
    // da OFERTA (o preço do curso), não a nossa taxa. Ele decide apenas *se* o
    // segmento cobra — e essa decisão é tomada na tela, antes de chegar aqui.
    const amountInCents = TAXA_MATRICULA_COGNA_CENTAVOS
    const description = taxaMatriculaCognaDescription(offer?.courseName)
    const institutionName = offer?.institutionName || 'Bolsa Click'

    const checkoutPayload = {
      name: customer.name,
      cpf: cleanCpf,
      email: customer.email,
      phone: cleanPhone,
      amountInCents,
      description,
      paymentMethod,
      ...(installmentCount && { installmentCount }),
      ...(creditCard && {
        creditCard: { ...creditCard, number: creditCard.number.replace(/\D/g, '') },
      }),
      ...(creditCardHolderInfo && { creditCardHolderInfo }),
      metadata: {
        source: 'checkout-matricula',
        institutionName,
        courseName: offer?.courseName,
        courseId: offer?.courseId,
      },
    }

    console.log(`💳 Criando cobrança da taxa Cogna ${paymentMethod.toUpperCase()} no Elysium...`, {
      email: customer.email,
      amountInCents,
      courseId: offer?.courseId,
    })

    const response = await elysium.post('/checkout', checkoutPayload)

    const externalTransactionId: string | undefined = response.data?.transactionId
    if (externalTransactionId) {
      const metadata = {
        checkoutFlow: COGNA_MATRICULA_CHECKOUT_FLOW,
        confirm,
        elysium: response.data,
        // Atribuição da Meta capturada AQUI, com o navegador ainda presente.
        // A confirmação roda por webhook/polling e não teria como obtê-la.
        [META_ATTRIBUTION_KEY]: metaAttributionFromRequest(request, metaIds),
      }
      try {
        const pixQrCode = response.data?.pixQrCode
        await prisma.transaction.upsert({
          where: { externalTransactionId },
          update: {
            pixBrCode: pixQrCode?.brCode ?? undefined,
            pixQrCodeBase64: pixQrCode?.brCodeBase64 ?? undefined,
            metadata: metadata as object,
          },
          create: {
            name: customer.name,
            cpf: cleanCpf,
            email: customer.email,
            phone: cleanPhone,
            amountInCents,
            paymentMethod,
            status: 'PENDING',
            externalTransactionId,
            courseId: offer?.courseId,
            courseName: offer?.courseName,
            institutionName,
            pixBrCode: pixQrCode?.brCode ?? undefined,
            pixQrCodeBase64: pixQrCode?.brCodeBase64 ?? undefined,
            metadata: metadata as object,
          },
        })
      } catch (persistError) {
        // Sem a Transaction local não há blob de inscrição: a taxa seria paga e
        // ninguém saberia o que inscrever. Melhor falhar agora, antes de o
        // candidato pagar.
        console.error('🚨 Falha ao persistir a Transaction do checkout Cogna:', persistError)
        return NextResponse.json(
          { error: 'Não foi possível iniciar o pagamento agora. Tente de novo em instantes.' },
          { status: 500 },
        )
      }

      try {
        await capturePostHogServerEvent({
          event: 'cogna_taxa_charge_created',
          distinctId: cleanCpf,
          eventId: `${externalTransactionId}_created`,
          properties: {
            transaction_id: externalTransactionId,
            value: amountInCents / 100,
            currency: 'BRL',
            course_name: offer?.courseName || null,
            course_id: offer?.courseId || null,
            brand: offer?.institutionName || null,
            payment_method: paymentMethod,
            flow: COGNA_MATRICULA_CHECKOUT_FLOW,
          },
          personProperties: {
            name: customer.name,
            phone: cleanPhone,
            email: customer.email,
          },
        })
      } catch (e) {
        console.error('⚠️ PostHog cogna_taxa_charge_created falhou:', e)
      }
    }

    return NextResponse.json(response.data)
  } catch (error: unknown) {
    console.error('❌ Erro ao criar a cobrança da taxa Cogna:', error)

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: { data?: { error?: string; message?: string }; status?: number }
      }
      // Asaas devolve a razão útil em `message` (ex.: "Transação não autorizada").
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        'Erro ao criar cobrança'
      return NextResponse.json(
        { error: errorMessage },
        { status: axiosError.response?.status || 500 },
      )
    }

    return NextResponse.json({ error: 'Erro interno ao criar cobrança' }, { status: 500 })
  }
}
