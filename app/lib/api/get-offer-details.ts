import { tartarus } from "./axios"

/** Parcela de um método de pagamento (POS) */
export interface PosInstallment {
  id: string
  number: number
  totalValue: number
  installmentValue: number
  discountPercentage: number
}

/** Método de pagamento com parcelas (POS) */
export interface PosPaymentMethod {
  type: string
  installments: PosInstallment[]
}

// Interface baseada na resposta da API
export interface OfferDetailsResponse {
  id: string
  name: string
  academicLevel: string
  academicDegree: string
  modality: string
  submodality: string | null
  duration: number
  brand: {
    id: string
    name: string
    logo: string
  }
  unit: {
    id: string
    name: string
    address: string
    location: {
      lat: number
      lon: number
    }
  }
  prices: {
    withDiscount: number
    withoutDiscount: number
    enrollment: number
  }
  basePricing: {
    default: {
      type: string
      offerSimulationId: string
      priceWithoutDiscount: number
      priceWithDiscount: number
      enrollmentPrice: number
      discountPercentage: number
      installments: Array<unknown>
      paymentMethods: PosPaymentMethod[]
    }
    easyPay: unknown | null
  }
  schedules: Array<{
    day: string
    startHour: string
    endHour: string
  }>
  shiftOptions: string[]
  poleType: string
  dmhId: string
  businessKey: string
  idDmhElastic: string | null
  dmhSource: unknown | null
  /** Tipos de ingresso (ex.: ["ISENTO_VESTIBULAR"] para pós). Se a API enviar mais de um, virão aqui. */
  ingressType?: string[]
}

// Interface de retorno mapeada para uso nos componentes
export interface OfferDetails {
  offerId: string
  offerBusinessKey: string
  groupId: string
  shift: string
  modality: string
  unitId: string
  subscriptionValue: number
  montlyFeeFrom: number
  montlyFeeTo: number
  expiredAt: string
  weekday: string
  classTimeStart: string
  classTimeEnd: string
  brand: string
  course: string
  courseId: string
  unit: string
  unitAddress: string
  unitCity: string
  unitState: string
  duration?: number
  academicLevel?: string
  dmhId?: string
  businessKey?: string
  schedules?: Array<{
    day: string
    startHour: string
    endHour: string
  }>
  dmhSource?: {
    businessKey?: string
    source?: string
  }
  lateEnrollment?: {
    baseValue: number
    netValue: number
    installments: Array<{
      installment: string
      netValue: number
      ponctualityDiscountNetValue: number
    }>
  }
  /** Pós-graduação: métodos de pagamento e parcelas */
  paymentMethods?: PosPaymentMethod[]
  /** Tipos de ingresso (ex.: ["ISENTO_VESTIBULAR"] para pós). Se mais de um, enviar todos na inscrição. */
  ingressType?: string[]
  /** ID DMH Elastic para criar inscrição no marketplace ATHENAS */
  idDmhElastic?: string
}

// Mapear resposta da API para o formato esperado (usando dados direto da API)
function mapOfferDetailsResponse(
  response: OfferDetailsResponse,
  shift: string,
  modality: string
): OfferDetails {
  // Processar horários e dias da semana (usando dados direto da API)
  const schedules = response.schedules || []
  const weekdays = schedules
    .map((s) => s.day)
    .join(', ')
  
  // Pegar primeiro horário como referência
  const firstSchedule = schedules[0]
  const classTimeStart = firstSchedule?.startHour || ''
  const classTimeEnd = firstSchedule?.endHour || ''

  // Extrair cidade e estado do nome da unidade (formato: "CIDADE/ESTADO - NOME")
  const unitParts = response.unit.name.split('/')
  const city = unitParts[0]?.trim() || ''
  const state = unitParts[1]?.split('-')[0]?.trim() || ''

  return {
    offerId: response.id,
    offerBusinessKey: response.businessKey,
    groupId: response.businessKey,
    shift: shift,
    modality: modality,
    unitId: response.unit.id,
    subscriptionValue: response.prices.enrollment,
    montlyFeeFrom: response.prices.withoutDiscount,
    montlyFeeTo: response.prices.withDiscount,
    expiredAt: '', // Não vem na resposta atual
    weekday: weekdays,
    classTimeStart: classTimeStart,
    classTimeEnd: classTimeEnd,
    brand: response.brand.name,
    course: response.name,
    courseId: response.id,
    unit: response.unit.name,
    unitAddress: response.unit.address,
    unitCity: city,
    unitState: state,
    duration: response.duration,
    academicLevel: response.academicLevel,
    dmhId: response.dmhId,
    businessKey: response.businessKey, // businessKey vem diretamente do objeto principal
    schedules: response.schedules,
    dmhSource: response.dmhSource ? {
      businessKey: (response.dmhSource as { businessKey?: string })?.businessKey,
      source: (response.dmhSource as { source?: string })?.source,
    } : undefined,
    paymentMethods: response.basePricing?.default?.paymentMethods ?? [],
    ingressType: response.ingressType,
    idDmhElastic: response.idDmhElastic || undefined,
  }
}

/**
 * @param groupId - ID do grupo (businessKey)
 * @param shift - Turno (MATUTINO, VESPERTINO, NOTURNO, INTEGRAL)
 * @param modality - Modalidade (PRESENCIAL, SEMIPRESENCIAL, EAD)
 * @param unitId - ID da unidade
 * @returns Detalhes da oferta mapeados
 */
export async function getOfferDetails(
  groupId: string,
  shift: string,
  modality: string,
  unitId: string
): Promise<OfferDetails> {
  const params: Record<string, string> = {
    groupId,
    shift,
    modality,
    unitId,
  }

  console.log('📡 Fazendo requisição para:', 'cogna/courses/details', 'com params:', params)

  const response = await tartarus.get<OfferDetailsResponse>('cogna/courses/details', {
    params,
  })

  console.log('📥 Resposta recebida:', response.data)

  // Mapear a resposta para o formato esperado
  return mapOfferDetailsResponse(response.data, shift, modality)
}

/**
 * Busca detalhes completos da oferta (incluindo basePricing.paymentMethods).
 * Usado no checkout POS para exibir parcelas e métodos de pagamento.
 */
export async function getPosOfferDetailsRaw(
  groupId: string,
  shift: string,
  modality: string,
  unitId: string
): Promise<OfferDetailsResponse> {
  const params: Record<string, string> = {
    groupId,
    shift,
    modality,
    unitId,
  }
  const response = await tartarus.get<OfferDetailsResponse>('cogna/courses/details', {
    params,
  })
  return response.data
}
