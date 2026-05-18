import { Star } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/app/lib/prisma'

interface Props {
  courseName: string
  brands: string[]
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function getCourseReviews(brands: string[]) {
  if (!brands || brands.length === 0) return { reviews: [], avgRating: 0, total: 0 }

  const brandSlugs = Array.from(new Set(brands.map(normalize).filter(Boolean)))
  if (brandSlugs.length === 0) return { reviews: [], avgRating: 0, total: 0 }

  try {
    const institutions = await prisma.institution.findMany({
      where: { slug: { in: brandSlugs }, isActive: true },
      select: { id: true, name: true, slug: true, logoUrl: true },
    })

    if (institutions.length === 0) return { reviews: [], avgRating: 0, total: 0 }

    const reviews = await prisma.review.findMany({
      where: {
        institutionId: { in: institutions.map((i) => i.id) },
        status: 'APPROVED',
      },
      orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
      take: 6,
      select: {
        id: true,
        authorName: true,
        rating: true,
        recommends: true,
        body: true,
        response: true,
        respondedAt: true,
        createdAt: true,
        institutionId: true,
      },
    })

    const allRatings = await prisma.review.findMany({
      where: {
        institutionId: { in: institutions.map((i) => i.id) },
        status: 'APPROVED',
      },
      select: { rating: true },
    })

    const total = allRatings.length
    const avgRating =
      total > 0 ? allRatings.reduce((sum, r) => sum + r.rating, 0) / total : 0

    // Adiciona dados da instituição em cada review
    const instById = new Map(institutions.map((i) => [i.id, i]))
    const reviewsWithInst = reviews.map((r) => ({
      ...r,
      institution: instById.get(r.institutionId) ?? null,
    }))

    return { reviews: reviewsWithInst, avgRating, total }
  } catch (err) {
    console.error('CourseReviewsBlock — falha ao buscar reviews:', err)
    return { reviews: [], avgRating: 0, total: 0 }
  }
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${rating} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={
            i <= rating
              ? 'fill-bolsa-secondary text-bolsa-secondary'
              : 'text-ink-300'
          }
        />
      ))}
    </div>
  )
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
}

export default async function CourseReviewsBlock({ courseName, brands }: Props) {
  const { reviews, avgRating, total } = await getCourseReviews(brands)

  if (reviews.length === 0) return null

  return (
    <section className="bg-white py-12 md:py-16 border-t border-hairline">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="hairline-b pb-3 mb-6 flex items-baseline justify-between">
          <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
            Avaliações de quem estuda
          </h2>
          <span className="font-mono num-tabular text-[11px] text-ink-500">
            ({String(total).padStart(2, '0')})
          </span>
        </div>

        <div className="flex items-baseline gap-4 mb-8">
          <p className="font-display text-4xl md:text-5xl text-ink-900">
            {avgRating.toFixed(1)}
          </p>
          <div>
            <StarRow rating={Math.round(avgRating)} />
            <p className="text-ink-500 text-sm mt-1">
              Média de {total} {total === 1 ? 'avaliação' : 'avaliações'} de alunos das
              faculdades parceiras que ofertam {courseName}
            </p>
          </div>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-px bg-hairline">
          {reviews.map((r) => (
            <li key={r.id} className="bg-white p-5">
              <div className="flex items-baseline justify-between mb-2">
                <p className="font-display text-ink-900">{r.authorName}</p>
                <span className="font-mono text-[10px] tracking-wider uppercase text-ink-500">
                  {formatDate(r.createdAt)}
                </span>
              </div>
              {r.institution && (
                <p className="text-xs text-ink-500 mb-2">{r.institution.name}</p>
              )}
              <StarRow rating={r.rating} />
              <p className="text-ink-800 text-sm leading-relaxed mt-3">{r.body}</p>
              {r.response && (
                <div className="mt-4 pt-3 border-t border-hairline">
                  <p className="font-mono text-[10px] tracking-wider uppercase text-ink-500 mb-1">
                    Resposta da faculdade
                  </p>
                  <p className="text-ink-700 text-sm leading-relaxed italic">
                    {r.response}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-6 text-center">
          <Link
            href="/avaliar"
            className="font-mono text-[11px] tracking-[0.18em] uppercase text-bolsa-secondary hover:underline"
          >
            Deixar sua avaliação →
          </Link>
        </div>
      </div>
    </section>
  )
}
