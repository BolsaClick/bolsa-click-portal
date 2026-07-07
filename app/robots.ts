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
]

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
