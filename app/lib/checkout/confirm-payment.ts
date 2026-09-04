import { prisma } from '@/app/lib/prisma'
import { confirmPaidMatricula, type ConfirmResult } from '@/app/lib/checkout/confirm-matricula'
import { confirmPaidEstacio, ESTACIO_CHECKOUT_FLOW } from '@/app/lib/checkout/confirm-estacio'

/**
 * Roteia a confirmação de pagamento para o fluxo dono da transação.
 *
 * Existe porque agora há mais de um checkout pago no portal, cada um com o seu
 * próprio "o que fazer depois de pagar":
 *  - `metadata.checkoutFlow === 'estacio'` → inscrição na Athena/YDUQS, com
 *    estorno se a Estácio recusar (`confirm-estacio.ts`);
 *  - qualquer outro → fluxo Cogna/matrícula de sempre (`confirm-matricula.ts`),
 *    que é o comportamento histórico e continua sendo o default.
 *
 * O discriminador é gravado na criação da cobrança (ver
 * `/api/athena-checkout/charge`) — transação sem ele cai no fluxo antigo, que
 * é exatamente o que acontecia antes deste roteador existir.
 */
export async function confirmPaidTransaction(
  externalTransactionId: string,
  opts?: { trustPaid?: boolean },
): Promise<ConfirmResult> {
  let checkoutFlow: unknown

  try {
    const tx = await prisma.transaction.findFirst({
      where: { externalTransactionId },
      select: { metadata: true },
    })
    const metadata = tx?.metadata as Record<string, unknown> | null | undefined
    checkoutFlow = metadata?.checkoutFlow
  } catch (e) {
    // Não sabemos o fluxo: cair no default é melhor do que não confirmar nada.
    console.error('⚠️ confirmPaidTransaction: falha ao ler o fluxo da transação', {
      externalTransactionId,
      error: e instanceof Error ? e.message : String(e),
    })
  }

  if (checkoutFlow === ESTACIO_CHECKOUT_FLOW) {
    const result = await confirmPaidEstacio(externalTransactionId, opts)
    // Normaliza para o contrato de ConfirmResult, que é o que webhook e
    // /api/payments/confirm respondem hoje. A tela do checkout Estácio usa a
    // rota própria (/api/athena-checkout/confirm), que devolve o detalhe.
    if (result.status === 'ok') {
      return { ok: true, status: 'PAID', alreadyDone: result.alreadyDone }
    }
    if (result.status === 'pending') {
      return { ok: false, status: 'PENDING' }
    }
    return {
      ok: false,
      status: 'REFUSED',
      alreadyDone: result.alreadyDone,
      reason: result.reason,
    }
  }

  return confirmPaidMatricula(externalTransactionId, opts)
}
