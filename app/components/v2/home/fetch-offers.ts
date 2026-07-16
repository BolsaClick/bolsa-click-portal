/**
 * Home v2 — busca de ofertas pra prateleiras client-side (geo/personalizada).
 *
 * Client-side o merge Athena/Estácio do getShowFiltersCourses acontece
 * automaticamente (o guard `typeof window` passa). Timeout de 8s pra nunca
 * segurar a prateleira; quem chama decide skeleton/empty/fallback.
 */

import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'

import { parseCourseName, type CourseOffer } from '../course-offer'
import { toCourseOffer } from './featured-offers'

export type DedupeMode = 'course' | 'offer'

/**
 * Dedupe:
 * - 'course' (vitrine de descoberta): 1 card por curso-base — mesmo critério
 *   do merge server-side, que evita "Pedagogia" repetida por polo.
 * - 'offer' (busca específica): mantém unidades diferentes do mesmo curso,
 *   removendo só duplicatas exatas (nome+marca+unidade+cidade+modalidade).
 */
export function dedupeOffers(offers: CourseOffer[], mode: DedupeMode = 'course'): CourseOffer[] {
  const seen = new Set<string>()
  return offers.filter((offer) => {
    const key =
      mode === 'course'
        ? parseCourseName(offer.name).title.trim().toUpperCase()
        : [
            offer.name,
            offer.brand,
            offer.unitName ?? offer.unit ?? '',
            offer.city ?? '',
            offer.commercialModality ?? offer.modality ?? '',
          ]
            .join('|')
            .toUpperCase()
    if (!key) return true
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export interface FetchOffersParams {
  courseName?: string
  city?: string
  state?: string
  modality?: string
  level?: string
  take?: number
  dedupeMode?: DedupeMode
}

export async function fetchOffers(params: FetchOffersParams): Promise<CourseOffer[]> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('offers timeout')), 8000),
  )

  const result = (await Promise.race([
    getShowFiltersCourses(
      params.courseName,
      params.city,
      params.state,
      params.modality,
      params.level ?? 'GRADUACAO',
      1,
      12,
    ),
    timeout,
  ])) as { data?: unknown[] }

  const mapped = (Array.isArray(result?.data) ? result.data : [])
    .map(toCourseOffer)
    .filter((offer): offer is CourseOffer => offer !== null)

  return dedupeOffers(mapped, params.dedupeMode ?? 'course').slice(0, params.take ?? 8)
}
