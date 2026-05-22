// Sitemap index XML — aponta pros 5 sub-sitemaps. Implementado como Route
// Handler em vez de app/sitemap.ts pra contornar bug do Next 15 onde
// generateSitemaps() não cria automaticamente o index (causou /sitemap.xml
// retornar 404 em produção).

import { NextResponse } from 'next/server'

const SITE_URL = 'https://www.bolsaclick.com.br'

// IDs estáveis sincronizados com app/sitemap/[id]/route.ts.
// Mantenha em paridade — não reordenar (afeta GSC).
const SUB_SITEMAP_IDS = [0, 1, 2, 3, 4] as const

// Revalida a cada 1h — Googlebot bate aqui regularmente.
export const revalidate = 3600

export async function GET() {
  const now = new Date().toISOString()
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SUB_SITEMAP_IDS.map(
  (id) => `  <sitemap>
    <loc>${SITE_URL}/sitemap/${id}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
).join('\n')}
</sitemapindex>
`
  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
