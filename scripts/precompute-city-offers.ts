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
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import { BRAZILIAN_CITIES } from '../app/lib/constants/brazilian-cities'
import { searchAthenaOffers } from '../app/lib/api/athena-offers'

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

interface AthenaPriced {
  minPrice?: number
  prices?: { withDiscount?: number }
}

interface FetchResult {
  offerCount: number
  minPrice: number | null
  error?: string
}

async function fetchOffers(
  courseName: string,
  city: string,
  state: string,
  nivel: string,
): Promise<FetchResult> {
  let lastErr = 'unknown'
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
      return {
        offerCount: data.length,
        minPrice: prices.length ? Math.min(...prices) : null,
      }
    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err)
      // Backoff exponencial + jitter antes de retentar — suaviza rate-limit (429)
      // e timeouts que derrubaram ~66% das chamadas a concorrência alta.
      if (attempt < MAX_RETRIES) {
        await sleep(500 * 2 ** (attempt - 1) + Math.floor(Math.random() * 300))
      }
    }
  }
  return { offerCount: 0, minPrice: null, error: lastErr }
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
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const perBrand = await Promise.all(
        ATHENA_BRANDS.map((brand) =>
          searchAthenaOffers(
            { courseName, city, state, academicLevel: nivel, brand },
            { throwOnFailure: true },
          ),
        ),
      )
      const all = perBrand.flat() as AthenaPriced[]
      const prices = all
        .map((o) => o.minPrice ?? o.prices?.withDiscount ?? 0)
        .filter((p) => p > 0)
      return {
        offerCount: all.length,
        minPrice: prices.length ? Math.min(...prices) : null,
      }
    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err)
      if (attempt < MAX_RETRIES) {
        await sleep(500 * 2 ** (attempt - 1) + Math.floor(Math.random() * 300))
      }
    }
  }
  return { offerCount: 0, minPrice: null, error: lastErr }
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
async function zerosAreTrustworthy<C>(
  succeeded: { city: C; r: FetchResult }[],
  recheck: (city: C) => Promise<FetchResult>,
): Promise<boolean> {
  if (succeeded.length === 0) return true
  if (succeeded.some(({ r }) => r.offerCount > 0)) return true
  await sleep(5_000)
  const sample = succeeded.slice(0, 3)
  const rechecked = await pMap(sample, ({ city }) => recheck(city), 1)
  return !rechecked.some((r) => r.offerCount > 0)
}

async function main() {
  console.log('═══════════════════════════════════════════════')
  console.log(`  precompute-city-offers  dry-run=${DRY_RUN}`)
  console.log(`  cities=${CITY_LIMIT}  concurrency=${CONCURRENCY}`)
  console.log(`  slug=${SINGLE_SLUG ?? 'all'}  course-limit=${COURSE_LIMIT || 'all'}`)
  console.log('═══════════════════════════════════════════════\n')

  const courses = await prisma.featuredCourse.findMany({
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
    },
    orderBy: { trendScore: 'desc' },
    ...(COURSE_LIMIT ? { take: COURSE_LIMIT } : {}),
  })

  const cities = BRAZILIAN_CITIES.slice(0, CITY_LIMIT)

  console.log(`Cursos a processar: ${courses.length}`)
  console.log(`Cidades por curso: ${cities.length}`)
  console.log(`Total de pares: ${courses.length * cities.length}\n`)

  const startedAt = Date.now()
  const deadline = TIME_BUDGET_MIN
    ? startedAt + TIME_BUDGET_MIN * 60_000
    : Number.POSITIVE_INFINITY
  let processed = 0
  let withOffers = 0
  let errors = 0
  let upserts = 0
  let skipped = 0
  let suspectBatches = 0
  let suspectAthena = 0
  let athenaErrors = 0
  let truncated = false

  // Idade do cache par a par, pra decidir o que ainda precisa ser consultado.
  const cutoff =
    MAX_AGE_DAYS > 0 ? new Date(Date.now() - MAX_AGE_DAYS * 86_400_000) : null
  // Sempre carregado (mesmo com --max-age-days=0): além de decidir o que
  // reconsultar, diz se a LINHA JÁ EXISTE — e linha nova só pode nascer com as
  // duas fontes medidas, senão gravaria zero de uma fonte que não foi medida.
  const cached = new Map<string, Date>()
  {
    const rows = await prisma.cityCourseOfferCache.findMany({
      where: { featuredCourseId: { in: courses.map((c) => c.id) } },
      select: { featuredCourseId: true, citySlug: true, fetchedAt: true },
    })
    for (const row of rows) {
      cached.set(`${row.featuredCourseId}|${row.citySlug}`, row.fetchedAt)
    }
  }

  // Mais velho primeiro: se a rodada for truncada, ela sempre avançou o que
  // estava pior. É o que substitui um checkpoint — a rodada seguinte recomeça
  // naturalmente pelo que ficou para trás, em vez de repetir o começo da fila.
  const queue = courses
    .map((course) => {
      const pending = cutoff
        ? cities.filter((city) => {
            const at = cached.get(`${course.id}|${city.slug}`)
            return !at || at < cutoff
          })
        : cities
      let oldestAt = Number.POSITIVE_INFINITY
      for (const city of pending) {
        const at = cached.get(`${course.id}|${city.slug}`)
        const t = at ? at.getTime() : 0
        if (t < oldestAt) oldestAt = t
      }
      return { course, pending, oldestAt }
    })
    .filter((item) => item.pending.length > 0)
    .sort((a, b) => a.oldestAt - b.oldestAt)

  const totalPending = queue.reduce((sum, item) => sum + item.pending.length, 0)
  console.log(
    `Pares a consultar: ${totalPending} de ${courses.length * cities.length}` +
      (cutoff
        ? `  (cache com menos de ${MAX_AGE_DAYS}d preservado)`
        : '  (revarredura completa)'),
  )
  console.log(`Cursos na fila: ${queue.length}\n`)

  for (const [ci, { course, pending }] of queue.entries()) {
    if (Date.now() > deadline) {
      truncated = true
      console.log(
        `\n\nTeto de tempo (${TIME_BUDGET_MIN}min) atingido — encerrando limpo.`,
      )
      console.log(
        `Faltaram ${queue.length - ci} cursos; a próxima rodada pega eles primeiro.`,
      )
      break
    }

    const courseStarted = Date.now()
    process.stdout.write(
      `\n[${ci + 1}/${queue.length}] ${course.slug.padEnd(46)} ` +
        `${String(pending.length).padStart(3)}p `,
    )

    // Consulta o lote inteiro ANTES de gravar: a decisão de aceitar um zero
    // depende da saúde do lote, e isso só dá pra avaliar com ele fechado.
    // As duas fontes vão juntas — o cache tem que medir o mesmo universo que a
    // página renderiza (Cogna + Athena), senão sitemap e página divergem, que
    // é exatamente o que mantinha página com oferta Estácio fora do sitemap.
    const results = await pMap(
      pending,
      async (city) => {
        const [r, a] = await Promise.all([
          fetchOffers(course.apiCourseName, city.name, city.state, course.nivel),
          SKIP_ATHENA
            ? Promise.resolve<FetchResult>({
                offerCount: 0,
                minPrice: null,
                error: 'skip-athena',
              })
            : fetchAthenaOffers(
                course.apiCourseName,
                city.name,
                city.state,
                course.nivel,
              ),
        ])
        return { city, r, a }
      },
      CONCURRENCY,
    )

    processed += results.length
    errors += results.filter(({ r }) => r.error).length
    withOffers += results.filter(
      ({ r, a }) => (!r.error && r.offerCount > 0) || (!a.error && a.offerCount > 0),
    ).length
    if (!SKIP_ATHENA) {
      athenaErrors += results.filter(({ a }) => a.error).length
    }

    // CONTROLE POSITIVO, por fonte — o guard que faltava.
    //
    // A falha que ESTOURA (400 embrulhando um 429, timeout) já era tratada:
    // `error` faz pular a gravação. A SILENCIOSA não era: HTTP 200 com lista
    // vazia sob carga chegava como sucesso e virava `offerCount = 0` gravado,
    // jogando pra noindex uma página com oferta real. É a origem dos zeros
    // concentrados por hora do relógio, que não são ausência de oferta.
    //
    // Avaliado por fonte porque elas falham de forma independente: a Cogna pode
    // estar saudável enquanto a Athena está fora, e gravar só metade é melhor
    // que pular tudo — desde que a metade não medida fique como estava.
    const cognaTrusted = await zerosAreTrustworthy(
      results.filter(({ r }) => !r.error).map(({ city, r }) => ({ city, r })),
      (city) =>
        fetchOffers(course.apiCourseName, city.name, city.state, course.nivel),
    )
    if (!cognaTrusted) {
      suspectBatches++
      process.stdout.write('COGNA SUSPEITA  ')
    }

    const athenaTrusted =
      !SKIP_ATHENA &&
      (await zerosAreTrustworthy(
        results.filter(({ a }) => !a.error).map(({ city, a }) => ({ city, r: a })),
        (city) =>
          fetchAthenaOffers(
            course.apiCourseName,
            city.name,
            city.state,
            course.nivel,
          ),
      ))
    if (!SKIP_ATHENA && !athenaTrusted) {
      suspectAthena++
      process.stdout.write('ATHENA SUSPEITA  ')
    }

    if (!DRY_RUN && (cognaTrusted || athenaTrusted)) {
      await pMap(
        results,
        async ({ city, r, a }) => {
          const writeCogna = cognaTrusted && !r.error
          const writeAthena = athenaTrusted && !a.error
          if (!writeCogna && !writeAthena) {
            skipped++
            return
          }
          // Linha nova exige as DUAS fontes: criar pela metade gravaria zero de
          // uma fonte que não foi medida. Sem linha, a página cai no
          // comportamento legado (busca ao vivo), que é o certo.
          const exists = cached.has(`${course.id}|${city.slug}`)
          if (!exists && !(writeCogna && writeAthena)) {
            skipped++
            return
          }
          try {
            if (exists) {
              await prisma.cityCourseOfferCache.update({
                where: {
                  featuredCourseId_citySlug: {
                    featuredCourseId: course.id,
                    citySlug: city.slug,
                  },
                },
                // `fetchedAt` continua significando "quando a Cogna foi medida"
                // — o corte de 14 dias do sitemap depende disso. A Athena tem o
                // próprio carimbo; atualizar um pelo outro faria número velho
                // parecer fresco.
                data: {
                  ...(writeCogna
                    ? {
                        offerCount: r.offerCount,
                        minPrice: r.minPrice,
                        fetchedAt: new Date(),
                      }
                    : {}),
                  ...(writeAthena
                    ? {
                        athenaOfferCount: a.offerCount,
                        athenaMinPrice: a.minPrice,
                        athenaFetchedAt: new Date(),
                      }
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
            upserts++
          } catch (dbErr) {
            errors++
            console.error(
              `  db error ${course.slug}×${city.slug}: ${
                dbErr instanceof Error ? dbErr.message : String(dbErr)
              }`,
            )
          }
        },
        CONCURRENCY,
      )
    } else if (!cognaTrusted && !athenaTrusted) {
      skipped += results.length
    }

    const cityWithOffers = results.filter(
      ({ r, a }) => r.offerCount > 0 || a.offerCount > 0,
    ).length
    const courseElapsed = Math.round((Date.now() - courseStarted) / 1000)
    console.log(
      `${String(cityWithOffers).padStart(3)}/${pending.length} c/oferta  ${courseElapsed}s`,
    )
  }

  const elapsed = Math.round((Date.now() - startedAt) / 1000)
  console.log('\n═══════════════════════════════════════════════')
  console.log(`  ✓ processados ${processed}  upserts ${upserts}  pulados ${skipped}`)
  console.log(`  c/oferta ${withOffers}  erros ${errors}  ${elapsed}s`)
  console.log(
    `  lotes suspeitos não gravados — Cogna ${suspectBatches}  Athena ${suspectAthena}`,
  )
  if (!SKIP_ATHENA) console.log(`  erros Athena ${athenaErrors}`)
  if (truncated) {
    console.log('  ATENÇÃO: rodada truncada pelo teto de tempo — fila incompleta.')
  }
  console.log('═══════════════════════════════════════════════\n')
}

main()
  .catch((e) => {
    console.error('Fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
