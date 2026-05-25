import { Star } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/app/lib/prisma'

const SITE_URL = 'https://www.bolsaclick.com.br'
const PAGE_URL = `${SITE_URL}/bolsas-de-estudo`

interface Props {
  /** Quantos depoimentos mostrar. Default 5. */
  limit?: number
}

async function getAggregatedReviews(limit: number) {
  try {
    const activeInstitutions = await prisma.institution.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
    })

    if (activeInstitutions.length === 0) {
      return { reviews: [], avgRating: 0, total: 0 }
    }

    const institutionIds = activeInstitutions.map(i => i.id)

    const [reviews, allRatings] = await Promise.all([
      prisma.review.findMany({
        where: {
          institutionId: { in: institutionIds },
          status: 'APPROVED',
        },
        orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        select: {
          id: true,
          authorName: true,
          rating: true,
          recommends: true,
          body: true,
          createdAt: true,
          institutionId: true,
        },
      }),
      prisma.review.findMany({
        where: {
          institutionId: { in: institutionIds },
          status: 'APPROVED',
        },
        select: { rating: true },
      }),
    ])

    const total = allRatings.length
    const avgRating =
      total > 0 ? allRatings.reduce((sum, r) => sum + r.rating, 0) / total : 0

    const instById = new Map(activeInstitutions.map(i => [i.id, i]))
    const reviewsWithInst = reviews.map(r => ({
      ...r,
      institution: instById.get(r.institutionId) ?? null,
    }))

    return { reviews: reviewsWithInst, avgRating, total }
  } catch (err) {
    console.error('DepoimentosSection — falha ao buscar reviews:', err)
    return { reviews: [], avgRating: 0, total: 0 }
  }
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${rating} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={14}
          className={
            i <= rating ? 'fill-bolsa-secondary text-bolsa-secondary' : 'text-ink-300'
          }
        />
      ))}
    </div>
  )
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
}

export default async function DepoimentosSection({ limit = 5 }: Props) {
  const { reviews, avgRating, total } = await getAggregatedReviews(limit)

  // Degradação graciosa: se DB ainda não tem reviews APPROVED, não renderiza nada.
  // Trust signal vazio é melhor que trust signal inventado (CLAUDE.md).
  if (reviews.length === 0) return null

  // Schemas: AggregateRating como propriedade do Organization global + Review[]
  // como itens próprios. Sinal forte de social proof verificável pra Rich Results.
  const ratingSchemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      '@id': `${SITE_URL}/#organization`,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: total,
        bestRating: '5',
        worstRating: '1',
      },
    },
    ...reviews.map(r => ({
      '@context': 'https://schema.org',
      '@type': 'Review',
      '@id': `${PAGE_URL}#review-${r.id}`,
      author: { '@type': 'Person', name: r.authorName },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: '5',
        worstRating: '1',
      },
      reviewBody: r.body,
      datePublished: r.createdAt.toISOString().split('T')[0],
      itemReviewed: r.institution
        ? {
            '@type': 'EducationalOrganization',
            name: r.institution.name,
            url: `${SITE_URL}/faculdades/${r.institution.slug}`,
          }
        : { '@type': 'EducationalOrganization', '@id': `${SITE_URL}/#organization` },
    })),
  ]

  return (
    <section
      id="depoimentos"
      className="bg-white py-12 md:py-16 border-b border-hairline"
      data-speakable="depoimentos"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ratingSchemas) }}
      />

      <div className="container mx-auto px-4 max-w-5xl">
        <div className="hairline-b pb-3 mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900">
            Quem já estuda com bolsa pelo Bolsa Click
          </h2>
          <span className="font-mono num-tabular text-[11px] text-ink-500">
            ({String(total).padStart(2, '0')})
          </span>
        </div>

        <div className="flex items-baseline gap-4 mb-8">
          <p className="font-display num-tabular text-4xl md:text-5xl text-ink-900">
            {avgRating.toFixed(1)}
          </p>
          <div>
            <StarRow rating={Math.round(avgRating)} />
            <p className="text-ink-500 text-sm mt-1">
              Média de {total} {total === 1 ? 'avaliação' : 'avaliações'} de alunos das
              faculdades parceiras do Bolsa Click
            </p>
          </div>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline">
          {reviews.map(r => (
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
