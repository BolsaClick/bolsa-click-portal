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

// brandKey → mecRating (1-5) das institutions ativas.
// Cacheado por 1h — mecRating muda raramente.
// Retornamos Record/plain object porque Map não sobrevive à serialização do
// unstable_cache (vira {} no cache hit e quebra .entries()).
export const getBrandMecRatings = unstable_cache(
  async (): Promise<Record<string, number>> => {
    try {
      const institutions = await prisma.institution.findMany({
        where: { isActive: true, mecRating: { not: null } },
        select: { slug: true, name: true, mecRating: true },
      })

      const result: Record<string, number> = {}
      for (const inst of institutions) {
        if (inst.mecRating == null) continue
        result[inst.slug] = inst.mecRating
        // Também indexar por nome normalizado (offer.brand vem como "Anhanguera", não slug)
        const nameKey = normalize(inst.name)
        if (nameKey && nameKey !== inst.slug) {
          result[nameKey] = inst.mecRating
        }
      }
      return result
    } catch (err) {
      console.error('getBrandMecRatings — falha:', err)
      return {}
    }
  },
  ['brand-mec-ratings-v2'],
  { revalidate: 3600, tags: ['institutions'] }
)

// Helper síncrono pra cliente. Recebe o objeto já buscado server-side.
export function getMecRatingFromMap(
  map: Record<string, number>,
  brand: string | undefined | null
): number | undefined {
  if (!brand) return undefined
  const key = normalize(brand)
  return map[key]
}

// Passthrough mantido por compat: callers podem continuar chamando mapToObject.
// Antes convertia Map → Record; agora Record → Record (no-op).
export function mapToObject(map: Record<string, number>): Record<string, number> {
  return map
}
