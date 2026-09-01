import { ImageResponse } from 'next/og'
import { resolveCanonicalCourseSlug } from '@/app/lib/seo/slug-resolver'
import { courseTypeLabel } from '@/app/lib/courseTypeLabel'
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
import { getCourseBySlug, getCoursePriceRange } from './_data/course-lookup'

/**
 * Imagem de compartilhamento de `/cursos/[slug]`.
 *
 * Antes, a página apontava `openGraph.images` pra `curso.imageUrl` — uma
 * foto de banco de imagem do curso, sem marca nem dado de preço. Esta rota
 * (convenção de arquivo do Next) tem precedência e vira a fonte de verdade;
 * `page.tsx` foi ajustada pra também usar esta URL no twitter:image e no
 * `ImageObject` do schema.org, então os três lugares batem.
 *
 * Nome, tipo e faixa de preço vêm do mesmo par de helpers (`getCourseBySlug`,
 * `getCoursePriceRange`) que `page.tsx` usa pra montar o `<title>`/meta —
 * mesma fonte, mesmo número. Sem oferta com preço, a imagem simplesmente
 * omite a linha de preço (nunca "R$ 0" nem "undefined").
 *
 * `alt` é string estática (exigência do Next: o arquivo é importado uma vez
 * no build, `alt` não pode ser função nem depender de `params`/fetch — mesma
 * limitação de `app/(default)/teste-vocacional/resultado/[shareToken]/opengraph-image.tsx`,
 * que também é 100% dinâmico mas tem `alt` fixo). O texto rico e específico
 * por curso (nome, preço, teto de desconto) vai no `caption` do `ImageObject`
 * em `page.tsx`, que É dinâmico — essa é a peça que buscadores de IA leem.
 */
export const runtime = 'nodejs'
export const contentType = OG_CONTENT_TYPE
export const size = OG_SIZE
export const alt = `Curso com bolsa de estudo de até ${DISCOUNT_CEILING_PCT}% em faculdades reconhecidas pelo MEC — Bolsa Click`

type Props = { params: Promise<{ slug: string }> }

export default async function OGImage({ params }: Props) {
  const { slug } = await params
  let curso = await getCourseBySlug(slug)
  if (!curso) {
    const canonical = await resolveCanonicalCourseSlug(slug)
    if (canonical) curso = await getCourseBySlug(canonical)
  }

  if (!curso) {
    return new ImageResponse(await OgNotFoundFrame({ label: 'Curso não encontrado' }), size)
  }

  const [logoSrc, priceRange] = await Promise.all([
    getBolsaClickLogoDataUri(),
    getCoursePriceRange(curso.apiCourseName, curso.nivel),
  ])

  const nivelLabel = curso.nivel === 'GRADUACAO' ? 'Graduação' : curso.nivel === 'POS_GRADUACAO' ? 'Pós-graduação' : 'Profissionalizante'
  const typeLabel = courseTypeLabel(curso.type)
  const kicker = typeLabel && typeLabel !== curso.type ? `${nivelLabel} · ${typeLabel}` : nivelLabel

  // Nome grande demais quebra o layout de 1 linha — reduz a fonte pra caber
  // sem cortar (satori não faz text-overflow/ellipsis de verdade).
  const headingSize = curso.name.length > 26 ? 58 : curso.name.length > 18 ? 68 : 80

  const priceLabel =
    priceRange.lowPrice > 0
      ? `A partir de R$ ${priceRange.lowPrice.toFixed(0)}/mês · até ${DISCOUNT_CEILING_PCT}% de desconto`
      : `Até ${DISCOUNT_CEILING_PCT}% de desconto · faculdades reconhecidas pelo MEC`

  return new ImageResponse(
    (
      <OgCanvas>
        <OgLogoRow logoSrc={logoSrc} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <OgKicker>{kicker}</OgKicker>
          <OgHeading line1={curso.name} size={headingSize} />
        </div>
        <OgFooterMeta>{priceLabel}</OgFooterMeta>
      </OgCanvas>
    ),
    size,
  )
}
