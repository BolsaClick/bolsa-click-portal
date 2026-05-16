import { tartarus } from './axios'

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
}

// Slots curados por nível. Cada slot vira 1 card. Modalidade opcional —
// quando definida, força a query a pegar especificamente aquela modalidade
// (útil pra mostrar a mesma graduação em EAD/Presencial, por exemplo).
const SLOTS_BY_LEVEL: Record<VitrineLevel, VitrineSlot[]> = {
  GRADUACAO: [
    { courseName: 'analise e desenvolvimento', modality: 'EAD' },
    { courseName: 'engenharia de producao', modality: 'SEMIPRESENCIAL' },
    { courseName: 'analise e desenvolvimento', modality: 'PRESENCIAL' },
    { courseName: 'administracao' },
    { courseName: 'pedagogia' },
    { courseName: 'direito' },
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
    return slots.map((slot) => fetchOne(level, slot))
  })

  const results = await Promise.all(fetches)
  return results.filter((c): c is VitrineCourse => c !== null)
}
