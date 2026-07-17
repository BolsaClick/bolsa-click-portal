/**
 * Captura de eventos no PostHog a partir do servidor (webhook/polling), sem
 * SDK — POST direto na API pública de capture. Usado para conversões que não
 * dependem do navegador (ex.: pagamento confirmado com a aba fechada), que o
 * funil browser-only perdia.
 *
 * A chave pública (NEXT_PUBLIC_POSTHOG_KEY) é a mesma do browser — a API de
 * capture só aceita escrita, não leitura. `$insert_id` = eventId garante
 * idempotência em retries de webhook.
 */

function posthogHost(): string {
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST
  // No browser o host é o rewrite relativo /ingest; no server precisa ser absoluto.
  if (host && host.startsWith('http')) return host.replace(/\/$/, '')
  return 'https://us.i.posthog.com'
}

export async function capturePostHogServerEvent(params: {
  event: string
  /** Deve casar com o distinct_id do browser (checkout usa CPF só dígitos). */
  distinctId: string
  /** Id estável do evento (ex.: externalTransactionId) — dedupa retries. */
  eventId?: string
  properties?: Record<string, unknown>
}): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!apiKey) return

  const res = await fetch(`${posthogHost()}/capture/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      event: params.event,
      distinct_id: params.distinctId,
      timestamp: new Date().toISOString(),
      properties: {
        ...params.properties,
        ...(params.eventId ? { $insert_id: params.eventId } : {}),
        source: 'server',
        $lib: 'bolsa-click-server',
      },
    }),
  })
  if (!res.ok) {
    throw new Error(`PostHog capture falhou: ${res.status} ${await res.text().catch(() => '')}`)
  }
}
