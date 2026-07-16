'use client'

/**
 * RelatedShelf — "Continue de onde parou": prateleira personalizada pela
 * última busca salva (useLastSearch, já gated por consentimento LGPD).
 *
 * Regras de privacidade e honestidade:
 * - Sem consentimento de personalização ou sem busca salva → não renderiza
 *   NADA (nem skeleton) — a home fica idêntica à de um visitante anônimo.
 * - Zero resultados ou erro → também não renderiza (prateleira é bônus,
 *   nunca um buraco na página).
 *
 * Dedupe por oferta (não por curso-base): a busca é específica, então
 * unidades/polos diferentes do mesmo curso são resultados legítimos.
 */

import { useQuery } from '@tanstack/react-query'

import { useLastSearch } from '@/app/lib/personalization/hooks'

import { titleCase } from '../course-offer'
import CourseShelf, { CourseShelfSkeleton } from './CourseShelf'
import { fetchOffers } from './fetch-offers'

const HEADING_ID = 'shelf-ultima-busca'

export default function RelatedShelf({ cardHref }: { cardHref?: string }) {
  const { lastSearch, enabled } = useLastSearch()

  const course = enabled ? lastSearch?.course?.trim() || null : null
  const hasSearch = Boolean(course)

  const query = useQuery({
    queryKey: [
      'v2-related-shelf',
      course,
      lastSearch?.city ?? null,
      lastSearch?.state ?? null,
      lastSearch?.modality ?? null,
      lastSearch?.level ?? null,
    ],
    enabled: hasSearch,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    queryFn: () =>
      fetchOffers({
        courseName: course as string,
        city: lastSearch?.city,
        state: lastSearch?.state,
        modality: lastSearch?.modality,
        level: lastSearch?.level,
        dedupeMode: 'offer',
        take: 8,
      }),
  })

  // Sem consentimento/sem busca: nada — nem skeleton.
  if (!hasSearch || !course) return null

  const title = `Continue de onde parou: ${titleCase(course)}`

  if (query.isPending) {
    return <CourseShelfSkeleton headingId={HEADING_ID} eyebrow="Sua última busca" title={title} />
  }

  if (query.isError || !query.data || query.data.length === 0) return null

  return (
    <CourseShelf
      headingId={HEADING_ID}
      eyebrow="Sua última busca"
      title={title}
      subtitle={
        lastSearch?.city ? `Ofertas de ${titleCase(course)} em ${titleCase(lastSearch.city)}.` : undefined
      }
      offers={query.data}
      cardHref={cardHref}
    />
  )
}
