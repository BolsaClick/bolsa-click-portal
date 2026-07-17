/**
 * Avaliação de feature flags do PostHog no SERVIDOR, sem posthog-node.
 * Usa a mesma chave pública do browser (NEXT_PUBLIC_POSTHOG_KEY) contra o
 * endpoint /flags. Pensado para kill switches GLOBAIS (rollout 0% ou 100%),
 * não para A/B por usuário: usamos um distinct_id fixo ('server-global'), então
 * 0% → false pra todos, 100% → true pra todos. Em rollout parcial o valor é
 * determinístico (tudo-ou-nada), então use só 0/100 nesses toggles.
 *
 * Cache em memória (60s) pra não bater na API a cada request — o valor de um
 * kill switch muda raramente e uma defasagem de até ~1min é aceitável.
 */

type CacheEntry = { value: boolean; expires: number }
const cache = new Map<string, CacheEntry>()
const TTL_MS = 60_000
const ERROR_TTL_MS = 10_000

function posthogHost(): string {
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST
  // No browser é o rewrite relativo /ingest; no server precisa ser absoluto.
  if (host && host.startsWith('http')) return host.replace(/\/$/, '')
  return 'https://us.i.posthog.com'
}

/**
 * @param key      chave da flag no PostHog
 * @param fallback valor quando a flag não pôde ser lida (PostHog fora, sem key,
 *                 erro de rede). Para um kill switch de "desligar", use `false`
 *                 — o modo de falha seguro é manter o recurso escondido.
 */
export async function isServerFlagEnabled(key: string, fallback = false): Promise<boolean> {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!apiKey) return fallback

  const cached = cache.get(key)
  if (cached && cached.expires > Date.now()) return cached.value

  try {
    const res = await fetch(`${posthogHost()}/flags?v=2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, distinct_id: 'server-global' }),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`flags ${res.status}`)
    const data = await res.json()
    // Suporta os dois formatos: /flags?v=2 ({flags:{k:{enabled}}}) e o legado
    // /decide ({featureFlags:{k:true}}).
    const raw = data?.flags?.[key]?.enabled ?? data?.featureFlags?.[key]
    const value = raw === true
    cache.set(key, { value, expires: Date.now() + TTL_MS })
    return value
  } catch {
    // Erro: devolve o fallback e cacheia curto pra não martelar a API.
    cache.set(key, { value: fallback, expires: Date.now() + ERROR_TTL_MS })
    return fallback
  }
}
