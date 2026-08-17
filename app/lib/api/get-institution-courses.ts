// Busca todos os cursos únicos de uma faculdade (brand) cobrindo o TOP_CURSOS
// inteiro em paralelo. Server-side com unstable_cache 1h pra amortizar o custo
// entre múltiplas visitas. Resolve o problema de "/faculdades/[slug] mostra 50
// cards do mesmo curso" — agora mostra 1 card por curso único da brand.

import { unstable_cache } from 'next/cache'
import { getShowFiltersCourses } from './get-courses-filter'
import { searchAthenaOffers, normalizeAthenaOffer } from './athena-offers'
import { normalizeBrand } from '../utils/brand'
import { TOP_CURSOS } from '@/app/cursos/_data/cursos'
import type { Course } from '@/app/interface/course'

/** Marcas servidas pela API Athena (YDUQS) — buscadas server-side à parte. */
const YDUQS_BRANDS = new Set(['Estácio', 'Wyden'])

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

async function fetchAllOffersByCourse(): Promise<Course[]> {
  const results = await Promise.all(
    TOP_CURSOS.map(curso =>
      getShowFiltersCourses(
        curso.apiCourseName,
        undefined, undefined, undefined,
        'GRADUACAO',
        1,
        50
      )
        .then(r => (r?.data || []) as Course[])
        .catch(error => {
          console.error(`[institution-courses] falha em ${curso.apiCourseName}:`, error)
          return [] as Course[]
        })
    )
  )
  return results.flat()
}

/**
 * Ofertas YDUQS (Estácio/Wyden) via Athena — fetch SERVER-SIDE (o merge padrão de
 * getShowFiltersCourses só roda no browser). Cobre o TOP_CURSOS e normaliza p/ Course.
 */
async function fetchAthenaOffersByCourse(): Promise<Course[]> {
  const results = await Promise.all(
    TOP_CURSOS.map(curso =>
      searchAthenaOffers({ courseName: curso.apiCourseName, academicLevel: 'GRADUACAO' })
        .then(list => list.map(normalizeAthenaOffer))
        .catch(error => {
          console.error(`[institution-courses] Athena falhou em ${curso.apiCourseName}:`, error)
          return [] as Course[]
        })
    )
  )
  return results.flat()
}

/**
 * Pra uma dada brand de faculdade, retorna 1 oferta por curso único (a mais barata).
 * Cobre todo o TOP_CURSOS (22) → diversidade real de cursos.
 * Cache 1h via unstable_cache.
 */
export const getInstitutionCourses = unstable_cache(
  async (brandName: string): Promise<Course[]> => {
    const brandKey = normalizeBrand(brandName)
    const tartarusOffers = await fetchAllOffersByCourse()
    // Ofertas YDUQS (Estácio) vêm da Athena server-side. Sem isso, a página de
    // marca da Estácio ficava sem ofertas/preços e o AggregateOffer não era emitido.
    const athenaOffers = YDUQS_BRANDS.has(brandKey)
      ? await fetchAthenaOffersByCourse()
      : []
    const allOffers = [...tartarusOffers, ...athenaOffers]

    // Filtra por brand — normalizeBrand agrupa as razões sociais YDUQS sob "Estácio".
    const brandOffers = allOffers.filter(
      o => normalizeBrand((o as Course).brand) === brandKey
    )

    // Dedup por nome do curso, mantendo a oferta mais barata
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
  ['institution-courses-v1'],
  { revalidate: 3600, tags: ['institution-courses'] }
)
