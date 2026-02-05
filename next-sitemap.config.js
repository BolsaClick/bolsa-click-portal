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

// Cidades principais do Brasil
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
  { city: 'Campinas', state: 'SP' },
  { city: 'Goiânia', state: 'GO' },
  { city: 'Manaus', state: 'AM' },
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

module.exports = {
  siteUrl: 'https://www.bolsaclick.com.br',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: [
    '/admin',
    '/login',
    '/checkout/*',    // Wildcard para todas páginas de checkout
    '/favoritos',     // Página privada
    '/curso',         // Redirect page (não indexar)
    '/ajuda',         // Páginas antigas (movidas para central-de-ajuda)
    '/ajuda/*',       // Todas subpáginas de ajuda antigas
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
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
      changefreq: 'daily',  // Mudou de weekly para daily
      priority: 0.95,       // Aumentou de 0.9 para 0.95
      lastmod: new Date().toISOString(),
    })

    paths.push({
      loc: '/pos-graduacao',
      changefreq: 'daily',  // Mudou de weekly para daily
      priority: 0.95,       // Aumentou de 0.9 para 0.95
      lastmod: new Date().toISOString(),
    })
    
    // Gerar URLs para combinações de cursos populares + cidades principais + modalidades
    // Prioridade alta (0.9): cursos mais buscados nas principais cidades
    const topCourses = popularCourses.slice(0, 6) // Top 6 cursos
    const topCities = mainCities.slice(0, 5) // Top 5 cidades
    
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
    
    // Prioridade média (0.8): demais combinações
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
    
    // Prioridade média (0.8): top cursos em todas as cidades
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
    
    // Pós-graduação: Top 10 cursos nas principais cidades
    // Prioridade alta (0.9): Top 5 pós-graduação × Top 5 cidades × 3 modalidades
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
    
    // Prioridade média (0.8): Demais pós-graduação em todas as cidades
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
    
    // Prioridade média (0.8): Top 5 pós-graduação nas demais cidades
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
