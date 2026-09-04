import { prisma } from '@/app/lib/prisma'
import { normalizeCourseNameKey } from '@/app/lib/utils/course-name-key'

// ─── Mapa em memória nome→slug dos cursos enriquecidos (FeaturedCourse) ─────
// Usado pelo card de resultado de busca pra linkar (link secundário, "Ver
// detalhes do curso") pra página /cursos/[slug] quando o curso da oferta tem
// conteúdo editorial. Cache em memória (processo Railway é longevo) — mesmo
// padrão do searchCache em SearchResultsData.tsx, TTL curto o bastante pra
// pegar curso novo/editado sem reiniciar o processo.
const SLUG_MAP_TTL_MS = 10 * 60_000

interface FeaturedCourseRow {
  slug: string
  name: string
  apiCourseName: string
  fullName: string
  nivel: string
}

// Uma única query/cache compartilhada por todos os lookups deste módulo — o
// mapa nome→slug (sem nível) e o lookup nome+nível (abaixo) derivam dos MESMOS
// registros, pra nunca divergir entre si com o tempo.
let rowsCache: { value: FeaturedCourseRow[]; expires: number } | null = null

async function getFeaturedCourseRows(): Promise<FeaturedCourseRow[]> {
  if (rowsCache && rowsCache.expires > Date.now()) return rowsCache.value

  const courses = await prisma.featuredCourse.findMany({
    where: { isActive: true },
    select: { slug: true, name: true, apiCourseName: true, fullName: true, nivel: true },
  })

  rowsCache = { value: courses, expires: Date.now() + SLUG_MAP_TTL_MS }
  return courses
}

export async function getFeaturedCourseSlugMap(): Promise<Record<string, string>> {
  const courses = await getFeaturedCourseRows()

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

  return map
}

/**
 * Resolve nome de curso (qualquer variante: name/apiCourseName/fullName) +
 * nível pro slug do FeaturedCourse. Diferente de getFeaturedCourseSlugMap
 * (que ignora nível e fica com o primeiro match), este é seguro pra usar como
 * alvo de canonical: existem hoje 8 nomes de curso duplicados entre GRADUACAO
 * e POS_GRADUACAO no catálogo (ex: "Design Gráfico" tecnólogo vs pós), e sem
 * checar nível o mapa simples aponta pro nível errado ~metade das vezes nesses
 * casos. Retorna null se não achar (curso fora do catálogo, ou existe só no
 * outro nível) — caller deve manter o comportamento atual nesse caso.
 */
export async function getFeaturedCourseSlugByNameAndLevel(
  courseName: string,
  nivel: string,
): Promise<string | null> {
  if (!courseName) return null
  const courses = await getFeaturedCourseRows()
  const key = normalizeCourseNameKey(courseName)
  const nivelUpper = nivel.toUpperCase()

  for (const course of courses) {
    if (course.nivel !== nivelUpper) continue
    const variants = [course.name, course.apiCourseName, course.fullName]
    if (variants.some((variant) => variant && normalizeCourseNameKey(variant) === key)) {
      return course.slug
    }
  }

  return null
}
