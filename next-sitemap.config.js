const coursePages = [
  {
    slug: 'direito',
    city: 'São Paulo',
    state: 'SP',
    courseId: '01d29fc8-6e92-4a6e-8edc-848dab59da24',
  },
  {
    slug: 'psicologia',
    city: 'campinas',
    state: 'sp',
    courseId: '05ea2de4-cf8c-4b2d-a3eb-9ab3bb8b94cf',
  },
  {
    slug: 'administracao',
    city: 'ribeiraopreto',
    state: 'sp',
    courseId: 'aaa8f97d-40dc-40c6-b772-2c3068288534',
  },

  {
    slug: 'enfermagem',
    city: 'rio-de-janeiro',
    state: 'rj',
    courseId: '9fd0c921-93b8-400c-82c6-f1a0166402d7',
  },
  {
    slug: 'educacao-fisica',
    city: 'curitiba',
    state: 'pr',
    courseId: '364d1436-ad27-4035-9ba7-dcb503797ed6',
  },
  {
    slug: 'farmacia',
    city: 'belo-horizonte',
    state: 'mg',
    courseId: 'd4f0d30d-75a3-4964-b5dc-028ae835460c',
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
    const paths = coursePages.map(({ slug, city, state, courseId }) => ({
      loc: `/cursos/${slug}?city=${city}&state=${state}&courseId=${courseId}`,
      changefreq: 'weekly',
      priority: 0.8,
    }))
    return paths
  },
}
