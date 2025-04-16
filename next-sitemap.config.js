/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.bolsaclick.com.br',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/admin', '/login'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
}
