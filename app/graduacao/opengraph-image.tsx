import { ImageResponse } from 'next/og'
import { prisma } from '@/app/lib/prisma'
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
 * Imagem de compartilhamento de `/graduacao`. Antes caía no fallback estático
 * `og-image-bolsaclick.png` declarado em `openGraph.images` da própria página
 * — este arquivo tem precedência e passa a ser a fonte de verdade.
 */
export const runtime = 'nodejs'
export const contentType = OG_CONTENT_TYPE
export const size = OG_SIZE
export const alt = `Cursos de graduação com bolsa de estudo de até ${DISCOUNT_CEILING_PCT}% — Bacharelado, Licenciatura e Tecnólogo — Bolsa Click`

export default async function OGImage() {
  const [logoSrc, courseCount] = await Promise.all([
    getBolsaClickLogoDataUri(),
    prisma.featuredCourse
      .count({ where: { isActive: true, nivel: 'GRADUACAO' } })
      .catch(() => 0),
  ])

  const countLabel = courseCount > 0 ? `${courseCount}+ cursos · ` : ''

  return new ImageResponse(
    (
      <OgCanvas>
        <OgLogoRow logoSrc={logoSrc} />
        <OgHeading line1="Graduação com bolsa" line2={`de até ${DISCOUNT_CEILING_PCT}%`} size={80} />
        <OgFooterMeta>
          {`${countLabel}Bacharelado, Licenciatura e Tecnólogo · EAD ou presencial`}
        </OgFooterMeta>
      </OgCanvas>
    ),
    size,
  )
}
