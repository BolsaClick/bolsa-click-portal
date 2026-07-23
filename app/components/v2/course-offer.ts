/**
 * CourseCard v2 — contrato de dados e helpers puros.
 *
 * O tipo espelha o payload real de cogna/courses/search. Nenhum campo é
 * inventado: tudo que o card exibe deriva destes campos ou é omitido.
 */

export interface CourseOffer {
  name: string
  brand: string
  academicLevel: 'GRADUACAO' | 'POS_GRADUACAO' | (string & {})
  academicDegree?: string
  modality?: string
  commercialModality?: string
  durationInMonths?: number
  minPrice: number
  maxPrice?: number
  unit?: string
  unitName?: string
  city?: string
  uf?: string
  shiftOptions?: string[]
  source?: string
  /** Pós-graduação: parcelamento "até Nx de R$ Y" */
  totalInstallment?: number
  minInstallmentValue?: number
  /**
   * Slot futuro — só renderiza quando o dado real existir no payload.
   * O preview não define default.
   */
  notaMec?: number
}

export const formatBRL = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/**
 * Desconto SEMPRE calculado a partir do payload; nunca hardcoded.
 * Math.floor por transparência: o % exibido nunca é maior que o desconto real.
 * Retorna null quando não há maxPrice maior que minPrice.
 */
export function computeDiscount(offer: CourseOffer): number | null {
  if (typeof offer.maxPrice !== 'number' || typeof offer.minPrice !== 'number') return null
  if (offer.maxPrice <= offer.minPrice) return null
  return Math.floor((1 - offer.minPrice / offer.maxPrice) * 100)
}

export interface ParsedCourseName {
  title: string
  degreeFromName?: string
}

/** "Administração Pública - Bacharelado" -> { title, degreeFromName } */
export function parseCourseName(name: string): ParsedCourseName {
  const match = name.match(/^(.*?)\s+-\s+(Bacharelado|Licenciatura|Tecn[oó]logo|Especialista)$/i)
  if (!match) return { title: name.trim() }
  return { title: match[1].trim(), degreeFromName: match[2] }
}

export function degreeLabel(degree?: string): string | null {
  if (!degree) return null
  const map: Record<string, string> = {
    BACHARELADO: 'Bacharelado',
    LICENCIATURA: 'Licenciatura',
    TECNOLOGO: 'Tecnólogo',
    ESPECIALISTA: 'Especialista',
    PROFISSIONALIZANTE: 'Profissionalizante',
  }
  return map[degree.toUpperCase()] ?? titleCase(degree)
}

export function academicLevelLabel(level?: string): string | null {
  if (!level) return null
  const map: Record<string, string> = {
    GRADUACAO: 'Graduação',
    POS_GRADUACAO: 'Pós-graduação',
  }
  return map[level.toUpperCase()] ?? titleCase(level)
}

export function modalityLabel(offer: CourseOffer): string {
  const raw = (offer.commercialModality || offer.modality || '').toUpperCase()
  const map: Record<string, string> = {
    EAD: 'EAD',
    PRESENCIAL: 'Presencial',
    SEMIPRESENCIAL: 'Semipresencial',
    HIBRIDO: 'Híbrido',
    HIBRIDO_FLEX: 'Híbrido',
  }
  return map[raw] ?? titleCase(raw)
}

export function shiftLabel(shift: string): string {
  const map: Record<string, string> = {
    MATUTINO: 'Manhã',
    VESPERTINO: 'Tarde',
    NOTURNO: 'Noite',
    INTEGRAL: 'Integral',
    VIRTUAL: 'Virtual',
  }
  return map[shift.toUpperCase()] ?? titleCase(shift)
}

/** "SAO PAULO" -> "Sao Paulo" (o payload chega sem acentos; não inventamos) */
export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => (word.length > 2 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ')
    .replace(/^./, (c) => c.toUpperCase())
}

/** Mesmo mapa de logos do card atual (assets já existentes em /public). */
export function brandLogoSrc(brand: string): string {
  const n = (brand || '').toLowerCase()
  if (n.includes('anhanguera')) return '/assets/logo-anhanguera-bolsa-click.svg'
  if (n.includes('unopar')) return '/assets/logo-unopar.svg'
  if (n.includes('pitagoras') || n.includes('pitágoras')) return '/assets/logo-pitagoras.svg'
  if (n.includes('unime')) return '/assets/logo-unime-p.png'
  if (n.includes('estacio') || n.includes('estácio')) return '/estacio-logo.png'
  if (n.includes('wyden')) return '/assets/wyden.svg'
  return '/assets/logo-bolsa-click-rosa.png'
}

/**
 * Link REAL pro funil de resultados. /curso/resultado lê cn/nivel/cidade/
 * estado/modalidade (não courseName/academicLevel — conferido no
 * ResultsShell). Usado como href default dos cards nas prateleiras
 * da home real; valores passam crus (round-trip do payload da própria API).
 */
export function offerResultHref(offer: CourseOffer): string {
  const params = new URLSearchParams()
  params.set('cn', parseCourseName(offer.name).title)
  params.set('nivel', offer.academicLevel || 'GRADUACAO')
  const modality = offer.commercialModality || offer.modality
  if (modality) params.set('modalidade', modality)
  if (offer.city) params.set('cidade', offer.city)
  if (offer.uf) params.set('estado', offer.uf)
  return `/curso/resultado?${params.toString()}`
}

/** Pós com parcelamento explícito no payload */
export function hasInstallmentPlan(offer: CourseOffer): boolean {
  return (
    offer.academicLevel === 'POS_GRADUACAO' &&
    typeof offer.totalInstallment === 'number' &&
    typeof offer.minInstallmentValue === 'number'
  )
}
