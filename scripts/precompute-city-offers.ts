#!/usr/bin/env tsx
/**
 * scripts/precompute-city-offers.ts
 *
 * Itera FeaturedCourse enriquecido × top N cidades brasileiras, bate Tartarus
 * `cogna/courses/search` e cacheia offerCount + minPrice em CityCourseOfferCache.
 *
 * Cron: semanal (.github/workflows/precompute-city-offers.yml). A rodada é
 * INCREMENTAL — só reconsulta o que passou de --max-age-days — e para sozinha em
 * --time-budget-min. Revarrer os 76.320 pares toda semana era o que estourava o
 * teto de 300min do runner: a rodada de 30/08 foi cancelada em 5h00m19s no meio,
 * e as 30.900 linhas que ela não alcançou ficaram com medição de 23/08.
 *
 * FILA POR PAR (2026-10-10): a fila deixou de ser por curso. Ver
 * precompute-city-offers-queue.ts — política (SLA 7d para cursos com página de
 * cidade, 28d para os demais, lacuna = 75% do SLA) e as duas inanições que a
 * fila por curso causava. Cada rodada grava em ActivityLog a distribuição do
 * MOTIVO das falhas (429, timeout, 5xx, 200-vazio…) e o frescor resultante —
 * os logs do Actions não são legíveis por ninguém do time hoje (gh sem login),
 * então o resumo precisa morar no banco. Ler com:
 *   npx tsx --env-file=.env scripts/precompute-run-report.ts
 *
 * Usado pra:
 *  - Sitemap filter: só emite URL se offerCount real ≥ 1 (lê do cache em vez
 *    de chamar Tartarus live no momento de gerar sitemap).
 *  - enable-city-pages-bulk.ts: critério de elegibilidade pra ligar hasCityPages.
 *  - Futuro: page render pode ler do cache (hoje ainda chama Tartarus live;
 *    cache aqui é principalmente pra sitemap/activation).
 *
 * USO:
 *   npx tsx scripts/precompute-city-offers.ts                        # todos cursos enriquecidos × top 100 cidades
 *   npx tsx scripts/precompute-city-offers.ts --dry-run              # só loga, não escreve
 *   npx tsx scripts/precompute-city-offers.ts --slug=direito-bacharelado
 *   npx tsx scripts/precompute-city-offers.ts --city-limit=50 --concurrency=4
 *   npx tsx scripts/precompute-city-offers.ts --course-limit=20
 *   npx tsx scripts/precompute-city-offers.ts --max-age-days=6    # padrão: só o que envelheceu
 *   npx tsx scripts/precompute-city-offers.ts --max-age-days=0    # revarredura completa
 *   npx tsx scripts/precompute-city-offers.ts --time-budget-min=280
 *   npx tsx scripts/precompute-city-offers.ts --lot-size=120       # pares por lote
 *   npx tsx scripts/precompute-city-offers.ts --plan-only          # só monta a fila (sem API)
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import { BRAZILIAN_CITIES } from '../app/lib/constants/brazilian-cities'
import {
  searchAthenaOffersWithMeta,
  normalizeAthenaOffer,
} from '../app/lib/api/athena-offers'
import {
  QUEUE_POLICY,
  blockedMinutes,
  buildWorkQueue,
  chunk,
  classifyFailure,
  emptyTally,
  pairKey,
  type FailureReason,
  type FailureTally,
  type WorkItem,
} from './precompute-city-offers-queue'

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const eq = a.indexOf('=')
      return eq === -1 ? [a.slice(2), true] : [a.slice(2, eq), a.slice(eq + 1)]
    }),
) as Record<string, string | boolean>

const DRY_RUN = !!args['dry-run']
// Monta a fila a partir do banco, imprime e sai — NENHUMA chamada à Tartarus
// nem à Athena. Serve para conferir a política contra o cache real.
const PLAN_ONLY = !!args['plan-only']
const SINGLE_SLUG = typeof args.slug === 'string' ? args.slug : undefined
const CITY_LIMIT = Number(args['city-limit']) || 100
const CONCURRENCY = Math.max(1, Number(args.concurrency) || 2)
const COURSE_LIMIT = Number(args['course-limit']) || 0
// Só reconsulta o par curso×cidade cujo cache está mais velho que isto (ou que
// nunca foi gravado). Corta a rodada de 76.320 pares pra alguns milhares — que é
// o que fazia o job estourar o teto de 300min do Actions e morrer no meio: em
// 30/08 ele foi cancelado em 5h00m19s deixando 30.900 linhas paradas em 23/08.
// --max-age-days=0 revarre tudo (comportamento antigo).
const MAX_AGE_DAYS =
  args['max-age-days'] === undefined ? 6 : Number(args['max-age-days'])
// Encerra limpo antes do teto do runner. Rodada morta pelo Actions não imprime
// resumo e não deixa registro do que ficou faltando.
const TIME_BUDGET_MIN = Number(args['time-budget-min']) || 0
// A Athena (Estácio/IBMEC/Wyden) entra no cache junto com a Cogna. --skip-athena
// volta ao comportamento Cogna-only, sem precisar reverter deploy.
const SKIP_ATHENA = !!args['skip-athena']
// Mesmas marcas que a sonda da city page consulta (city-offers.ts) — o cache
// tem que medir o MESMO universo que a página renderiza, senão volta a divergir.
const ATHENA_BRANDS = ['estacio', 'ibmec', 'wyden']
const MAX_RETRIES = 3
/**
 * Pares por lote. O lote é a unidade do controle positivo (`zerosAreTrustworthy`)
 * e do checkpoint de tempo. Atravessa cursos: a fila é por par, e um lote de
 * 120 pares de cursos diferentes todo zerado é sinal de falha tão bom quanto
 * (ou melhor que) 160 cidades de um curso só.
 */
const LOT_SIZE = Math.max(10, Number(args['lot-size']) || 120)
/** Identifica a rodada no ActivityLog. */
const RUN_ID = `precompute-city-offers:${new Date().toISOString()}`
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const TARTARUS_API = process.env.NEXT_PUBLIC_TARTARUS_API
if (!TARTARUS_API) {
  console.error('ERRO: NEXT_PUBLIC_TARTARUS_API não está no env.')
  process.exit(1)
}

// Upserts rodam com CONCURRENCY em paralelo; a DATABASE_URL do app costuma vir
// com connection_limit=1 (bom pro serverless, fatal aqui: pool timeout no fim
// da rodada). Força um pool que comporta a concorrência do script.
function scriptDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL
  if (!raw) return undefined
  const url = new URL(raw)
  url.searchParams.set('connection_limit', String(Math.max(CONCURRENCY + 1, 5)))
  url.searchParams.set('pool_timeout', '30')
  return url.toString()
}

const prisma = new PrismaClient({
  datasources: { db: { url: scriptDatabaseUrl() } },
})
const tartarus = axios.create({
  baseURL: TARTARUS_API,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

interface TartarusOffer {
  minPrice?: number
  prices?: { withDiscount?: number; withoutDiscount?: number }
}

interface FetchResult {
  offerCount: number
  minPrice: number | null
  error?: string
  /** Motivo da falha FINAL (depois dos retries). */
  reason?: FailureReason
  /** Minutos de bloqueio anunciados pela Cogna — aborta a rodada inteira. */
  blockedMin?: number
}

/**
 * Motivo de CADA tentativa que falhou, por fonte — inclusive as que um retry
 * depois salvou. É o que mostra se estamos batendo no teto da Cogna: 429 que o
 * retry recupera ainda é 429 contra o antifraude.
 */
const attemptFailures = { cogna: emptyTally(), athena: emptyTally() }

async function fetchOffers(
  courseName: string,
  city: string,
  state: string,
  nivel: string,
): Promise<FetchResult> {
  let lastErr = 'unknown'
  let lastReason: FailureReason = 'outro'
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await tartarus.get('cogna/courses/search', {
        params: {
          courseName,
          city,
          state,
          size: 50,
          page: 1,
          academicLevel: [nivel],
        },
        paramsSerializer: (params: Record<string, unknown>) => {
          const sp = new URLSearchParams()
          for (const [k, v] of Object.entries(params)) {
            if (Array.isArray(v)) v.forEach((x) => sp.append(k, String(x)))
            else if (v != null) sp.append(k, String(v))
          }
          return sp.toString()
        },
      })
      const data: TartarusOffer[] = res.data?.data ?? []
      const prices = data
        .map((o) => o.minPrice ?? o.prices?.withDiscount ?? 0)
        .filter((p) => p > 0)
      // `data.length` é o tamanho da PÁGINA (size=50), não o total. A Tartarus
      // devolve `totalItems` no topo; sem ele, uma cidade com mais de 50 ofertas
      // ficaria eternamente registrada como tendo exatamente 50.
      const total =
        typeof res.data?.totalItems === 'number' ? res.data.totalItems : data.length
      return {
        offerCount: total,
        minPrice: prices.length ? Math.min(...prices) : null,
      }
    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err)
      const reason = classifyFailure(err)
      lastReason = reason
      attemptFailures.cogna[reason]++
      // Bloqueio anunciado em MINUTOS não passa com backoff de segundos: cada
      // nova tentativa só soma contra um antifraude que já nos marcou (foi
      // assim que 1s virou 55min em 10/10). Sai sem retry e a rodada aborta.
      const blocked = blockedMinutes(err)
      if (blocked !== null) {
        return { offerCount: 0, minPrice: null, error: lastErr, reason, blockedMin: blocked }
      }
      // Backoff exponencial + jitter antes de retentar — suaviza rate-limit (429)
      // e timeouts que derrubaram ~66% das chamadas a concorrência alta.
      if (attempt < MAX_RETRIES) {
        await sleep(500 * 2 ** (attempt - 1) + Math.floor(Math.random() * 300))
      }
    }
  }
  return { offerCount: 0, minPrice: null, error: lastErr, reason: lastReason }
}

/**
 * Ofertas da Athena (YDUQS) pro par curso×cidade, somando as marcas.
 *
 * `throwOnFailure: true` é o ponto todo: sem ele `searchAthenaOffers` degrada
 * graciosamente e devolve lista vazia em caso de falha — que é indistinguível
 * de "não tem oferta aqui" e viraria zero gravado. Com ele, falha vira exceção
 * e o chamador pula a gravação em vez de mentir.
 */
async function fetchAthenaOffers(
  courseName: string,
  city: string,
  state: string,
  nivel: string,
): Promise<FetchResult> {
  let lastErr = 'unknown'
  let lastReason: FailureReason = 'outro'
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const perBrand = await Promise.all(
        ATHENA_BRANDS.map((brand) =>
          searchAthenaOffersWithMeta(
            { courseName, city, state, academicLevel: nivel, brand },
            { throwOnFailure: true },
          ),
        ),
      )
      // Total REAL somado por marca (`meta.total`), não o tamanho das páginas.
      // A Athena pagina em 20: contar as listas dava no máximo 60 pras três
      // marcas, teto que "Pedagogia em Recife = 40" tinha batido sem avisar.
      const offerCount = perBrand.reduce((sum, r) => sum + r.total, 0)
      // O preço mínimo sai da primeira página de cada marca — é o que temos sem
      // paginar tudo e quadruplicar de novo a carga na API. Pode superestimar o
      // mínimo, nunca inventa valor: todo preço veio da API.
      //
      // Passa por `normalizeAthenaOffer` porque a Athena usa nomes de campo
      // PRÓPRIOS — `priceTo` (com desconto) e `priceFrom` (sem) — e não os
      // `minPrice`/`prices.withDiscount` da Tartarus. Ler os nomes da Cogna
      // numa oferta da Athena devolve undefined em todo campo, e o resultado
      // era `athenaMinPrice` nulo em 100% das linhas, sem erro nenhum.
      const prices = perBrand
        .flatMap((r) => r.offers)
        .map((o) => normalizeAthenaOffer(o).minPrice ?? 0)
        .filter((p) => p > 0)
      return {
        offerCount,
        minPrice: prices.length ? Math.min(...prices) : null,
      }
    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err)
      lastReason = classifyFailure(err)
      attemptFailures.athena[lastReason]++
      if (attempt < MAX_RETRIES) {
        await sleep(500 * 2 ** (attempt - 1) + Math.floor(Math.random() * 300))
      }
    }
  }
  return { offerCount: 0, minPrice: null, error: lastErr, reason: lastReason }
}

async function pMap<T, R>(
  items: T[],
  fn: (item: T, idx: number) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0
  const workers = Array.from({ length: concurrency }, async () => {
    while (cursor < items.length) {
      const i = cursor++
      results[i] = await fn(items[i], i)
    }
  })
  await Promise.all(workers)
  return results
}

/**
 * Um lote inteiro sem nenhuma oferta tem duas explicações OPOSTAS: o curso não
 * existe em nenhuma daquelas cidades (ausência real) ou a API entrou no modo de
 * falha silencioso — HTTP 200 com lista vazia sob carga, que não lança nada e
 * por isso não é distinguível numa chamada isolada. Um LOTE distingue: se a
 * reconsulta de uma amostra, com folga, acha oferta onde o lote dizia zero, o
 * vazio era falha. Na dúvida não grava — zero velho pode estar certo, zero
 * falso está errado com cara de recente.
 */
async function zerosAreTrustworthy<T>(
  succeeded: { item: T; r: FetchResult }[],
  recheck: (item: T) => Promise<FetchResult>,
): Promise<boolean> {
  if (succeeded.length === 0) return true
  if (succeeded.some(({ r }) => r.offerCount > 0)) return true
  await sleep(5_000)
  const sample = succeeded.slice(0, 3)
  const rechecked = await pMap(sample, ({ item }) => recheck(item), 1)
  return !rechecked.some((r) => r.offerCount > 0)
}

type Course = {
  id: string
  slug: string
  apiCourseName: string
  nivel: string
  hasCityPages: boolean
}
type City = (typeof BRAZILIAN_CITIES)[number]
type Item = WorkItem<Course, City>

/** Frescor do cache por camada, depois da rodada — o "deu certo?" da garantia. */
async function measureFreshness() {
  const rows = await prisma.$queryRaw<
    { tier: number; linhas: bigint; acima_7d: bigint; acima_14d: bigint; acima_28d: bigint; idade_max_dias: number | null }[]
  >`
    SELECT CASE WHEN f."hasCityPages" THEN 1 ELSE 2 END AS tier,
           COUNT(*) AS linhas,
           COUNT(*) FILTER (WHERE c."fetchedAt" < now() - interval '7 days')  AS acima_7d,
           COUNT(*) FILTER (WHERE c."fetchedAt" < now() - interval '14 days') AS acima_14d,
           COUNT(*) FILTER (WHERE c."fetchedAt" < now() - interval '28 days') AS acima_28d,
           EXTRACT(EPOCH FROM now() - MIN(c."fetchedAt")) / 86400 AS idade_max_dias
    FROM "CityCourseOfferCache" c
    JOIN "FeaturedCourse" f ON f.id = c."featuredCourseId"
    WHERE f."isActive" AND f."enrichedAt" IS NOT NULL
    GROUP BY 1 ORDER BY 1
  `
  return rows.map((r) => ({
    camada: r.tier,
    linhas: Number(r.linhas),
    acima7d: Number(r.acima_7d),
    acima14d: Number(r.acima_14d),
    acima28d: Number(r.acima_28d),
    idadeMaxDias: r.idade_max_dias === null ? null : Math.round(Number(r.idade_max_dias) * 10) / 10,
  }))
}

async function main() {
  console.log('═══════════════════════════════════════════════')
  console.log(`  precompute-city-offers  dry-run=${DRY_RUN}`)
  console.log(`  cities=${CITY_LIMIT}  concurrency=${CONCURRENCY}  lot=${LOT_SIZE}`)
  console.log(`  slug=${SINGLE_SLUG ?? 'all'}  course-limit=${COURSE_LIMIT || 'all'}`)
  console.log(
    `  SLA camada 1=${QUEUE_POLICY.tier1SlaDays}d  camada 2=${QUEUE_POLICY.tier2SlaDays}d  lacuna=${QUEUE_POLICY.gapUrgency}×SLA`,
  )
  console.log('═══════════════════════════════════════════════\n')

  const courses: Course[] = await prisma.featuredCourse.findMany({
    where: {
      isActive: true,
      enrichedAt: { not: null },
      ...(SINGLE_SLUG ? { slug: SINGLE_SLUG } : {}),
    },
    select: {
      id: true,
      slug: true,
      apiCourseName: true,
      nivel: true,
      hasCityPages: true,
    },
    orderBy: { trendScore: 'desc' },
    ...(COURSE_LIMIT ? { take: COURSE_LIMIT } : {}),
  })

  const cities = BRAZILIAN_CITIES.slice(0, CITY_LIMIT)

  // Carimbo da COGNA por par. Sempre carregado (mesmo com --max-age-days=0):
  // além de ordenar a fila, diz se a LINHA JÁ EXISTE — e linha nova só pode
  // nascer com as duas fontes medidas, senão gravaria zero de uma fonte que
  // não foi medida.
  const cached = new Map<string, Date>()
  {
    const rows = await prisma.cityCourseOfferCache.findMany({
      where: { featuredCourseId: { in: courses.map((c) => c.id) } },
      select: { featuredCourseId: true, citySlug: true, fetchedAt: true },
    })
    for (const row of rows) cached.set(pairKey(row.featuredCourseId, row.citySlug), row.fetchedAt)
  }

  const startedAt = Date.now()
  const queue: Item[] = buildWorkQueue({
    courses,
    cities,
    cached,
    now: new Date(startedAt),
    minAgeDays: MAX_AGE_DAYS,
  })
  const queueStats = {
    total: queue.length,
    lacunas: queue.filter((w) => w.kind === 'gap').length,
    velhas: queue.filter((w) => w.kind === 'stale').length,
    camada1: queue.filter((w) => w.tier === 1).length,
    camada2: queue.filter((w) => w.tier === 2).length,
    grade: courses.length * cities.length,
  }
  console.log(`Cursos: ${courses.length} (${courses.filter((c) => c.hasCityPages).length} com página de cidade)`)
  console.log(
    `Fila: ${queueStats.total} pares de ${queueStats.grade} — ${queueStats.velhas} velhas, ${queueStats.lacunas} lacunas · camada 1 ${queueStats.camada1}, camada 2 ${queueStats.camada2}\n`,
  )

  if (PLAN_ONLY) {
    const fmt = (w: Item) =>
      `${w.course.slug}×${w.city.slug} [c${w.tier} ${w.kind}${w.ageDays === null ? '' : ` ${w.ageDays.toFixed(1)}d`} u=${w.urgency.toFixed(2)}]`
    console.log('Primeiros 15 da fila:')
    for (const w of queue.slice(0, 15)) console.log(`  ${fmt(w)}`)
    const ate = (n: number) => {
      const fatia = queue.slice(0, n)
      return `camada 1 ${fatia.filter((w) => w.tier === 1).length} · camada 2 ${fatia.filter((w) => w.tier === 2).length} · lacunas ${fatia.filter((w) => w.kind === 'gap').length}`
    }
    console.log(`
Nos primeiros 30.000 pares (≈ rodada com 30% de falha): ${ate(30_000)}`)
    console.log(`Nos primeiros 45.000 pares (≈ capacidade medida em 04/10): ${ate(45_000)}`)
    const ultimoC1 = queue.map((w) => w.tier).lastIndexOf(1)
    console.log(`Último par da camada 1 está na posição ${ultimoC1 + 1} de ${queue.length}`)
    return
  }

  const deadline = TIME_BUDGET_MIN ? startedAt + TIME_BUDGET_MIN * 60_000 : Number.POSITIVE_INFINITY
  const finalFailures = { cogna: emptyTally(), athena: emptyTally() }
  const counts = {
    processados: 0,
    upserts: 0,
    pulados: 0,
    errosDb: 0,
    lotesSuspeitosCogna: 0,
    lotesSuspeitosAthena: 0,
    cognaComOferta: 0,
    cognaVazio: 0,
    cognaVazioEmLoteSuspeito: 0,
    athenaComOferta: 0,
    athenaVazio: 0,
    processadosPorCamada: { 1: 0, 2: 0 } as Record<1 | 2, number>,
    cognaOkPorCamada: { 1: 0, 2: 0 } as Record<1 | 2, number>,
  }
  let truncated = false
  let abortReason: string | null = null

  const lots = chunk(queue, LOT_SIZE)
  for (const [li, lot] of lots.entries()) {
    if (Date.now() > deadline) {
      truncated = true
      console.log(`\n\nTeto de tempo (${TIME_BUDGET_MIN}min) atingido — encerrando limpo.`)
      console.log(`Faltaram ${queue.length - li * LOT_SIZE} pares; a próxima rodada pega os mais urgentes primeiro.`)
      break
    }

    const lotStarted = Date.now()
    process.stdout.write(`[lote ${li + 1}/${lots.length}] ${String(lot.length).padStart(3)}p `)

    // Consulta o lote inteiro ANTES de gravar: a decisão de aceitar um zero
    // depende da saúde do lote. As duas fontes vão juntas — o cache tem que
    // medir o mesmo universo que a página renderiza (Cogna + Athena).
    const results = await pMap(
      lot,
      async (item) => {
        const { course, city } = item
        const [r, a] = await Promise.all([
          fetchOffers(course.apiCourseName, city.name, city.state, course.nivel),
          SKIP_ATHENA
            ? Promise.resolve<FetchResult>({ offerCount: 0, minPrice: null, error: 'skip-athena' })
            : fetchAthenaOffers(course.apiCourseName, city.name, city.state, course.nivel),
        ])
        return { item, r, a }
      },
      CONCURRENCY,
    )

    counts.processados += results.length
    for (const { item, r, a } of results) {
      counts.processadosPorCamada[item.tier]++
      if (r.error) finalFailures.cogna[r.reason ?? 'outro']++
      else if (r.offerCount > 0) counts.cognaComOferta++
      else counts.cognaVazio++
      if (!SKIP_ATHENA) {
        if (a.error) finalFailures.athena[a.reason ?? 'outro']++
        else if (a.offerCount > 0) counts.athenaComOferta++
        else counts.athenaVazio++
      }
    }

    // Bloqueio antifraude: nada de controle positivo (ele RECONSULTA a Cogna)
    // e nenhum zero da Cogna deste lote é gravado — sob bloqueio, vazio não
    // prova ausência. A Athena (serviço nosso) segue valendo.
    const blocked = results.find(({ r }) => r.blockedMin !== undefined)
    if (blocked) {
      abortReason = `Cogna bloqueou por ${blocked.r.blockedMin} minutos (antifraude) no lote ${li + 1}`
    }

    // CONTROLE POSITIVO, por fonte. HTTP 200 com lista vazia sob carga não
    // lança nada; um LOTE inteiro zerado que a reconsulta desmente era falha.
    // Avaliado por fonte porque elas falham de forma independente.
    const cognaTrusted = blocked
      ? false
      : await zerosAreTrustworthy(
          results.filter(({ r }) => !r.error).map(({ item, r }) => ({ item, r })),
          (item) => fetchOffers(item.course.apiCourseName, item.city.name, item.city.state, item.course.nivel),
        )
    if (!cognaTrusted) {
      counts.lotesSuspeitosCogna++
      counts.cognaVazioEmLoteSuspeito += results.filter(({ r }) => !r.error && r.offerCount === 0).length
      process.stdout.write(blocked ? 'COGNA BLOQUEADA  ' : 'COGNA SUSPEITA  ')
    }

    const athenaTrusted =
      !SKIP_ATHENA &&
      (await zerosAreTrustworthy(
        results.filter(({ a }) => !a.error).map(({ item, a }) => ({ item, r: a })),
        (item) => fetchAthenaOffers(item.course.apiCourseName, item.city.name, item.city.state, item.course.nivel),
      ))
    if (!SKIP_ATHENA && !athenaTrusted) {
      counts.lotesSuspeitosAthena++
      process.stdout.write('ATHENA SUSPEITA  ')
    }

    if (!DRY_RUN && (cognaTrusted || athenaTrusted)) {
      await pMap(
        results,
        async ({ item, r, a }) => {
          const { course, city } = item
          // Sob bloqueio, só grava a Cogna que trouxe oferta de verdade.
          const writeCogna = !r.error && (cognaTrusted || (blocked !== undefined && r.offerCount > 0))
          const writeAthena = athenaTrusted && !a.error
          if (!writeCogna && !writeAthena) {
            counts.pulados++
            return
          }
          // Linha nova exige as DUAS fontes: criar pela metade gravaria zero de
          // uma fonte que não foi medida. Sem linha, a página cai no
          // comportamento legado (busca ao vivo), que é o certo.
          const exists = cached.has(pairKey(course.id, city.slug))
          if (!exists && !(writeCogna && writeAthena)) {
            counts.pulados++
            return
          }
          try {
            if (exists) {
              await prisma.cityCourseOfferCache.update({
                where: {
                  featuredCourseId_citySlug: { featuredCourseId: course.id, citySlug: city.slug },
                },
                // `fetchedAt` continua significando "quando a Cogna foi medida"
                // — o corte de 14 dias do sitemap depende disso. A Athena tem o
                // próprio carimbo; atualizar um pelo outro faria número velho
                // parecer fresco.
                data: {
                  ...(writeCogna
                    ? { offerCount: r.offerCount, minPrice: r.minPrice, fetchedAt: new Date() }
                    : {}),
                  ...(writeAthena
                    ? { athenaOfferCount: a.offerCount, athenaMinPrice: a.minPrice, athenaFetchedAt: new Date() }
                    : {}),
                },
              })
            } else {
              await prisma.cityCourseOfferCache.create({
                data: {
                  featuredCourseId: course.id,
                  citySlug: city.slug,
                  offerCount: r.offerCount,
                  minPrice: r.minPrice,
                  athenaOfferCount: a.offerCount,
                  athenaMinPrice: a.minPrice,
                  athenaFetchedAt: new Date(),
                },
              })
            }
            if (writeCogna) counts.cognaOkPorCamada[item.tier]++
            counts.upserts++
          } catch (dbErr) {
            counts.errosDb++
            console.error(
              `  db error ${course.slug}×${city.slug}: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`,
            )
          }
        },
        CONCURRENCY,
      )
    } else if (!cognaTrusted && !athenaTrusted) {
      counts.pulados += results.length
    }

    const falhasCogna = results.filter(({ r }) => r.error).length
    console.log(
      `${String(falhasCogna).padStart(3)} falhas Cogna  ${Math.round((Date.now() - lotStarted) / 1000)}s`,
    )

    if (abortReason) {
      truncated = true
      console.log(`\n\n🛑 ${abortReason} — abortando a rodada (backoff de segundos não resolve bloqueio em minutos).`)
      break
    }
  }

  const finishedAt = Date.now()
  const elapsed = Math.round((finishedAt - startedAt) / 1000)
  const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : '—')
  const totalFalhasCogna = Object.values(finalFailures.cogna).reduce((s, n) => s + n, 0)
  const fmtTally = (t: FailureTally) =>
    Object.entries(t)
      .filter(([, n]) => n > 0)
      .map(([k, n]) => `${k}=${n}`)
      .join(' ') || 'nenhuma'

  console.log('\n═══════════════════════════════════════════════')
  console.log(`  ✓ processados ${counts.processados} de ${queue.length}  upserts ${counts.upserts}  pulados ${counts.pulados}  ${elapsed}s`)
  console.log(
    `  Cogna: com oferta ${counts.cognaComOferta} · 200-vazio ${counts.cognaVazio} (${counts.cognaVazioEmLoteSuspeito} em lote suspeito) · falhas ${totalFalhasCogna} (${pct(totalFalhasCogna, counts.processados)})`,
  )
  console.log(`  Cogna, motivo final:      ${fmtTally(finalFailures.cogna)}`)
  console.log(`  Cogna, motivo por tentativa: ${fmtTally(attemptFailures.cogna)}`)
  if (!SKIP_ATHENA) {
    console.log(`  Athena, motivo final:     ${fmtTally(finalFailures.athena)}`)
  }
  console.log(`  lotes suspeitos não gravados — Cogna ${counts.lotesSuspeitosCogna}  Athena ${counts.lotesSuspeitosAthena}`)
  if (abortReason) console.log(`  ABORTADA: ${abortReason}`)
  else if (truncated) console.log('  ATENÇÃO: rodada truncada pelo teto de tempo — fila incompleta.')

  let frescor: Awaited<ReturnType<typeof measureFreshness>> | null = null
  try {
    frescor = await measureFreshness()
    for (const f of frescor) {
      console.log(
        `  frescor camada ${f.camada}: ${f.linhas} linhas · >7d ${f.acima7d} · >14d ${f.acima14d} · >28d ${f.acima28d} · mais velha ${f.idadeMaxDias}d`,
      )
    }
  } catch (e) {
    console.error('  frescor: falhou ao medir', e instanceof Error ? e.message : e)
  }
  console.log('═══════════════════════════════════════════════\n')

  // Resumo da rodada no banco (ActivityLog: tabela de log de atividade, sem uso
  // por outro código; dispensa migration). Nunca derruba a rodada.
  if (!DRY_RUN) {
    try {
      await prisma.activityLog.create({
        data: {
          adminUserId: 'system:precompute-city-offers',
          action: 'PRECOMPUTE_RUN',
          entity: 'CityCourseOfferCache',
          entityId: RUN_ID,
          details: {
            iniciou: new Date(startedAt).toISOString(),
            terminou: new Date(finishedAt).toISOString(),
            duracaoMin: Math.round(elapsed / 6) / 10,
            truncada: truncated,
            abortada: abortReason,
            parametros: {
              cityLimit: CITY_LIMIT,
              concurrency: CONCURRENCY,
              maxAgeDays: MAX_AGE_DAYS,
              timeBudgetMin: TIME_BUDGET_MIN,
              lotSize: LOT_SIZE,
              skipAthena: SKIP_ATHENA,
              politica: QUEUE_POLICY,
            },
            fila: queueStats,
            ...counts,
            falhasFinais: finalFailures,
            falhasPorTentativa: attemptFailures,
            frescorDepois: frescor,
          },
        },
      })
      console.log(`Resumo gravado em ActivityLog (${RUN_ID}).`)
    } catch (e) {
      console.error('⚠️ Falha ao gravar o resumo da rodada em ActivityLog:', e instanceof Error ? e.message : e)
    }
  }
}

main()
  .catch((e) => {
    console.error('Fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
