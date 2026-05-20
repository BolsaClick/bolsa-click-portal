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
        select: { slug: true, updatedAt: true, hasCityPages: true },
      }),
    ])

    // /cursos/[slug] — todos os cursos ativos
    coursePages = featuredCourses.map(({ slug, updatedAt }) => ({
      url: `${SITE_URL}/cursos/${slug}`,
      lastModified: updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }))

    // /cursos/[slug]/[city] — só cursos com hasCityPages=true × cidades brasileiras.
    // A rota emite noindex+canonical quando Tartarus não devolve oferta local
    // (app/cursos/[slug]/[city]/page.tsx), então listar tudo é seguro contra
    // Helpful Content.
    const cityEligible = featuredCourses.filter((c) => c.hasCityPages)
    courseCityPages = cityEligible.flatMap(({ slug, updatedAt }) =>
      BRAZILIAN_CITIES.map((city) => ({
        url: `${SITE_URL}/cursos/${slug}/${city.slug}`,
        lastModified: updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    )

    // /teste-vocacional/[slug] — uma página long-tail por curso ativo
    testeVocacionalCursoPages = featuredCourses.map(({ slug, updatedAt }) => ({
      url: `${SITE_URL}/teste-vocacional/${slug}`,
      lastModified: updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
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
