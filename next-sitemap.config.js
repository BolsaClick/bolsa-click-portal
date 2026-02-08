// Cursos populares para o sitemap (Graduação)
const popularCourses = [
  { name: 'Administração', suffix: 'Bacharelado', nivel: 'GRADUACAO' },
  { name: 'Direito', suffix: 'Bacharelado', nivel: 'GRADUACAO' },
  { name: 'Enfermagem', suffix: 'Bacharelado', nivel: 'GRADUACAO' },
  { name: 'Psicologia', suffix: 'Bacharelado', nivel: 'GRADUACAO' },
  { name: 'Educação Física', suffix: 'Bacharelado', nivel: 'GRADUACAO' },
  { name: 'Farmácia', suffix: 'Bacharelado', nivel: 'GRADUACAO' },
  { name: 'Medicina', suffix: 'Bacharelado', nivel: 'GRADUACAO' },
  { name: 'Engenharia Civil', suffix: 'Bacharelado', nivel: 'GRADUACAO' },
  { name: 'Pedagogia', suffix: 'Licenciatura', nivel: 'GRADUACAO' },
  { name: 'Análise e Desenvolvimento de Sistemas', suffix: 'Tecnólogo', nivel: 'GRADUACAO' },
  { name: 'Gestão de Recursos Humanos', suffix: 'Tecnólogo', nivel: 'GRADUACAO' },
  { name: 'Marketing', suffix: 'Tecnólogo', nivel: 'GRADUACAO' },
]

// Cursos de Pós-graduação mais populares (Top 10)
const popularPosGraduacao = [
  { name: 'BIM e Projetos aplicados à construção civil', nivel: 'POS_GRADUACAO' },
  { name: 'Bilinguismo e Educação Bilíngue', nivel: 'POS_GRADUACAO' },
  { name: 'Avaliação Psicológica e Psicodiagnóstico', nivel: 'POS_GRADUACAO' },
  { name: 'Avaliação estratégica de investimentos e gestão financeira', nivel: 'POS_GRADUACAO' },
  { name: 'Automação, controle e robótica na indústria', nivel: 'POS_GRADUACAO' },
  { name: 'Automação industrial e robótica', nivel: 'POS_GRADUACAO' },
  { name: 'Auditoria, perícia e licenciamento ambiental', nivel: 'POS_GRADUACAO' },
  { name: 'Auditoria em enfermagem', nivel: 'POS_GRADUACAO' },
  { name: 'Atendimento Educacional Especializado e Educação Inclusiva', nivel: 'POS_GRADUACAO' },
  { name: 'Atendimento Educacional Especializado e Educação Especial', nivel: 'POS_GRADUACAO' },
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

// Modalidades disponíveis
const modalidades = ['EAD', 'PRESENCIAL', 'SEMIPRESENCIAL']

// Função para criar URL no formato novo
function createCourseUrl(course, city, modalidade) {
  const params = new URLSearchParams()
  params.set('c', course.name)
  // Para pós-graduação não tem sufixo (cn), apenas para graduação
  if (course.suffix) {
    params.set('cn', course.suffix)
  }
  params.set('cidade', city.city)
  params.set('estado', city.state)
  params.set('modalidade', modalidade)
  params.set('nivel', course.nivel)
  return `/curso/resultado?${params.toString()}`
}

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

    // Páginas principais com prioridade muito alta
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

    // Landing pages /cursos/[slug]/[city] - prioridade alta (0.85)
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

    // URLs de busca: cursos populares + cidades principais + modalidades
    const topCourses = popularCourses.slice(0, 6)
    const topCities = mainCities.slice(0, 5)

    topCourses.forEach(course => {
      topCities.forEach(city => {
        modalidades.forEach(modalidade => {
          paths.push({
            loc: createCourseUrl(course, city, modalidade),
            changefreq: 'weekly',
            priority: 0.9,
            lastmod: new Date().toISOString(),
          })
        })
      })
    })

    // Demais combinações
    popularCourses.slice(6).forEach(course => {
      mainCities.forEach(city => {
        modalidades.forEach(modalidade => {
          paths.push({
            loc: createCourseUrl(course, city, modalidade),
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: new Date().toISOString(),
          })
        })
      })
    })

    // Top cursos em todas as cidades
    topCourses.forEach(course => {
      mainCities.slice(5).forEach(city => {
        modalidades.forEach(modalidade => {
          paths.push({
            loc: createCourseUrl(course, city, modalidade),
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: new Date().toISOString(),
          })
        })
      })
    })

    // Pós-graduação
    const topPosGraduacao = popularPosGraduacao.slice(0, 5)
    topPosGraduacao.forEach(course => {
      topCities.forEach(city => {
        modalidades.forEach(modalidade => {
          paths.push({
            loc: createCourseUrl(course, city, modalidade),
            changefreq: 'weekly',
            priority: 0.9,
            lastmod: new Date().toISOString(),
          })
        })
      })
    })

    popularPosGraduacao.slice(5).forEach(course => {
      mainCities.forEach(city => {
        modalidades.forEach(modalidade => {
          paths.push({
            loc: createCourseUrl(course, city, modalidade),
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: new Date().toISOString(),
          })
        })
      })
    })

    topPosGraduacao.forEach(course => {
      mainCities.slice(5).forEach(city => {
        modalidades.forEach(modalidade => {
          paths.push({
            loc: createCourseUrl(course, city, modalidade),
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: new Date().toISOString(),
          })
        })
      })
    })

    return paths
  },
}
