import { ImageResponse } from 'next/og'
import { DISCOUNT_CEILING_PCT, PARTNER_NETWORKS_LIST, WEDGE_NO_FEE } from '@/app/lib/copy/claims'
import {
  OG_SIZE,
  OG_CONTENT_TYPE,
  OgCanvas,
  OgLogoRow,
  OgHeading,
  OgFooterMeta,
  getBolsaClickLogoDataUri,
} from '@/app/lib/og/shared'

/**
 * Imagem de compartilhamento de `/checkout/matricula`.
 *
 * Limitação real: a página é Client Component (`'use client'`, sem
 * `generateMetadata`) e o que ela mostra — curso, faculdade, preço — vem de
 * query string (`?offerId=...`), não de segmento de rota. `opengraph-image.tsx`
 * só recebe `params` de segmentos dinâmicos, nunca `searchParams`, então não
 * dá pra personalizar esta imagem por oferta pela convenção de arquivo (nem
 * por um `layout.tsx`, que também não recebe `searchParams`). Ver decisão
 * equivalente pra `/curso/resultado` em `app/api/og/resultado/route.tsx`,
 * onde uma Route Handler comum (não a convenção de metadata) resolve o mesmo
 * problema lendo a query diretamente — inviável aqui porque o checkout não
 * expõe esse endpoint sem risco de vazar contexto de PII pela URL da imagem.
 *
 * Troca: em vez do fallback genérico `og-image-bolsaclick.png` do layout
 * raiz, a rota ganha um card de marca dedicado ("Matricule-se com bolsa"),
 * ainda com dado real (rede de faculdades parceiras, teto de desconto).
 * `/checkout/` é `noindex,nofollow` (ver `app/checkout/layout.tsx`) e também
 * está desautorizado no `robots.ts` pra todo crawler — inclusive os de IA —
 * então esta imagem serve só o unfurl social (WhatsApp/Facebook), nunca
 * indexação nem citação por LLM.
 */
export const runtime = 'nodejs'
export const contentType = OG_CONTENT_TYPE
export const size = OG_SIZE
export const alt = `Matricule-se com bolsa de estudo de até ${DISCOUNT_CEILING_PCT}% em ${PARTNER_NETWORKS_LIST} — Bolsa Click`

export default async function OGImage() {
  const logoSrc = await getBolsaClickLogoDataUri()

  return new ImageResponse(
    (
      <OgCanvas>
        <OgLogoRow logoSrc={logoSrc} />
        <OgHeading line1="Matricule-se com" line2={`bolsa de até ${DISCOUNT_CEILING_PCT}%`} size={76} />
        <OgFooterMeta>{WEDGE_NO_FEE}</OgFooterMeta>
      </OgCanvas>
    ),
    size,
  )
}
