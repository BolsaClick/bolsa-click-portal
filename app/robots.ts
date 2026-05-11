import { MetadataRoute } from 'next'

const PRIVATE_PATHS = [
  '/admin/',
  '/api/',
  '/checkout/',
  '/login',
  '/cadastro',
  '/minha-conta/',
  '/favoritos',
  '/recuperar-senha',
  '/curso/resultado',
]

export default function robots(): MetadataRoute.Robots {
  const aiCrawlers = ['GPTBot', 'ClaudeBot', 'anthropic-ai', 'PerplexityBot', 'Google-Extended', 'CCBot', 'Bytespider']

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      // Permitir explicitamente crawlers de IA — o site é citável e queremos
      // visibilidade em ChatGPT, Claude, Perplexity e Google AI Overviews.
      ...aiCrawlers.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: PRIVATE_PATHS,
      })),
    ],
    sitemap: 'https://www.bolsaclick.com.br/sitemap.xml',
    host: 'https://www.bolsaclick.com.br',
  }
}
