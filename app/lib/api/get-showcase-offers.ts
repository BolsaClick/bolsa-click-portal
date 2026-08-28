import { DISCOUNT_CEILING_PCT } from '@/app/lib/copy/claims'
import { tartarus } from './axios'
import { getBrandLogo } from '@/app/lib/brand-logos'
import { normalizeBrand } from '@/app/lib/utils/brand'
import { parseCourseName, titleCase } from '@/app/components/v2/course-offer'

/**
 * Vitrine "Ofertas em destaque" de /cursos.
 *
 * NÃO usa /offers/featured — esse endpoint devolve catálogo errado (cursos
 * livres UNAES, polos aleatórios). NÃO mescla Athena/Estácio. Cada card
 * ou vem de `cogna/courses/search` (Tartarus) com De/Por reais, ou some.
 *
 * Os stubs antigos (Pedagogia 119/950, Administração 99,99/1290, ADS
 * 109/1100) calculavam 87/90/92% no SSR — percentuais inventados, acima
 * do teto de 78% e acima do que a busca ao vivo devolve (Pedagogia BH
 * ~46% semipresencial; Administração Curitiba ~42% EAD).
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

const SEARCH_TIMEOUT_MS = 8000
const SEARCH_SIZE = 20

type TartarusSearchOffer = {
  name?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
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
  return stripDiacritics(
    parseCourseName(name).title,
  )
    .trim()
    .toLowerCase()
}

export function discountFromPrices(min: number, max: number): number {
  if (!max || max <= 0 || min <= 0 || min >= max) return 0
  return Math.floor((1 - min / max) * 100)
}

function isCanonicalModality(value: string | undefined): value is ShowcaseOffer['modality'] {
  const u = (value || '').toUpperCase()
  return CANONICAL_MODALITIES.has(u as ShowcaseOffer['modality'])
}

/**
 * Escolhe 1 oferta real pro slot. Sem match honesto → null (o card some).
 * Prefere a modalidade pedida, depois o maior desconto ≤ teto 78%.
 */
export function pickShelfOffer(
  offers: TartarusSearchOffer[],
  slot: CursosFeaturedSlot,
): TartarusSearchOffer | null {
  const want = baseCourseName(slot.courseName)
  const ranked = offers
    .map((offer) => {
      const min = Number(offer.minPrice ?? 0)
      const max = Number(offer.maxPrice ?? 0)
      const commercial = (offer.commercialModality || '').toUpperCase()
      const delivery = (offer.modality || '').toUpperCase()
      const modality = isCanonicalModality(commercial)
        ? commercial
        : isCanonicalModality(delivery)
          ? delivery
          : null
      const discount = discountFromPrices(min, max)
      const nameMatch = baseCourseName(offer.name || '') === want
      const modalityScore =
        commercial === slot.modality ? 2 : delivery === slot.modality ? 1 : 0
      return { offer, min, max, modality, discount, nameMatch, modalityScore }
    })
    .filter(
      (row) =>
        row.nameMatch &&
        row.modality !== null &&
        row.discount > 0 &&
        row.discount <= DISCOUNT_CEILING_PCT,
    )

  ranked.sort((a, b) => {
    if (b.modalityScore !== a.modalityScore) return b.modalityScore - a.modalityScore
    if (b.discount !== a.discount) return b.discount - a.discount
    return a.min - b.min
  })

  return ranked[0]?.offer ?? null
}

function toShowcase(offer: TartarusSearchOffer, slot: CursosFeaturedSlot): ShowcaseOffer | null {
  const min = Number(offer.minPrice ?? 0)
  const max = Number(offer.maxPrice ?? 0)
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

function serializeParams(params: Record<string, string | number | string[]>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((item) => searchParams.append(key, String(item)))
    else if (value !== null && value !== undefined) searchParams.append(key, String(value))
  })
  return searchParams.toString()
}

async function searchSlot(slot: CursosFeaturedSlot): Promise<TartarusSearchOffer[]> {
  const params: Record<string, string | number | string[]> = {
    page: 1,
    size: SEARCH_SIZE,
    academicLevel: [slot.academicLevel],
    courseName: slot.courseName,
    city: slot.city,
    state: slot.state,
  }

  const { data } = await tartarus.get<{ data?: TartarusSearchOffer[] }>('cogna/courses/search', {
    params,
    paramsSerializer: serializeParams,
    timeout: SEARCH_TIMEOUT_MS,
  })

  return Array.isArray(data?.data) ? data.data : []
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
