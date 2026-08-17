// Sitemap index XML — aponta pros 5 sub-sitemaps. Implementado como Route
// Handler em vez de app/sitemap.ts pra contornar bug do Next 15 onde
// generateSitemaps() não cria automaticamente o index (causou /sitemap.xml
// retornar 404 em produção).

import { NextRequest, NextResponse } from 'next/server'
import { seoSite } from '@/app/lib/seo/site-config'
import { PARTNERS, isIndexable } from '@/app/lp/_shared/partners'

const SITE_URL = seoSite.siteUrl
const BUILD_TIME = new Date().toISOString()

// IDs estáveis sincronizados com app/sitemap/[id]/route.ts.
// Mantenha em paridade — não reordenar (afeta GSC).
const SUB_SITEMAP_IDS = [0, 1, 2, 3, 4] as const

// Revalida a cada 1h — Googlebot bate aqui regularmente.
export const revalidate = 3600

/**
 * Sitemap do ingressa.digital — deploy Railway SEPARADO deste mesmo repo,
 * roteado por host no middleware (`ingressa.digital/{parceiro}` → `/lp/{parceiro}`;
 * `/sitemap.xml` é passthrough, cai aqui). Ramo isolado, host-aware: não reusa
 * o sitemap index de 5 sub-sitemaps do bolsaclick.com.br (que é sobre OUTRAS
 * páginas, em outro domínio) — só lista as landings de marca indexáveis
 * (hoje só /estacio; ver PARTNER_INDEXABLE em app/lp/_shared/partners.ts).
 * Hardcode do domínio de propósito: este ramo só roda quando o host JÁ é
 * ingressa.digital, então não depende de NEXT_PUBLIC_SITE_URL estar setado
 * corretamente pro build.
 */
function ingressaSitemap(): NextResponse {
  const base = 'https://ingressa.digital'
  const urls = PARTNERS.filter(isIndexable)
    .map(
      (partner) => `  <url>
    <loc>${base}/${partner}</loc>
    <lastmod>${BUILD_TIME}</lastmod>
    <changefreq>daily</changefreq>
  </url>`
    )
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

export async function GET(request: NextRequest) {
  const host = (request.headers.get('host') || '').split(':')[0]
  if (host === 'ingressa.digital' || host === 'www.ingressa.digital') {
    return ingressaSitemap()
  }

  if (!seoSite.indexingEnabled) {
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" />\n', {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, follow',
      },
    })
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SUB_SITEMAP_IDS.map(
  (id) => `  <sitemap>
    <loc>${SITE_URL}/sitemap/${id}.xml</loc>
    <lastmod>${BUILD_TIME}</lastmod>
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
