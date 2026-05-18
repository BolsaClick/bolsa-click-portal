// Busca cursos únicos de uma faculdade (brand) numa cidade específica.
// Cobre TOP_CURSOS em paralelo e filtra localmente por brand + city.
// Cache de 1h por (brand, citySlug) via unstable_cache.

import { unstable_cache } from 'next/cache'
import { getShowFiltersCourses } from './get-courses-filter'
import { TOP_CURSOS } from '@/app/cursos/_data/cursos'
import type { Course } from '@/app/interface/course'

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

async function fetchAllOffersForCity(cityName: string, stateUF: string): Promise<Course[]> {
  const results = await Promise.all(
    TOP_CURSOS.map((curso) =>
      getShowFiltersCourses(
        curso.apiCourseName,
        cityName,
        stateUF,
        undefined,
        'GRADUACAO',
        1,
        50,
      )
        .then((r) => (r?.data || []) as Course[])
        .catch((error) => {
          console.error(`[institution-courses-by-city] falha em ${curso.apiCourseName} ${cityName}/${stateUF}:`, error)
          return [] as Course[]
        }),
    ),
  )
  return results.flat()
}

/**
 * Para uma brand + cidade, retorna 1 oferta por curso único (a mais barata).
 * Retorna lista vazia quando não há inventário local — a página chamadora deve
 * emitir noindex+canonical pra /faculdades/[slug] nacional nesse caso.
 */
export const getInstitutionCoursesByCity = unstable_cache(
  async (brandName: string, cityName: string, stateUF: string): Promise<Course[]> => {
    const brandKey = normalize(brandName)
    const allOffers = await fetchAllOffersForCity(cityName, stateUF)

    const brandOffers = allOffers.filter(
      (o) => normalize(o.brand || '') === brandKey,
    )

    const bestByName = new Map<string, Course>()
    for (const offer of brandOffers) {
      const key = normalize(offer.name ?? '')
      if (!key) continue
      const existing = bestByName.get(key)
      if (!existing) {
        bestByName.set(key, offer)
        continue
      }
      const existingPrice = existing.minPrice ?? Number.POSITIVE_INFINITY
      const offerPrice = offer.minPrice ?? Number.POSITIVE_INFINITY
      if (offerPrice < existingPrice) {
        bestByName.set(key, offer)
      }
    }

    return Array.from(bestByName.values()).sort((a, b) => {
      const ap = a.minPrice ?? Number.POSITIVE_INFINITY
      const bp = b.minPrice ?? Number.POSITIVE_INFINITY
      return ap - bp
    })
  },
  ['institution-courses-by-city-v1'],
  { revalidate: 3600, tags: ['institution-courses-by-city'] },
)
