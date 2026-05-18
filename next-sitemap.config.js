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

// 284 municípios: 27 capitais + grandes cidades por população (IBGE 2022) +
// long tail de cidades com polo real de Anhanguera/Unopar/Pitágoras (via API
// Tartarus). Mantém em sincronia com app/lib/constants/brazilian-cities.ts.
// A página /cursos/[slug]/[city] e /faculdades/[slug]/[city] emitem
// noindex + canonical pra nacional quando não há oferta local, então listar
// todas é seguro contra Helpful Content (Google descarta thin via noindex).
// Monitorar GSC: se >30% das URLs ficarem "submitted but not indexed" por
// meses, considerar pré-filtrar via API.
const ALL_CITIES = [
  ['São Paulo', 'SP'],
  ['Rio de Janeiro', 'RJ'],
  ['Brasília', 'DF'],
  ['Fortaleza', 'CE'],
  ['Salvador', 'BA'],
  ['Belo Horizonte', 'MG'],
  ['Manaus', 'AM'],
  ['Curitiba', 'PR'],
  ['Recife', 'PE'],
  ['Goiânia', 'GO'],
  ['Belém', 'PA'],
  ['Porto Alegre', 'RS'],
  ['Guarulhos', 'SP'],
  ['Campinas', 'SP'],
  ['São Luís', 'MA'],
  ['São Gonçalo', 'RJ'],
  ['Maceió', 'AL'],
  ['Duque de Caxias', 'RJ'],
  ['Campo Grande', 'MS'],
  ['Natal', 'RN'],
  ['Teresina', 'PI'],
  ['São Bernardo do Campo', 'SP'],
  ['Nova Iguaçu', 'RJ'],
  ['João Pessoa', 'PB'],
  ['Santo André', 'SP'],
  ['Osasco', 'SP'],
  ['Jaboatão dos Guararapes', 'PE'],
  ['São José dos Campos', 'SP'],
  ['Ribeirão Preto', 'SP'],
  ['Uberlândia', 'MG'],
  ['Sorocaba', 'SP'],
  ['Contagem', 'MG'],
  ['Aracaju', 'SE'],
  ['Feira de Santana', 'BA'],
  ['Cuiabá', 'MT'],
  ['Joinville', 'SC'],
  ['Juiz de Fora', 'MG'],
  ['Londrina', 'PR'],
  ['Aparecida de Goiânia', 'GO'],
  ['Ananindeua', 'PA'],
  ['Florianópolis', 'SC'],
  ['Niterói', 'RJ'],
  ['Serra', 'ES'],
  ['Belford Roxo', 'RJ'],
  ['Campos dos Goytacazes', 'RJ'],
  ['Caxias do Sul', 'RS'],
  ['Vila Velha', 'ES'],
  ['São João de Meriti', 'RJ'],
  ['Mauá', 'SP'],
  ['Carapicuíba', 'SP'],
  ['Mogi das Cruzes', 'SP'],
  ['Santos', 'SP'],
  ['Diadema', 'SP'],
  ['Olinda', 'PE'],
  ['Betim', 'MG'],
  ['Maringá', 'PR'],
  ['Jundiaí', 'SP'],
  ['Caucaia', 'CE'],
  ['Anápolis', 'GO'],
  ['Piracicaba', 'SP'],
  ['Itaquaquecetuba', 'SP'],
  ['Vitória', 'ES'],
  ['Montes Claros', 'MG'],
  ['São José do Rio Preto', 'SP'],
  ['Cariacica', 'ES'],
  ['Caruaru', 'PE'],
  ['Pelotas', 'RS'],
  ['Bauru', 'SP'],
  ['Canoas', 'RS'],
  ['Blumenau', 'SC'],
  ['Suzano', 'SP'],
  ['Vitória da Conquista', 'BA'],
  ['Ribeirão das Neves', 'MG'],
  ['Franca', 'SP'],
  ['Petrolina', 'PE'],
  ['Ponta Grossa', 'PR'],
  ['Paulista', 'PE'],
  ['Camaçari', 'BA'],
  ['Petrópolis', 'RJ'],
  ['Uberaba', 'MG'],
  ['Cascavel', 'PR'],
  ['Praia Grande', 'SP'],
  ['Taubaté', 'SP'],
  ['Limeira', 'SP'],
  ['Santa Maria', 'RS'],
  ['Gravataí', 'RS'],
  ['Mossoró', 'RN'],
  ['Volta Redonda', 'RJ'],
  ['Sumaré', 'SP'],
  ['Várzea Grande', 'MT'],
  ['Imperatriz', 'MA'],
  ['Foz do Iguaçu', 'PR'],
  ['São Vicente', 'SP'],
  ['Embu das Artes', 'SP'],
  ['Hortolândia', 'SP'],
  ['Marília', 'SP'],
  ['Indaiatuba', 'SP'],
  ['Porto Velho', 'RO'],
  ['Macapá', 'AP'],
  ['Rio Branco', 'AC'],
  ['Boa Vista', 'RR'],
  ['Palmas', 'TO'],
  ['Águas Lindas de Goiás', 'GO'],
  ['Alagoinhas', 'BA'],
  ['Alegrete', 'RS'],
  ['Alfenas', 'MG'],
  ['Almenara', 'MG'],
  ['Altamira', 'PA'],
  ['Alvorada', 'RS'],
  ['Americana', 'SP'],
  ['Angra dos Reis', 'RJ'],
  ['Apucarana', 'PR'],
  ['Aquidauana', 'MS'],
  ['Araçuaí', 'MG'],
  ['Arapiraca', 'AL'],
  ['Arapongas', 'PR'],
  ['Araranguá', 'SC'],
  ['Araraquara', 'SP'],
  ['Araruama', 'RJ'],
  ['Ariquemes', 'RO'],
  ['Assis', 'SP'],
  ['Atibaia', 'SP'],
  ['Bacabal', 'MA'],
  ['Bagé', 'RS'],
  ['Bandeirantes', 'PR'],
  ['Barra do Bugres', 'MT'],
  ['Barra do Corda', 'MA'],
  ['Barra do Garcas', 'MT'],
  ['Barra Mansa', 'RJ'],
  ['Barueri', 'SP'],
  ['Belo Jardim', 'PE'],
  ['Bom Jesus', 'PI'],
  ['Bom Jesus da Lapa', 'BA'],
  ['Botucatu', 'SP'],
  ['Bragança Paulista', 'SP'],
  ['Brumado', 'BA'],
  ['Cabo Frio', 'RJ'],
  ['Cachoeiro de Itapemirim', 'ES'],
  ['Caicó', 'RN'],
  ['Cajazeiras', 'PB'],
  ['Campina Grande', 'PB'],
  ['Canaa dos Carajas', 'PA'],
  ['Capanema', 'PA'],
  ['Capelinha', 'MG'],
  ['Castanhal', 'PA'],
  ['Catanduva', 'SP'],
  ['Caxias', 'MA'],
  ['Cerejeiras', 'RO'],
  ['Chapadao do Sul', 'MS'],
  ['Chapecó', 'SC'],
  ['Codó', 'MA'],
  ['Colatina', 'ES'],
  ['Colinas do Tocantins', 'TO'],
  ['Concordia', 'SC'],
  ['Corumba', 'MS'],
  ['Cotia', 'SP'],
  ['Coxim', 'MS'],
  ['Crato', 'CE'],
  ['Criciúma', 'SC'],
  ['Cruz Alta', 'RS'],
  ['Cruzeiro do Sul', 'AC'],
  ['Divinópolis', 'MG'],
  ['Dourados', 'MS'],
  ['Erechim', 'RS'],
  ['Esperantina', 'PI'],
  ['Eunapolis', 'BA'],
  ['Formosa do Rio Preto', 'BA'],
  ['Garanhuns', 'PE'],
  ['Governador Valadares', 'MG'],
  ['Gramado', 'RS'],
  ['Guanambi', 'BA'],
  ['Guarai', 'TO'],
  ['Guarapari', 'ES'],
  ['Guarapuava', 'PR'],
  ['Gurupi', 'TO'],
  ['Ilhéus', 'BA'],
  ['Ipatinga', 'MG'],
  ['Irece', 'BA'],
  ['Itabira', 'MG'],
  ['Itaboraí', 'RJ'],
  ['Itabuna', 'BA'],
  ['Itaituba', 'PA'],
  ['Itajaí', 'SC'],
  ['Itapecerica da Serra', 'SP'],
  ['Itapetinga', 'BA'],
  ['Itapetininga', 'SP'],
  ['Itapeva', 'SP'],
  ['Itapevi', 'SP'],
  ['Itapuranga', 'GO'],
  ['Itu', 'SP'],
  ['Itumbiara', 'GO'],
  ['Jacareí', 'SP'],
  ['Jacobina', 'BA'],
  ['Jaragua do Sul', 'SC'],
  ['Jau', 'SP'],
  ['Jequie', 'BA'],
  ['Juazeiro', 'BA'],
  ['Juazeiro do Norte', 'CE'],
  ['Lages', 'SC'],
  ['Lauro de Freitas', 'BA'],
  ['Leme', 'SP'],
  ['Linhares', 'ES'],
  ['Luis Eduardo Magalhaes', 'BA'],
  ['Luziânia', 'GO'],
  ['Macaé', 'RJ'],
  ['Magé', 'RJ'],
  ['Marabá', 'PA'],
  ['Maranguape', 'CE'],
  ['Marataizes', 'ES'],
  ['Marica', 'RJ'],
  ['Matao', 'SP'],
  ['Monte Alegre', 'RN'],
  ['Muriae', 'MG'],
  ['Nova Friburgo', 'RJ'],
  ['Novo Hamburgo', 'RS'],
  ['Palhoca', 'SC'],
  ['Para de Minas', 'MG'],
  ['Paragominas', 'PA'],
  ['Paraiso do Tocantins', 'TO'],
  ['Paranagua', 'PR'],
  ['Parauapebas', 'PA'],
  ['Parnaíba', 'PI'],
  ['Passo Fundo', 'RS'],
  ['Patos', 'PB'],
  ['Patos de Minas', 'MG'],
  ['Paulo Afonso', 'BA'],
  ['Penapolis', 'SP'],
  ['Picos', 'PI'],
  ['Pindamonhangaba', 'SP'],
  ['Piracuruca', 'PI'],
  ['Pirapora', 'MG'],
  ['Pirassununga', 'SP'],
  ['Pocos de Caldas', 'MG'],
  ['Ponta Pora', 'MS'],
  ['Ponte Nova', 'MG'],
  ['Portao', 'RS'],
  ['Porto Nacional', 'TO'],
  ['Pouso Alegre', 'MG'],
  ['Presidente Dutra', 'MA'],
  ['Presidente Prudente', 'SP'],
  ['Primavera do Leste', 'MT'],
  ['Redencao', 'PA'],
  ['Resende', 'RJ'],
  ['Rio Claro', 'SP'],
  ['Rio Grande', 'RS'],
  ['Rio Verde', 'GO'],
  ['Rondonópolis', 'MT'],
  ['Santa Barbara D\'oeste', 'SP'],
  ['Santa Luzia', 'MG'],
  ['Santa Vitoria do Palmar', 'RS'],
  ['Santarém', 'PA'],
  ['Santo Antonio de Jesus', 'BA'],
  ['São Borja', 'RS'],
  ['São Caetano do Sul', 'SP'],
  ['São Carlos', 'SP'],
  ['São Francisco', 'MG'],
  ['São José', 'SC'],
  ['São Leopoldo', 'RS'],
  ['São Mateus', 'ES'],
  ['Sapucaia do Sul', 'RS'],
  ['Sarandi', 'PR'],
  ['Seabra', 'BA'],
  ['Senador Canedo', 'GO'],
  ['Sertaozinho', 'SP'],
  ['Sete Lagoas', 'MG'],
  ['Sinop', 'MT'],
  ['Sobral', 'CE'],
  ['Sorriso', 'MT'],
  ['Taboao da Serra', 'SP'],
  ['Tangara da Serra', 'MT'],
  ['Teixeira de Freitas', 'BA'],
  ['Teresópolis', 'RJ'],
  ['Timon', 'MA'],
  ['Toledo', 'PR'],
  ['Tubarão', 'SC'],
  ['Tucuruí', 'PA'],
  ['Umuarama', 'PR'],
  ['Uruguaiana', 'RS'],
  ['Vacaria', 'RS'],
  ['Valinhos', 'SP'],
  ['Valparaiso de Goias', 'GO'],
  ['Varginha', 'MG'],
  ['Vilhena', 'RO'],
  ['Vitória de Santo Antão', 'PE']
]

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.bolsaclick.com.br',
  generateRobotsTxt: true,
  // sitemapSize: 1500 força next-sitemap a gerar sitemap index automático
  // com sub-sitemaps (sitemap-0.xml, sitemap-1.xml, ...) quando passamos do
  // limite. Com ~3k+ URLs (cursos × cidades expandido), isso garante 2-3
  // arquivos menores em vez de 1 flat de 500KB+ — melhora crawl budget,
  // facilita reindexação parcial e dá pro Google priorizar por sitemap.
  // V2: split semântico (sitemap-cursos.xml, sitemap-cidades.xml) requer
  // migrar pra App Router sitemap.ts em cada subdir.
  sitemapSize: 1500,
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

      const [activeCourses, activeInstitutions, blogPosts, blogCategories] = await Promise.all([
        prisma.featuredCourse.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true, hasCityPages: true },
        }),
        prisma.institution.findMany({
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

      // /faculdades/[slug] (nacionais)
      activeInstitutions.forEach((inst) => {
        paths.push({
          loc: `/faculdades/${inst.slug}`,
          changefreq: 'weekly',
          priority: 0.85,
          lastmod: inst.updatedAt.toISOString(),
        })
      })

      // /faculdades/[slug]/[city] — só pra instituições com presença ampla
      // (hasCityPages=true). Runtime emite noindex quando não tem oferta local.
      const cityEligibleInstitutions = activeInstitutions.filter((i) => i.hasCityPages)
      cityEligibleInstitutions.forEach((inst) => {
        ALL_CITIES.forEach(([cityName]) => {
          paths.push({
            loc: `/faculdades/${inst.slug}/${slugifyCity(cityName)}`,
            changefreq: 'weekly',
            priority: 0.75,
            lastmod: now,
          })
        })
      })

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
