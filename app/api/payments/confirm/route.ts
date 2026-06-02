import { NextRequest, NextResponse } from 'next/server'
import { confirmPaidMatricula } from '@/app/lib/checkout/confirm-matricula'

/**
 * Confirmação de pagamento disparada pelo CLIENTE quando o polling vê PAID.
 * É seguro expor: confirmPaidMatricula valida o pagamento no Elysium antes de
 * agir (trustPaid=false) e é idempotente. Acelera o tab-open; o webhook cobre
 * o tab-closed.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const externalTransactionId = body?.externalTransactionId
    if (!externalTransactionId) {
      return NextResponse.json(
        { ok: false, error: 'externalTransactionId is required' },
        { status: 400 }
      )
    }
    const result = await confirmPaidMatricula(String(externalTransactionId))
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ /api/payments/confirm erro:', error)
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
