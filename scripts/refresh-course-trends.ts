/**
 * Coleta Google Trends por curso (nacional BR) e popula FeaturedCourse.trendScore.
 *
 * Estratégia: 1 chamada por curso (não por curso × cidade). Combinação 117 × 284
 * com Trends real daria 33k chamadas (~14h com throttle, alto risco de 429).
 * Score nacional × cityRank é boa proxy pro ranking SEO.
 *
 * Score 0-100 baseado no maior `trendValue` retornado em relatedQueries
 * (queries que estão "Top" ou "Rising" pro keyword do nome do curso).
 * Se nenhum entry, usa fallback baseado em marketDemand (ALTA=70, MEDIA=40, BAIXA=15).
 *
 * Uso:
 *   npx tsx scripts/refresh-course-trends.ts             # todos os cursos ativos
 *   npx tsx scripts/refresh-course-trends.ts --dry-run   # só loga
 *   npx tsx scripts/refresh-course-trends.ts --slug=direito-bacharelado
 *   npx tsx scripts/refresh-course-trends.ts --limit=10  # primeiros N (debug)
 */

import { PrismaClient } from '@prisma/client'
import { fetchTrendsForTopic } from '../app/lib/seo/trends-fetcher'

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
const LIMIT = typeof args.limit === 'string' ? parseInt(args.limit, 10) : undefined
const THROTTLE_MS = 1500

const DEMAND_FALLBACK: Record<string, number> = {
  ALTA: 70,
  MEDIA: 40,
  BAIXA: 15,
}

const prisma = new PrismaClient()

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function scoreFromTrendsEntries(entries: { value: number }[]): number {
  if (!entries.length) return 0
  const max = Math.max(...entries.map((e) => e.value || 0))
  // Trends values: top=0-100 (relativo ao maior); rising=percent (pode ser 999/breakout).
  // Cap em 100.
  return Math.min(100, Math.round(max))
}

async function main() {
  console.log('═══════════════════════════════════════════════')
  console.log(`  refresh-course-trends  dry-run=${DRY_RUN}  limit=${LIMIT ?? 'all'}`)
  console.log('═══════════════════════════════════════════════\n')

  const courses = await prisma.featuredCourse.findMany({
    where: {
      isActive: true,
      ...(SINGLE_SLUG ? { slug: SINGLE_SLUG } : {}),
    },
    select: { id: true, slug: true, name: true, apiCourseName: true, marketDemand: true },
    orderBy: { slug: 'asc' },
    ...(LIMIT ? { take: LIMIT } : {}),
  })

  console.log(`Cursos a processar: ${courses.length}`)

  let ok = 0
  let fallbackUsed = 0
  let fail = 0
  const startedAt = Date.now()

  for (const [i, course] of courses.entries()) {
    const topic = course.apiCourseName
    process.stdout.write(`[${i + 1}/${courses.length}] ${course.slug.padEnd(50)} `)

    try {
      const result = await fetchTrendsForTopic(topic, { timeframeDays: 30, region: 'BR' })

      let score: number
      let source: string
      if (result.rateLimited || !result.entries.length) {
        score = DEMAND_FALLBACK[course.marketDemand] ?? 0
        source = result.rateLimited ? `fallback:rateLimit:${course.marketDemand}` : `fallback:${course.marketDemand}`
        fallbackUsed++
      } else {
        score = scoreFromTrendsEntries(result.entries)
        if (score === 0) {
          score = DEMAND_FALLBACK[course.marketDemand] ?? 0
          source = `fallback:${course.marketDemand}`
          fallbackUsed++
        } else {
          source = 'trends'
        }
      }

      console.log(`score=${String(score).padStart(3)}  (${source})`)

      if (!DRY_RUN) {
        await prisma.featuredCourse.update({
          where: { id: course.id },
          data: { trendScore: score, trendScoreFetched: new Date() },
        })
      }
      ok++
    } catch (err) {
      console.log(`✗ ${err instanceof Error ? err.message : String(err)}`)
      fail++
    }

    if (i < courses.length - 1) await sleep(THROTTLE_MS)
  }

  const elapsed = Math.round((Date.now() - startedAt) / 1000)
  console.log('\n═══════════════════════════════════════════════')
  console.log(`  ✓ ${ok}  fallback ${fallbackUsed}  fail ${fail}  ${elapsed}s`)
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
