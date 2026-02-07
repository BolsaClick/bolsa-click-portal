import { NextResponse } from 'next/server'

/**
 * GET - Retorna a chave pública do Stripe para o frontend.
 * OBRIGATÓRIO: deve ser a chave da MESMA conta Stripe que o Elysium usa para criar o PaymentIntent.
 * Se for de outra conta, o Stripe retorna: "client_secret does not match any PaymentIntent on this account".
 */
export async function GET() {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()

  if (!publishableKey || publishableKey.length < 10) {
    return NextResponse.json(
      {
        error:
          'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY não configurada. Use a chave pública da MESMA conta Stripe que o Elysium usa (Dashboard Stripe da conta do Elysium).',
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ publishableKey })
}
