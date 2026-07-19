import { readFile, readdir } from 'node:fs/promises'
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

if (baseUrl) {
  const robots = await fetch(`${baseUrl}/robots.txt`)
  if (!robots.ok) fail(`robots.txt respondeu ${robots.status}`)
  const robotsBody = await robots.text()
  const sitemap = await fetch(`${baseUrl}/sitemap.xml`)
  if (!sitemap.ok) fail(`sitemap.xml respondeu ${sitemap.status}`)
  const sitemapBody = await sitemap.text()
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
