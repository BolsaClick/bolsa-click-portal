import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'
import { prisma } from '@/app/lib/prisma'
import type { GapMatchStatus, TrendsSource, Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const auth = await withAdminAuth(request, ['seo'])
  if (isAuthError(auth)) return auth

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') as GapMatchStatus | null
  const source = searchParams.get('source') as TrendsSource | null
  const includeDismissed = searchParams.get('includeDismissed') === 'true'
  const onlyRising = searchParams.get('onlyRising') === 'true'
  const limit = Math.min(Number(searchParams.get('limit') || '200'), 500)

  const where: Prisma.SeoTrendsEntryWhereInput = {}
  if (status) where.matchStatus = status
  if (!includeDismissed) where.dismissed = false
  if (onlyRising) where.isRising = true
  if (source) {
    where.snapshot = { source }
  }

  const entries = await prisma.seoTrendsEntry.findMany({
    where,
    orderBy: { priorityScore: 'desc' },
    take: limit,
    include: {
      snapshot: {
        select: { topic: true, source: true, timeframe: true, fetchedAt: true },
      },
    },
  })

  const counts = await prisma.seoTrendsEntry.groupBy({
    by: ['matchStatus'],
    _count: true,
    where: { dismissed: false },
  })

  const lastSnapshot = await prisma.seoTrendsSnapshot.findFirst({
    orderBy: { fetchedAt: 'desc' },
    select: { fetchedAt: true },
  })

  return NextResponse.json({
    entries,
    counts: counts.reduce<Record<string, number>>((acc, c) => {
      acc[c.matchStatus] = c._count
      return acc
    }, {}),
    lastFetchedAt: lastSnapshot?.fetchedAt ?? null,
  })
}
