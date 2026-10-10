import { readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

const baseUrl = (process.env.SEO_AUDIT_BASE_URL || '').replace(/\/+$/, '')
const target = process.env.NEXT_PUBLIC_THEME || 'bolsaclick'
const forbidden = (process.env.SEO_FORBIDDEN_PUBLIC_TERMS || '')
  .split(',').map((v) => v.trim()).filter(Boolean)
const needles = forbidden
const legacyPublic = target === 'bolsamais' ? ['bolsaclick.com.br', 'Bolsa Click'] : []
let failures = 0

function fail(message) {
  failures += 1
  console.error(`SEO AUDIT: ${message}`)
}

async function walk(dir) {
  const output = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', '.next', '.maestri'].includes(entry.name)) continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) output.push(...await walk(path))
    else output.push(path)
  }
  return output
}

// Conteúdo fonte publicável: dados editoriais e páginas. O catálogo de termos
// é privado via secret de CI; os termos nunca são impressos no log.
for (const path of await walk(process.cwd())) {
  if (!['.ts', '.tsx', '.json', '.md'].includes(extname(path))) continue
  const rel = relative(process.cwd(), path)
  if (!/^(app|public|scripts\/(?:_seeds|enrichment-data))/.test(rel)) continue
  const content = await readFile(path, 'utf8')
  for (const needle of needles) {
    if (needle && content.toLocaleLowerCase('pt-BR').includes(needle.toLocaleLowerCase('pt-BR'))) {
      fail(`${rel} contém termo público incompatível com a marca alvo`)
      break
    }
  }
}

// ---------------------------------------------------------------------------
// Trava do sitemap/robots dinâmicos.
//
// A fonte de verdade é o App Router: app/robots.txt/route.ts,
// app/sitemap.xml/route.ts e
// app/sitemap/[id]/route.ts. O gerador estático next-sitemap foi aposentado na
// migração (commit 5d68fc6), mas o next-sitemap.config.js ficou para trás e
// divergiu em silêncio: emitia /faculdades/[slug]/[city] (rota legada, hoje um
// redirect) e slugs de curso sem o sufixo canônico.
//
// O modo de falha grave não é o config em si, é o que acontece se alguém rodar
// o gerador: ele escreve public/robots.txt e public/sitemap.xml, e arquivo
// estático em public/ TEM PRECEDÊNCIA sobre rota do App Router no Next. O site
// perderia em silêncio os blocos de crawler de IA e o Content-Signal do
// robots, e trocaria um
// sitemap de ~12k URLs por um errado, sem nenhum erro de build pra avisar.
//
// Este bloco falha o PR se qualquer peça dessa armadilha voltar.
const staticOverrides = ['public/robots.txt', 'public/sitemap.xml', 'public/sitemap-0.xml']
for (const rel of staticOverrides) {
  if (existsSync(join(process.cwd(), rel))) {
    fail(rel + ' existe e sombreia a rota dinâmica do App Router; remova o arquivo estático')
  }
}
if (existsSync(join(process.cwd(), 'next-sitemap.config.js'))) {
  fail('next-sitemap.config.js voltou; o sitemap vive em app/sitemap/[id]/route.ts, não reative o gerador estático')
}
{
  const pkg = JSON.parse(await readFile(join(process.cwd(), 'package.json'), 'utf8'))
  if (pkg.dependencies?.['next-sitemap'] || pkg.devDependencies?.['next-sitemap']) {
    fail('next-sitemap voltou às dependencies; o gerador estático foi aposentado, use as rotas do App Router')
  }
  if (Object.values(pkg.scripts ?? {}).some((cmd) => String(cmd).includes('next-sitemap'))) {
    fail('há script npm chamando next-sitemap; sobrescreveria o robots.txt e o sitemap.xml dinâmicos')
  }
}

if (baseUrl) {
  const robots = await fetch(`${baseUrl}/robots.txt`)
  if (!robots.ok) fail(`robots.txt respondeu ${robots.status}`)
  const robotsBody = await robots.text()
  const sitemap = await fetch(`${baseUrl}/sitemap.xml`)
  if (!sitemap.ok) fail(`sitemap.xml respondeu ${sitemap.status}`)
  const sitemapBody = await sitemap.text()
  // Content Signals (contentsignals.org) — declaração de preferência de uso
  // do conteúdo por IA. Mora em app/robots.txt/route.ts; se alguém reverter o
  // robots pra Metadata API do Next, a diretiva some sem erro de build.
  if (!/^Content-Signal:/m.test(robotsBody)) {
    fail('robots.txt perdeu a diretiva Content-Signal')
  }
  // Crawler de IA liberado nominalmente é canal de aquisição, não detalhe.
  for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'OAI-SearchBot', 'CCBot']) {
    if (!new RegExp('^User-agent: ' + bot + '$', 'mi').test(robotsBody)) {
      fail(`robots.txt não libera ${bot} nominalmente`)
    }
  }
  if (process.env.NEXT_PUBLIC_SEO_INDEXING_ENABLED !== 'true') {
    if (/<loc>/i.test(sitemapBody)) fail('warmup expõe URLs no sitemap')
  } else if (!robotsBody.includes(`${baseUrl}/sitemap.xml`)) {
    fail('robots.txt não anuncia o sitemap do próprio domínio')
  }
  if (new RegExp('https?://(?!' + new URL(baseUrl).host.replaceAll('.', '\\.') + ')', 'i').test(sitemapBody)) {
    fail('sitemap contém URL de outro domínio')
  }
  const sampleUrls = [...sitemapBody.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => match[1]).slice(0, 50)
  for (const url of sampleUrls) {
    const response = await fetch(url, { redirect: 'follow' })
    const html = await response.text()
    if (!response.ok) fail(`${new URL(url).pathname} respondeu ${response.status}`)
    if (legacyPublic.some((needle) => html.toLocaleLowerCase('pt-BR').includes(needle.toLocaleLowerCase('pt-BR')))) {
      fail(`${new URL(url).pathname} contém identidade de outra marca`)
    }
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1]
    if (canonical && new URL(canonical).host !== new URL(baseUrl).host) {
      fail(`${new URL(url).pathname} canoniza para outro domínio`)
    }
  }
}

if (failures) process.exit(1)
console.log('SEO AUDIT: aprovado')
