import { getFeaturedCourses } from './get-featured-courses'

/** Shape do card da vitrine "Ofertas em destaque" (igual ao usado no /cursos). */
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

/** Logo por marca (mesmo mapa do CourseCardNew). Match por substring (marcas YDUQS vêm com nome completo). */
function brandLogo(brand: string): string {
  const n = (brand || '').toLowerCase()
  if (n.includes('anhanguera')) return '/assets/logo-anhanguera-bolsa-click.svg'
  if (n.includes('unopar')) return '/assets/logo-unopar.svg'
  if (n.includes('ampli')) return '/assets/ampli-logo.png'
  if (n.includes('pitagoras') || n.includes('pitágoras')) return '/assets/logo-pitagoras.svg'
  if (n.includes('unime')) return '/assets/logo-unime-p.png'
  if (n.includes('estacio') || n.includes('estácio')) return '/estacio-logo.png'
  if (n.includes('wyden')) return '/assets/wyden.svg'
  return '/assets/logo-bolsa-click-rosa.png'
}

function normModality(m?: string): ShowcaseOffer['modality'] {
  const u = (m || '').toUpperCase()
  return u === 'PRESENCIAL' || u === 'SEMIPRESENCIAL' ? u : 'EAD'
}

function discountPct(min: number, max: number): number {
  if (!max || max <= 0 || min <= 0 || min >= max) return 0
  return Math.round((1 - min / max) * 100)
}

function capitalize(s: string): string {
  return (s || '')
    .toLowerCase()
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

interface RawOffer {
  offerId?: string
  source?: string
  name?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  modality?: string
  city?: string
  uf?: string
  unitState?: string
  academicLevel?: string
}

function toShowcase(o: RawOffer): ShowcaseOffer | null {
  const course = (o.name || '').trim()
  if (!course) return null
  const min = Number(o.minPrice ?? 0)
  const max = Number(o.maxPrice ?? 0)
  const modality = normModality(o.modality)
  const city = capitalize(o.city || '')
  const uf = (o.uf || o.unitState || '').toUpperCase()
  const academicLevel = o.academicLevel || 'GRADUACAO'

  // Trilho YDUQS (Estácio): vai direto pro checkout de inscrição.
  // Cogna/Tartarus: vai pra busca filtrada (fluxo atual).
  const href =
    o.source === 'YDUQS' && o.offerId
      ? `/checkout/estacio?${new URLSearchParams({
          offerId: o.offerId,
          courseName: course,
          brand: o.brand || '',
          modality: o.modality || '',
          price: String(min || ''),
          city: o.city || '',
          state: uf,
          academicLevel,
        }).toString()}`
      : `/curso/resultado?${new URLSearchParams({
          c: course,
          nivel: academicLevel,
          ...(o.modality ? { modalidade: o.modality.toUpperCase() } : {}),
        }).toString()}`

  return {
    course: capitalize(course),
    institution: o.brand || '',
    logo: brandLogo(o.brand || ''),
    modality,
    city,
    uf,
    finalPrice: min,
    originalPrice: max || min,
    discountPct: discountPct(min, max),
    href,
  }
}

/** Intercala A e B (round-robin) para misturar as fontes na vitrine. */
function interleave<T>(a: T[], b: T[]): T[] {
  const out: T[] = []
  const n = Math.max(a.length, b.length)
  for (let i = 0; i < n; i++) {
    if (i < a.length) out.push(a[i])
    if (i < b.length) out.push(b[i])
  }
  return out
}

/**
 * Vitrine "Ofertas em destaque": mescla ofertas Cogna (featured) + Estácio (Athena),
 * intercaladas. Degradação graciosa: se uma fonte falhar, usa só a outra.
 * Roda no browser (getFeaturedCourses usa tartarus; Athena via /api/athena-offers).
 */
export async function getShowcaseOffers(limit = 6): Promise<ShowcaseOffer[]> {
  const [cognaRes, athenaRes] = await Promise.allSettled([
    getFeaturedCourses(),
    fetch('/api/athena-offers').then((r) => (r.ok ? r.json() : { data: [] })),
  ])

  const cognaRaw: RawOffer[] =
    cognaRes.status === 'fulfilled' ? (cognaRes.value?.data ?? []) : []

  let athenaRaw: RawOffer[] =
    athenaRes.status === 'fulfilled' ? (athenaRes.value?.data ?? []) : []

  // Dedup Athena por nome de curso (evita repetir o mesmo curso de vários polos).
  const seen = new Set<string>()
  athenaRaw = athenaRaw.filter((o) => {
    const k = (o.name || '').trim().toUpperCase()
    if (!k || seen.has(k)) return false
    seen.add(k)
    return true
  })

  const cogna = cognaRaw.map(toShowcase).filter(Boolean) as ShowcaseOffer[]
  const athena = athenaRaw.map(toShowcase).filter(Boolean) as ShowcaseOffer[]

  return interleave(cogna, athena).slice(0, limit)
}
