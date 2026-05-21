import { MetadataRoute } from 'next'
import { prisma } from '@/app/lib/prisma'
import { BRAZILIAN_CITIES } from '@/app/lib/constants/brazilian-cities'

const SITE_URL = 'https://www.bolsaclick.com.br'

// Fallback usado só se o DB falhar no build. Em condições normais, a lista de
// slugs vem de prisma.featuredCourse.findMany abaixo.
const FALLBACK_COURSE_SLUGS = [
  'administracao', 'direito', 'enfermagem', 'psicologia',
  'educacao-fisica', 'farmacia', 'medicina', 'engenharia-civil',
  'pedagogia', 'analise-e-desenvolvimento-de-sistemas',
  'gestao-de-recursos-humanos', 'marketing',
  'nutricao', 'odontologia', 'fisioterapia', 'biomedicina',
  'ciencias-contabeis', 'arquitetura-e-urbanismo',
  'engenharia-de-producao', 'gestao-comercial',
]

// Ranking das cidades por relevância (índice 0-283).
// Top 27 = capitais + grandes municípios. Cidades < 100 são consideradas
// "tier 1" e ganham boost de priority. Cidades > 200 viram tier 3 (priority
// menor) — mantemos no sitemap só se o curso for de alta demanda (trendScore >= 70).
const CITY_TIER_1_CUTOFF = 60   // top 60 cidades: capital + região metropolitana
const CITY_TIER_2_CUTOFF = 160  // top 160: cidades médias

const cityRankBySlug = new Map(BRAZILIAN_CITIES.map((c, idx) => [c.slug, idx]))

function cityTier(citySlug: string): 1 | 2 | 3 {
  const rank = cityRankBySlug.get(citySlug) ?? 999
  if (rank < CITY_TIER_1_CUTOFF) return 1
  if (rank < CITY_TIER_2_CUTOFF) return 2
  return 3
}

// Calcula priority [0.3, 0.80] pra URL /cursos/[slug]/[city] com base em
// trendScore (0-100) e tier da cidade. priority=1.0 fica reservado APENAS
// pra home; pillar pages (graduacao, pos, cursos, blog) ficam em 0.9-0.95.
// City pages, mesmo a top performer (tier 1 + trend 100), capam em 0.80
// pra preservar diferenciação relativa pro crawler do Google e Bing.
function cityCoursePriority(trendScore: number, citySlug: string): number {
  const tier = cityTier(citySlug)
  const trendNorm = Math.max(0, Math.min(100, trendScore)) / 100   // 0-1
  // base 0.30 + até 0.35 por trend + bônus por tier (max 0.15)
  const tierBonus = tier === 1 ? 0.15 : tier === 2 ? 0.08 : 0
  const priority = 0.30 + (trendNorm * 0.35) + tierBonus
  return Math.round(priority * 100) / 100   // cap natural em 0.80
}

// Emite no sitemap só se a URL for "vale a pena indexar". Tier 3 (cidade
// long tail) só entra pra cursos com alta demanda real.
function shouldEmitCityUrl(trendScore: number, citySlug: string): boolean {
  const tier = cityTier(citySlug)
  if (tier === 1) return true
  if (tier === 2) return trendScore >= 30
  return trendScore >= 60
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
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
    // Hubs de programas governamentais — alta intenção de busca informativa
    { url: `${SITE_URL}/enem`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/prouni`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/sisu`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/fies`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/encceja`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ]

  // Hubs de cidade /bolsas-de-estudo/[city] — 100 URLs
  const cityHubPages: MetadataRoute.Sitemap = BRAZILIAN_CITIES.map(city => ({
    url: `${SITE_URL}/bolsas-de-estudo/${city.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Teste vocacional — páginas de perfil Holland (6 URLs)
  const tipoSlugs = ['realista', 'investigativo', 'artistico', 'social', 'empreendedor', 'convencional']
  const testeVocacionalPerfilPages: MetadataRoute.Sitemap = tipoSlugs.map(tipo => ({
    url: `${SITE_URL}/teste-vocacional/perfil/${tipo}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  // Teste vocacional — página de metodologia
  const testeVocacionalMetodologia: MetadataRoute.Sitemap = [{
    url: `${SITE_URL}/teste-vocacional/metodologia`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }]

  // Dados dinâmicos do banco
  let dynamicPages: MetadataRoute.Sitemap = []
  let coursePages: MetadataRoute.Sitemap = []
  let courseCityPages: MetadataRoute.Sitemap = []
  let testeVocacionalCursoPages: MetadataRoute.Sitemap = []

  try {
    const [blogPosts, blogCategories, institutions, helpArticles, featuredCourses] = await Promise.all([
      prisma.blogPost.findMany({
        where: { isActive: true, publishedAt: { not: null } },
        select: { slug: true, updatedAt: true },
      }),
      prisma.blogCategory.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.institution.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.helpArticle.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true, category: { select: { slug: true } } },
      }),
      prisma.featuredCourse.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true, hasCityPages: true, trendScore: true },
        orderBy: { trendScore: 'desc' },
      }),
    ])

    // /cursos/[slug] — todos os cursos ativos. Priority graduada por trendScore.
    // Curso top (score 100) = 0.85; médio (score 50) = 0.675; baixo (score 0) = 0.50.
    // Cap em 0.85 pra deixar 0.9+ reservado pra pillar pages e 1.0 só pra home.
    coursePages = featuredCourses.map(({ slug, updatedAt, trendScore }) => ({
      url: `${SITE_URL}/cursos/${slug}`,
      lastModified: updatedAt,
      changeFrequency: 'daily' as const,
      priority: Math.round((0.50 + (trendScore ?? 0) / 100 * 0.35) * 100) / 100,
    }))

    // /cursos/[slug]/[city] — cursos com hasCityPages=true × cidades.
    // Filtro de tier: cidades tier 1 (top 60) entram sempre; tier 2 só com
    // trendScore >= 30; tier 3 só com trendScore >= 60. Reduz volume de
    // ~33k → ~12k URLs, focando crawl budget no que rankeia.
    // A rota emite noindex+canonical quando Tartarus não devolve oferta local.
    const cityEligible = featuredCourses.filter((c) => c.hasCityPages)
    courseCityPages = cityEligible
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
      // Ordena por priority desc — Google honra primeiras URLs do sitemap
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))

    // /teste-vocacional/[slug] — uma página long-tail por curso ativo
    testeVocacionalCursoPages = featuredCourses.map(({ slug, updatedAt, trendScore }) => ({
      url: `${SITE_URL}/teste-vocacional/${slug}`,
      lastModified: updatedAt,
      changeFrequency: 'monthly' as const,
      priority: Math.round((0.55 + (trendScore ?? 0) / 100 * 0.3) * 100) / 100,
    }))

    dynamicPages = [
      ...blogPosts.map((post: { slug: string; updatedAt: Date }) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
      ...blogCategories.map((cat: { slug: string; updatedAt: Date }) => ({
        url: `${SITE_URL}/blog/categoria/${cat.slug}`,
        lastModified: cat.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...institutions.map((inst: { slug: string; updatedAt: Date }) => ({
        url: `${SITE_URL}/faculdades/${inst.slug}`,
        lastModified: inst.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...helpArticles.map((article: { slug: string; updatedAt: Date; category: { slug: string } }) => ({
        url: `${SITE_URL}/central-de-ajuda/${article.category.slug}/${article.slug}`,
        lastModified: article.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      // Faculdade × cidade /faculdades/[slug]/em/[city] — N instituições × 100 cidades
      ...institutions.flatMap((inst: { slug: string; updatedAt: Date }) =>
        BRAZILIAN_CITIES.map(city => ({
          url: `${SITE_URL}/faculdades/${inst.slug}/em/${city.slug}`,
          lastModified: inst.updatedAt,
          changeFrequency: 'weekly' as const,
          priority: 0.75,
        }))
      ),
      // Comparações faculdade × faculdade /comparar/[a]-vs-[b] (alfabético = canônico)
      ...institutions.flatMap((instA: { slug: string; updatedAt: Date }, i: number) =>
        institutions.slice(i + 1).map((instB: { slug: string; updatedAt: Date }) => {
          const [a, b] = [instA.slug, instB.slug].sort()
          return {
            url: `${SITE_URL}/comparar/${a}-vs-${b}`,
            lastModified: instA.updatedAt > instB.updatedAt ? instA.updatedAt : instB.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
          }
        })
      ),
    ]
  } catch (e) {
    console.error('Erro ao buscar dados dinâmicos para sitemap:', e)
    // Fallback: emite os 20 slugs hardcoded em /cursos/[slug] e suas city pages.
    // Garante que o sitemap nunca volte vazio se o DB falhar no build.
    coursePages = FALLBACK_COURSE_SLUGS.map((slug) => ({
      url: `${SITE_URL}/cursos/${slug}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }))
    courseCityPages = FALLBACK_COURSE_SLUGS.flatMap((slug) =>
      BRAZILIAN_CITIES.map((city) => ({
        url: `${SITE_URL}/cursos/${slug}/${city.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    )
    testeVocacionalCursoPages = FALLBACK_COURSE_SLUGS.map((slug) => ({
      url: `${SITE_URL}/teste-vocacional/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  }

  return [
    ...staticPages,
    ...coursePages,
    ...courseCityPages,
    ...cityHubPages,
    ...testeVocacionalCursoPages,
    ...testeVocacionalPerfilPages,
    ...testeVocacionalMetodologia,
    ...dynamicPages,
  ]
}
