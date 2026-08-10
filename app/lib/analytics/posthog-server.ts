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
  /**
   * Person properties (`$set`) — nome/email/telefone do candidato. Sem isto a
   * person criada pelo server tinha só o CPF como distinct_id e NENHUM dado de
   * contato: dava pra contar as inscrições, não pra saber quem eram nem falar
   * com elas. Chaves com valor undefined/null são descartadas para não
   * sobrescrever com vazio um dado que outra chamada já gravou.
   */
  personProperties?: Record<string, unknown>
  /**
   * `$set_once` — grava só na primeira vez (ex.: primeira marca/curso pelo qual
   * a pessoa entrou). Nunca sobrescreve em eventos posteriores.
   */
  personPropertiesOnce?: Record<string, unknown>
}): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!apiKey) return

  const clean = (obj?: Record<string, unknown>): Record<string, unknown> | undefined => {
    if (!obj) return undefined
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined && v !== null && v !== '') out[k] = v
    }
    return Object.keys(out).length > 0 ? out : undefined
  }

  const set = clean(params.personProperties)
  const setOnce = clean(params.personPropertiesOnce)

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
        ...(set ? { $set: set } : {}),
        ...(setOnce ? { $set_once: setOnce } : {}),
        source: 'server',
        $lib: 'bolsa-click-server',
      },
    }),
  })
  if (!res.ok) {
    throw new Error(`PostHog capture falhou: ${res.status} ${await res.text().catch(() => '')}`)
  }
}
