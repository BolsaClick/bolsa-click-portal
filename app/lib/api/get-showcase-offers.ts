import { DISCOUNT_CEILING_PCT } from '@/app/lib/copy/claims'
import { getBrandLogo } from '@/app/lib/brand-logos'
import { normalizeBrand } from '@/app/lib/utils/brand'
import { parseCourseName, titleCase } from '@/app/components/v2/course-offer'

/**
 * Vitrine "Ofertas em destaque" de /cursos.
 *
 * NÃO usa /offers/featured (catálogo errado). NÃO mescla Athena. Cada card
 * vem de `cogna/courses/search` com De/Por reais, ou some.
 *
 * SSR: NÃO usar o axios `tartarus` aqui. `baseURL` é
 * `process.env.NEXT_PUBLIC_TARTARUS_API` no load do módulo — se a env não
 * estiver inlined no server bundle, axios chama `cogna/courses/search` como
 * URL relativa e explode com `ERR_INVALID_URL` (visto no `next build`).
 * `loadSlot` engolia o erro → prateleira vazia em produção. Fetch com base
 * absoluta (fallback público) + cache ISR.
 */

export type ShowcaseOffer = {
  course: string
  institution: string
  logo: string
  modality: 'EAD' | 'PRESENCIAL' | 'SEMIPRESENCIAL'
  city: string
  uf: string
  finalPrice: number
  originalPrice: number
  discountPct: number
  href: string
}

export type CursosFeaturedSlot = {
  courseName: string
  city: string
  state: string
  modality: ShowcaseOffer['modality']
  academicLevel: 'GRADUACAO'
}

/** Os três cards da prateleira — mesmos cursos/cidades dos stubs, preços ao vivo. */
export const CURSOS_FEATURED_SLOTS: CursosFeaturedSlot[] = [
  {
    courseName: 'Pedagogia',
    city: 'Belo Horizonte',
    state: 'MG',
    modality: 'EAD',
    academicLevel: 'GRADUACAO',
  },
  {
    courseName: 'Administração',
    city: 'Curitiba',
    state: 'PR',
    modality: 'EAD',
    academicLevel: 'GRADUACAO',
  },
  {
    courseName: 'Análise e Desenvolvimento de Sistemas',
    city: 'Recife',
    state: 'PE',
    modality: 'EAD',
    academicLevel: 'GRADUACAO',
  },
]

const CANONICAL_MODALITIES = new Set<ShowcaseOffer['modality']>([
  'EAD',
  'PRESENCIAL',
  'SEMIPRESENCIAL',
])

const SEARCH_TIMEOUT_MS = 15_000
const SEARCH_SIZE = 10
const TARTARUS_FALLBACK = 'https://tartarus-api.inovitdigital.com.br/api'

export function tartarusBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_TARTARUS_API?.trim().replace(/\/$/, '')
  return fromEnv || TARTARUS_FALLBACK
}

type TartarusSearchOffer = {
  name?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  priceWithDiscount?: number
  priceWithoutDiscount?: number
  modality?: string
  commercialModality?: string
  city?: string
  uf?: string
  academicLevel?: string
}

function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/** "Administração - Bacharelado" → "administracao"; "Administração Pública" não casa. */
export function baseCourseName(name: string): string {
  return stripDiacritics(parseCourseName(name).title)
    .trim()
    .toLowerCase()
}

export function discountFromPrices(min: number, max: number): number {
  if (!max || max <= 0 || min <= 0 || min >= max) return 0
  return Math.floor((1 - min / max) * 100)
}

function offerPrices(offer: TartarusSearchOffer): { min: number; max: number } {
  return {
    min: Number(offer.minPrice ?? offer.priceWithDiscount ?? 0),
    max: Number(offer.maxPrice ?? offer.priceWithoutDiscount ?? 0),
  }
}

function isCanonicalModality(value: string | undefined): value is ShowcaseOffer['modality'] {
  const u = (value || '').toUpperCase()
  return CANONICAL_MODALITIES.has(u as ShowcaseOffer['modality'])
}

function cityKey(city: string | undefined): string {
  return stripDiacritics(city || '').trim().toLowerCase()
}

/**
 * Escolhe 1 oferta real pro slot. Sem match honesto → null (o card some).
 * Prefere a cidade do slot, depois a modalidade pedida, depois o maior
 * desconto ≤ teto 78%. SEMIPRESENCIAL conta (Pedagogia BH não tem EAD comercial).
 * Cidade é preferência, não filtro — empty state é pior que um De/Por real.
 */
export function pickShelfOffer(
  offers: TartarusSearchOffer[],
  slot: CursosFeaturedSlot,
): TartarusSearchOffer | null {
  const want = baseCourseName(slot.courseName)
  const wantCity = cityKey(slot.city)
  const ranked = offers
    .map((offer) => {
      const { min, max } = offerPrices(offer)
      const commercial = (offer.commercialModality || '').toUpperCase()
      const delivery = (offer.modality || '').toUpperCase()
      const modality = isCanonicalModality(commercial)
        ? commercial
        : isCanonicalModality(delivery)
          ? delivery
          : null
      const discount = discountFromPrices(min, max)
      const nameMatch = baseCourseName(offer.name || '') === want
      const cityScore = wantCity && cityKey(offer.city) === wantCity ? 1 : 0
      const modalityScore =
        commercial === slot.modality ? 2 : delivery === slot.modality ? 1 : 0
      return { offer, min, modality, discount, nameMatch, cityScore, modalityScore }
    })
    .filter(
      (row) =>
        row.nameMatch &&
        row.modality !== null &&
        row.discount > 0 &&
        row.discount <= DISCOUNT_CEILING_PCT,
    )

  ranked.sort((a, b) => {
    if (b.cityScore !== a.cityScore) return b.cityScore - a.cityScore
    if (b.modalityScore !== a.modalityScore) return b.modalityScore - a.modalityScore
    if (b.discount !== a.discount) return b.discount - a.discount
    return a.min - b.min
  })

  return ranked[0]?.offer ?? null
}

function toShowcase(offer: TartarusSearchOffer, slot: CursosFeaturedSlot): ShowcaseOffer | null {
  const { min, max } = offerPrices(offer)
  const discount = discountFromPrices(min, max)
  if (discount <= 0 || discount > DISCOUNT_CEILING_PCT) return null

  const commercial = (offer.commercialModality || '').toUpperCase()
  const delivery = (offer.modality || '').toUpperCase()
  const modality: ShowcaseOffer['modality'] = isCanonicalModality(commercial)
    ? commercial
    : isCanonicalModality(delivery)
      ? delivery
      : slot.modality

  const course = parseCourseName(offer.name || slot.courseName).title
  const brand = normalizeBrand(offer.brand) || offer.brand || ''
  const city = titleCase(offer.city || slot.city)
  const uf = (offer.uf || slot.state).toUpperCase()
  const academicLevel = offer.academicLevel || slot.academicLevel

  const href = `/curso/resultado?${new URLSearchParams({
    c: course,
    nivel: academicLevel,
    modalidade: modality,
    cidade: city,
    estado: uf,
  }).toString()}`

  return {
    course,
    institution: brand,
    logo: getBrandLogo(brand) || '/assets/logo-bolsa-click-rosa.png',
    modality,
    city,
    uf,
    finalPrice: min,
    originalPrice: max,
    discountPct: discount,
    href,
  }
}

function serializeQuery(params: Record<string, string | number>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      searchParams.append(key, String(value))
    }
  })
  return searchParams.toString()
}

async function searchTartarus(params: Record<string, string | number>): Promise<TartarusSearchOffer[]> {
  const url = `${tartarusBaseUrl()}/cogna/courses/search?${serializeQuery(params)}`
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
  })
  if (!res.ok) {
    throw new Error(`Tartarus search HTTP ${res.status}`)
  }
  const json = (await res.json()) as { data?: TartarusSearchOffer[] }
  return Array.isArray(json?.data) ? json.data : []
}

async function searchSlot(slot: CursosFeaturedSlot): Promise<TartarusSearchOffer[]> {
  const base = {
    page: 1,
    size: SEARCH_SIZE,
    academicLevel: slot.academicLevel,
    courseName: slot.courseName,
  }
  // Cogna guarda cidade em maiúsculas sem acento (SAO PAULO, BELO HORIZONTE).
  const city = stripDiacritics(slot.city).toUpperCase()

  try {
    const local = await searchTartarus({ ...base, city, state: slot.state })
    if (local.length > 0) return local
  } catch (error) {
    console.error(
      `[cursos featured] busca com cidade falhou "${slot.courseName}" (${city}/${slot.state}):`,
      error,
    )
  }

  // Mesmo padrão da vitrine /graduacao (sem cidade) — devolve De/Por real
  // em vez de empty state quando o filtro local 429/vazio.
  return searchTartarus(base)
}

async function loadSlot(slot: CursosFeaturedSlot): Promise<ShowcaseOffer | null> {
  try {
    const offers = await searchSlot(slot)
    const picked = pickShelfOffer(offers, slot)
    if (!picked) return null
    return toShowcase(picked, slot)
  } catch (error) {
    console.error(`[cursos featured] Tartarus falhou em "${slot.courseName}" (${slot.city}/${slot.state}):`, error)
    return null
  }
}

/**
 * Uma oferta Tartarus por slot. Slot sem oferta real some — nunca cai
 * em De/Por inventado.
 */
export async function getShowcaseOffers(): Promise<ShowcaseOffer[]> {
  const cards = await Promise.all(CURSOS_FEATURED_SLOTS.map(loadSlot))
  return cards.filter((card): card is ShowcaseOffer => card !== null)
}
