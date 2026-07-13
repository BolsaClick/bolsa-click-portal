import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import type { Modalidade } from './types'

/**
 * Oferta real normalizada pro simulador. Todos os campos derivam da busca real
 * (Tartarus/Cogna + Athena/Estácio via getShowFiltersCourses) — nunca de
 * mock-course-data.ts. `discountPct` é DERIVADO de (1 - min/max), não um campo
 * inventado.
 */
export interface SimuladorOferta {
  name: string
  brand?: string
  city?: string
  state?: string
  modality?: string
  minPrice: number
  maxPrice: number
  discountPct: number
}

interface RawCourse {
  name?: string
  courseName?: string
  brand?: string
  institutionName?: string
  city?: string
  unitCity?: string
  state?: string
  unitState?: string
  uf?: string
  modality?: string
  commercialModality?: string
  minPrice?: number
  maxPrice?: number
  [key: string]: unknown
}

function pickString(...vals: unknown[]): string | undefined {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return undefined
}

function computeDiscount(min: number, max: number): number {
  if (max > 0 && min > 0 && max > min) {
    return Math.round((1 - min / max) * 100)
  }
  return 0
}

/**
 * Busca as ofertas reais pro curso+cidade+modalidade e devolve uma lista limpa,
 * ordenada pela mensalidade com bolsa (menor primeiro). Roda no browser (a fonte
 * Athena depende de fetch relativo). Degradação graciosa: erro → [].
 */
export async function fetchOfertas(params: {
  courseName?: string
  city?: string
  state?: string
  modality?: Modalidade
  academicLevel?: string
  limit?: number
}): Promise<SimuladorOferta[]> {
  try {
    const result = await getShowFiltersCourses(
      params.courseName,
      params.city,
      params.state,
      params.modality,
      params.academicLevel ?? 'GRADUACAO',
      1,
      30
    )

    const rows: RawCourse[] = Array.isArray(result)
      ? (result as RawCourse[])
      : Array.isArray((result as { data?: RawCourse[] })?.data)
        ? ((result as { data: RawCourse[] }).data)
        : []

    const ofertas = rows
      .map((c): SimuladorOferta => {
        const minPrice = Number(c.minPrice ?? 0)
        const maxPrice = Number(c.maxPrice ?? 0)
        return {
          name: pickString(c.name, c.courseName) ?? 'Curso',
          brand: pickString(c.brand, c.institutionName),
          city: pickString(c.city, c.unitCity),
          state: pickString(c.state, c.unitState, c.uf),
          modality: pickString(c.modality, c.commercialModality),
          minPrice,
          maxPrice: maxPrice > minPrice ? maxPrice : minPrice,
          discountPct: computeDiscount(minPrice, maxPrice),
        }
      })
      .filter((o) => o.minPrice > 0)
      .sort((a, b) => a.minPrice - b.minPrice)

    return typeof params.limit === 'number' ? ofertas.slice(0, params.limit) : ofertas
  } catch (error) {
    console.error('Erro ao buscar ofertas do simulador:', error)
    return []
  }
}
