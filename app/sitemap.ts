import type { MetadataRoute } from 'next'
import { prisma } from '@/app/lib/prisma'
import { BRAZILIAN_CITIES } from '@/app/lib/constants/brazilian-cities'

const SITE_URL = 'https://www.bolsaclick.com.br'

/**
 * Sitemap dividido em sub-sitemaps por categoria.
 *
 * Next 15 com generateSitemaps automaticamente cria sitemap-index em
 * /sitemap.xml e cada sub-sitemap fica em /sitemap/<id>.xml. Vantagens vs.
 * sitemap monolítico anterior (5.6MB / 29k URLs):
 *   - Crawl paralelo do Googlebot
 *   - Cache HTTP independente por categoria
 *   - Cada sub-sitemap fica <10MB e bem abaixo do limite de 50k URLs
 *   - Possibilita invalidação seletiva (ex: pingar só blog quando muda post)
 *
 * IDs estáveis (não reordenar — afeta GSC):
 *   0 = static + hubs governamentais
 *   1 = /cursos/[slug] (page nacional do curso)
 *   2 = /cursos/[slug]/[city] (city pages — maior volume)
 *   3 = /faculdades + /faculdades/[slug] + /faculdades/[slug]/em/[city] + /comparar
 *   4 = blog + central-de-ajuda + teste-vocacional
 */

export async function generateSitemaps() {
  return [
    { id: 0 }, // static
    { id: 1 }, // courses (national)
    { id: 2 }, // courses × cities
    { id: 3 }, // faculdades + comparar
    { id: 4 }, // blog + ajuda + vocacional
  ]
}

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
  const priority = 0.30 + (trendNorm * 0.35) + tierBonus
  return Math.round(priority * 100) / 100
}

function shouldEmitCityUrl(trendScore: number, citySlug: string): boolean {
  const tier = cityTier(citySlug)
  if (tier === 1) return true
  if (tier === 2) return trendScore >= 30
  return trendScore >= 60
}

// ─────────────────────────────────────────────────────────────────────────
// SITEMAP 0 — STATIC + HUBS
// ─────────────────────────────────────────────────────────────────────────

function buildStaticSitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/cursos`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/graduacao`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${SITE_URL}/pos-graduacao`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${SITE_URL}/cursos-profissionalizantes`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${SITE_URL}/faculdades`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/bolsas-de-estudo`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/quem-somos`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/contato`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/central-de-ajuda`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/teste-vocacional`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    // Hubs de programas governamentais
    { url: `${SITE_URL}/enem`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/prouni`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/sisu`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/fies`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/encceja`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    // Hubs de cidade /bolsas-de-estudo/[city]
    ...BRAZILIAN_CITIES.map((city) => ({
      url: `${SITE_URL}/bolsas-de-estudo/${city.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    // Teste vocacional perfis
    ...['realista', 'investigativo', 'artistico', 'social', 'empreendedor', 'convencional'].map((tipo) => ({
      url: `${SITE_URL}/teste-vocacional/perfil/${tipo}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
    {
      url: `${SITE_URL}/teste-vocacional/metodologia`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}

// ─────────────────────────────────────────────────────────────────────────
// SITEMAP 1 — /cursos/[slug] (page nacional)
// ─────────────────────────────────────────────────────────────────────────

async function buildCoursesSitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  try {
    const courses = await prisma.featuredCourse.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true, trendScore: true },
      orderBy: { trendScore: 'desc' },
    })
    return courses.map(({ slug, updatedAt, trendScore }) => ({
      url: `${SITE_URL}/cursos/${slug}`,
      lastModified: updatedAt,
      changeFrequency: 'daily' as const,
      priority: Math.round((0.50 + (trendScore ?? 0) / 100 * 0.35) * 100) / 100,
    }))
  } catch (e) {
    console.error('[sitemap:courses] erro:', e)
    return FALLBACK_COURSE_SLUGS.map((slug) => ({
      url: `${SITE_URL}/cursos/${slug}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))
  }
}

// ─────────────────────────────────────────────────────────────────────────
// SITEMAP 2 — /cursos/[slug]/[city] (maior volume, ~12k URLs)
// ─────────────────────────────────────────────────────────────────────────

async function buildCourseCitiesSitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const courses = await prisma.featuredCourse.findMany({
      where: { isActive: true, hasCityPages: true },
      select: { slug: true, updatedAt: true, trendScore: true },
      orderBy: { trendScore: 'desc' },
    })
    return courses
      .flatMap(({ slug, updatedAt, trendScore }) =>
        BRAZILIAN_CITIES
          .filter((city) => shouldEmitCityUrl(trendScore ?? 0, city.slug))
          .map((city) => ({
            url: `${SITE_URL}/cursos/${slug}/${city.slug}`,
            lastModified: updatedAt,
            changeFrequency: 'weekly' as const,
            priority: cityCoursePriority(trendScore ?? 0, city.slug),
          })),
      )
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
  } catch (e) {
    console.error('[sitemap:course-cities] erro:', e)
    const now = new Date()
    return FALLBACK_COURSE_SLUGS.flatMap((slug) =>
      BRAZILIAN_CITIES.slice(0, CITY_TIER_1_CUTOFF).map((city) => ({
        url: `${SITE_URL}/cursos/${slug}/${city.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.65,
      })),
    )
  }
}

// ─────────────────────────────────────────────────────────────────────────
// SITEMAP 3 — faculdades + comparar
// ─────────────────────────────────────────────────────────────────────────

async function buildInstitutionsSitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const institutions = await prisma.institution.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    })
    return [
      // /faculdades/[slug]
      ...institutions.map(({ slug, updatedAt }) => ({
        url: `${SITE_URL}/faculdades/${slug}`,
        lastModified: updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
      // /faculdades/[slug]/em/[city]
      ...institutions.flatMap(({ slug, updatedAt }) =>
        BRAZILIAN_CITIES.slice(0, CITY_TIER_1_CUTOFF).map((city) => ({
          url: `${SITE_URL}/faculdades/${slug}/em/${city.slug}`,
          lastModified: updatedAt,
          changeFrequency: 'weekly' as const,
          priority: 0.65,
        })),
      ),
      // /comparar/[a]-vs-[b]
      ...institutions.flatMap((instA, i) =>
        institutions.slice(i + 1).map((instB) => {
          const [a, b] = [instA.slug, instB.slug].sort()
          return {
            url: `${SITE_URL}/comparar/${a}-vs-${b}`,
            lastModified: instA.updatedAt > instB.updatedAt ? instA.updatedAt : instB.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.75,
          }
        }),
      ),
    ]
  } catch (e) {
    console.error('[sitemap:institutions] erro:', e)
    return []
  }
}

// ─────────────────────────────────────────────────────────────────────────
// SITEMAP 4 — blog + central-de-ajuda + teste-vocacional cursos
// ─────────────────────────────────────────────────────────────────────────

async function buildEditorialSitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [blogPosts, blogCategories, helpArticles, vocacionalCourses] = await Promise.all([
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
    ])
    return [
      ...blogPosts.map(({ slug, updatedAt }) => ({
        url: `${SITE_URL}/blog/${slug}`,
        lastModified: updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
      ...blogCategories.map(({ slug, updatedAt }) => ({
        url: `${SITE_URL}/blog/categoria/${slug}`,
        lastModified: updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...helpArticles.map(({ slug, updatedAt, category }) => ({
        url: `${SITE_URL}/central-de-ajuda/${category.slug}/${slug}`,
        lastModified: updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      // Teste vocacional × curso
      ...vocacionalCourses.map(({ slug, updatedAt, trendScore }) => ({
        url: `${SITE_URL}/teste-vocacional/${slug}`,
        lastModified: updatedAt,
        changeFrequency: 'monthly' as const,
        priority: Math.round((0.55 + (trendScore ?? 0) / 100 * 0.25) * 100) / 100,
      })),
    ]
  } catch (e) {
    console.error('[sitemap:editorial] erro:', e)
    return []
  }
}

// ─────────────────────────────────────────────────────────────────────────
// DISPATCH
// ─────────────────────────────────────────────────────────────────────────

export default async function sitemap({
  id,
}: {
  id: number
}): Promise<MetadataRoute.Sitemap> {
  switch (id) {
    case 0:
      return buildStaticSitemap()
    case 1:
      return buildCoursesSitemap()
    case 2:
      return buildCourseCitiesSitemap()
    case 3:
      return buildInstitutionsSitemap()
    case 4:
      return buildEditorialSitemap()
    default:
      return []
  }
}
