import { NextRequest, NextResponse } from 'next/server'
import { elysium } from '@/app/lib/api/axios'
import { prisma } from '@/app/lib/prisma'

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
  cpfCnpj: string // só dígitos
  postalCode: string // CEP só dígitos
  addressNumber: string
  addressComplement?: string
  phone?: string
  mobilePhone?: string
}

interface CheckoutRequest {
  name: string
  cpf: string
  email: string
  phone: string
  amountInCents: number
  description: string
  paymentMethod?: 'pix' | 'card' | 'boleto'
  /** Cartão: nº de parcelas (1 = à vista; até 21x). */
  installmentCount?: number
  creditCard?: CreditCard
  creditCardHolderInfo?: CreditCardHolderInfo
  couponCode?: string
  brand?: string
  city?: string
  channel?: string
  metadata?: Record<string, unknown>
}

/** Lê uma string de dentro do metadata da request, se existir. */
function metaString(
  metadata: Record<string, unknown> | undefined,
  key: string
): string | undefined {
  const value = metadata?.[key]
  return typeof value === 'string' ? value : undefined
}

// POST - Criar checkout (PIX ou Cartão)
export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json()

    const {
      name,
      cpf,
      email,
      phone,
      amountInCents,
      description,
      paymentMethod = 'pix',
      installmentCount,
      creditCard,
      creditCardHolderInfo,
      couponCode,
      brand,
      city,
      channel,
      metadata,
    } = body

    // Validação básica
    if (!name || !cpf || !email || !phone || amountInCents === undefined) {
      return NextResponse.json(
        { error: 'name, cpf, email, phone and amountInCents are required' },
        { status: 400 }
      )
    }

    // Cartão exige os dados do cartão + dados do portador.
    if (paymentMethod === 'card' && (!creditCard || !creditCardHolderInfo)) {
      return NextResponse.json(
        { error: 'creditCard and creditCardHolderInfo are required for paymentMethod=card' },
        { status: 400 }
      )
    }

    // Limpar CPF e telefone
    const cleanCpf = cpf.replace(/\D/g, '')
    const cleanPhone = phone.replace(/\D/g, '')

    // Construir payload para Elysium. Dados de cartão são repassados ao gateway
    // (Asaas) pelo Elysium — NUNCA são logados nem persistidos no portal.
    const checkoutPayload = {
      name,
      cpf: cleanCpf,
      email,
      phone: cleanPhone,
      amountInCents,
      description,
      paymentMethod,
      ...(installmentCount && { installmentCount }),
      ...(creditCard && {
        creditCard: { ...creditCard, number: creditCard.number.replace(/\D/g, '') },
      }),
      ...(creditCardHolderInfo && { creditCardHolderInfo }),
      ...(couponCode && { couponCode }),
      ...(brand && { brand }),
      ...(city && { city }),
      ...(channel && { channel }),
      ...(metadata && { metadata }),
    }

    console.log(`💳 Criando checkout ${paymentMethod.toUpperCase()} no Elysium...`, {
      name,
      email,
      amountInCents,
      paymentMethod,
    })

    // Chamar API Elysium
    const response = await elysium.post('/checkout', checkoutPayload)

    console.log(`✅ Checkout ${paymentMethod.toUpperCase()} criado com sucesso:`, {
      transactionId: response.data.transactionId,
      paymentMethod: response.data.paymentMethod,
    })

    // Persistir transação local para suportar polling de status e a criação da
    // inscrição após confirmação do pagamento. O `externalTransactionId` é o id
    // retornado pelo Elysium — é por ele que /api/checkout/status/[id] consulta.
    const externalTransactionId: string | undefined = response.data?.transactionId
    if (externalTransactionId) {
      try {
        const pixQrCode = response.data?.pixQrCode
        await prisma.transaction.upsert({
          where: { externalTransactionId },
          update: {
            pixBrCode: pixQrCode?.brCode ?? undefined,
            pixQrCodeBase64: pixQrCode?.brCodeBase64 ?? undefined,
            metadata: { ...(metadata ?? {}), elysium: response.data } as object,
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
            courseId: metaString(metadata, 'courseId'),
            courseName: metaString(metadata, 'courseName'),
            institutionName: metaString(metadata, 'institutionName'),
            leadId: metaString(metadata, 'leadId'),
            pixBrCode: pixQrCode?.brCode ?? undefined,
            pixQrCodeBase64: pixQrCode?.brCodeBase64 ?? undefined,
            metadata: { ...(metadata ?? {}), elysium: response.data } as object,
          },
        })
      } catch (persistError) {
        // Não falhar o checkout por causa da persistência local — o pagamento
        // pode prosseguir; apenas logamos para investigar (polling pode 404).
        console.error('⚠️ Falha ao persistir Transaction local do checkout:', persistError)
      }
    }

    return NextResponse.json(response.data)
  } catch (error: unknown) {
    console.error('❌ Erro ao criar checkout:', error)

    // Tentar extrair mensagem de erro da resposta
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { error?: string; message?: string }; status?: number } }
      // Asaas devolve a razão útil em `message` (ex.: "Transação não autorizada").
      // `error` costuma ser só "Bad Request" — por isso priorizamos `message`.
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Erro ao criar checkout'
      return NextResponse.json(
        { error: errorMessage },
        { status: axiosError.response?.status || 500 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno ao criar checkout' },
      { status: 500 }
    )
  }
}
