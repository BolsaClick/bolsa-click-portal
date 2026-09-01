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
 * Imagem de compartilhamento de `/pos-graduacao`. Mesma lógica de
 * `/graduacao/opengraph-image.tsx`: substitui o fallback estático
 * `og-image-bolsaclick.png` que a página declarava em `openGraph.images`.
 */
export const runtime = 'nodejs'
export const contentType = OG_CONTENT_TYPE
export const size = OG_SIZE
export const alt = `Cursos de pós-graduação com bolsa de estudo de até ${DISCOUNT_CEILING_PCT}% — Especialização e MBA — Bolsa Click`

export default async function OGImage() {
  const [logoSrc, courseCount] = await Promise.all([
    getBolsaClickLogoDataUri(),
    prisma.featuredCourse
      .count({ where: { isActive: true, nivel: 'POS_GRADUACAO' } })
      .catch(() => 0),
  ])

  const countLabel = courseCount > 0 ? `${courseCount}+ cursos · ` : ''

  return new ImageResponse(
    (
      <OgCanvas>
        <OgLogoRow logoSrc={logoSrc} />
        <OgHeading line1="Pós-graduação com bolsa" line2={`de até ${DISCOUNT_CEILING_PCT}%`} size={72} />
        <OgFooterMeta>
          {`${countLabel}Especialização e MBA · EAD ou presencial`}
        </OgFooterMeta>
      </OgCanvas>
    ),
    size,
  )
}
