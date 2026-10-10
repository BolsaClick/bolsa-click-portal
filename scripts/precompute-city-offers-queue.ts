/**
 * Fila do precompute-city-offers — lógica pura, testada com dado sintético
 * (precompute-city-offers-queue.test.ts). Sem banco, sem Tartarus.
 *
 * POR QUE A FILA É POR PAR (2026-10-10)
 *
 * A fila antiga ordenava CURSOS pelo par mais velho e reconsultava o curso
 * inteiro. Duas inanições saíam disso:
 *
 *  1. Falha da Cogna num par não avança o `fetchedAt` dele (a Athena tem
 *     carimbo próprio). O par segue velho, puxa o curso para a frente na
 *     rodada seguinte e o curso reconsulta os 160 pares de novo. Medido em
 *     10/10: 197 cursos "mistos" com 10.025 linhas paradas desde 30/08–13/09
 *     (todas com `athenaFetchedAt` fresco), furando a fila toda semana, e 68
 *     cursos inteiros (10.880 linhas) sem ser alcançados desde 13/09–20/09.
 *  2. Par AUSENTE no cache virava época 0 e jogava o curso para a frente de
 *     tudo. Latente em 10/10 (grade 477×160 completa), mas morderia assim que
 *     a lista de cidades crescesse: 477 × N lacunas, todas na frente.
 *
 * Por par, um par que falha custa 1 consulta na rodada seguinte, não 160.
 *
 * POLÍTICA (aprovada pelo CEO em 2026-10-10)
 *
 * Urgência = idade ÷ SLA da camada do curso. Maior urgência primeiro.
 *  - Camada 1: cursos com `hasCityPages` — alimentam sitemap e gate de
 *    indexação. SLA de 7 dias.
 *  - Camada 2: os demais — só servem à elegibilidade do enable-city-pages-bulk.
 *    SLA de 28 dias, com o que sobrar do orçamento.
 *  - Lacuna (par sem linha) entra com urgência fixa GAP_URGENCY (0,75 = "como
 *    uma linha a 75% do SLA"): renovar o que está para furar o SLA vem antes
 *    de crescer, e crescer vem antes de renovar o que ainda está fresco.
 *    Preencher lacuna e renovar linha velha competem pelo mesmo orçamento;
 *    um número só decide quem ganha, em vez de "ausente = época 0", que ganhava
 *    de tudo.
 *
 * Por que não duas fases (todas as velhas, depois as lacunas): com o volume
 * atual a fase 1 nunca termina e as lacunas nunca entrariam — a tarefa 5
 * (mais cidades) ficaria parada para sempre sem ninguém ver. E por que não
 * cota fixa por tipo: uma cota adivinha a proporção certa; a urgência a deriva
 * do SLA.
 */

export type Tier = 1 | 2
export type PairKind = 'stale' | 'gap'

export const QUEUE_POLICY = {
  /** SLA dos cursos com página de cidade (sitemap + gate de indexação). */
  tier1SlaDays: 7,
  /** SLA dos demais cursos. */
  tier2SlaDays: 28,
  /** Lacuna vale como uma linha a esta fração do SLA da camada. */
  gapUrgency: 0.75,
} as const

const DAY_MS = 86_400_000

export interface QueueCourse {
  id: string
  hasCityPages: boolean
}

export interface QueueCity {
  slug: string
}

export interface WorkItem<C extends QueueCourse, Ci extends QueueCity> {
  course: C
  city: Ci
  kind: PairKind
  tier: Tier
  /** Idade em dias (null para lacuna). */
  ageDays: number | null
  urgency: number
}

export const pairKey = (courseId: string, citySlug: string) => `${courseId}|${citySlug}`

/**
 * Monta a fila ordenada.
 *
 * @param cached  `pairKey → fetchedAt` (carimbo da COGNA — é o que o corte de
 *                14 dias e o sitemap leem; a Athena tem carimbo próprio).
 * @param minAgeDays  linhas mais novas que isto ficam fora da rodada
 *                (`--max-age-days`; 0 = todas entram).
 *
 * Ordem estável: empates de urgência preservam camada 1 antes da 2 e, dentro
 * disso, a ordem de entrada dos cursos (trendScore desc) e das cidades
 * (ranking da lista).
 */
export function buildWorkQueue<C extends QueueCourse, Ci extends QueueCity>(input: {
  courses: C[]
  cities: Ci[]
  cached: Map<string, Date>
  now: Date
  minAgeDays: number
  policy?: typeof QUEUE_POLICY
}): WorkItem<C, Ci>[] {
  const policy = input.policy ?? QUEUE_POLICY
  const nowMs = input.now.getTime()
  const items: (WorkItem<C, Ci> & { order: number })[] = []
  let order = 0

  for (const course of input.courses) {
    const tier: Tier = course.hasCityPages ? 1 : 2
    const sla = tier === 1 ? policy.tier1SlaDays : policy.tier2SlaDays
    for (const city of input.cities) {
      const at = input.cached.get(pairKey(course.id, city.slug))
      if (!at) {
        items.push({ course, city, kind: 'gap', tier, ageDays: null, urgency: policy.gapUrgency, order: order++ })
        continue
      }
      const ageDays = (nowMs - at.getTime()) / DAY_MS
      if (input.minAgeDays > 0 && ageDays < input.minAgeDays) continue
      items.push({ course, city, kind: 'stale', tier, ageDays, urgency: ageDays / sla, order: order++ })
    }
  }

  items.sort((a, b) => b.urgency - a.urgency || a.tier - b.tier || a.order - b.order)
  return items.map((it) => ({
    course: it.course,
    city: it.city,
    kind: it.kind,
    tier: it.tier,
    ageDays: it.ageDays,
    urgency: it.urgency,
  }))
}

/** Corta a fila em lotes de tamanho fixo, na ordem de prioridade. */
export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

// ─── Motivo da falha ─────────────────────────────────────────────────────────

/**
 * Por que a chamada à Cogna (via Tartarus) não deu oferta. Os ~30% de falha
 * medidos em 04/10 são o teto real do precompute: se forem 429 em massa, a
 * resposta é reduzir volume, não otimizar fila. Por isso cada rodada grava
 * esta distribuição (ActivityLog, ver precompute-city-offers.ts).
 *
 * `ok_vazio` NÃO é falha numa chamada isolada — é indistinguível de "não tem
 * oferta aqui". Conta à parte, junto com quantos vazios caíram em lote
 * suspeito (o modo silencioso "200 com lista vazia sob carga").
 */
export type FailureReason =
  | 'http_429'
  | 'bloqueio_antifraude'
  | 'timeout'
  | 'http_5xx'
  | 'http_4xx'
  | 'rede'
  | 'outro'

interface ErrorLike {
  code?: unknown
  message?: unknown
  response?: { status?: unknown; data?: unknown }
}

/** Minutos de bloqueio quando a Cogna os anuncia ("bloqueado por 55 minutos"). */
export function blockedMinutes(err: unknown): number | null {
  const e = (err ?? {}) as ErrorLike
  const data = (e.response?.data ?? {}) as { message?: unknown; cognaError?: { message?: unknown } }
  const texts = [data.cognaError?.message, data.message, e.message].filter(
    (t): t is string => typeof t === 'string',
  )
  for (const t of texts) {
    const m = /bloquead[oa]\s+por\s+(\d+)\s*minuto/i.exec(t)
    if (m) return Number(m[1])
  }
  return null
}

/**
 * Classifica a falha. Lê o status ORIGINAL da Cogna (`cognaStatus`), porque o
 * Tartarus reempacota 429 como 400 — classificar pelo HTTP do BFF contaria o
 * antifraude como "4xx genérico". Cai para a mensagem no formato que o
 * interceptor de app/lib/api/axios.ts injeta ("[HTTP 429]") quando o corpo
 * estruturado não vem.
 */
export function classifyFailure(err: unknown): FailureReason {
  const e = (err ?? {}) as ErrorLike
  if (blockedMinutes(err) !== null) return 'bloqueio_antifraude'

  const data = (e.response?.data ?? {}) as { cognaStatus?: unknown }
  const message = typeof e.message === 'string' ? e.message : ''
  const fromMessage = /\[HTTP (\d{3})\]/.exec(message)
  const status =
    typeof data.cognaStatus === 'number'
      ? data.cognaStatus
      : fromMessage
        ? Number(fromMessage[1])
        : typeof e.response?.status === 'number'
          ? e.response.status
          : null

  if (status === 429) return 'http_429'
  if (e.code === 'ECONNABORTED' || e.code === 'ETIMEDOUT' || /timeout/i.test(message)) return 'timeout'
  if (status !== null && status >= 500) return 'http_5xx'
  if (status !== null && status >= 400) return 'http_4xx'
  if (!e.response && typeof e.code === 'string') return 'rede'
  return 'outro'
}

export type FailureTally = Record<FailureReason, number>

export const emptyTally = (): FailureTally => ({
  http_429: 0,
  bloqueio_antifraude: 0,
  timeout: 0,
  http_5xx: 0,
  http_4xx: 0,
  rede: 0,
  outro: 0,
})

// ─── Zero sobre positivo ─────────────────────────────────────────────────────

/** Reconsultas de "zero sobre positivo" por lote — teto de carga na Cogna. */
export const ZERO_RECHECK_CAP = 10

/**
 * Pares em que a Cogna respondeu 200 com ZERO onde o cache tinha oferta.
 *
 * O controle positivo por lote só pega o lote INTEIRO zerado. A falha
 * silenciosa intermitente ("200 com lista vazia sob carga", vista pelo CEO na
 * varredura de 10/10: Pedagogia e Ciências Contábeis com totalItems = 0) zera
 * pares soltos num lote saudável, e cada um sobrescreveria dado bom. Esses pares
 * ganham uma reconsulta atrasada. Acima do teto, o zero NÃO é gravado: a linha
 * fica como está e, por estar velha, volta primeiro na rodada seguinte, ao custo
 * de 1 consulta.
 *
 * Por que não tratar todo 200-vazio como falha: aí nenhum zero seria gravado
 * nunca, e oferta que sumiu de verdade ficaria positiva no cache para sempre,
 * deixando a página indexada com a tela vazia.
 */
export function zeroOverPositive<T extends { key: string; offerCount: number; ok: boolean }>(
  results: T[],
  previous: Map<string, number>,
  cap: number = ZERO_RECHECK_CAP,
): { recheck: T[]; overflow: T[] } {
  const candidates = results.filter((x) => x.ok && x.offerCount === 0 && (previous.get(x.key) ?? 0) > 0)
  return { recheck: candidates.slice(0, cap), overflow: candidates.slice(cap) }
}
