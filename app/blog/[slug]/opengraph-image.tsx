import { ImageResponse } from 'next/og'
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
import { getPostBySlug } from './_data/post-lookup'

/**
 * Imagem de compartilhamento de `/blog/[slug]`.
 *
 * Antes: `openGraph.images` apontava pro `post.featuredImage` (upload manual
 * no CMS/Hermes) ou, na ausência dele, pro logo genérico — card sem padrão
 * visual comum entre posts. Esta rota gera um card consistente com o resto
 * do site a partir do título e categoria REAIS do post (Prisma), pro leitor
 * reconhecer o Bolsa Click em qualquer link do blog compartilhado.
 * `post.featuredImage` continua sendo usado no corpo do artigo — só o
 * compartilhamento social/schema muda.
 */
export const runtime = 'nodejs'
export const contentType = OG_CONTENT_TYPE
export const size = OG_SIZE
// Estático (limitação do Next). Título real de cada post vai no `caption` do
// ImageObject em page.tsx, que é dinâmico.
export const alt = 'Artigo do blog Bolsa Click sobre bolsas de estudo, ENEM, vestibular e escolha de carreira'

type Props = { params: Promise<{ slug: string }> }

export default async function OGImage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return new ImageResponse(await OgNotFoundFrame({ label: 'Artigo não encontrado' }), size)
  }

  const logoSrc = await getBolsaClickLogoDataUri()
  const category = post.categories[0]?.title

  // Título grande demais quebra em várias linhas de qualquer jeito — reduz a
  // fonte pra manter no máximo 2 linhas legíveis em miniatura.
  const titleSize = post.title.length > 70 ? 46 : post.title.length > 45 ? 54 : 64

  return new ImageResponse(
    (
      <OgCanvas>
        <OgLogoRow logoSrc={logoSrc} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <OgKicker>{category ? `Blog · ${category}` : 'Blog Bolsa Click'}</OgKicker>
          <div
            style={{
              display: 'flex',
              fontSize: titleSize,
              fontWeight: 700,
              color: '#0B1F3C',
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
            }}
          >
            {post.title}
          </div>
        </div>
        <OgFooterMeta>{`${post.readingTime} min de leitura · bolsaclick.com.br/blog`}</OgFooterMeta>
      </OgCanvas>
    ),
    size,
  )
}
