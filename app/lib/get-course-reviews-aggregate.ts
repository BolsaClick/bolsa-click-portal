import { unstable_cache } from 'next/cache'
import { prisma } from './prisma'

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export interface CourseReviewsAggregate {
  ratingValue: number // 1.0 a 5.0 com 1 casa decimal
  reviewCount: number
}

// Mínimo de reviews aprovadas pra emitir AggregateRating no schema Course.
// Abaixo disso, Google pode marcar como dados insuficientes (e a média
// flutua demais com poucos votos).
const MIN_REVIEWS_FOR_AGGREGATE = 3

/**
 * Retorna AggregateRating das reviews APPROVED das instituições que ofertam
 * esse curso. Retorna null se < 3 reviews — não emite schema com volume insuficiente
 * pra evitar penalty de "low-quality data" e pra ratingValue não ser enganoso.
 *
 * Cacheado por 1h (reviews mudam pouco em alta frequência).
 */
export async function getCourseReviewsAggregate(
  brands: string[]
): Promise<CourseReviewsAggregate | null> {
  const brandSlugs = Array.from(new Set(brands.map(normalize).filter(Boolean)))
  if (brandSlugs.length === 0) return null

  // Cache key inclui brands ordenados pra reuso entre chamadas
  const cacheKey = brandSlugs.sort().join(',')

  return unstable_cache(
    async (): Promise<CourseReviewsAggregate | null> => {
      try {
        const institutions = await prisma.institution.findMany({
          where: { slug: { in: brandSlugs }, isActive: true },
          select: { id: true },
        })
        if (institutions.length === 0) return null

        const reviews = await prisma.review.findMany({
          where: {
            institutionId: { in: institutions.map((i) => i.id) },
            status: 'APPROVED',
          },
          select: { rating: true },
        })

        if (reviews.length < MIN_REVIEWS_FOR_AGGREGATE) return null

        const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
        const avg = sum / reviews.length

        return {
          ratingValue: Math.round(avg * 10) / 10,
          reviewCount: reviews.length,
        }
      } catch (err) {
        console.error('getCourseReviewsAggregate — falha:', err)
        return null
      }
    },
    [`course-reviews-aggregate-${cacheKey}`],
    { revalidate: 3600, tags: ['reviews'] }
  )()
}
