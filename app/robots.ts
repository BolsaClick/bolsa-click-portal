import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout/', '/login', '/cadastro', '/minha-conta'],
      },
    ],
    sitemap: 'https://www.bolsaclick.com.br/sitemap.xml',
    host: 'https://www.bolsaclick.com.br',
  }
}
