import { NextRequest, NextResponse } from 'next/server'
import { confirmPaidEstacio } from '@/app/lib/checkout/confirm-estacio'

/**
 * POST /api/athena-checkout/confirm — passo 2 do checkout Estácio pago:
 * chamado pelo cliente assim que o pagamento da taxa (R$ 19,90) é detectado
 * como PAID (PIX confirmado ou cartão aprovado). Valida o pagamento no
 * Elysium, cria a inscrição na Athena e devolve o resultado para a tela
 * decidir entre sucesso e recusa — nunca mostra sucesso sem confirmar.
 *
 * Idempotente por `externalTransactionId`: o webhook do Elysium
 * (/api/payments/webhook) chama a MESMA função, então uma corrida entre os
 * dois nunca cria duas inscrições (ver confirm-estacio.ts).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const externalTransactionId = body?.externalTransactionId

    if (typeof externalTransactionId !== 'string' || !externalTransactionId.trim()) {
      return NextResponse.json({ error: 'externalTransactionId é obrigatório' }, { status: 400 })
    }

    const result = await confirmPaidEstacio(externalTransactionId.trim())

    if (result.status === 'ok') {
      return NextResponse.json({ status: 'ok', checkout: result.checkout })
    }

    if (result.status === 'pending') {
      // 202: pagamento ainda não confirmado no Elysium, ou outra chamada está
      // processando esta mesma transação agora. Não é erro — o cliente repete.
      return NextResponse.json({ status: 'pending' }, { status: 202 })
    }

    return NextResponse.json(
      { status: 'refused', reason: result.reason, errorCode: result.errorCode, refunded: result.refunded },
      { status: 422 },
    )
  } catch (error) {
    console.error('❌ /api/athena-checkout/confirm falhou:', error)
    return NextResponse.json(
      { status: 'error', message: 'Erro interno ao confirmar pagamento' },
      { status: 500 },
    )
  }
}
