/** @type {import('next-sitemap').IConfig} */
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

    const modalities = ['distancia', 'presencial', 'semipresencial']
    const cities = [
      { city: 'São Paulo', state: 'SP' },
      { city: 'Rio de Janeiro', state: 'RJ' },
      { city: 'Belo Horizonte', state: 'MG' },
    ]

    const urls = []

    courses.forEach((course) => {
      modalities.forEach((modality) => {
        cities.forEach(({ city, state }) => {
          urls.push({
            loc: `/cursos?modalidade=${modality}&course=${course.id}&courseName=${encodeURIComponent(
              course.name
            )}&city=${encodeURIComponent(city)}&state=${state}`,
            changefreq: 'weekly',
            priority: 0.7,
          })
        })
      })
    })

    return urls
  },
}
