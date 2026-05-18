// Resolve slugs curtos (ex: "medicina-veterinaria") para slugs canônicos
// com sufixo da API (ex: "medicina-veterinaria-bacharelado"). Usado nas rotas
// /cursos/[slug] e /carreiras/[slug] pra evitar 404 quando usuário/Google
// digita versão sem sufixo. Retorna o slug canônico se achar, null se não.

import { prisma } from '@/app/lib/prisma'

const SUFFIXES = ['-bacharelado', '-licenciatura', '-tecnologo', '-especializacao', '-mba']

export async function resolveCanonicalCourseSlug(slug: string): Promise<string | null> {
  // Se slug já termina em sufixo, retorna direto (não há ambiguidade)
  if (SUFFIXES.some((s) => slug.endsWith(s))) {
    return null
  }
  // Tenta cada sufixo
  for (const suffix of SUFFIXES) {
    const candidate = `${slug}${suffix}`
    const found = await prisma.featuredCourse.findUnique({
      where: { slug: candidate, isActive: true },
      select: { slug: true },
    })
    if (found) return found.slug
  }
  return null
}
