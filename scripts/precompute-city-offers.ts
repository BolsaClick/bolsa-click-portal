#!/usr/bin/env tsx
/**
 * scripts/precompute-city-offers.ts
 *
 * Itera FeaturedCourse enriquecido × top N cidades brasileiras, bate Tartarus
 * `cogna/courses/search` e cacheia offerCount + minPrice em CityCourseOfferCache.
 *
 * Cron recomendado: semanal (preços e disponibilidade variam pouco em janela curta).
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
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import { BRAZILIAN_CITIES } from '../app/lib/constants/brazilian-cities'

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
const MAX_RETRIES = 3
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const TARTARUS_API = process.env.NEXT_PUBLIC_TARTARUS_API
if (!TARTARUS_API) {
  console.error('ERRO: NEXT_PUBLIC_TARTARUS_API não está no env.')
  process.exit(1)
}

const prisma = new PrismaClient()
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
  let processed = 0
  let withOffers = 0
  let errors = 0
  let upserts = 0
  let skipped = 0

  for (const [ci, course] of courses.entries()) {
    const courseStarted = Date.now()
    process.stdout.write(
      `\n[${ci + 1}/${courses.length}] ${course.slug.padEnd(50)} `,
    )

    const results = await pMap(
      cities,
      async (city) => {
        const r = await fetchOffers(
          course.apiCourseName,
          city.name,
          city.state,
          course.nivel,
        )
        processed++
        if (r.error) errors++
        if (r.offerCount > 0) withOffers++

        // Só grava em SUCESSO. Em erro de fetch (rate-limit/timeout) NÃO gravar:
        // gravar 0 criaria falso zero, jogando uma página com oferta pra noindex.
        // Pular preserva o valor anterior do cache (se houver).
        if (!DRY_RUN && !r.error) {
          try {
            await prisma.cityCourseOfferCache.upsert({
              where: {
                featuredCourseId_citySlug: {
                  featuredCourseId: course.id,
                  citySlug: city.slug,
                },
              },
              create: {
                featuredCourseId: course.id,
                citySlug: city.slug,
                offerCount: r.offerCount,
                minPrice: r.minPrice,
              },
              update: {
                offerCount: r.offerCount,
                minPrice: r.minPrice,
                fetchedAt: new Date(),
              },
            })
            upserts++
          } catch (dbErr) {
            errors++
            console.error(
              `  db error ${course.slug}×${city.slug}: ${
                dbErr instanceof Error ? dbErr.message : String(dbErr)
              }`,
            )
          }
        } else if (r.error) {
          skipped++
        }
        return r
      },
      CONCURRENCY,
    )

    const cityWithOffers = results.filter((r) => r.offerCount > 0).length
    const courseElapsed = Math.round((Date.now() - courseStarted) / 1000)
    console.log(
      `${String(cityWithOffers).padStart(3)}/${cities.length} c/oferta  ${courseElapsed}s`,
    )
  }

  const elapsed = Math.round((Date.now() - startedAt) / 1000)
  console.log('\n═══════════════════════════════════════════════')
  console.log(`  ✓ processados ${processed}  upserts ${upserts}  pulados(erro) ${skipped}`)
  console.log(`  c/oferta ${withOffers}  erros ${errors}  ${elapsed}s`)
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
