// Watchlist de topics monitorados pelo SEO Trends Dashboard.
// MVP: lista curada hardcoded + scan automático do catálogo ativo (FeaturedCourse + Institution).
// Fase 2: substituir parte curada por CRUD via UI admin (SiteSettings ou model próprio).

import { prisma } from '@/app/lib/prisma'

export interface TrendsTopic {
  topic: string
  source: 'CURATED' | 'COURSE_CATALOG' | 'INSTITUTION_CATALOG'
}

// Termos macro do ecossistema educação no Brasil
export const CURATED_TOPICS: string[] = [
  'ENEM',
  'SISU',
  'PROUNI',
  'FIES',
  'ENCCEJA',
  'vestibular',
  'graduação EAD',
  'pós-graduação',
  'MBA',
  'curso técnico',
  'bolsa de estudo',
  'faculdade',
]

// Lista todos os topics a monitorar num refresh completo
export async function getAllTopics(opts: {
  includeCatalog?: boolean
  catalogLimit?: number
} = {}): Promise<TrendsTopic[]> {
  const { includeCatalog = true, catalogLimit = 30 } = opts

  const topics: TrendsTopic[] = CURATED_TOPICS.map((t) => ({ topic: t, source: 'CURATED' }))

  if (!includeCatalog) return topics

  // Top cursos ativos por order (cap pra não estourar rate-limit no MVP)
  const courses = await prisma.featuredCourse.findMany({
    where: { isActive: true },
    select: { name: true },
    orderBy: { order: 'asc' },
    take: catalogLimit,
  })
  for (const c of courses) {
    topics.push({ topic: c.name, source: 'COURSE_CATALOG' })
  }

  // Instituições (3 hoje, cabe todas)
  const institutions = await prisma.institution.findMany({
    where: { isActive: true },
    select: { name: true },
  })
  for (const i of institutions) {
    topics.push({ topic: i.name, source: 'INSTITUTION_CATALOG' })
  }

  return topics
}
