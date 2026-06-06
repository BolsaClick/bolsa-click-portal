import { tartarus } from './axios'
import { searchAthenaOffers, normalizeAthenaOffer } from './athena-offers'
import { normalizeBrand } from '../utils/brand'

export type VitrineLevel = 'GRADUACAO' | 'POS_GRADUACAO' | 'CURSO_PROFISSIONALIZANTE'

export type VitrineCourse = {
  id: string
  name: string
  brand: string
  modality: 'EAD' | 'PRESENCIAL' | 'SEMIPRESENCIAL'
  durationInMonths: number | null
  minPrice: number
  maxPrice: number
  discountPct: number
  city: string | null
  uf: string | null
  searchTerm: string
  academicLevel: VitrineLevel
}

type ApiCourse = {
  id?: string
  name?: string
  brand?: string
  modality?: string
  commercialModality?: string
  durationInMonths?: number | null
  minPrice?: number
  maxPrice?: number
  city?: string
  uf?: string
}

type Modality = 'EAD' | 'PRESENCIAL' | 'SEMIPRESENCIAL'

type VitrineSlot = {
  courseName: string
  modality?: Modality
  /** Fonte da oferta. 'YDUQS' busca na Athena (Estácio); default Cogna (Tartarus). */
  source?: 'COGNA' | 'YDUQS'
}

// Slots curados por nível. Cada slot vira 1 card. Modalidade opcional —
// quando definida, força a query a pegar especificamente aquela modalidade
// (útil pra mostrar a mesma graduação em EAD/Presencial, por exemplo).
const SLOTS_BY_LEVEL: Record<VitrineLevel, VitrineSlot[]> = {
  // Rebalanceado: alterna Cogna (Anhanguera/Unopar) e YDUQS (Estácio) pra dar
  // presença de marca equilibrada na vitrine de graduação (antes era 100% Cogna).
  GRADUACAO: [
    { courseName: 'analise e desenvolvimento', modality: 'EAD' },
    { courseName: 'Psicologia', source: 'YDUQS' },
    { courseName: 'engenharia de producao', modality: 'SEMIPRESENCIAL' },
    { courseName: 'Pedagogia', source: 'YDUQS' },
    { courseName: 'direito' },
    { courseName: 'Enfermagem', source: 'YDUQS' },
  ],
  POS_GRADUACAO: [
    { courseName: 'mba gestao empresarial' },
    { courseName: 'mba marketing' },
    { courseName: 'gestao de pessoas' },
    { courseName: 'psicologia' },
    { courseName: 'direito digital' },
    { courseName: 'pedagogia empresarial' },
  ],
  CURSO_PROFISSIONALIZANTE: [
    { courseName: 'cuidador' },
    { courseName: 'eletricista' },
    { courseName: 'recursos humanos' },
    { courseName: 'administrador condominio' },
    { courseName: 'marketing digital' },
    { courseName: 'atendente' },
  ],
}

const ALL_LEVELS: VitrineLevel[] = ['GRADUACAO', 'POS_GRADUACAO', 'CURSO_PROFISSIONALIZANTE']

function capitalizeCity(city: string | undefined | null): string | null {
  if (!city) return null
  return city
    .toLowerCase()
    .replace(/(^\w{1})|(\s+\w{1})/g, (m) => m.toUpperCase())
}

async function fetchOne(level: VitrineLevel, slot: VitrineSlot): Promise<VitrineCourse | null> {
  try {
    const params: Record<string, string | number | string[]> = {
      page: 1,
      size: 1,
      academicLevel: [level],
      courseName: slot.courseName,
    }
    if (slot.modality) {
      params.modality = [slot.modality]
    }

    const { data } = await tartarus.get<{ data?: ApiCourse[] }>('cogna/courses/search', {
      params,
      paramsSerializer: (p) => {
        const sp = new URLSearchParams()
        Object.entries(p).forEach(([k, v]) => {
          if (Array.isArray(v)) v.forEach((i) => sp.append(k, String(i)))
          else if (v !== null && v !== undefined) sp.append(k, String(v))
        })
        return sp.toString()
      },
      timeout: 8000,
    })

    const c = data?.data?.[0]
    if (!c || !c.id || !c.name) return null

    const minPrice = Number(c.minPrice ?? 0)
    const maxPrice = Number(c.maxPrice ?? 0)
    const discountPct = maxPrice > 0 && minPrice > 0
      ? Math.round((1 - minPrice / maxPrice) * 100)
      : 0

    // commercialModality é o rótulo de fachada (ex.: SEMIPRESENCIAL),
    // modality é o delivery interno (geralmente EAD). Para a vitrine queremos o comercial.
    const modality = (
      c.commercialModality?.toUpperCase() ||
      c.modality?.toUpperCase() ||
      'EAD'
    ) as VitrineCourse['modality']

    return {
      id: c.id,
      name: c.name,
      brand: c.brand ?? '',
      modality,
      durationInMonths: c.durationInMonths ?? null,
      minPrice,
      maxPrice,
      discountPct,
      city: capitalizeCity(c.city),
      uf: c.uf ?? null,
      searchTerm: slot.courseName,
      academicLevel: level,
    }
  } catch (error) {
    console.error(`[vitrine] erro buscando "${slot.courseName}" (${level}/${slot.modality ?? 'any'}):`, error)
    return null
  }
}

// Busca 1 oferta Estácio (YDUQS) via Athena para o slot. Graduação: minPrice já é
// mensalidade (consistente com o card de graduação, que não divide por duração).
async function fetchOneYduqs(level: VitrineLevel, slot: VitrineSlot): Promise<VitrineCourse | null> {
  try {
    const list = await searchAthenaOffers({
      courseName: slot.courseName,
      academicLevel: level,
      modality: slot.modality,
    })
    const offers = list.map(normalizeAthenaOffer).filter((o) => !!o.offerId)
    if (offers.length === 0) return null
    // Preferir match exato do nome (ex.: "Administração" e não "Administração Pública");
    // senão a oferta mais barata.
    const norm = (s: string) =>
      s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
    const target = norm(slot.courseName)
    const offer =
      offers.find((o) => norm(o.name ?? '') === target) ||
      offers.slice().sort((a, b) => (a.minPrice ?? 1e9) - (b.minPrice ?? 1e9))[0]
    if (!offer.name) return null

    const minPrice = Number(offer.minPrice ?? 0)
    const maxPrice = Number(offer.maxPrice ?? 0)
    const discountPct = maxPrice > 0 && minPrice > 0
      ? Math.round((1 - minPrice / maxPrice) * 100)
      : 0

    return {
      id: offer.offerId || String(offer.id) || slot.courseName,
      name: offer.name,
      brand: normalizeBrand(offer.brand) || 'Estácio',
      modality: ((offer.modality || '').toUpperCase() as VitrineCourse['modality']) || 'EAD',
      durationInMonths: offer.durationInMonths ?? null,
      minPrice,
      maxPrice,
      discountPct,
      city: capitalizeCity(offer.city),
      uf: offer.uf ?? offer.unitState ?? null,
      searchTerm: slot.courseName,
      academicLevel: level,
    }
  } catch (error) {
    console.error(`[vitrine] Athena erro "${slot.courseName}" (${level}):`, error)
    return null
  }
}

type GetVitrineOptions = {
  levels?: VitrineLevel[]
  perLevel?: number
}

export async function getVitrine({
  levels,
  perLevel = 3,
}: GetVitrineOptions = {}): Promise<VitrineCourse[]> {
  const targetLevels = levels && levels.length > 0 ? levels : ALL_LEVELS

  const fetches = targetLevels.flatMap((level) => {
    const slots = (SLOTS_BY_LEVEL[level] ?? []).slice(0, perLevel)
    return slots.map((slot) =>
      slot.source === 'YDUQS' ? fetchOneYduqs(level, slot) : fetchOne(level, slot),
    )
  })

  const results = await Promise.all(fetches)
  return results.filter((c): c is VitrineCourse => c !== null)
}
