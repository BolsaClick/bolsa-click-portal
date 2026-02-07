import { NextRequest, NextResponse } from 'next/server'
import { elysium } from '@/app/lib/api/axios'

interface CheckoutRequest {
  name: string
  cpf: string
  email: string
  phone: string
  amountInCents: number
  description: string
  paymentMethod?: 'pix' | 'card'
  couponCode?: string
  brand?: string
  metadata?: Record<string, unknown>
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
      couponCode,
      brand,
      metadata,
    } = body

    // Validação básica
    if (!name || !cpf || !email || !phone || amountInCents === undefined) {
      return NextResponse.json(
        { error: 'name, cpf, email, phone and amountInCents are required' },
        { status: 400 }
      )
    }

    // Limpar CPF e telefone
    const cleanCpf = cpf.replace(/\D/g, '')
    const cleanPhone = phone.replace(/\D/g, '')

    // Construir payload para Elysium
    const checkoutPayload = {
      name,
      cpf: cleanCpf,
      email,
      phone: cleanPhone,
      amountInCents,
      description,
      paymentMethod,
      ...(couponCode && { couponCode }),
      ...(brand && { brand }),
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

    return NextResponse.json(response.data)
  } catch (error: unknown) {
    console.error('❌ Erro ao criar checkout:', error)

    // Tentar extrair mensagem de erro da resposta
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { error?: string; message?: string }; status?: number } }
      const errorMessage = axiosError.response?.data?.error || axiosError.response?.data?.message || 'Erro ao criar checkout'
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
