import { NextRequest, NextResponse } from 'next/server'
import { confirmPaidMatricula } from '@/app/lib/checkout/confirm-matricula'

/**
 * Webhook de pagamento confirmado. Deve ser chamado pelo Elysium (ou pelo
 * gateway) quando a cobrança é paga — funciona mesmo com a aba do usuário
 * fechada (essencial para boleto). Autenticado por PAYMENTS_WEBHOOK_SECRET
 * (header `x-webhook-secret` ou query `?secret=`).
 *
 * Contrato esperado (qualquer um destes campos com o id da transação no gateway):
 *   { externalTransactionId } | { transactionId } | { data: { transparent: { externalId | id } } }
 */
const SECRET = process.env.PAYMENTS_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const provided =
      request.headers.get('x-webhook-secret') || url.searchParams.get('secret')

    // Se houver secret configurado, é obrigatório bater.
    if (SECRET && provided !== SECRET) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({} as Record<string, unknown>))
    const data = (body?.data ?? {}) as Record<string, unknown>
    const transparent = (data?.transparent ?? {}) as Record<string, unknown>
    const externalTransactionId =
      body?.externalTransactionId ||
      body?.transactionId ||
      transparent?.externalId ||
      transparent?.id ||
      data?.externalId ||
      data?.id

    if (!externalTransactionId) {
      return NextResponse.json({ ok: false, reason: 'no_transaction_id' }, { status: 200 })
    }

    // Quando o webhook é autenticado pelo secret, confiamos no sinal de pago
    // (evita corrida com a atualização de status no Elysium). Sem secret
    // configurado, validamos via Elysium por segurança.
    const trustPaid = Boolean(SECRET) && provided === SECRET
    const result = await confirmPaidMatricula(String(externalTransactionId), { trustPaid })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('❌ /api/payments/webhook erro:', error)
    // Sempre 200 para não provocar tempestade de retries do gateway.
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
