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
    const res = await fetch('https://api.inovit.io/api/core/showCourse')
    const courses = await res.json()

    return courses.map((course) => ({
      loc: `/buscar-cursos?q=${encodeURIComponent(course.name)}`,
      changefreq: 'weekly',
      priority: 0.8,
    }))
  },
}