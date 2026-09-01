import { ImageResponse } from 'next/og'
import { BRAZILIAN_CITIES } from '@/app/lib/constants/brazilian-cities'
import { DISCOUNT_CEILING_PCT } from '@/app/lib/copy/claims'
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
 * Imagem de compartilhamento da página que disputa o head term "bolsas de
 * estudo".
 *
 * Antes desta rota a página não tinha og:image NENHUMA — declarar `openGraph`
 * no metadata substitui o objeto do layout raiz inteiro, então todo
 * compartilhamento em WhatsApp, Facebook e LinkedIn saía sem preview. Numa
 * página cujo gargalo é autoridade e link, isso desperdiça cada divulgação.
 *
 * Gerada por código (e não um PNG estático) para os números acompanharem o
 * catálogo: a contagem de cidades vem da mesma fonte que a página usa, e o
 * percentual vem do teto único de `app/lib/copy/claims.ts`.
 *
 * Convenção de arquivo do Next tem precedência sobre `metadata.openGraph.images`
 * — esta rota é a fonte de verdade da imagem desta página.
 *
 * Layout montado a partir de `app/lib/og/shared.tsx` — referência de padrão
 * visual pra todas as demais imagens OG do site.
 */
export const runtime = 'nodejs' // lê o logo do disco
export const contentType = OG_CONTENT_TYPE
export const size = OG_SIZE
export const alt = `Bolsas de estudo de até ${DISCOUNT_CEILING_PCT}% em faculdades reconhecidas pelo MEC — Bolsa Click`

export default async function OGImage() {
  const logoSrc = await getBolsaClickLogoDataUri()

  return new ImageResponse(
    (
      <OgCanvas>
        <OgLogoRow logoSrc={logoSrc} />
        <OgHeading line1="Bolsas de estudo" line2={`de até ${DISCOUNT_CEILING_PCT}%`} size={88} />
        <OgFooterMeta>
          {`1.000+ cursos · ${BRAZILIAN_CITIES.length} cidades · faculdades reconhecidas pelo MEC`}
        </OgFooterMeta>
      </OgCanvas>
    ),
    size,
  )
}
