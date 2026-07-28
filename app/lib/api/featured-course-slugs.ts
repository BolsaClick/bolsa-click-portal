import { prisma } from '@/app/lib/prisma'
import { normalizeCourseNameKey } from '@/app/lib/utils/course-name-key'

// ─── Mapa em memória nome→slug dos cursos enriquecidos (FeaturedCourse) ─────
// Usado pelo card de resultado de busca pra linkar (link secundário, "Ver
// detalhes do curso") pra página /cursos/[slug] quando o curso da oferta tem
// conteúdo editorial. Cache em memória (processo Railway é longevo) — mesmo
// padrão do searchCache em SearchResultsData.tsx, TTL curto o bastante pra
// pegar curso novo/editado sem reiniciar o processo.
const SLUG_MAP_TTL_MS = 10 * 60_000

let cache: { value: Record<string, string>; expires: number } | null = null

export async function getFeaturedCourseSlugMap(): Promise<Record<string, string>> {
  if (cache && cache.expires > Date.now()) return cache.value

  const courses = await prisma.featuredCourse.findMany({
    where: { isActive: true },
    select: { slug: true, name: true, apiCourseName: true, fullName: true },
  })

  const map: Record<string, string> = {}
  for (const course of courses) {
    // Indexa todas as variantes de nome disponíveis pro mesmo slug — a oferta
    // que vem da API de busca (Tartarus/Athena) pode usar qualquer uma delas.
    const variants = [course.name, course.apiCourseName, course.fullName]
    for (const variant of variants) {
      if (!variant) continue
      const key = normalizeCourseNameKey(variant)
      if (key && !map[key]) map[key] = course.slug
    }
  }

  cache = { value: map, expires: Date.now() + SLUG_MAP_TTL_MS }
  return map
}
