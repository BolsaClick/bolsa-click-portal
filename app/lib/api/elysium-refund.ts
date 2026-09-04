import { elysium } from './axios'

/**
 * Estorno de uma cobrança criada no Elysium.
 *
 * Usado quando a taxa já foi paga e o parceiro recusa a inscrição depois —
 * o aluno NUNCA pode ficar pago e sem inscrição em silêncio.
 *
 * Endpoint: `POST /checkout/:transactionId/refund`. Respostas conhecidas:
 * 200 (ok), 400 (not_paid), 422 (refund_not_supported), 502
 * (gateway_refund_failed). Asaas: refund nativo. AbacatePay:
 * /v2/transparents/refund (PIX) ou 422 (boleto).
 *
 * Idempotente — seguro em retry. Falhou (não-2xx)? O caller registra a
 * pendência no CRM/log e segue: o estorno não é rede única.
 */
export async function refundElysiumCharge(
  externalTransactionId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await elysium.post(`/checkout/${encodeURIComponent(externalTransactionId)}/refund`)
    return { ok: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(
      '🚨 refundElysiumCharge: o Elysium NÃO confirmou o estorno — aluno pago sem inscrição, estorno manual necessário no gateway',
      { externalTransactionId, error: message },
    )
    return { ok: false, error: message }
  }
}
