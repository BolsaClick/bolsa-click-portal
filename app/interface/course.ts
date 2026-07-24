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
  /** Avaliação MEC do curso (0-5) */
  mecScore?: number
  /** Quantidade de alunos inscritos neste semestre */
  enrolledCount?: number
  /** Desconto derivado de minPrice/maxPrice, persistido em favoritos */
  discount?: number
  /**
   * Ofertas-irmãs da mesma vaga (unidade/curso/turno/modalidade) em forma de
   * ingresso 2 (Transferência Externa) e/ou 3 (MSV Externa) — só ofertas
   * YDUQS/Estácio. Cada forma de ingresso é uma oferta SEPARADA na Athena
   * (offerId próprio), agrupadas client-side em `groupByIngressForm`
   * (confirmado com dado real 2026-07-24). Formas 1/7/24 usam sempre
   * `offerId`/`minPrice` acima (a oferta primária). Ausente = só a forma
   * primária disponível pra essa vaga.
   */
  ingressFormOffers?: Partial<Record<2 | 3, { offerId: string; price: number }>>
}
