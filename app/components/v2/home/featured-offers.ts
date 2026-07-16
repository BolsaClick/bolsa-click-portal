/**
 * Home v2 — mapeamento do payload real -> CourseOffer + fallback local.
 */

import type { CourseOffer } from '../course-offer'

/**
 * Converte um item cru de getShowFiltersCourses (cogna/courses/search +
 * Athena) no contrato CourseOffer do card v2. Retorna null quando faltam
 * os campos mínimos pra exibição honesta (nome, marca, preço > 0).
 */
export function toCourseOffer(raw: unknown): CourseOffer | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>

  const name = typeof r.name === 'string' && r.name.trim() ? r.name.trim() : null
  const brand = typeof r.brand === 'string' && r.brand.trim() ? r.brand.trim() : null
  const minPrice = typeof r.minPrice === 'number' && r.minPrice > 0 ? r.minPrice : null
  if (!name || !brand || !minPrice) return null

  const str = (key: string): string | undefined =>
    typeof r[key] === 'string' && (r[key] as string).trim() ? (r[key] as string) : undefined
  const num = (key: string): number | undefined =>
    typeof r[key] === 'number' && (r[key] as number) > 0 ? (r[key] as number) : undefined

  return {
    name,
    brand,
    academicLevel: str('academicLevel') ?? 'GRADUACAO',
    academicDegree: str('academicDegree'),
    modality: str('modality'),
    commercialModality: str('commercialModality'),
    durationInMonths: num('durationInMonths'),
    minPrice,
    maxPrice: num('maxPrice'),
    unit: str('unit'),
    unitName: str('unitName'),
    city: str('city'),
    uf: str('uf'),
    shiftOptions: Array.isArray(r.shiftOptions)
      ? (r.shiftOptions.filter((s) => typeof s === 'string') as string[])
      : undefined,
    source: str('source'),
    totalInstallment: num('totalInstallment'),
    minInstallmentValue: num('minInstallmentValue'),
  }
}

/**
 * DADOS DE EXEMPLO — fallback usado APENAS quando a chamada server-side a
 * getShowFiltersCourses falha ou expira durante o preview local. A estrutura
 * e as faixas de preço espelham payloads reais de cogna/courses/search
 * (o primeiro item é um payload literal da API). Não são ofertas ao vivo —
 * na integração final, a vitrine deve sempre vir do fetch real.
 */
export const SAMPLE_FEATURED_OFFERS: CourseOffer[] = [
  {
    name: 'Administração Pública - Bacharelado',
    brand: 'ANHANGUERA',
    academicLevel: 'GRADUACAO',
    academicDegree: 'BACHARELADO',
    modality: 'EAD',
    commercialModality: 'EAD',
    durationInMonths: 48,
    minPrice: 108.38,
    maxPrice: 206.59,
    unit: 'SAO PAULO/SP - PIRITUBA',
    unitName: 'PIRITUBA',
    city: 'SAO PAULO',
    uf: 'SP',
    shiftOptions: ['VIRTUAL'],
    source: 'ATHENAS',
  },
  {
    name: 'Tecnologia em Análise e Desenvolvimento de Sistemas - Tecnólogo',
    brand: 'UNOPAR',
    academicLevel: 'GRADUACAO',
    academicDegree: 'TECNOLOGO',
    modality: 'EAD',
    commercialModality: 'EAD',
    durationInMonths: 30,
    minPrice: 119.9,
    maxPrice: 219.9,
    city: 'LONDRINA',
    uf: 'PR',
    shiftOptions: ['VIRTUAL'],
    source: 'ATHENAS',
  },
  {
    name: 'Pedagogia - Licenciatura',
    brand: 'PITAGORAS',
    academicLevel: 'GRADUACAO',
    academicDegree: 'LICENCIATURA',
    modality: 'EAD',
    commercialModality: 'EAD',
    durationInMonths: 48,
    minPrice: 99.9,
    maxPrice: 189.9,
    city: 'BELO HORIZONTE',
    uf: 'MG',
    shiftOptions: ['VIRTUAL'],
    source: 'ATHENAS',
  },
  {
    name: 'Ciências Contábeis - Bacharelado',
    brand: 'ANHANGUERA',
    academicLevel: 'GRADUACAO',
    academicDegree: 'BACHARELADO',
    modality: 'EAD',
    commercialModality: 'EAD',
    durationInMonths: 48,
    minPrice: 149.9,
    city: 'SAO PAULO',
    uf: 'SP',
    shiftOptions: ['VIRTUAL'],
    source: 'ATHENAS',
  },
  {
    name: 'Gestão de Recursos Humanos - Tecnólogo',
    brand: 'UNOPAR',
    academicLevel: 'GRADUACAO',
    academicDegree: 'TECNOLOGO',
    modality: 'EAD',
    commercialModality: 'EAD',
    durationInMonths: 24,
    minPrice: 104.9,
    maxPrice: 194.9,
    city: 'CAMPINAS',
    uf: 'SP',
    shiftOptions: ['VIRTUAL'],
    source: 'ATHENAS',
  },
  {
    name: 'Enfermagem - Bacharelado',
    brand: 'ANHANGUERA',
    academicLevel: 'GRADUACAO',
    academicDegree: 'BACHARELADO',
    modality: 'PRESENCIAL',
    commercialModality: 'PRESENCIAL',
    durationInMonths: 60,
    minPrice: 389.9,
    maxPrice: 689.9,
    unitName: 'CAMPO LIMPO',
    city: 'SAO PAULO',
    uf: 'SP',
    shiftOptions: ['MATUTINO', 'NOTURNO'],
    source: 'ATHENAS',
  },
]
