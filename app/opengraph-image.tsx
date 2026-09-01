import { ImageResponse } from 'next/og'
import { prisma } from '@/app/lib/prisma'
import { DISCOUNT_CEILING_PCT, PARTNER_NETWORKS_LIST } from '@/app/lib/copy/claims'
import { BRAZILIAN_CITIES } from '@/app/lib/constants/brazilian-cities'
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
 * Imagem de compartilhamento da home — hub de marca do domínio. Sem arquivo
 * próprio, a home caía no `og-image-bolsaclick.png` estático do layout raiz
 * (mesmo PNG genérico usado por qualquer página sem `opengraph-image.tsx`
 * nem `openGraph.images` próprios).
 *
 * A contagem de cursos ativos vem do catálogo (Prisma) — nunca um número
 * arredondado de marketing. Nomes de rede vêm de `PARTNER_NETWORKS_LIST`
 * (mesma lista usada no resto do site) e o teto de desconto vem de
 * `DISCOUNT_CEILING_PCT`.
 */
export const runtime = 'nodejs'
export const contentType = OG_CONTENT_TYPE
export const size = OG_SIZE
export const alt = `Bolsa de estudo de até ${DISCOUNT_CEILING_PCT}% em ${PARTNER_NETWORKS_LIST} — Bolsa Click`

export default async function OGImage() {
  const [logoSrc, activeCourseCount] = await Promise.all([
    getBolsaClickLogoDataUri(),
    prisma.featuredCourse.count({ where: { isActive: true } }).catch(() => 0),
  ])

  const courseCountLabel = activeCourseCount > 0 ? `${activeCourseCount}+ cursos · ` : ''

  return new ImageResponse(
    (
      <OgCanvas>
        <OgLogoRow logoSrc={logoSrc} />
        <OgHeading line1="Bolsa de estudo nas" line2="maiores redes do Brasil" size={72} />
        <OgFooterMeta>
          {`${courseCountLabel}${BRAZILIAN_CITIES.length} cidades · até ${DISCOUNT_CEILING_PCT}% de desconto`}
        </OgFooterMeta>
      </OgCanvas>
    ),
    size,
  )
}
