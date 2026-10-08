import { NextRequest } from 'next/server'
import { ImageResponse } from 'next/og'
import {
  SOCIAL_SIZE,
  getBolsaClickLogoDataUri,
  getMascotDataUri,
} from '@/app/lib/og/shared'
import {
  SOCIAL_SLIDE_KINDS,
  SocialContentSlide,
  SocialCoverSlide,
  SocialCtaSlide,
  SocialErrorSlide,
  type SocialSlideKind,
} from '@/app/lib/og/social'
import {
  buildOfferSlides,
  parseSocialSlides,
  poseForSlide,
  OfferAcimaDoTetoError,
  type SocialSlide,
} from '@/app/lib/social/slides'
import { getShowcaseOffers, type ShowcaseOffer } from '@/app/lib/api/get-showcase-offers'
import { prisma } from '@/app/lib/prisma'
import type { MascotPose } from '@/app/components/v2/mascot/Mascot'

/**
 * Slides de carrossel do Instagram, um por requisição. Dois modos:
 *
 *   AO VIVO  GET /api/og/social/oferta?slide=capa&i=0
 *            Monta a partir do catálogo agora. Serve pra conferir o molde.
 *
 *   DA FILA  GET /api/og/social/oferta?postId=<uuid>&slide=capa
 *            Desenha os slides CONGELADOS daquele `SocialPost`. É o modo que a
 *            tela de aprovação usa: o que o Rodrigo aprova tem que ser
 *            byte-a-byte o que vai pro feed, não uma releitura do catálogo que
 *            pode ter mudado de preço no meio do caminho.
 *
 * `runtime = 'nodejs'` porque logo e mascote são lidos do disco (mesma razão de
 * `app/api/og/resultado`). `force-dynamic` porque no modo ao vivo o preço tem
 * que ser o do catálogo agora: um slide de oferta cacheado na borda é um De/Por
 * velho publicado como se fosse de hoje.
 *
 * DADO REAL OU NADA. Sem oferta, a rota devolve o quadro vermelho de erro com
 * status fora de 2xx, nunca um card plausível com número inventado.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ formato: string }> }

/** Formatos da grade editorial. Só `oferta` tem slides implementados hoje. */
const FORMATOS_IMPLEMENTADOS = ['oferta'] as const

const SLIDE_TOTAL = SOCIAL_SLIDE_KINDS.length

function parseSlide(value: string | null): SocialSlideKind {
  const found = SOCIAL_SLIDE_KINDS.find((kind) => kind === value)
  return found ?? 'capa'
}

function errorImage(title: string, detail: string, status: number) {
  // Imagem (e não JSON) porque o consumo é visual: abrir a URL no navegador
  // tem que mostrar na cara que não há conteúdo publicável. O status fora da
  // faixa 2xx é o que impede um job automático de tratar isto como slide bom.
  return new ImageResponse(<SocialErrorSlide title={title} detail={detail} />, {
    ...SOCIAL_SIZE,
    status,
    headers: { 'X-Social-Og-Error': title },
  })
}

/**
 * Slide congelado → imagem. O `slide.kind` escolhe o molde; nada aqui decide
 * conteúdo, só desenha o que já foi resolvido em `buildOfferSlides`.
 */
function renderSlide(slide: SocialSlide, logoSrc: string, mascotSrc: string, index: number) {
  const comum = { logoSrc, mascotSrc, slideIndex: index + 1, slideTotal: SLIDE_TOTAL }
  if (slide.kind === 'capa') {
    // O molde exige ressalva junto de preço no TIPO, e o schema do banco repete
    // a regra na leitura. Os dois caminhos chegam aqui com o par completo.
    return slide.priceFrom && slide.priceTo && slide.disclaimer ? (
      <SocialCoverSlide
        {...comum}
        kicker={slide.kicker}
        line1={slide.line1}
        locality={slide.locality}
        badge={slide.badge}
        support={slide.support}
        priceFrom={slide.priceFrom}
        priceTo={slide.priceTo}
        priceToSuffix={slide.priceToSuffix}
        disclaimer={slide.disclaimer}
      />
    ) : (
      <SocialCoverSlide
        {...comum}
        kicker={slide.kicker}
        line1={slide.line1}
        locality={slide.locality}
        badge={slide.badge}
        support={slide.support}
      />
    )
  }
  if (slide.kind === 'conteudo') {
    return (
      <SocialContentSlide
        {...comum}
        kicker={slide.kicker}
        heading={slide.heading}
        priceFrom={slide.priceFrom}
        priceTo={slide.priceTo}
        priceToSuffix={slide.priceToSuffix}
        disclaimer={slide.disclaimer}
        rows={slide.rows}
      />
    )
  }
  return (
    <SocialCtaSlide
      {...comum}
      kicker={slide.kicker}
      heading={slide.heading}
      steps={slide.steps}
      cta={slide.cta}
      disclaimer={slide.disclaimer}
    />
  )
}

/** Modo FILA: slides congelados de um SocialPost. */
async function slidesFromQueue(
  postId: string,
): Promise<{ slides: SocialSlide[] } | { error: [string, string, number] }> {
  let post: { slides: unknown } | null
  try {
    post = await prisma.socialPost.findUnique({
      where: { id: postId },
      select: { slides: true },
    })
  } catch (error) {
    // Banco fora do ar, ou a tabela ainda não existe porque a migration não
    // foi aplicada. Sem este catch o erro subia cru e virava 500 do Next: um
    // "erro do servidor" genérico, que num pipeline de conteúdo é pior do que
    // parece, porque não diz se o problema é infraestrutura ou conteúdo
    // impublicável. Mesmo tratamento do catálogo fora do ar.
    console.error('[og social] leitura da fila falhou', postId, error)
    return {
      error: [
        'Fila indisponível',
        'Não deu pra ler esta peça no banco. Se a migration do SocialPost ainda não foi aplicada, a tabela não existe.',
        503,
      ],
    }
  }
  if (!post) {
    return { error: ['Post não existe na fila', `Nenhum SocialPost com id ${postId}.`, 404] }
  }
  try {
    return { slides: parseSocialSlides(post.slides) }
  } catch (error) {
    // Registro corrompido falha aqui, na leitura, e não na frente de quem está
    // aprovando achando que viu a peça inteira.
    console.error('[og social] slides inválidos no post', postId, error)
    return {
      error: [
        'Slides inválidos na fila',
        `O conteúdo gravado deste post não passa na validação (inclusive a regra de preço sem ressalva). Post ${postId}.`,
        422,
      ],
    }
  }
}

/** Modo AO VIVO: monta do catálogo agora. */
async function slidesFromCatalog(
  index: number,
): Promise<{ slides: SocialSlide[] } | { error: [string, string, number] }> {
  let offers: ShowcaseOffer[]
  try {
    offers = await getShowcaseOffers()
  } catch (error) {
    console.error('[og social] getShowcaseOffers falhou:', error)
    return {
      error: [
        'Catálogo não respondeu',
        'A busca de ofertas reais falhou. Nenhum preço é inventado como alternativa: refaça quando a API voltar.',
        503,
      ],
    }
  }

  const offer = offers[index]
  if (!offer) {
    return {
      error: [
        'Sem oferta real agora',
        `O catálogo não devolveu oferta com De/Por honesto no índice ${index} (${offers.length} disponíveis). Slide não gerado.`,
        503,
      ],
    }
  }

  try {
    return { slides: buildOfferSlides(offer) }
  } catch (error) {
    if (error instanceof OfferAcimaDoTetoError) {
      return { error: ['Desconto fora do teto', `${error.message} Slide bloqueado.`, 422] }
    }
    throw error
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { formato } = await context.params
  const { searchParams } = request.nextUrl
  const slideKind = parseSlide(searchParams.get('slide'))
  const postId = searchParams.get('postId')
  const index = Number.parseInt(searchParams.get('i') ?? '0', 10) || 0

  if (!(FORMATOS_IMPLEMENTADOS as readonly string[]).includes(formato)) {
    return errorImage(
      `Formato "${formato}" não existe`,
      `Formatos com slide implementado: ${FORMATOS_IMPLEMENTADOS.join(', ')}.`,
      404,
    )
  }

  const resultado = postId ? await slidesFromQueue(postId) : await slidesFromCatalog(index)
  if ('error' in resultado) return errorImage(...resultado.error)

  const slideIdx = resultado.slides.findIndex((s) => s.kind === slideKind)
  const slide = resultado.slides[slideIdx]
  if (!slide) {
    return errorImage(
      `Slide "${slideKind}" não existe nesta peça`,
      `Este post tem ${resultado.slides.length} slide(s): ${resultado.slides.map((s) => s.kind).join(', ')}.`,
      404,
    )
  }

  const [logoSrc, mascotSrc] = await Promise.all([
    getBolsaClickLogoDataUri(),
    getMascotDataUri((slide.pose as MascotPose) || poseForSlide(slide.kind)),
  ])

  return new ImageResponse(renderSlide(slide, logoSrc, mascotSrc, slideIdx), SOCIAL_SIZE)
}
