// Cross-reference de queries do Trends contra o catálogo interno (FeaturedCourse,
// Institution, BlogPost) + páginas estáticas conhecidas. Devolve matchStatus
// (GAP / PARTIAL / COVERED) + lista de entidades matched.

import { prisma } from '@/app/lib/prisma'

export type MatchStatus = 'GAP' | 'PARTIAL' | 'COVERED'

export interface MatchResult {
  status: MatchStatus
  matchedEntities: string[]
}

// Páginas estáticas relevantes que cobrem queries macro
const STATIC_PAGES: Array<{ slug: string; aliases: string[] }> = [
  { slug: '/enem', aliases: ['enem'] },
  { slug: '/sisu', aliases: ['sisu'] },
  { slug: '/prouni', aliases: ['prouni'] },
  { slug: '/fies', aliases: ['fies'] },
  { slug: '/encceja', aliases: ['encceja'] },
  { slug: '/teste-vocacional', aliases: ['teste vocacional', 'vocacional'] },
  { slug: '/graduacao', aliases: ['graduacao', 'graduação'] },
  { slug: '/pos-graduacao', aliases: ['pos-graduacao', 'pos graduacao', 'pós-graduação'] },
  { slug: '/cursos-profissionalizantes', aliases: ['cursos profissionalizantes', 'profissionalizante'] },
  { slug: '/faculdades', aliases: ['faculdades', 'faculdade'] },
  { slug: '/bolsas-de-estudo', aliases: ['bolsa de estudo', 'bolsas de estudo', 'bolsa estudo'] },
]

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Cache leve em escopo de request — buildCatalog é chamado uma vez por refresh
interface CatalogIndex {
  courses: Array<{ slug: string; name: string; apiName: string; keywords: string[] }>
  institutions: Array<{ slug: string; name: string; keywords: string[] }>
  blogPosts: Array<{ slug: string; title: string; keywords: string[] }>
}

export async function buildCatalogIndex(): Promise<CatalogIndex> {
  const [courses, institutions, blogPosts] = await Promise.all([
    prisma.featuredCourse.findMany({
      where: { isActive: true },
      select: { slug: true, name: true, apiCourseName: true, keywords: true },
    }),
    prisma.institution.findMany({
      where: { isActive: true },
      select: { slug: true, name: true, keywords: true },
    }),
    prisma.blogPost.findMany({
      where: { isActive: true, publishedAt: { not: null } },
      select: { slug: true, title: true, keywords: true },
    }),
  ])
  return {
    courses: courses.map((c) => ({
      slug: c.slug,
      name: c.name,
      apiName: c.apiCourseName,
      keywords: c.keywords ?? [],
    })),
    institutions: institutions.map((i) => ({
      slug: i.slug,
      name: i.name,
      keywords: i.keywords ?? [],
    })),
    blogPosts: blogPosts.map((p) => ({
      slug: p.slug,
      title: p.title,
      keywords: p.keywords ?? [],
    })),
  }
}

function fieldsMatch(queryNorm: string, fields: string[]): 'exact' | 'partial' | 'none' {
  for (const f of fields) {
    const fNorm = normalize(f)
    if (!fNorm) continue
    if (fNorm === queryNorm) return 'exact'
    // partial: query inteira contém o campo OU campo contém a query inteira
    if (fNorm.includes(queryNorm) || queryNorm.includes(fNorm)) return 'partial'
  }
  return 'none'
}

export function matchQuery(query: string, catalog: CatalogIndex): MatchResult {
  const q = normalize(query)
  const matchedEntities: string[] = []
  let bestLevel: 'exact' | 'partial' | 'none' = 'none'

  // Static pages
  for (const page of STATIC_PAGES) {
    const m = fieldsMatch(q, [page.slug.replace(/^\//, ''), ...page.aliases])
    if (m === 'exact') {
      matchedEntities.push(`staticPage:${page.slug}`)
      bestLevel = 'exact'
    } else if (m === 'partial' && bestLevel !== 'exact') {
      matchedEntities.push(`staticPage:${page.slug}`)
      bestLevel = bestLevel === 'none' ? 'partial' : bestLevel
    }
  }

  // Courses
  for (const c of catalog.courses) {
    const m = fieldsMatch(q, [c.slug, c.name, c.apiName, ...c.keywords])
    if (m === 'exact') {
      matchedEntities.push(`featuredCourse:${c.slug}`)
      bestLevel = 'exact'
    } else if (m === 'partial' && bestLevel !== 'exact') {
      matchedEntities.push(`featuredCourse:${c.slug}`)
      bestLevel = bestLevel === 'none' ? 'partial' : bestLevel
    }
  }

  // Institutions
  for (const inst of catalog.institutions) {
    const m = fieldsMatch(q, [inst.slug, inst.name, ...inst.keywords])
    if (m === 'exact') {
      matchedEntities.push(`institution:${inst.slug}`)
      bestLevel = 'exact'
    } else if (m === 'partial' && bestLevel !== 'exact') {
      matchedEntities.push(`institution:${inst.slug}`)
      bestLevel = bestLevel === 'none' ? 'partial' : bestLevel
    }
  }

  // Blog posts
  for (const p of catalog.blogPosts) {
    const m = fieldsMatch(q, [p.slug, p.title, ...p.keywords])
    if (m === 'exact') {
      matchedEntities.push(`blogPost:${p.slug}`)
      bestLevel = 'exact'
    } else if (m === 'partial' && bestLevel !== 'exact') {
      matchedEntities.push(`blogPost:${p.slug}`)
      bestLevel = bestLevel === 'none' ? 'partial' : bestLevel
    }
  }

  const status: MatchStatus =
    bestLevel === 'exact' ? 'COVERED' : bestLevel === 'partial' ? 'PARTIAL' : 'GAP'

  // Dedup matchedEntities
  const unique = Array.from(new Set(matchedEntities))

  return { status, matchedEntities: unique }
}

// Calcula priorityScore: queries com alto trend + status GAP ficam no topo.
// Rising recebe boost porque indica crescimento (vs query estabelecida).
export function calculatePriorityScore(
  trendValue: number,
  isRising: boolean,
  status: MatchStatus,
): number {
  const statusWeight = status === 'GAP' ? 1.0 : status === 'PARTIAL' ? 0.4 : 0.1
  const risingBoost = isRising ? 1.3 : 1.0
  return Math.round(trendValue * statusWeight * risingBoost * 10) / 10
}
