import { NextRequest, NextResponse } from 'next/server'
import { elysium } from '@/app/lib/api/axios'
import { prisma } from '@/app/lib/prisma'
import type { CreateEnrollmentInput } from '@/app/lib/api/athena-offers'
import { getEmailMxRejectionMessage } from '@/app/lib/validation/email-mx'
import {
  TAXA_MATRICULA_ESTACIO_CENTAVOS,
  taxaMatriculaEstacioDescription,
} from '@/app/lib/checkout/taxa-estacio'
import {
  ESTACIO_CHECKOUT_FLOW,
  type EstacioConfirmBlob,
} from '@/app/lib/checkout/confirm-estacio'
import { capturePostHogServerEvent } from '@/app/lib/analytics/posthog-server'

/**
 * POST /api/athena-checkout/charge — passo 1 do checkout Estácio pago: cria a
 * cobrança da taxa de matrícula do Bolsa Click (R$ 19,90) no Elysium e
 * persiste tudo que a confirmação precisa para criar a inscrição na Athena
 * DEPOIS do pagamento — nunca antes.
 *
 * Irmã de `app/api/checkout/route.ts` (genérico do portal): mesmo contrato de
 * cobrança no Elysium, mas `amountInCents` é FIXO no servidor (nunca confia no
 * valor que o cliente manda) e o payload da inscrição vai para
 * `Transaction.metadata.estacio`, com `metadata.checkoutFlow = 'estacio'` —
 * é esse campo que faz o webhook rodar a confirmação certa.
 *
 * A cobrança da PRÓPRIA Estácio (mensalidade/matrícula da instituição, com PIX
 * e link de pagamento) continua existindo e é ADICIONAL: ela nasce junto com a
 * inscrição, na confirmação, e aparece na tela de sucesso.
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

interface EstacioChargeBody {
  enrollment: CreateEnrollmentInput
  offer?: EstacioConfirmBlob['offer']
  paymentMethod: 'pix' | 'card'
  installmentCount?: number
  creditCard?: CreditCard
  creditCardHolderInfo?: CreditCardHolderInfo
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EstacioChargeBody
    const { enrollment, offer, paymentMethod = 'pix', installmentCount, creditCard, creditCardHolderInfo } = body || {}

    // Validação dos obrigatórios da INSCRIÇÃO antes de cobrar: um dado que a
    // Athena recusaria depois viraria taxa paga + estorno, com o candidato
    // achando que foi cobrado à toa.
    const { offerId, student, address, options } = enrollment || ({} as CreateEnrollmentInput)
    if (!offerId || !student?.name || !student?.cpf || !student?.email || !student?.mobile) {
      return NextResponse.json(
        { error: 'offerId e student (name, cpf, email, mobile) são obrigatórios' },
        { status: 400 },
      )
    }
    if (!address?.zipCode || !address?.state || !address?.city) {
      return NextResponse.json(
        { error: 'address (zipCode, state, city) é obrigatório' },
        { status: 400 },
      )
    }
    if (!options?.acceptTerms) {
      return NextResponse.json(
        { error: 'É necessário aceitar os termos (options.acceptTerms)' },
        { status: 400 },
      )
    }
    if (paymentMethod === 'card' && (!creditCard || !creditCardHolderInfo)) {
      return NextResponse.json(
        { error: 'creditCard e creditCardHolderInfo são obrigatórios para paymentMethod=card' },
        { status: 400 },
      )
    }

    // Domínio sem MX não recebe e-mail nenhum — erro comprovado, não suspeita.
    // Fail-open embutido: só rejeita quando a consulta DNS PROVA que o domínio
    // não tem MX (ver app/lib/validation/email-mx.ts).
    const mxRejection = await getEmailMxRejectionMessage(student.email)
    if (mxRejection) {
      return NextResponse.json({ error: mxRejection }, { status: 422 })
    }

    const cleanCpf = student.cpf.replace(/\D/g, '')
    const cleanPhone = student.mobile.replace(/\D/g, '')

    const blob: EstacioConfirmBlob = {
      enrollment,
      offer: {
        offerId,
        courseName: offer?.courseName,
        brand: offer?.brand,
        modality: offer?.modality,
        city: offer?.city,
        state: offer?.state,
        academicLevel: offer?.academicLevel,
        monthlyPrice: offer?.monthlyPrice,
      },
    }

    // Valor FIXO, do servidor. O cliente nem manda valor — e se mandasse, seria
    // ignorado.
    const amountInCents = TAXA_MATRICULA_ESTACIO_CENTAVOS
    const description = taxaMatriculaEstacioDescription(offer?.courseName)
    const institutionName = offer?.brand || 'Estácio'

    const checkoutPayload = {
      name: student.name,
      cpf: cleanCpf,
      email: student.email,
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
        source: 'checkout-estacio',
        institutionName,
        courseName: offer?.courseName,
        offerId,
      },
    }

    console.log(`💳 Criando cobrança da taxa Estácio ${paymentMethod.toUpperCase()} no Elysium...`, {
      email: student.email,
      amountInCents,
      offerId,
    })

    const response = await elysium.post('/checkout', checkoutPayload)

    const externalTransactionId: string | undefined = response.data?.transactionId
    if (externalTransactionId) {
      const metadata = {
        checkoutFlow: ESTACIO_CHECKOUT_FLOW,
        estacio: blob,
        elysium: response.data,
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
            name: student.name,
            cpf: cleanCpf,
            email: student.email,
            phone: cleanPhone,
            amountInCents,
            paymentMethod,
            status: 'PENDING',
            externalTransactionId,
            courseId: offerId,
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
        console.error('🚨 Falha ao persistir a Transaction do checkout Estácio:', persistError)
        return NextResponse.json(
          { error: 'Não foi possível iniciar o pagamento agora. Tente de novo em instantes.' },
          { status: 500 },
        )
      }

      try {
        await capturePostHogServerEvent({
          event: 'estacio_taxa_charge_created',
          distinctId: cleanCpf,
          eventId: `${externalTransactionId}_created`,
          properties: {
            transaction_id: externalTransactionId,
            value: amountInCents / 100,
            currency: 'BRL',
            course_name: offer?.courseName || null,
            brand: offer?.brand || null,
            offer_id: offerId,
            payment_method: paymentMethod,
            flow: 'estacio',
          },
          personProperties: { name: student.name, phone: cleanPhone, email: student.email },
        })
      } catch (e) {
        console.error('⚠️ PostHog estacio_taxa_charge_created falhou:', e)
      }
    }

    return NextResponse.json(response.data)
  } catch (error: unknown) {
    console.error('❌ Erro ao criar a cobrança da taxa Estácio:', error)

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: { data?: { error?: string; message?: string }; status?: number }
      }
      // Asaas devolve a razão útil em `message` (ex.: "Transação não autorizada").
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        'Erro ao criar cobrança'
      return NextResponse.json({ error: errorMessage }, { status: axiosError.response?.status || 500 })
    }

    return NextResponse.json({ error: 'Erro interno ao criar cobrança' }, { status: 500 })
  }
}
