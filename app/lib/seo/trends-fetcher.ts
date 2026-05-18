// Wrapper do google-trends-api (NPM, unofficial scraper). Inclui retry com
// backoff exponencial, throttling entre topics e detecção de rate-limit (429).
// Quando Google bloqueia o IP, retorna { rateLimited: true } pra a UI mostrar
// estado degradado e usar último snapshot do DB como fallback.
//
// Limitações conhecidas:
// - Endpoints raspam HTML/JSON do trends.google.com. Sem garantia de uptime.
// - Em Vercel funciona melhor que dev local (IPs rotativos).
// - Pra produção crítica, migrar pra DataForSEO/Semrush (Fase 4 do plano).

import gt from 'google-trends-api'

const SLEEP = (ms: number) => new Promise((r) => setTimeout(r, ms))

export interface TrendsEntryRaw {
  query: string
  value: number
  isRising: boolean
}

export interface TrendsFetchResult {
  topic: string
  timeframe: string
  region: string
  entries: TrendsEntryRaw[]
  rawData: unknown
  rateLimited: boolean
  error?: string
}

const DEFAULT_TIMEFRAME_DAYS = 7

export async function fetchTrendsForTopic(
  topic: string,
  opts: { timeframeDays?: number; region?: string; retries?: number } = {},
): Promise<TrendsFetchResult> {
  const timeframeDays = opts.timeframeDays ?? DEFAULT_TIMEFRAME_DAYS
  const region = opts.region ?? 'BR'
  const retries = opts.retries ?? 2

  const timeframe = `now ${timeframeDays}-d`
  const startTime = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000)

  let lastError: string | undefined

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const raw = await gt.relatedQueries({
        keyword: topic,
        geo: region,
        startTime,
      })

      // Detect Google's 429 HTML response (não-JSON)
      if (typeof raw === 'string' && raw.trim().startsWith('<')) {
        lastError = 'rate-limited (HTML response)'
        if (attempt < retries) {
          await SLEEP(2000 * Math.pow(2, attempt))
          continue
        }
        return {
          topic,
          timeframe,
          region,
          entries: [],
          rawData: { error: 'rate_limited' },
          rateLimited: true,
        }
      }

      const parsed = JSON.parse(raw)
      const topList = parsed?.default?.rankedList?.[0]?.rankedKeyword ?? []
      const risingList = parsed?.default?.rankedList?.[1]?.rankedKeyword ?? []

      const entries: TrendsEntryRaw[] = [
        ...topList.map((k: { query: string; value: number }) => ({
          query: k.query,
          value: Number(k.value) || 0,
          isRising: false,
        })),
        ...risingList.map((k: { query: string; value: number }) => ({
          query: k.query,
          value: Number(k.value) || 0,
          isRising: true,
        })),
      ]

      return { topic, timeframe, region, entries, rawData: parsed, rateLimited: false }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
      if (attempt < retries) {
        await SLEEP(1500 * Math.pow(2, attempt))
      }
    }
  }

  return {
    topic,
    timeframe,
    region,
    entries: [],
    rawData: { error: lastError ?? 'unknown' },
    rateLimited: false,
    error: lastError,
  }
}

// Fetch sequencial de múltiplos topics com throttle pra reduzir chance de 429.
// 1.5s entre cada chamada (~40 topics/minuto).
export async function fetchTrendsForMany(
  topics: string[],
  opts: { timeframeDays?: number; region?: string; throttleMs?: number } = {},
): Promise<TrendsFetchResult[]> {
  const throttle = opts.throttleMs ?? 1500
  const results: TrendsFetchResult[] = []
  for (const topic of topics) {
    const r = await fetchTrendsForTopic(topic, opts)
    results.push(r)
    // Se rate limit, para o batch (evita queimar pior)
    if (r.rateLimited) break
    await SLEEP(throttle)
  }
  return results
}
