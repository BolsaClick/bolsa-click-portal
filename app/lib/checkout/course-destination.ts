import { Course } from '@/app/interface/course'

/**
 * FONTE DE VERDADE do destino de checkout de uma oferta.
 *
 * Antes essas ~60 linhas viviam duplicadas no CourseCardNew (e no Redesign), e
 * as landings de SEO (/cursos/[slug] e /cursos/[slug]/[city]) simplesmente NÃO
 * as tinham — mandavam a pessoa pra /curso/resultado e jogavam a oferta clicada
 * fora. Qualquer superfície que leve alguém ao checkout deve usar estas funções
 * (via useCourseSelection), nunca remontar os params na mão.
 *
 * Puro de propósito: sem React, sem window, sem tracking. Dá pra testar e dá
 * pra usar em render (ex.: montar href de <a> pra SEO/nova aba).
 */

/** Trilho de checkout da oferta. */
export type CheckoutRail = 'yduqs' | 'cogna'

export interface CourseDestination {
  rail: CheckoutRail
  /** Caminho completo já com query string. */
  href: string
  params: URLSearchParams
  modality: string
  /** Turno resolvido — só no trilho Cogna; '' quando não se aplica. */
  shift: string
}

/** Modalidade normalizada (maiúscula) da oferta. */
export function resolveCourseModality(course: Course): string {
  return (
    course.modality?.toUpperCase() ||
    course.commercialModality?.toUpperCase() ||
    ''
  )
}

/**
 * A oferta exige que a pessoa escolha o turno antes de seguir pro checkout?
 * Só quando há MÚLTIPLOS turnos possíveis e o curso não é virtual/EAD.
 * Medido em 29/07/2026 sobre 601 ofertas de 25 landings: 9,8% do total
 * (19,6% das ofertas de graduação, 0% das ofertas YDUQS/Estácio).
 */
export function courseNeedsShiftSelection(course: Course): boolean {
  if (!course.businessKey || !course.unitId) return false

  const isVirtual =
    course.shiftOptions?.some((s) => s.toUpperCase() === 'VIRTUAL') ||
    course.classShift?.toUpperCase() === 'VIRTUAL'
  if (isVirtual) return false

  return !!(course.shiftOptions && course.shiftOptions.length > 1)
}

/**
 * Turno final que vai pro checkout: o escolhido pela pessoa, o turno fixo da
 * oferta, ou o único turno disponível quando só existe um.
 */
export function resolveCourseShift(course: Course, selectedShift?: string): string {
  const singleShift =
    course.shiftOptions && course.shiftOptions.length === 1
      ? course.shiftOptions[0]
      : null
  return selectedShift || course.classShift || singleShift || ''
}

/** Rótulo pt-BR de um turno da API (MATUTINO → Manhã). */
export function shiftLabel(shift: string): string {
  switch (shift.toUpperCase()) {
    case 'MATUTINO':
      return 'Manhã'
    case 'VESPERTINO':
      return 'Tarde'
    case 'NOTURNO':
      return 'Noite'
    case 'INTEGRAL':
      return 'Integral'
    case 'VIRTUAL':
      return 'Virtual'
    default:
      return shift
  }
}

/**
 * Monta o destino de checkout da oferta.
 *
 * - `source === 'YDUQS'` (Estácio via Athena) → /checkout/estacio por inscrição.
 * - Qualquer outra (Cogna/Tartarus) → /checkout/matricula.
 *
 * NÃO valida turno: quem chama deve checar `courseNeedsShiftSelection` antes
 * (ver useCourseSelection) — mandar pro checkout sem turno obrigatório troca um
 * vazamento por um erro.
 */
export function buildCourseCheckoutDestination(
  course: Course,
  selectedShift?: string,
): CourseDestination {
  const modality = resolveCourseModality(course)
  const params = new URLSearchParams()

  // Trilho YDUQS (Estácio via Athena): checkout por inscrição (não passa pelo
  // /checkout/matricula).
  if (course.source === 'YDUQS') {
    if (course.offerId) params.set('offerId', course.offerId)
    if (course.name) params.set('courseName', course.name)
    if (course.brand) params.set('brand', course.brand)
    const athenaModality =
      modality || course.modality || course.commercialModality || ''
    if (athenaModality) params.set('modality', athenaModality)
    if (course.minPrice) params.set('price', String(course.minPrice))
    if (course.city) params.set('city', course.city)
    const athenaState = course.uf || course.unitState || ''
    if (athenaState) params.set('state', athenaState)
    if (course.academicLevel) params.set('academicLevel', course.academicLevel)
    // Endereço da unidade — opcional, pro checkout mostrar onde fica
    // (relevante pra presencial/semipresencial).
    if (course.unitAddress) params.set('unitAddress', course.unitAddress)
    if (course.unitDistrict) params.set('unitDistrict', course.unitDistrict)
    if (course.unitPostalCode) params.set('unitPostalCode', course.unitPostalCode)
    // Forma de ingresso da linha de catálogo: o checkout deriva dela quais
    // opções pode oferecer sem cair em MS004 na YDUQS.
    if (course.codFormaIngressoOferta !== undefined) {
      params.set('codFormaIngressoOferta', String(course.codFormaIngressoOferta))
    }
    // Preço por forma de ingresso (2/3) — opcional, ver Course.priceForma2/3.
    if (course.priceForma2) params.set('priceForma2', String(course.priceForma2))
    if (course.priceForma3) params.set('priceForma3', String(course.priceForma3))
    // Preço cheio ("de") e duração — pra ancoragem de preço no checkout Estácio
    // (ver app/lib/utils/price-anchor.ts). Opcionais: sem eles o checkout
    // mostra só o preço, sem riscado/%.
    if (typeof course.maxPrice === 'number') params.set('maxPrice', String(course.maxPrice))
    const athenaDuration = course.durationInMonths ?? course.duration
    if (typeof athenaDuration === 'number') {
      params.set('durationInMonths', String(athenaDuration))
    }

    return {
      rail: 'yduqs',
      href: `/checkout/estacio?${params.toString()}`,
      params,
      modality: athenaModality,
      shift: '',
    }
  }

  // Trilho Cogna: params obrigatórios groupId (course.id), unitId, modality, shift.
  if (course.id) params.set('groupId', String(course.id))
  if (course.unitId) params.set('unitId', course.unitId)

  const finalModality =
    modality || course.modality || course.commercialModality || ''
  if (finalModality) params.set('modality', finalModality)

  const finalShift = resolveCourseShift(course, selectedShift)
  if (finalShift) params.set('shift', finalShift)

  return {
    rail: 'cogna',
    href: `/checkout/matricula?${params.toString()}`,
    params,
    modality: finalModality,
    shift: finalShift,
  }
}
