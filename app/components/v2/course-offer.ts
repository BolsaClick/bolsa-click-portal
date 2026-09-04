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
  /**
   * Identificadores da oferta, só usados pra montar o link direto de
   * checkout (offerCheckoutHref) — espelham app/interface/course.ts Course.
   * Sem eles o card cai pro link de resultado (ver offerCheckoutHref).
   */
  id?: number | string
  unitId?: string
  businessKey?: string
  /** uuid do Offer no catálogo da Athena — só no trilho `source === 'YDUQS'`. */
  offerId?: string
  classShift?: string
  unitState?: string
  unitAddress?: string
  unitDistrict?: string
  unitPostalCode?: string
  codFormaIngressoOferta?: number
  priceForma2?: number
  priceForma3?: number
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

/**
 * Mesmo mapa de logos do card atual (assets já existentes em /public).
 *
 * Duplicado de app/lib/brand-logos.ts (BRAND_LOGOS/getBrandLogo) — mesmo
 * problema resolvido em três outros pontos por bcd6b3d ("feat(marcas): logo
 * do IBMEC nos cards de oferta"): esse card (v2, vitrine da home) é um
 * QUARTO ponto que ficou de fora e continuou caindo no fallback rosa
 * genérico pro IBMEC. Manter a lista sincronizada com BRAND_LOGOS.
 */
export function brandLogoSrc(brand: string): string {
  const n = (brand || '').toLowerCase()
  if (n.includes('anhanguera')) return '/assets/logo-anhanguera-bolsa-click.svg'
  if (n.includes('unopar')) return '/assets/logo-unopar.svg'
  if (n.includes('pitagoras') || n.includes('pitágoras')) return '/assets/logo-pitagoras.svg'
  if (n.includes('unime')) return '/assets/logo-unime-p.png'
  if (n.includes('estacio') || n.includes('estácio')) return '/estacio-logo.png'
  if (n.includes('wyden')) return '/assets/wyden.svg'
  if (n.includes('ibmec')) return '/assets/logo-ibmec.svg'
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

/**
 * Link REAL pro checkout, com a oferta do card já resolvida — decisão CEO:
 * "Garantir bolsa" na vitrine da home deve ir direto pro checkout, não pra
 * listagem intermediária. Listagem é o maior vazamento medido do funil de
 * SEO (81% não reclicam na oferta depois de cair numa lista); repetir esse
 * padrão aqui custaria o mesmo.
 *
 * Espelha a construção de URL de app/components/CourseCardNew/index.tsx
 * (handleClick) pros dois trilhos de checkout existentes:
 * - `source === 'YDUQS'` (Estácio via Athena): /checkout/estacio, com
 *   offerId — a Estácio identifica a oferta pelo offerId (já inclui turno
 *   e unidade), então NÃO manda `shift` (o card também não envia lá).
 * - default (Cogna/Tartarus): /checkout/matricula, com groupId (=id) +
 *   unitId + modality. `shift` é acrescentado pelo próprio card
 *   (CourseCardV2) quando o turno é obrigatório e foi escolhido, ou quando
 *   há um único turno não-virtual (auto-seleção) — nunca aqui, porque esta
 *   função não sabe qual turno a pessoa escolheu.
 *
 * Sem o identificador mínimo da oferta (offerId no trilho Estácio, id no
 * trilho Cogna) cai pro link de resultado: nunca manda o candidato pra um
 * checkout que não vai conseguir casar a oferta.
 */
export function offerCheckoutHref(offer: CourseOffer): string {
  const modality = offer.commercialModality || offer.modality

  if (offer.source === 'YDUQS') {
    if (!offer.offerId) return offerResultHref(offer)

    const params = new URLSearchParams()
    params.set('offerId', offer.offerId)
    params.set('courseName', offer.name)
    if (offer.brand) params.set('brand', offer.brand)
    if (modality) params.set('modality', modality)
    params.set('price', String(offer.minPrice))
    if (offer.city) params.set('city', offer.city)
    const state = offer.uf || offer.unitState
    if (state) params.set('state', state)
    if (offer.academicLevel) params.set('academicLevel', offer.academicLevel)
    // Endereço da unidade — opcional, pro checkout mostrar onde fica
    // (relevante pra presencial/semipresencial).
    if (offer.unitAddress) params.set('unitAddress', offer.unitAddress)
    if (offer.unitDistrict) params.set('unitDistrict', offer.unitDistrict)
    if (offer.unitPostalCode) params.set('unitPostalCode', offer.unitPostalCode)
    // Forma de ingresso da linha de catálogo: o checkout deriva dela quais
    // opções pode oferecer sem cair em MS004 na YDUQS.
    if (offer.codFormaIngressoOferta !== undefined)
      params.set('codFormaIngressoOferta', String(offer.codFormaIngressoOferta))
    if (offer.priceForma2) params.set('priceForma2', String(offer.priceForma2))
    if (offer.priceForma3) params.set('priceForma3', String(offer.priceForma3))
    // Preço cheio ("de") e duração — pra ancoragem de preço no checkout.
    if (typeof offer.maxPrice === 'number') params.set('maxPrice', String(offer.maxPrice))
    if (typeof offer.durationInMonths === 'number')
      params.set('durationInMonths', String(offer.durationInMonths))
    return `/checkout/estacio?${params.toString()}`
  }

  if (!offer.id) return offerResultHref(offer)

  const params = new URLSearchParams()
  params.set('groupId', String(offer.id))
  if (offer.unitId) params.set('unitId', offer.unitId)
  if (modality) params.set('modality', modality)
  return `/checkout/matricula?${params.toString()}`
}

/**
 * `minPrice`/`maxPrice` (e `montlyFeeFrom`/`montlyFeeTo` no checkout) desse
 * nível já são o TOTAL do curso (`priceWithDiscount`/`priceWithoutDiscount`
 * no Tartarus/Cogna), não mensalidade — confirmado contra a API: pós e
 * profissionalizante batem com esses campos, graduação (ATHENAS) tem
 * minPrice/maxPrice na faixa de mensalidade mesmo.
 *
 * Usado pra decidir `priceIsTotal` em `getPriceAnchor`: multiplicar um total
 * por `durationMonths` de novo infla "Economize" até igualar o "De" (bug
 * real observado em card de pós, 2026-08).
 */
export function isTotalPriceLevel(academicLevel?: string | null): boolean {
  return academicLevel === 'POS_GRADUACAO' || academicLevel === 'CURSO_PROFISSIONALIZANTE'
}

/**
 * A oferta é vendida parcelada, e não por mensalidade?
 *
 * Vale para pós-graduação e para os cursos profissionalizantes: nos dois o
 * preço do catálogo é o TOTAL do curso, pago em N parcelas — não um valor
 * mensal recorrente como na graduação. Mostrar o total cheio nesses casos
 * assusta sem necessidade (R$ 1.183,20 em vez de 6x de R$ 209,52), e ainda
 * vinha rotulado como "/mês", o que é simplesmente errado.
 */
export function hasInstallmentPlan<
  T extends {
    academicLevel?: string | null
    totalInstallment?: number | null
    minInstallmentValue?: number | null
  },
>(offer: T): offer is T & { totalInstallment: number; minInstallmentValue: number } {
  return (
    isTotalPriceLevel(offer.academicLevel) &&
    typeof offer.totalInstallment === 'number' &&
    typeof offer.minInstallmentValue === 'number'
  )
}
