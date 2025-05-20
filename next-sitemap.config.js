const coursePages = [
  {
    slug: 'direito',
    courseName:'Direito+-+Bacharelado',
    citySlug: 'sao-paulo',
    city: 'São+Paulo',
    state: 'SP',
    courseId: '01d29fc8-6e92-4a6e-8edc-848dab59da24',
    modalidade: 'presencial'
  },
  {
    slug: 'psicologia',
    city: 'Campinas',
    citySlug: 'campinas',
    courseName:'Psicologia+-+Bacharelado',
    state: 'SP',
    courseId: '05ea2de4-cf8c-4b2d-a3eb-9ab3bb8b94cf',
    modalidade: 'presencial'
  },
  {
    slug: 'administracao',
    citySlug: 'ribeirao-preto',
    city: 'Ribeirão+Preto',
    state: 'SP',
    courseName:'Administração+-+Bacharelado',
    courseId: 'aaa8f97d-40dc-40c6-b772-2c3068288534',
    modalidade: 'distancia'

  },

  {
    slug: 'enfermagem',
    city: 'Rio+de+Janeiro',
    citySlug: 'rio-de-janeiro',
    courseName:'Enfermagem+-+Bacharelado',
    state: 'RJ',
    courseId: '9fd0c921-93b8-400c-82c6-f1a0166402d7',
    modalidade: 'presencial'

  },
  {
    slug: 'educacao-fisica',
    citySlug: 'curitiba',
    courseName:'Educação+Física+-+Bacharelado',
    city: 'Curitiba',
    state: 'PR',
    courseId: '364d1436-ad27-4035-9ba7-dcb503797ed6',
    modalidade: 'distancia'

  },
  {
    slug: 'farmacia',
    citySlug: 'belo-horizonte',
    city: 'Belo+Horizonte',
    courseName:'Farmácia+-+Bacharelado',
    state: 'MG',
    courseId: 'd4f0d30d-75a3-4964-b5dc-028ae835460c',
    modalidade: 'distancia'

  },
]

module.exports = {
  siteUrl: 'https://www.bolsaclick.com.br',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/admin', '/login', '/checkout', '/checkout/success'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
  additionalPaths: async () => {
    const paths = coursePages.map(({ slug, citySlug, city, state, courseId, modalidade, courseName }) => ({
      loc: `/cursos/resultado/${modalidade}/${slug}/${citySlug}?courseId=${courseId}&city=${city}&state=${state}&courseName=${courseName}`,
      changefreq: 'weekly',
      priority: 0.8,
    }))
    return paths
  },
}
