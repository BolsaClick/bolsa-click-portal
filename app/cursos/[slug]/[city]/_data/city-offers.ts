/**
 * Ofertas de curso por cidade + faixa de preço. Extraído de `page.tsx` pra um
 * módulo comum — Next.js restringe o que um `page.tsx` pode exportar (o
 * plugin de TypeScript acusa "no exported member" pra quem tenta importar
 * outros nomes de lá, mesmo com `export` presente), então o compartilhamento
 * com `opengraph-image.tsx` passa por aqui em vez de `import ... from '../page'`.
 */
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'

// Busca ofertas de cidade. Retorna offers + flag fromFallback indicando se
// caímos na busca nacional por falta de estoque local. unstable_cache persiste
// o resultado da API tartarus por 10 min entre renders; react.cache deduplicar
// dentro do mesmo request (generateMetadata + page component).
const _getCityCourseOffersBase = unstable_cache(
  async (
    apiCourseName: string,
    cityName: string,
    stateUF: string,
    nivel: string,
  ) => {
    try {
      const cityResponse = await getShowFiltersCourses(
        apiCourseName, cityName, stateUF, undefined, nivel, 1, 20
      )
      const cityOffers = cityResponse?.data || []
      if (cityOffers.length > 0) {
        return { offers: cityOffers, fromFallback: false }
      }

      const generalResponse = await getShowFiltersCourses(
        apiCourseName, undefined, undefined, undefined, nivel, 1, 20
      )
      return { offers: generalResponse?.data || [], fromFallback: true }
    } catch (error) {
      console.error(`Erro ao buscar ofertas para ${apiCourseName} em ${cityName}:`, error)
      try {
        const fallbackResponse = await getShowFiltersCourses(
          apiCourseName, undefined, undefined, undefined, nivel, 1, 20
        )
        return { offers: fallbackResponse?.data || [], fromFallback: true }
      } catch {
        return { offers: [], fromFallback: true }
      }
    }
  },
  ['city-course-offers'],
  { revalidate: 600 },
)

export const getCityCourseOffers = cache(_getCityCourseOffersBase)

export function priceRangeFromOffers(offers: unknown[]) {
  const prices = (offers as { minPrice?: number; prices?: { withDiscount?: number } }[])
    .map(o => o.minPrice || o.prices?.withDiscount || 0)
    .filter(p => p > 0)
  const maxPrices = (offers as { maxPrice?: number; prices?: { withoutDiscount?: number } }[])
    .map(o => o.maxPrice || o.prices?.withoutDiscount || 0)
    .filter(p => p > 0)
  return {
    lowPrice: prices.length > 0 ? Math.min(...prices) : 0,
    highPrice: maxPrices.length > 0 ? Math.max(...maxPrices) : 0,
    offerCount: offers.length,
  }
}
