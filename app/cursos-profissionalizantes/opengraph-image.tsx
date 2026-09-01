import { ImageResponse } from 'next/og'
import { prisma } from '@/app/lib/prisma'
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
 * Imagem de compartilhamento de `/cursos-profissionalizantes`. A página não
 * declarava `openGraph.images` nenhuma — herdava o fallback estático
 * `og-image-bolsaclick.png` do layout raiz.
 *
 * Sem `DISCOUNT_CEILING_PCT` aqui de propósito: o teto de 78% em
 * `app/lib/copy/claims.ts` está ancorado numa oferta de graduação, e a
 * própria página não faz claim de percentual para profissionalizantes — só
 * "bolsa de estudo e desconto". Mantemos a mesma restrição na imagem.
 */
export const runtime = 'nodejs'
export const contentType = OG_CONTENT_TYPE
export const size = OG_SIZE
export const alt = 'Cursos profissionalizantes com bolsa de estudo — Bolsa Click'

export default async function OGImage() {
  const [logoSrc, courseCount] = await Promise.all([
    getBolsaClickLogoDataUri(),
    prisma.featuredCourse
      .count({ where: { isActive: true, nivel: 'CURSO_PROFISSIONALIZANTE' } })
      .catch(() => 0),
  ])

  const countLabel = courseCount > 0 ? `${courseCount}+ cursos · ` : ''

  return new ImageResponse(
    (
      <OgCanvas>
        <OgLogoRow logoSrc={logoSrc} />
        <OgHeading line1="Cursos profissionalizantes" line2="com bolsa de estudo" size={62} />
        <OgFooterMeta>
          {`${countLabel}foco prático · qualificação rápida pro mercado de trabalho`}
        </OgFooterMeta>
      </OgCanvas>
    ),
    size,
  )
}
