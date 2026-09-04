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
import { searchAthenaOffers } from '@/app/lib/api/athena-offers'

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

/**
 * Marcas YDUQS consultadas na Athena — mesma lista de ALL_YDUQS_BRAND_SLUGS
 * em app/lib/api/get-courses-filter.ts (não importada de lá pra manter esta
 * sonda desacoplada do fetch de CONTEÚDO; ver comentário de probeAthenaHealth
 * abaixo pro porquê disso importa). Atualizar as duas listas juntas se a
 * Athena passar a rotear outra marca.
 */
const YDUQS_BRAND_SLUGS_FOR_PROBE = ['estacio', 'ibmec', 'wyden']

/**
 * Sonda de saúde da Athena — usada SÓ pelo gate de indexação do Grupo A
 * (resolveOfferCountForGate em ../page.tsx), nunca pro conteúdo renderizado.
 *
 * POR QUÊ EXISTE: getCityCourseOffers (acima) mescla Cogna+Athena via
 * getShowFiltersCourses, mas essa função NUNCA deixa uma falha de UMA marca
 * Athena escapar como exceção — searchAthenaOffers() degrada graciosamente
 * pra `[]` por padrão (comportamento certo pro RENDER: uma Athena instável
 * não pode derrubar a página). Isso significa que o "0 ofertas" que chega ao
 * gate é AMBÍGUO: pode ser "curso realmente sem oferta Athena nesta cidade"
 * (evidência positiva, autoriza noindex) ou "a Athena falhou bem na hora da
 * revalidação ISR" (zero por acidente, NÃO autoriza noindex — ver comentário
 * em resolveOfferCountForGate). Esta sonda existe pra desambiguar: chama
 * searchAthenaOffers com `throwOnFailure: true` (opt-in, não muda o
 * comportamento do fetch de conteúdo) e reporta se alguma marca lançou uma
 * exceção REAL (ex.: 400 embrulhando 429).
 *
 * COBERTURA PARCIAL, DE PROPÓSITO: só pega o modo de falha "exceção depois da
 * chamada HTTP". O outro modo conhecido — "200 com lista vazia sob carga" —
 * não lança nada, então uma chamada isolada (mesmo com throwOnFailure) não
 * distingue isso de ausência real; não existe sinal extra pra isso numa
 * leitura única (ao contrário do precompute-institution-max-discount.ts, que
 * some esse ruído agregando MUITAS chamadas — não dá pra replicar isso pra
 * UM curso × UMA cidade sem inventar amostra). Mitigação de verdade — fora de
 * escopo aqui — é persistir uma contagem mesclada Cogna+Athena com o mesmo
 * gate "nunca escreve com falha" de precompute-institution-max-discount.ts,
 * pra que o gate leia um valor pré-validado em vez de uma leitura ao vivo.
 * Ver relatório da tarefa "gate considera Athena" (blindagem) pro próximo passo.
 *
 * Cacheado 10 min (mesma janela de getCityCourseOffers) — não dobra o
 * tráfego Athena a cada request, só por revalidação ISR (24h) de fato.
 *
 * @param cityScoped Sonda a MESMA forma de consulta que produziu o
 *   liveOfferCount que estamos desconfiando: local (cidade+estado) quando
 *   fromFallback=false, nacional (sem cidade) quando fromFallback=true —
 *   espelha exatamente o fallback interno de getCityCourseOffers.
 */
const _probeAthenaHealthBase = unstable_cache(
  async (
    apiCourseName: string,
    cityName: string,
    stateUF: string,
    nivel: string,
    cityScoped: boolean,
  ): Promise<boolean> => {
    const results = await Promise.allSettled(
      YDUQS_BRAND_SLUGS_FOR_PROBE.map((brand) =>
        searchAthenaOffers(
          {
            courseName: apiCourseName,
            city: cityScoped ? cityName : undefined,
            state: cityScoped ? stateUF : undefined,
            academicLevel: nivel,
            brand,
          },
          { throwOnFailure: true },
        ),
      ),
    )
    return results.every((r) => r.status === 'fulfilled')
  },
  ['city-course-athena-health-probe'],
  { revalidate: 600 },
)

export const probeAthenaHealth = cache(_probeAthenaHealthBase)

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
