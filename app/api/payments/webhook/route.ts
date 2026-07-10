import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { confirmPaidMatricula } from '@/app/lib/checkout/confirm-matricula'

/**
 * Webhook de pagamento confirmado. Chamado pelo Elysium (orquestrador) quando a
 * cobrança é paga — funciona com a aba fechada (essencial p/ boleto/PIX).
 *
 * Auth (duas formas):
 *  1. **Elysium**: assinatura HMAC-SHA256 no header `x-elysium-signature`,
 *     validada com `ELYSIUM_WEBHOOK_SECRET` (o webhook secret deste site,
 *     gerado no painel). Caminho recomendado.
 *  2. **Fallback**: secret compartilhado `PAYMENTS_WEBHOOK_SECRET`
 *     (`x-webhook-secret` ou `?secret=`) — p/ webhooks legados do gateway.
 *
 * Corpo do Elysium: { event:'payment.confirmed', transactionId, status, ... }.
 * Só age em `payment.confirmed`. Sempre 200 (evita tempestade de retries).
 */
const SECRET = process.env.PAYMENTS_WEBHOOK_SECRET
const ELYSIUM_WEBHOOK_SECRET = process.env.ELYSIUM_WEBHOOK_SECRET

function verifyHmac(raw: string, signature: string | null): boolean {
  if (!signature || !ELYSIUM_WEBHOOK_SECRET) return false
  const expected = createHmac('sha256', ELYSIUM_WEBHOOK_SECRET)
    .update(raw)
    .digest('hex')
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(request: NextRequest) {
  try {
    // Corpo cru é necessário pra validar o HMAC sobre os mesmos bytes.
    const raw = await request.text()
    const url = new URL(request.url)
    const elysiumSig = request.headers.get('x-elysium-signature')

    let authed = false
    if (elysiumSig) {
      if (!verifyHmac(raw, elysiumSig)) {
        return NextResponse.json(
          { error: 'invalid signature' },
          { status: 401 },
        )
      }
      authed = true
    } else {
      const provided =
        request.headers.get('x-webhook-secret') ||
        url.searchParams.get('secret')
      if (SECRET && provided !== SECRET) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
      }
      authed = Boolean(SECRET) && provided === SECRET
    }

    const body = JSON.parse(raw || '{}') as Record<string, unknown>

    // O Elysium manda `event`; só agimos em pagamento confirmado.
    const event = body?.event as string | undefined
    if (event && event !== 'payment.confirmed') {
      return NextResponse.json({ ok: true, ignored: event }, { status: 200 })
    }

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
      return NextResponse.json(
        { ok: false, reason: 'no_transaction_id' },
        { status: 200 },
      )
    }

    // Autenticado (HMAC do Elysium ou secret) → confiamos no sinal de pago.
    const result = await confirmPaidMatricula(String(externalTransactionId), {
      trustPaid: authed,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('❌ /api/payments/webhook erro:', error)
    // Sempre 200 para não provocar tempestade de retries.
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
