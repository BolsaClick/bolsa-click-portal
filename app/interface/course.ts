export interface Schedule {
  day: string
  startHour: string
  endHour: string
}

export interface Course {
  id: number | string
  logo?: string
  name: string
  currentPrice?: string
  unitCity?: string
  city?: string
  unitDistrict?: string
  unitNumber?: string
  modality: string
  unitState?: string
  uf?: string
  minPrice: number
  maxPrice?: number
  classShift?: string
  shiftOptions?: string[]
  schedules?: Schedule[]
  brand: string
  unitAddress?: string
  unitPostalCode?: string
  academicLevel?: string
  academicDegree?: string
  duration?: number
  durationInMonths?: number
  unitId?: string
  unitName?: string
  unit?: string
  businessKey?: string
  commercialModality?: string | null
  submodality?: string | null
  /** Pós-graduação: número de parcelas */
  totalInstallment?: number
  /** Pós-graduação: valor da parcela mínima */
  minInstallmentValue?: number
  /**
   * Fonte da oferta (discriminador de checkout). Ausente = Tartarus (fluxo atual).
   * 'YDUQS' = oferta Estácio via API Athena (checkout por inscrição).
   * Obs.: NÃO confundir com `dmhSource.source === 'ATHENAS'` da Cogna (outra coisa).
   */
  source?: 'TARTARUS' | 'YDUQS'
  /** uuid do Offer no catálogo da Athena. Usado só no trilho 'YDUQS'. */
  offerId?: string
}
