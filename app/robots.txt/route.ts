// robots.txt — Route Handler, não `app/robots.ts` (Metadata API).
//
// A convenção de metadados do Next só sabe emitir User-agent/Allow/Disallow/
// Crawl-delay/Sitemap/Host; não tem ponto de extensão para diretivas novas.
// O `Content-Signal` (contentsignals.org) precisa sair no arquivo, então o
// robots passou a ser gerado aqui. O conteúdo é o mesmo de antes — mesmas
// regras privadas, mesma exceção de /api/og/, mesmo comportamento de warmup —
// mais o content signal, a lista ampliada de crawlers de IA e o bloqueio dos
// crawlers de backlink que só consomem banda.

import { NextResponse } from 'next/server'
import { seoSite } from '@/app/lib/seo/site-config'

export const revalidate = 3600

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

// Content Signals (contentsignals.org): declaração de preferência de uso do
// conteúdo, não controle de acesso. Os três sinais são `yes` de propósito e
// isso é coerente com a whitelist abaixo — inclusive `ai-train=yes`, já que
// liberamos GPTBot e CCBot, que são crawlers de treinamento. Declarar
// `ai-train=no` enquanto se libera GPTBot seria contradição no mesmo arquivo.
//
// Por que `yes` nos três: para um marketplace de bolsas, ser citado por
// ChatGPT/Claude/Perplexity é canal de aquisição, e estar no corpus de
// treinamento é recall de marca. O custo de tráfego é o mesmo que já pagamos.
const CONTENT_SIGNAL = 'Content-Signal: search=yes, ai-input=yes, ai-train=yes'

// Crawlers de IA liberados explicitamente — busca generativa é canal de
// primeira classe aqui, não efeito colateral do SEO. A lista cobre busca
// (OAI-SearchBot, PerplexityBot, Claude-SearchBot), fetch disparado pelo
// usuário (ChatGPT-User, Claude-User, Perplexity-User) e treinamento
// (GPTBot, CCBot, Google-Extended, Applebot-Extended, Ai2Bot).
//
// Liberar um user-agent que não existe é no-op; o risco da lista longa é
// zero. O risco de lista curta é um crawler novo cair no grupo '*' — que
// também libera tudo hoje, mas perde o sinal explícito que estes grupos dão.
const AI_CRAWLERS = [
  // OpenAI
  'GPTBot', // treinamento
  'OAI-SearchBot', // índice do ChatGPT Search
  'ChatGPT-User', // usuário pede pra abrir/citar uma URL
  // Anthropic
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  // Perplexity
  'PerplexityBot',
  'Perplexity-User',
  // Google (Gemini, AI Overviews, Vertex)
  'Google-Extended',
  'GoogleOther',
  'Google-CloudVertexBot',
  // Apple
  'Applebot',
  'Applebot-Extended', // Apple Intelligence
  // Amazon
  'Amazonbot',
  // Meta
  'Meta-ExternalAgent',
  'Meta-ExternalFetcher',
  'FacebookBot',
  // ByteDance
  'Bytespider',
  'TikTokSpider',
  // Common Crawl — alimenta praticamente todo corpus aberto
  'CCBot',
  // Cohere
  'cohere-ai',
  'cohere-training-data-crawler',
  // Mistral
  'MistralAI-User',
  // Assistentes e buscas menores
  'DuckAssistBot',
  'YouBot',
  'LinerBot',
  'iaskspider/2.0',
  'PanguBot',
  // Datasets e infra de agente
  'AI2Bot',
  'Ai2Bot-Dolma',
  'ImagesiftBot',
  'omgilibot',
  'Webzio-Extended',
  'Timpibot',
  'FirecrawlAgent',
  'Diffbot',
]

// Crawlers de índice de backlink. Não mandam visita, não citam, não aparecem
// em lugar nenhum do funil — só consomem banda e expõem nosso perfil de link
// pra quem paga a assinatura deles.
//
// Ahrefs e Semrush ficam de FORA deste bloqueio de propósito: são as
// ferramentas que o time usa pra auditar o próprio site, e bloquear o crawler
// cega a auditoria. Se um dia o time trocar de ferramenta, revisar aqui.
const BLOCKED_SEO_CRAWLERS = [
  'DotBot', // Moz
  'BLEXBot', // WebMeUp
  'MJ12bot', // Majestic
  'MegaIndex.ru',
  'megaindex.com',
  'SEOkicks',
  'Barkrowler', // Babbar
]

function group(userAgent: string, { contentSignal }: { contentSignal: boolean }): string {
  const lines = [`User-agent: ${userAgent}`]
  if (contentSignal) lines.push(CONTENT_SIGNAL)
  for (const path of ['/', ...PUBLIC_IMAGE_PATHS]) lines.push(`Allow: ${path}`)
  for (const path of PRIVATE_PATHS) lines.push(`Disallow: ${path}`)
  return lines.join('\n')
}

export function GET() {
  const blocks: string[] = []

  blocks.push(
    [
      '# Ao acessar este site, você concorda com os sinais de uso de conteúdo',
      '# declarados abaixo (contentsignals.org). search = indexar e mostrar em',
      '# resultado de busca; ai-input = usar como fonte viva de resposta de IA;',
      '# ai-train = usar para treinar modelo. Os três estão liberados.',
    ].join('\n'),
  )

  // O grupo '*' não é lido por quem casa com um grupo específico — por isso o
  // Content-Signal se repete em cada grupo de IA abaixo em vez de ficar só
  // aqui. Diretiva desconhecida é ignorada sem erro por qualquer parser.
  blocks.push(group('*', { contentSignal: true }))

  for (const userAgent of AI_CRAWLERS) {
    blocks.push(group(userAgent, { contentSignal: true }))
  }

  for (const userAgent of BLOCKED_SEO_CRAWLERS) {
    blocks.push(`User-agent: ${userAgent}\nDisallow: /`)
  }

  const trailer = []
  // Warmup continua crawlable: o bloqueio de indexação é feito por meta/X-Robots,
  // permitindo QA dos crawlers sem publicar URLs no sitemap.
  if (seoSite.indexingEnabled) trailer.push(`Sitemap: ${seoSite.siteUrl}/sitemap.xml`)
  trailer.push(`Host: ${seoSite.siteUrl}`)
  blocks.push(trailer.join('\n'))

  return new NextResponse(blocks.join('\n\n') + '\n', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
