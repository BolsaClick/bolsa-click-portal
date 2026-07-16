'use client'

/**
 * GeoShelf — "Presencial perto de você": prateleira personalizada por
 * geolocalização (IP, via GeoLocationContext — o mesmo do funil).
 *
 * Estados:
 * - geo/fetch carregando → skeleton (aria-busy);
 * - ofertas na cidade do usuário → "Presencial perto de você · {Cidade}";
 * - sem geo ou 0 ofertas na cidade → fallback São Paulo com título honesto
 *   "Presencial em São Paulo" (sem fingir que é a cidade do usuário);
 * - erro nos dois fetches → empty state com mascote surpreso.
 *
 * Client-side o merge Athena/Estácio acontece automaticamente. Nunca bloqueia
 * o render da página (as prateleiras server-side seguem como estão).
 */

import { useQuery } from '@tanstack/react-query'

import { useGeoLocation } from '@/app/context/GeoLocationContext'

import { titleCase } from '../course-offer'
import CourseShelf, { CourseShelfSkeleton } from './CourseShelf'
import { fetchOffers } from './fetch-offers'

const HEADING_ID = 'shelf-perto-de-voce'
const FALLBACK = { city: 'SAO PAULO', state: 'SP', label: 'São Paulo' }

export default function GeoShelf({ cardHref }: { cardHref?: string }) {
  const geo = useGeoLocation()

  // O contexto resolve com city (sucesso ou default de bot/erro) ou error.
  const geoResolved = Boolean(geo.city || geo.error)
  const userCity = geo.city?.trim() || null
  const userState = (geo.state || geo.region || '').trim() || null

  const query = useQuery({
    queryKey: ['v2-geo-shelf', userCity, userState],
    enabled: geoResolved,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    queryFn: async () => {
      // 1º: cidade real do usuário (quando houver)
      if (userCity) {
        const offers = await fetchOffers({
          modality: 'PRESENCIAL',
          city: userCity,
          state: userState ?? undefined,
        })
        if (offers.length > 0) {
          return { offers, cityLabel: titleCase(userCity), isFallback: false }
        }
      }
      // 2º: fallback honesto pra São Paulo (sem geo ou 0 ofertas na cidade)
      const offers = await fetchOffers({
        modality: 'PRESENCIAL',
        city: FALLBACK.city,
        state: FALLBACK.state,
      })
      return { offers, cityLabel: FALLBACK.label, isFallback: true }
    },
  })

  if (!geoResolved || query.isPending) {
    return (
      <CourseShelfSkeleton
        headingId={HEADING_ID}
        eyebrow="Perto de você"
        title="Presencial perto de você"
      />
    )
  }

  if (query.isError) {
    return (
      <CourseShelf
        headingId={HEADING_ID}
        eyebrow="Perto de você"
        title="Presencial perto de você"
        offers={[]}
        cardHref={cardHref}
        emptyMessage="Não conseguimos carregar as ofertas presenciais agora — recarregue a página ou use a busca lá em cima."
      />
    )
  }

  const { offers, cityLabel, isFallback } = query.data

  return (
    <CourseShelf
      headingId={HEADING_ID}
      eyebrow="Perto de você"
      title={isFallback ? 'Presencial em São Paulo' : `Presencial perto de você · ${cityLabel}`}
      subtitle={
        isFallback && userCity
          ? `Não achamos ofertas presenciais em ${titleCase(userCity)} — veja São Paulo ou busque sua cidade lá em cima.`
          : 'Campi com turnos de manhã e noite — escolha o turno no card.'
      }
      offers={offers}
      cardHref={cardHref}
      emptyMessage="Nenhuma oferta presencial carregada agora — use a busca lá em cima."
    />
  )
}
