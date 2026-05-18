import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'
import { prisma } from '@/app/lib/prisma'
import { fetchTrendsForTopic } from '@/app/lib/seo/trends-fetcher'
import { buildCatalogIndex, matchQuery, normalize, calculatePriorityScore } from '@/app/lib/seo/gap-matcher'
import { getAllTopics } from '@/app/lib/seo/topics'

// Rate-limit: 1 refresh por hora (lock via último snapshot)
const REFRESH_COOLDOWN_MS = 60 * 60 * 1000

export async function POST(request: NextRequest) {
  const auth = await withAdminAuth(request, ['seo'])
  if (isAuthError(auth)) return auth

  // Cooldown check
  const lastSnapshot = await prisma.seoTrendsSnapshot.findFirst({
    orderBy: { fetchedAt: 'desc' },
    select: { fetchedAt: true },
  })
  if (lastSnapshot) {
    const ageMs = Date.now() - new Date(lastSnapshot.fetchedAt).getTime()
    if (ageMs < REFRESH_COOLDOWN_MS) {
      const waitMin = Math.ceil((REFRESH_COOLDOWN_MS - ageMs) / 60000)
      return NextResponse.json(
        {
          error: 'cooldown',
          message: `Aguarde ${waitMin}min antes do próximo refresh.`,
          retryInMs: REFRESH_COOLDOWN_MS - ageMs,
        },
        { status: 429 },
      )
    }
  }

  // Pega topics + monta catalog index uma vez
  const topics = await getAllTopics({ includeCatalog: true, catalogLimit: 20 })
  const catalog = await buildCatalogIndex()

  let totalEntries = 0
  let rateLimitedCount = 0
  let errorCount = 0
  const snapshotsCreated: string[] = []

  for (const t of topics) {
    const result = await fetchTrendsForTopic(t.topic, { timeframeDays: 7, region: 'BR' })

    if (result.error) errorCount++
    if (result.rateLimited) {
      rateLimitedCount++
      // se rate-limitar, persiste snapshot vazio pra audit, mas para o loop
      await prisma.seoTrendsSnapshot.create({
        data: {
          topic: t.topic,
          source: t.source,
          timeframe: result.timeframe,
          region: result.region,
          rawData: result.rawData as never,
        },
      })
      break
    }

    if (result.entries.length === 0) {
      continue
    }

    const snapshot = await prisma.seoTrendsSnapshot.create({
      data: {
        topic: t.topic,
        source: t.source,
        timeframe: result.timeframe,
        region: result.region,
        rawData: result.rawData as never,
      },
    })
    snapshotsCreated.push(snapshot.id)

    const entryData = result.entries.map((e) => {
      const match = matchQuery(e.query, catalog)
      return {
        snapshotId: snapshot.id,
        query: e.query,
        normalizedQuery: normalize(e.query),
        trendValue: e.value,
        isRising: e.isRising,
        risingPercent: e.isRising ? e.value : null,
        matchStatus: match.status,
        matchedEntities: match.matchedEntities,
        priorityScore: calculatePriorityScore(e.value, e.isRising, match.status),
      }
    })
    if (entryData.length > 0) {
      await prisma.seoTrendsEntry.createMany({ data: entryData })
      totalEntries += entryData.length
    }
  }

  return NextResponse.json({
    success: true,
    topicsProcessed: snapshotsCreated.length,
    totalEntries,
    rateLimited: rateLimitedCount > 0,
    rateLimitedCount,
    errorCount,
  })
}
