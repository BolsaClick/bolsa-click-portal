import { NextRequest, NextResponse } from 'next/server'
import { confirmPaidCampaign } from '@/app/lib/checkout/confirm-campaign'

/**
 * POST /api/ingressa/checkout/confirm — passo 2 do checkout pago da campanha:
 * chamado pelo cliente assim que o pagamento (R$ 58,90) é detectado como
 * PAID (PIX confirmado ou cartão aprovado). Confirma no Elysium, cria a
 * inscrição na Cogna e devolve o resultado para a tela decidir entre sucesso
 * e erro (nunca mostra sucesso sem confirmar — ver confirm-campaign.ts).
 *
 * Idempotente por `externalTransactionId`: pode ser chamado mais de uma vez
 * (retry de rede, duplo clique) sem duplicar a inscrição na Cogna.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const externalTransactionId = body?.externalTransactionId

    if (typeof externalTransactionId !== 'string' || !externalTransactionId.trim()) {
      return NextResponse.json({ error: 'externalTransactionId é obrigatório' }, { status: 400 })
    }

    const result = await confirmPaidCampaign(externalTransactionId.trim())

    if (result.status === 'ok') {
      return NextResponse.json({ status: 'ok', inscriptionId: result.inscriptionId })
    }

    if (result.status === 'pending') {
      // 202: pagamento ainda não confirmado no Elysium, ou outra chamada está
      // processando esta mesma transação agora. Não é erro — o cliente repete.
      return NextResponse.json({ status: 'pending' }, { status: 202 })
    }

    return NextResponse.json(
      { status: 'refused', reason: result.reason, refunded: result.refunded },
      { status: 422 },
    )
  } catch (error) {
    console.error('❌ /api/ingressa/checkout/confirm falhou:', error)
    return NextResponse.json({ status: 'error', message: 'Erro interno ao confirmar pagamento' }, { status: 500 })
  }
}
