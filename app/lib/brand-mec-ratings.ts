import { unstable_cache } from 'next/cache'
import { prisma } from './prisma'

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Map brandSlug → mecRating (1-5) das institutions ativas.
// Cacheado por 1h — mecRating muda raramente.
export const getBrandMecRatings = unstable_cache(
  async (): Promise<Map<string, number>> => {
    try {
      const institutions = await prisma.institution.findMany({
        where: { isActive: true, mecRating: { not: null } },
        select: { slug: true, name: true, mecRating: true },
      })

      const map = new Map<string, number>()
      for (const inst of institutions) {
        if (inst.mecRating == null) continue
        map.set(inst.slug, inst.mecRating)
        // Também indexar por nome normalizado (offer.brand vem como "Anhanguera", não slug)
        const nameKey = normalize(inst.name)
        if (nameKey && nameKey !== inst.slug) {
          map.set(nameKey, inst.mecRating)
        }
      }
      return map
    } catch (err) {
      console.error('getBrandMecRatings — falha:', err)
      return new Map()
    }
  },
  ['brand-mec-ratings-v1'],
  { revalidate: 3600, tags: ['institutions'] }
)

// Helper síncrono pra cliente. Recebe a Map já buscada server-side.
export function getMecRatingFromMap(
  map: Record<string, number>,
  brand: string | undefined | null
): number | undefined {
  if (!brand) return undefined
  const key = normalize(brand)
  return map[key]
}

// Serializa o Map pra passar via prop pra client component
export function mapToObject(map: Map<string, number>): Record<string, number> {
  return Object.fromEntries(map.entries())
}
