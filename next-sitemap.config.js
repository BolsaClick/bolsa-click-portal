// Função para gerar slug de cidade (mesma lógica do brazilian-cities.ts)
function slugifyCity(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Slugs de fallback usados quando o DB não responde no build do sitemap.
// Em condições normais, puxamos a lista real de cursos ativos do Prisma.
const FALLBACK_COURSE_SLUGS = [
  'administracao', 'direito', 'enfermagem', 'psicologia',
  'educacao-fisica', 'farmacia', 'medicina', 'engenharia-civil',
  'pedagogia', 'analise-e-desenvolvimento-de-sistemas',
  'gestao-de-recursos-humanos', 'marketing',
  'nutricao', 'odontologia', 'fisioterapia', 'biomedicina',
  'ciencias-contabeis', 'arquitetura-e-urbanismo',
  'engenharia-de-producao', 'gestao-comercial',
]

// 102 municípios cobrindo as 27 capitais + maiores cidades por população (IBGE 2022).
// Mantém em sincronia com app/lib/constants/brazilian-cities.ts (RAW_CITIES).
// A página /cursos/[slug]/[city] já emite noindex + canonical pra nacional
// quando não há oferta local, então listar todas é seguro do ponto de vista
// de Helpful Content (Google descarta thin pages via noindex; o canonical
// consolida sinais). Monitorar GSC: se >30% das URLs ficarem "submitted
// but not indexed" por meses, considerar pré-filtrar via API.
const ALL_CITIES = [
  ['São Paulo', 'SP'], ['Rio de Janeiro', 'RJ'], ['Brasília', 'DF'],
  ['Fortaleza', 'CE'], ['Salvador', 'BA'], ['Belo Horizonte', 'MG'],
  ['Manaus', 'AM'], ['Curitiba', 'PR'], ['Recife', 'PE'],
  ['Goiânia', 'GO'], ['Belém', 'PA'], ['Porto Alegre', 'RS'],
  ['Guarulhos', 'SP'], ['Campinas', 'SP'], ['São Luís', 'MA'],
  ['São Gonçalo', 'RJ'], ['Maceió', 'AL'], ['Duque de Caxias', 'RJ'],
  ['Campo Grande', 'MS'], ['Natal', 'RN'], ['Teresina', 'PI'],
  ['São Bernardo do Campo', 'SP'], ['Nova Iguaçu', 'RJ'], ['João Pessoa', 'PB'],
  ['Santo André', 'SP'], ['Osasco', 'SP'], ['Jaboatão dos Guararapes', 'PE'],
  ['São José dos Campos', 'SP'], ['Ribeirão Preto', 'SP'], ['Uberlândia', 'MG'],
  ['Sorocaba', 'SP'], ['Contagem', 'MG'], ['Aracaju', 'SE'],
  ['Feira de Santana', 'BA'], ['Cuiabá', 'MT'], ['Joinville', 'SC'],
  ['Juiz de Fora', 'MG'], ['Londrina', 'PR'], ['Aparecida de Goiânia', 'GO'],
  ['Ananindeua', 'PA'], ['Florianópolis', 'SC'], ['Niterói', 'RJ'],
  ['Serra', 'ES'], ['Belford Roxo', 'RJ'], ['Campos dos Goytacazes', 'RJ'],
  ['Caxias do Sul', 'RS'], ['Vila Velha', 'ES'], ['São João de Meriti', 'RJ'],
  ['Mauá', 'SP'], ['Carapicuíba', 'SP'], ['Mogi das Cruzes', 'SP'],
  ['Santos', 'SP'], ['Diadema', 'SP'], ['Olinda', 'PE'],
  ['Betim', 'MG'], ['Maringá', 'PR'], ['Jundiaí', 'SP'],
  ['Caucaia', 'CE'], ['Anápolis', 'GO'], ['Piracicaba', 'SP'],
  ['Itaquaquecetuba', 'SP'], ['Vitória', 'ES'], ['Montes Claros', 'MG'],
  ['São José do Rio Preto', 'SP'], ['Cariacica', 'ES'], ['Caruaru', 'PE'],
  ['Pelotas', 'RS'], ['Bauru', 'SP'], ['Canoas', 'RS'],
  ['Blumenau', 'SC'], ['Suzano', 'SP'], ['Vitória da Conquista', 'BA'],
  ['Ribeirão das Neves', 'MG'], ['Franca', 'SP'], ['Petrolina', 'PE'],
  ['Ponta Grossa', 'PR'], ['Paulista', 'PE'], ['Camaçari', 'BA'],
  ['Petrópolis', 'RJ'], ['Uberaba', 'MG'], ['Cascavel', 'PR'],
  ['Praia Grande', 'SP'], ['Taubaté', 'SP'], ['Limeira', 'SP'],
  ['Santa Maria', 'RS'], ['Gravataí', 'RS'], ['Mossoró', 'RN'],
  ['Volta Redonda', 'RJ'], ['Sumaré', 'SP'], ['Várzea Grande', 'MT'],
  ['Imperatriz', 'MA'], ['Foz do Iguaçu', 'PR'], ['São Vicente', 'SP'],
  ['Embu das Artes', 'SP'], ['Hortolândia', 'SP'], ['Marília', 'SP'],
  ['Indaiatuba', 'SP'], ['Porto Velho', 'RO'], ['Macapá', 'AP'],
  ['Rio Branco', 'AC'], ['Boa Vista', 'RR'], ['Palmas', 'TO'],
]

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.bolsaclick.com.br',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: [
    '/admin',
    '/admin/*',
    '/login',
    '/checkout/*',
    '/favoritos',
    '/curso',
    '/curso/resultado',
    '/curso/resultado*',
    '/ajuda',
    '/ajuda/*',
    '/minha-conta',
    '/minha-conta/*',
    '/cadastro',
    '/recuperar-senha',
    '/api/*',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/checkout/',
          '/login',
          '/favoritos',
          '/minha-conta/',
          '/cadastro',
          '/recuperar-senha',
          '/curso/resultado',
        ],
      },
    ],
  },
  additionalPaths: async () => {
    const paths = []
    const now = new Date().toISOString()

    // Páginas core
    const corePages = [
      { loc: '/', priority: 1.0, changefreq: 'daily' },
      { loc: '/graduacao', priority: 0.95, changefreq: 'daily' },
      { loc: '/pos-graduacao', priority: 0.95, changefreq: 'daily' },
      { loc: '/cursos-profissionalizantes', priority: 0.95, changefreq: 'daily' },
      { loc: '/cursos', priority: 0.9, changefreq: 'daily' },
      { loc: '/faculdades', priority: 0.85, changefreq: 'weekly' },
      { loc: '/carreiras', priority: 0.9, changefreq: 'weekly' },
      { loc: '/blog', priority: 0.9, changefreq: 'daily' },
    ]
    corePages.forEach((p) => paths.push({ ...p, lastmod: now }))

    // Cursos + carreiras + blog (todos via Prisma — fallback pra constantes se DB falhar)
    let activeCourseSlugs = FALLBACK_COURSE_SLUGS
    try {
      const { PrismaClient } = require('@prisma/client')
      const prisma = new PrismaClient()

      const [activeCourses, blogPosts, blogCategories] = await Promise.all([
        prisma.featuredCourse.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true, hasCityPages: true },
        }),
        prisma.blogPost.findMany({
          where: { isActive: true, publishedAt: { not: null } },
          select: { slug: true, updatedAt: true },
        }),
        prisma.blogCategory.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true },
        }),
      ])

      if (activeCourses.length > 0) {
        activeCourseSlugs = activeCourses.map((c) => c.slug)
      }

      // /carreiras/[slug] — uma página de profissão por curso ativo
      activeCourses.forEach((c) => {
        paths.push({
          loc: `/carreiras/${c.slug}`,
          changefreq: 'weekly',
          priority: 0.85,
          lastmod: c.updatedAt.toISOString(),
        })
      })

      // /cursos/[slug]/[city] — só pros cursos com hasCityPages=true (gate manual).
      // Evita explosão a 92k+ URLs thin quando catálogo escala pra 900+ cursos.
      const cityEligibleSlugs = activeCourses.filter((c) => c.hasCityPages).map((c) => c.slug)
      cityEligibleSlugs.forEach((slug) => {
        ALL_CITIES.forEach(([cityName]) => {
          paths.push({
            loc: `/cursos/${slug}/${slugifyCity(cityName)}`,
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: now,
          })
        })
      })

      blogPosts.forEach((post) => {
        paths.push({
          loc: `/blog/${post.slug}`,
          changefreq: 'weekly',
          priority: 0.8,
          lastmod: post.updatedAt.toISOString(),
        })
      })

      blogCategories.forEach((cat) => {
        paths.push({
          loc: `/blog/categoria/${cat.slug}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: cat.updatedAt.toISOString(),
        })
      })

      await prisma.$disconnect()
    } catch (e) {
      console.error('Sitemap: falha ao buscar dados do Prisma, usando fallback:', e)
      // Emite carreiras pelos slugs de fallback se DB falhar
      activeCourseSlugs.forEach((slug) => {
        paths.push({
          loc: `/carreiras/${slug}`,
          changefreq: 'weekly',
          priority: 0.85,
          lastmod: now,
        })
      })
    }

    // /cursos/[slug] (nacional) — todos os cursos ativos vão pro sitemap
    activeCourseSlugs.forEach((slug) => {
      paths.push({
        loc: `/cursos/${slug}`,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: now,
      })
    })

    return paths
  },
}
