module.exports = {
  siteUrl: 'https://www.bolsaclick.com.br',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: [
    '/admin',
    '/login',
    '/checkout',
    '/checkout/success',
    '/buscar-cursos', 
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
    const res = await fetch('https://api.inovit.io/api/core/showCourse')
    const courses = await res.json()

    const paths = []

    for (const course of courses) {
      const slug = course.slug || course.name.toLowerCase().replace(/\s+/g, '-')
      const modalidades = ['presencial', 'distancia', 'semipresencial']

      for (const modalidade of modalidades) {
        for (const unidade of course.units || []) {
          const city = unidade.city.toLowerCase().replace(/\s+/g, '-')
          const state = unidade.state.toLowerCase()
          const cidadeEstado = `${city}-${state}`

          paths.push({
            loc: `/cursos/${slug}/${modalidade}/${cidadeEstado}`,
            changefreq: 'weekly',
            priority: 0.8,
          })
        }
      }
    }

    return paths
  },
}
