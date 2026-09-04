import { ImageResponse } from 'next/og'
import { resolveCanonicalCourseSlug } from '@/app/lib/seo/slug-resolver'
import { getCityBySlug } from '@/app/lib/constants/brazilian-cities'
import { DISCOUNT_CEILING_PCT } from '@/app/lib/copy/claims'
import {
  OG_SIZE,
  OG_CONTENT_TYPE,
  OgCanvas,
  OgLogoRow,
  OgKicker,
  OgHeading,
  OgFooterMeta,
  OgNotFoundFrame,
  getBolsaClickLogoDataUri,
} from '@/app/lib/og/shared'
import { getCourseBySlug } from '../_data/course-lookup'
import { getCityCourseOffers, priceRangeFromOffers } from './_data/city-offers'

/**
 * Imagem de compartilhamento de `/cursos/[slug]/[city]` — a maior família de
 * rotas do site (curso × cidade). Antes caía na mesma foto genérica de
 * `curso.imageUrl` usada em `/cursos/[slug]`, sem menção à cidade.
 *
 * Reaproveita os helpers de `../../page.tsx` (curso, ofertas locais com cache
 * de 10min, faixa de preço) — mesmos números que a própria página mostra.
 */
export const runtime = 'nodejs'
export const contentType = OG_CONTENT_TYPE
export const size = OG_SIZE
// Estático (limitação do Next: `alt` não pode ser função) — texto rico e
// dinâmico por curso/cidade vai no `caption` do ImageObject em page.tsx.
export const alt = `Bolsa de estudo de até ${DISCOUNT_CEILING_PCT}% em faculdades reconhecidas pelo MEC — Bolsa Click`

type Props = { params: Promise<{ slug: string; city: string }> }

export default async function OGImage({ params }: Props) {
  const { slug, city: citySlug } = await params
  let curso = await getCourseBySlug(slug)
  if (!curso) {
    const canonical = await resolveCanonicalCourseSlug(slug)
    if (canonical) curso = await getCourseBySlug(canonical)
  }
  const cityData = getCityBySlug(citySlug)

  if (!curso || !cityData) {
    return new ImageResponse(await OgNotFoundFrame({ label: 'Página não encontrada' }), size)
  }

  const [logoSrc, { offers }] = await Promise.all([
    getBolsaClickLogoDataUri(),
    getCityCourseOffers(curso.apiCourseName, cityData.name, cityData.state, curso.nivel),
  ])
  const priceRange = priceRangeFromOffers(offers)

  const nivelLabel = curso.nivel === 'GRADUACAO' ? 'Graduação' : curso.nivel === 'POS_GRADUACAO' ? 'Pós-graduação' : 'Profissionalizante'
  const headingSize = curso.name.length > 22 ? 54 : curso.name.length > 14 ? 62 : 72

  const priceLabel =
    priceRange.lowPrice > 0
      ? `A partir de R$ ${priceRange.lowPrice.toFixed(0)}/mês · até ${DISCOUNT_CEILING_PCT}% de desconto`
      : `Até ${DISCOUNT_CEILING_PCT}% de desconto · faculdades reconhecidas pelo MEC`

  return new ImageResponse(
    (
      <OgCanvas>
        <OgLogoRow logoSrc={logoSrc} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <OgKicker>{nivelLabel}</OgKicker>
          <OgHeading line1={curso.name} line2={`em ${cityData.name}-${cityData.state}`} size={headingSize} />
        </div>
        <OgFooterMeta>{priceLabel}</OgFooterMeta>
      </OgCanvas>
    ),
    size,
  )
}
