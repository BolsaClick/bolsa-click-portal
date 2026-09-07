import { NextRequest, NextResponse } from 'next/server'
import { confirmPaidMatricula } from '@/app/lib/checkout/confirm-matricula'

/**
 * POST /api/checkout/matricula/confirm — passo 2 do checkout Cogna pago:
 * chamado pelo cliente assim que o pagamento da taxa é detectado como PAID
 * (PIX confirmado ou cartão aprovado). Valida o pagamento no Elysium, cria a
 * inscrição na Cogna e devolve o resultado para a tela decidir entre sucesso e
 * recusa — nunca mostra sucesso sem confirmar.
 *
 * Irmã de `/api/athena-checkout/confirm`. Existe separada de
 * `/api/payments/confirm` (que devolve só o resumo) porque a tela precisa do
 * detalhe da recusa e do estorno.
 *
 * Idempotente por `externalTransactionId`: o webhook do Elysium
 * (/api/payments/webhook) chama a MESMA função, então uma corrida entre os
 * dois nunca cria duas inscrições (ver confirm-matricula.ts).
 *
 * NUNCA trocar este polling por `/api/checkout/status/[id]`: aquela rota
 * sincroniza o status local para PAID e roubaria o claim atômico, deixando a
 * inscrição sem ninguém para criá-la.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const externalTransactionId = body?.externalTransactionId

    if (typeof externalTransactionId !== 'string' || !externalTransactionId.trim()) {
      return NextResponse.json({ error: 'externalTransactionId é obrigatório' }, { status: 400 })
    }

    const result = await confirmPaidMatricula(externalTransactionId.trim())

    if (result.ok) {
      return NextResponse.json({
        status: 'ok',
        inscriptionId: result.inscriptionId ?? null,
        alreadyDone: result.alreadyDone ?? false,
      })
    }

    // 202: pagamento ainda não confirmado no Elysium, ou outra chamada está
    // processando esta mesma transação agora. Não é erro — o cliente repete.
    if (result.status === 'PENDING') {
      return NextResponse.json({ status: 'pending' }, { status: 202 })
    }

    return NextResponse.json(
      {
        status: 'refused',
        reason: result.reason,
        errorCode: result.errorCode ?? null,
        refunded: result.refunded ?? false,
      },
      { status: 422 },
    )
  } catch (error) {
    console.error('❌ /api/checkout/matricula/confirm falhou:', error)
    return NextResponse.json(
      { status: 'error', message: 'Erro interno ao confirmar pagamento' },
      { status: 500 },
    )
  }
}
