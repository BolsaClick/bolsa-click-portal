import { MetadataRoute } from 'next'
import { seoSite } from './lib/seo/site-config'

const PRIVATE_PATHS = [
  '/admin/',
  '/api/',
  '/checkout/',
  '/login',
  '/cadastro',
  '/minha-conta/',
  '/favoritos',
  '/recuperar-senha',
  // Rotas de preview interno — não são conteúdo público, não devem ser rastreadas.
  '/dev/',
]

// `/api/og/` gera a imagem de compartilhamento de `/curso/resultado` (a
// página mais visitada do site é dirigida por query string, não por
// segmento de rota — não dá pra usar a convenção `opengraph-image.tsx`, que
// não recebe searchParams; ver app/api/og/resultado/route.tsx). Path mais
// específico que '/api/' — pelas regras padrão de robots.txt (Google, e os
// crawlers de IA abaixo seguem a mesma convenção), o `allow` mais específico
// vence o `disallow` genérico, então isso NÃO reabre o resto de `/api/`.
const PUBLIC_IMAGE_PATHS = ['/api/og/']

export default function robots(): MetadataRoute.Robots {
  // OAI-SearchBot = ChatGPT browse/search (≠ GPTBot que é treinamento)
  // Applebot-Extended = Apple Intelligence
  // Meta-ExternalAgent = AI agents da Meta
  // Bingbot incluído pra deixar explícito (já estava em '*' mas redundância protege)
  const aiCrawlers = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User', // ChatGPT quando o usuário pede pra abrir/citar uma URL
    'ClaudeBot',
    'anthropic-ai',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'CCBot',
    'Bytespider',
    'Applebot-Extended',
    'Meta-ExternalAgent',
    'Meta-ExternalFetcher',
    'cohere-ai',
    'Diffbot',
  ]

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', ...PUBLIC_IMAGE_PATHS],
        disallow: PRIVATE_PATHS,
      },
      // Permitir explicitamente crawlers de IA — o site é citável e queremos
      // visibilidade em ChatGPT, Claude, Perplexity e Google AI Overviews.
      ...aiCrawlers.map((userAgent) => ({
        userAgent,
        allow: ['/', ...PUBLIC_IMAGE_PATHS],
        disallow: PRIVATE_PATHS,
      })),
    ],
    // Warmup continua crawlable: o bloqueio de indexação é feito por meta/X-Robots,
    // permitindo QA dos crawlers sem publicar URLs no sitemap.
    sitemap: seoSite.indexingEnabled ? `${seoSite.siteUrl}/sitemap.xml` : undefined,
    host: seoSite.siteUrl,
  }
}
