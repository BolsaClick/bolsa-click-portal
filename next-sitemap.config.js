// Função para gerar slug de cidade (mesma lógica do brazilian-cities.ts)
function slugifyCity(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Slugs dos cursos populares para landing pages /cursos/[slug]/[city]
const courseSlugs = [
  'administracao', 'direito', 'enfermagem', 'psicologia',
  'educacao-fisica', 'farmacia', 'medicina', 'engenharia-civil',
  'pedagogia', 'analise-e-desenvolvimento-de-sistemas',
  'gestao-de-recursos-humanos', 'marketing',
  'nutricao', 'odontologia', 'fisioterapia', 'biomedicina',
  'ciencias-contabeis', 'arquitetura-e-urbanismo',
  'engenharia-de-producao', 'gestao-comercial',
]

// Capitais estaduais + Campinas (28 cidades)
const mainCities = [
  { city: 'São Paulo', state: 'SP' },
  { city: 'Rio de Janeiro', state: 'RJ' },
  { city: 'Belo Horizonte', state: 'MG' },
  { city: 'Curitiba', state: 'PR' },
  { city: 'Porto Alegre', state: 'RS' },
  { city: 'Brasília', state: 'DF' },
  { city: 'Salvador', state: 'BA' },
  { city: 'Recife', state: 'PE' },
  { city: 'Fortaleza', state: 'CE' },
  { city: 'Goiânia', state: 'GO' },
  { city: 'Manaus', state: 'AM' },
  { city: 'Belém', state: 'PA' },
  { city: 'Campinas', state: 'SP' },
  { city: 'São Luís', state: 'MA' },
  { city: 'Maceió', state: 'AL' },
  { city: 'Campo Grande', state: 'MS' },
  { city: 'Cuiabá', state: 'MT' },
  { city: 'João Pessoa', state: 'PB' },
  { city: 'Natal', state: 'RN' },
  { city: 'Teresina', state: 'PI' },
  { city: 'Aracaju', state: 'SE' },
  { city: 'Florianópolis', state: 'SC' },
  { city: 'Vitória', state: 'ES' },
  { city: 'Porto Velho', state: 'RO' },
  { city: 'Macapá', state: 'AP' },
  { city: 'Rio Branco', state: 'AC' },
  { city: 'Boa Vista', state: 'RR' },
  { city: 'Palmas', state: 'TO' },
]

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

    // Home com prioridade máxima
    paths.push({
      loc: '/',
      changefreq: 'daily',
      priority: 1.0,
      lastmod: new Date().toISOString(),
    })

    // Páginas principais
    paths.push({
      loc: '/graduacao',
      changefreq: 'daily',
      priority: 0.95,
      lastmod: new Date().toISOString(),
    })

    paths.push({
      loc: '/pos-graduacao',
      changefreq: 'daily',
      priority: 0.95,
      lastmod: new Date().toISOString(),
    })

    paths.push({
      loc: '/cursos',
      changefreq: 'daily',
      priority: 0.9,
      lastmod: new Date().toISOString(),
    })

    paths.push({
      loc: '/faculdades',
      changefreq: 'weekly',
      priority: 0.85,
      lastmod: new Date().toISOString(),
    })

    // Landing pages estáticas /cursos/[slug]/[city] - alto valor SEO
    courseSlugs.forEach(courseSlug => {
      mainCities.forEach(city => {
        paths.push({
          loc: `/cursos/${courseSlug}/${slugifyCity(city.city)}`,
          changefreq: 'weekly',
          priority: 0.85,
          lastmod: new Date().toISOString(),
        })
      })
    })

    return paths
  },
}
