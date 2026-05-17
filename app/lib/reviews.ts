import { cache } from 'react'
import { prisma } from '@/app/lib/prisma'

export interface InstitutionReviewSummary {
  reviews: Array<{
    id: string
    authorName: string
    rating: number
    recommends: boolean
    body: string
    response: string | null
    respondedAt: Date | null
    createdAt: Date
  }>
  count: number
  averageRating: number  // 0 quando count === 0
  recommendPercent: number  // 0-100
}

const MIN_REVIEWS_FOR_AGGREGATE = 3

export const getInstitutionReviewSummary = cache(
  async (institutionId: string): Promise<InstitutionReviewSummary> => {
    const approved = await prisma.review.findMany({
      where: { institutionId, status: 'APPROVED' },
      select: {
        id: true,
        authorName: true,
        rating: true,
        recommends: true,
        body: true,
        response: true,
        respondedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const count = approved.length
    const averageRating = count > 0 ? approved.reduce((s, r) => s + r.rating, 0) / count : 0
    const recommendCount = approved.filter((r) => r.recommends).length
    const recommendPercent = count > 0 ? Math.round((recommendCount / count) * 100) : 0

    return { reviews: approved, count, averageRating, recommendPercent }
  }
)

export function shouldEmitAggregateRating(summary: InstitutionReviewSummary): boolean {
  return summary.count >= MIN_REVIEWS_FOR_AGGREGATE
}

export function buildAggregateRatingSchema(summary: InstitutionReviewSummary) {
  if (!shouldEmitAggregateRating(summary)) return null
  return {
    '@type': 'AggregateRating',
    ratingValue: summary.averageRating.toFixed(1),
    bestRating: '5',
    worstRating: '1',
    ratingCount: String(summary.count),
    reviewCount: String(summary.count),
  }
}
