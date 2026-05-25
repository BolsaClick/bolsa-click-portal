// Sub-sitemap dinâmico — atende /sitemap/0.xml a /sitemap/4.xml.
// Refatorado de app/sitemap.ts pra Route Handler pra ter controle total
// sobre a resposta XML e contornar bugs do generateSitemaps() do Next 15.

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { BRAZILIAN_CITIES } from '@/app/lib/constants/brazilian-cities'

const SITE_URL = 'https://www.bolsaclick.com.br'

export const revalidate = 3600

type SitemapEntry = {
  loc: string
  lastmod?: string
  changefreq?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never'
  priority?: number
}

const MAX_URLS_PER_SITEMAP = 45_000
const MAX_COMPARE_URLS = 1_000

const FALLBACK_COURSE_SLUGS = [
  'administracao-bacharelado', 'direito-bacharelado', 'enfermagem-bacharelado',
  'psicologia-bacharelado', 'educacao-fisica-bacharelado', 'farmacia-bacharelado',
  'medicina-bacharelado', 'engenharia-civil-bacharelado', 'pedagogia-licenciatura',
  'analise-e-desenvolvimento-de-sistemas-tecnologo', 'gestao-de-recursos-humanos-tecnologo',
  'marketing-tecnologo', 'nutricao-bacharelado', 'odontologia-bacharelado',
  'fisioterapia-bacharelado', 'biomedicina-bacharelado', 'ciencias-contabeis-bacharelado',
  'arquitetura-e-urbanismo-bacharelado', 'engenharia-de-producao-bacharelado',
  'gestao-comercial-tecnologo',
]

const CITY_TIER_1_CUTOFF = 60
const CITY_TIER_2_CUTOFF = 160

const cityRankBySlug = new Map(BRAZILIAN_CITIES.map((c, idx) => [c.slug, idx]))

function cityTier(citySlug: string): 1 | 2 | 3 {
  const rank = cityRankBySlug.get(citySlug) ?? 999
  if (rank < CITY_TIER_1_CUTOFF) return 1
  if (rank < CITY_TIER_2_CUTOFF) return 2
  return 3
}

function cityCoursePriority(trendScore: number, citySlug: string): number {
  const tier = cityTier(citySlug)
  const trendNorm = Math.max(0, Math.min(100, trendScore)) / 100
  const tierBonus = tier === 1 ? 0.15 : tier === 2 ? 0.08 : 0
  return Math.round((0.30 + trendNorm * 0.35 + tierBonus) * 100) / 100
}

function shouldEmitCityUrl(trendScore: number, citySlug: string): boolean {
  const tier = cityTier(citySlug)
  if (tier === 1) return true
  if (tier === 2) return trendScore >= 30
  return trendScore >= 60
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`[sitemap] timeout ${label} após ${ms}ms`)), ms)
  )
  return Promise.race([promise, timeout])
}

// ─────────────────────────────────────────────────────────────────────────
// BUILDERS
// ─────────────────────────────────────────────────────────────────────────

function buildStaticSitemap(): SitemapEntry[] {
  const now = new Date().toISOString()
  return [
    { loc: SITE_URL, lastmod: now, changefreq: 'daily', priority: 1.0 },
    { loc: `${SITE_URL}/cursos`, lastmod: now, changefreq: 'daily', priority: 0.9 },
    { loc: `${SITE_URL}/graduacao`, lastmod: now, changefreq: 'daily', priority: 0.95 },
    { loc: `${SITE_URL}/pos-graduacao`, lastmod: now, changefreq: 'daily', priority: 0.95 },
    { loc: `${SITE_URL}/cursos-profissionalizantes`, lastmod: now, changefreq: 'daily', priority: 0.95 },
    { loc: `${SITE_URL}/faculdades`, lastmod: now, changefreq: 'weekly', priority: 0.85 },
    { loc: `${SITE_URL}/bolsas-de-estudo`, lastmod: now, changefreq: 'daily', priority: 1.0 },
    { loc: `${SITE_URL}/blog`, lastmod: now, changefreq: 'daily', priority: 0.9 },
    { loc: `${SITE_URL}/quem-somos`, lastmod: now, changefreq: 'weekly', priority: 0.7 },
    { loc: `${SITE_URL}/contato`, lastmod: now, changefreq: 'weekly', priority: 0.7 },
    { loc: `${SITE_URL}/central-de-ajuda`, lastmod: now, changefreq: 'weekly', priority: 0.7 },
    { loc: `${SITE_URL}/faq`, lastmod: now, changefreq: 'weekly', priority: 0.8 },
    { loc: `${SITE_URL}/teste-vocacional`, lastmod: now, changefreq: 'monthly', priority: 0.85 },
    { loc: `${SITE_URL}/enem`, lastmod: now, changefreq: 'monthly', priority: 0.85 },
    { loc: `${SITE_URL}/prouni`, lastmod: now, changefreq: 'monthly', priority: 0.85 },
    { loc: `${SITE_URL}/sisu`, lastmod: now, changefreq: 'monthly', priority: 0.85 },
    { loc: `${SITE_URL}/fies`, lastmod: now, changefreq: 'monthly', priority: 0.85 },
    { loc: `${SITE_URL}/encceja`, lastmod: now, changefreq: 'monthly', priority: 0.8 },
    ...BRAZILIAN_CITIES.map((city) => ({
      loc: `${SITE_URL}/bolsas-de-estudo/${city.slug}`,
      lastmod: now,
      changefreq: 'weekly' as const,
      priority: 0.7,
    })),
    ...['realista', 'investigativo', 'artistico', 'social', 'empreendedor', 'convencional'].map((tipo) => ({
      loc: `${SITE_URL}/teste-vocacional/perfil/${tipo}`,
      lastmod: now,
      changefreq: 'monthly' as const,
      priority: 0.75,
    })),
    {
      loc: `${SITE_URL}/teste-vocacional/metodologia`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.8,
    },
  ]
}

async function buildCoursesSitemap(): Promise<SitemapEntry[]> {
  const now = new Date().toISOString()
  try {
    const courses = await withTimeout(
      prisma.featuredCourse.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true, trendScore: true },
        orderBy: { trendScore: 'desc' },
      }),
      8_000,
      'courses'
    )
    console.log(`[sitemap:courses] ${courses.length} cursos`)
    return courses.map(({ slug, updatedAt, trendScore }) => ({
      loc: `${SITE_URL}/cursos/${slug}`,
      lastmod: updatedAt.toISOString(),
      changefreq: 'daily' as const,
      priority: Math.round((0.50 + (trendScore ?? 0) / 100 * 0.35) * 100) / 100,
    }))
  } catch (e) {
    console.error('[sitemap:courses] erro, usando fallback:', e)
    return FALLBACK_COURSE_SLUGS.map((slug) => ({
      loc: `${SITE_URL}/cursos/${slug}`,
      lastmod: now,
      changefreq: 'daily' as const,
      priority: 0.7,
    }))
  }
}

async function buildCourseCitiesSitemap(): Promise<SitemapEntry[]> {
  try {
    const courses = await withTimeout(
      prisma.featuredCourse.findMany({
        where: { isActive: true, hasCityPages: true },
        select: { slug: true, updatedAt: true, trendScore: true },
        orderBy: { trendScore: 'desc' },
      }),
      8_000,
      'course-cities'
    )
    console.log(`[sitemap:course-cities] ${courses.length} cursos com hasCityPages`)
    return courses
      .flatMap(({ slug, updatedAt, trendScore }) =>
        BRAZILIAN_CITIES
          .filter((city) => shouldEmitCityUrl(trendScore ?? 0, city.slug))
          .map((city) => ({
            loc: `${SITE_URL}/cursos/${slug}/${city.slug}`,
            lastmod: updatedAt.toISOString(),
            changefreq: 'weekly' as const,
            priority: cityCoursePriority(trendScore ?? 0, city.slug),
          })),
      )
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
      .slice(0, MAX_URLS_PER_SITEMAP)
  } catch (e) {
    console.error('[sitemap:course-cities] erro, fallback:', e)
    const now = new Date().toISOString()
    return FALLBACK_COURSE_SLUGS.flatMap((slug) =>
      BRAZILIAN_CITIES.slice(0, CITY_TIER_1_CUTOFF).map((city) => ({
        loc: `${SITE_URL}/cursos/${slug}/${city.slug}`,
        lastmod: now,
        changefreq: 'weekly' as const,
        priority: 0.65,
      })),
    )
  }
}

async function buildInstitutionsSitemap(): Promise<SitemapEntry[]> {
  try {
    const institutions = await withTimeout(
      prisma.institution.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      8_000,
      'institutions'
    )
    console.log(`[sitemap:institutions] ${institutions.length} ativas`)

    const sortedByRecency = [...institutions].sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    )

    const compareUrls: SitemapEntry[] = []
    outer: for (let i = 0; i < sortedByRecency.length; i++) {
      for (let j = i + 1; j < sortedByRecency.length; j++) {
        const instA = sortedByRecency[i]
        const instB = sortedByRecency[j]
        const [a, b] = [instA.slug, instB.slug].sort()
        const newer = instA.updatedAt > instB.updatedAt ? instA.updatedAt : instB.updatedAt
        compareUrls.push({
          loc: `${SITE_URL}/comparar/${a}-vs-${b}`,
          lastmod: newer.toISOString(),
          changefreq: 'weekly' as const,
          priority: 0.75,
        })
        if (compareUrls.length >= MAX_COMPARE_URLS) break outer
      }
    }

    return [
      ...institutions.map(({ slug, updatedAt }) => ({
        loc: `${SITE_URL}/faculdades/${slug}`,
        lastmod: updatedAt.toISOString(),
        changefreq: 'weekly' as const,
        priority: 0.8,
      })),
      ...institutions.flatMap(({ slug, updatedAt }) =>
        BRAZILIAN_CITIES.slice(0, CITY_TIER_1_CUTOFF).map((city) => ({
          loc: `${SITE_URL}/faculdades/${slug}/em/${city.slug}`,
          lastmod: updatedAt.toISOString(),
          changefreq: 'weekly' as const,
          priority: 0.65,
        })),
      ),
      ...compareUrls,
    ].slice(0, MAX_URLS_PER_SITEMAP)
  } catch (e) {
    console.error('[sitemap:institutions] erro:', e)
    return []
  }
}

async function buildEditorialSitemap(): Promise<SitemapEntry[]> {
  try {
    const [blogPosts, blogCategories, helpArticles, vocacionalCourses] = await withTimeout(
      Promise.all([
        prisma.blogPost.findMany({
          where: { isActive: true, publishedAt: { not: null } },
          select: { slug: true, updatedAt: true },
        }),
        prisma.blogCategory.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true },
        }),
        prisma.helpArticle.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true, category: { select: { slug: true } } },
        }),
        prisma.featuredCourse.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true, trendScore: true },
          orderBy: { trendScore: 'desc' },
        }),
      ]),
      8_000,
      'editorial'
    )
    console.log(
      `[sitemap:editorial] ${blogPosts.length} posts, ${blogCategories.length} cats, ${helpArticles.length} ajuda, ${vocacionalCourses.length} vocacional`
    )
    return [
      ...blogPosts.map(({ slug, updatedAt }) => ({
        loc: `${SITE_URL}/blog/${slug}`,
        lastmod: updatedAt.toISOString(),
        changefreq: 'weekly' as const,
        priority: 0.8,
      })),
      ...blogCategories.map(({ slug, updatedAt }) => ({
        loc: `${SITE_URL}/blog/categoria/${slug}`,
        lastmod: updatedAt.toISOString(),
        changefreq: 'weekly' as const,
        priority: 0.7,
      })),
      ...helpArticles.map(({ slug, updatedAt, category }) => ({
        loc: `${SITE_URL}/central-de-ajuda/${category.slug}/${slug}`,
        lastmod: updatedAt.toISOString(),
        changefreq: 'weekly' as const,
        priority: 0.7,
      })),
      ...vocacionalCourses.map(({ slug, updatedAt, trendScore }) => ({
        loc: `${SITE_URL}/teste-vocacional/${slug}`,
        lastmod: updatedAt.toISOString(),
        changefreq: 'monthly' as const,
        priority: Math.round((0.55 + (trendScore ?? 0) / 100 * 0.25) * 100) / 100,
      })),
    ]
  } catch (e) {
    console.error('[sitemap:editorial] erro:', e)
    return []
  }
}

// ─────────────────────────────────────────────────────────────────────────
// SERIALIZAÇÃO XML
// ─────────────────────────────────────────────────────────────────────────

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function entriesToXml(entries: SitemapEntry[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map((e) => {
    const lines = [`  <url>`, `    <loc>${escapeXml(e.loc)}</loc>`]
    if (e.lastmod) lines.push(`    <lastmod>${e.lastmod}</lastmod>`)
    if (e.changefreq) lines.push(`    <changefreq>${e.changefreq}</changefreq>`)
    if (e.priority !== undefined) lines.push(`    <priority>${e.priority.toFixed(2)}</priority>`)
    lines.push(`  </url>`)
    return lines.join('\n')
  })
  .join('\n')}
</urlset>
`
}

// ─────────────────────────────────────────────────────────────────────────
// HANDLER
// ─────────────────────────────────────────────────────────────────────────

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id: rawId } = await params
  // Aceita "0", "1.xml", "0.xml" — normaliza pra inteiro
  const id = parseInt(rawId.replace(/\.xml$/, ''), 10)
  console.log(`[sitemap] dispatch id=${id}`)

  let entries: SitemapEntry[] = []
  switch (id) {
    case 0:
      entries = buildStaticSitemap()
      break
    case 1:
      entries = await buildCoursesSitemap()
      break
    case 2:
      entries = await buildCourseCitiesSitemap()
      break
    case 3:
      entries = await buildInstitutionsSitemap()
      break
    case 4:
      entries = await buildEditorialSitemap()
      break
    default:
      return new NextResponse('Not Found', { status: 404 })
  }

  console.log(`[sitemap] id=${id} retornando ${entries.length} URLs`)
  return new NextResponse(entriesToXml(entries), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
