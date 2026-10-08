import { z } from 'zod'
import type { ShowcaseOffer } from '@/app/lib/api/get-showcase-offers'
import { formatBRL } from '@/app/components/v2/course-offer'
import { DISCOUNT_CEILING_PCT, WEDGE_NO_FEE } from '@/app/lib/copy/claims'
import type { MascotPose } from '@/app/components/v2/mascot/Mascot'

/**
 * Conteúdo CONGELADO de um carrossel.
 *
 * O `SocialPost.slides` do banco guarda exatamente estas estruturas: texto e
 * preço já resolvidos, não uma referência pro catálogo ao vivo. É o que faz a
 * aprovação valer alguma coisa — se a prévia relesse o preço na hora de
 * exibir, o Rodrigo aprovaria um valor e publicaria outro.
 *
 * Como `Json` do Prisma não tem tipo, tudo que sai do banco passa por
 * `parseSocialSlides` antes de virar imagem. Um registro corrompido falha na
 * leitura, não na frente de quem está aprovando.
 */

/**
 * Ressalva curta — todo slide que imprime R$ carrega a sua, porque qualquer
 * slide pode ser printado e circular sozinho, fora do carrossel que o
 * explicava. Deliberadamente sem o "cadastro grátis": aquilo é argumento de
 * venda e vive no slide de CTA.
 */
export const RESSALVA_PRECO = 'Valor confirmado pela instituição no ato da inscrição.'

const dataRowSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  strike: z.boolean().optional(),
})

const capaSchema = z.object({
  kind: z.literal('capa'),
  pose: z.string().min(1),
  kicker: z.string().min(1),
  line1: z.string().min(1),
  locality: z.string().optional(),
  badge: z.string().optional(),
  support: z.string().optional(),
  priceFrom: z.string().optional(),
  priceTo: z.string().optional(),
  priceToSuffix: z.string().optional(),
  disclaimer: z.string().optional(),
})

const conteudoSchema = z.object({
  kind: z.literal('conteudo'),
  pose: z.string().min(1),
  kicker: z.string().min(1),
  heading: z.string().min(1),
  priceFrom: z.string().min(1),
  priceTo: z.string().min(1),
  priceToSuffix: z.string().optional(),
  disclaimer: z.string().min(1),
  rows: z.array(dataRowSchema),
})

const ctaSchema = z.object({
  kind: z.literal('cta'),
  pose: z.string().min(1),
  kicker: z.string().min(1),
  heading: z.string().min(1),
  steps: z.array(z.string().min(1)).min(1),
  cta: z.string().min(1),
  disclaimer: z.string().optional(),
})

const slideSchema = z.discriminatedUnion('kind', [capaSchema, conteudoSchema, ctaSchema])

/**
 * A mesma regra que o TypeScript impõe nos componentes, repetida aqui porque
 * JSON vindo do banco não passa pelo compilador. Preço sem ressalva não
 * renderiza, venha de onde vier.
 */
export const socialSlidesSchema = z.array(slideSchema).min(1).superRefine((slides, ctx) => {
  slides.forEach((slide, i) => {
    const temPreco =
      ('priceTo' in slide && Boolean(slide.priceTo)) ||
      ('priceFrom' in slide && Boolean(slide.priceFrom))
    const temRessalva = 'disclaimer' in slide && Boolean(slide.disclaimer)
    if (temPreco && !temRessalva) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [i, 'disclaimer'],
        message: `slide ${i} (${slide.kind}) imprime preço sem ressalva`,
      })
    }
  })
})

export type SocialSlide = z.infer<typeof slideSchema>
export type SocialSlideCapa = z.infer<typeof capaSchema>
export type SocialSlideConteudo = z.infer<typeof conteudoSchema>
export type SocialSlideCta = z.infer<typeof ctaSchema>

/** Lê `SocialPost.slides` do banco. Lança se o registro não for publicável. */
export function parseSocialSlides(raw: unknown): SocialSlide[] {
  return socialSlidesSchema.parse(raw)
}

/** Pose do Bob por slide — mapa pose→contexto em docs/MASCOTES.md. */
const POSE_POR_SLIDE: Record<SocialSlide['kind'], MascotPose> = {
  capa: 'apontando', // direciona atenção ao card
  conteudo: 'explicando', // leitura de dado, "como funciona"
  cta: 'joinha', // aprovação, fecha o carrossel
}

export function poseForSlide(kind: SocialSlide['kind']): MascotPose {
  return POSE_POR_SLIDE[kind]
}

/** Chave de rotação: identifica o slot do catálogo que gerou a peça. */
export function sourceRefForOffer(offer: ShowcaseOffer): string {
  return `${offer.course}|${offer.city}|${offer.uf}`
}

export class OfferAcimaDoTetoError extends Error {
  constructor(public readonly discountPct: number) {
    super(
      `Oferta com ${discountPct}% de desconto e o teto publicável é ${DISCOUNT_CEILING_PCT}%.`,
    )
    this.name = 'OfferAcimaDoTetoError'
  }
}

const MODALIDADE_LABEL: Record<ShowcaseOffer['modality'], string> = {
  EAD: 'EAD',
  PRESENCIAL: 'Presencial',
  SEMIPRESENCIAL: 'Semipresencial',
}

/**
 * Único lugar que transforma uma oferta do catálogo em slides.
 *
 * Prévia ao vivo, geração da fila e publicação chamam todos esta função, então
 * não existe caminho em que o que foi aprovado e o que foi publicado divirjam
 * por copy duplicada em dois lugares.
 */
export function buildOfferSlides(offer: ShowcaseOffer): SocialSlide[] {
  // Trava redundante: `getShowcaseOffers` já descarta acima do teto, mas aqui
  // o número vira peça pública e fica CONGELADO no banco. Se o teto mudar ou o
  // filtro de cima regredir, a geração falha em vez de gravar um percentual
  // proibido que ninguém revisa de novo. Ver o lock em claims.ts.
  if (offer.discountPct <= 0 || offer.discountPct > DISCOUNT_CEILING_PCT) {
    throw new OfferAcimaDoTetoError(offer.discountPct)
  }

  const local = `${offer.city}-${offer.uf}`
  const modalidade = MODALIDADE_LABEL[offer.modality]
  const kicker = 'Oferta da semana'
  const priceFrom = formatBRL(offer.originalPrice)
  const priceTo = formatBRL(offer.finalPrice)

  // Os três slots de `CURSOS_FEATURED_SLOTS` são todos GRADUACAO, onde o preço
  // do catálogo é mensalidade recorrente. Se entrar slot de pós ou
  // profissionalizante, o valor passa a ser o TOTAL parcelado e este sufixo
  // vira mentira: ver `isTotalPriceLevel` em app/components/v2/course-offer.ts.
  const priceToSuffix = '/mês'

  return [
    {
      kind: 'capa',
      pose: POSE_POR_SLIDE.capa,
      kicker,
      // Hierarquia em três tempos: o curso é o que a pessoa procura, o preço é
      // o que convence, a cidade qualifica.
      line1: offer.course,
      locality: local,
      badge: `-${offer.discountPct}%`,
      support: `${offer.institution}, ${modalidade}`,
      priceFrom,
      priceTo,
      priceToSuffix,
      disclaimer: RESSALVA_PRECO,
    },
    {
      kind: 'conteudo',
      pose: POSE_POR_SLIDE.conteudo,
      kicker,
      // Só o nome do curso: "Pedagogia em Belo Horizonte-MG" quebrava a linha
      // no hífen da UF. A cidade aparece inteira na lista de dados.
      heading: offer.course,
      priceFrom,
      priceTo,
      priceToSuffix,
      disclaimer: RESSALVA_PRECO,
      rows: [
        { label: 'Instituição', value: offer.institution },
        { label: 'Cidade', value: local },
        { label: 'Modalidade', value: modalidade },
        { label: 'Desconto', value: `${offer.discountPct}% na mensalidade` },
      ],
    },
    {
      kind: 'cta',
      pose: POSE_POR_SLIDE.cta,
      kicker,
      heading: 'Quer ver se tem na sua cidade?',
      steps: [
        'Busque o seu curso no site',
        'Compare o preço com bolsa na sua cidade',
        'Faça a inscrição pela plataforma',
      ],
      cta: 'Link na bio',
      disclaimer: `${WEDGE_NO_FEE}. Valor e vagas confirmados pela instituição no ato da inscrição.`,
    },
  ]
}

/**
 * Link com UTM. É o que liga um post do Instagram a uma matrícula sem
 * construir rastreamento novo: `app/lib/analytics/utm.ts` já captura e carrega
 * esses campos até Attio/Utmify/Transaction.
 *
 * `isoDate` entra por parâmetro em vez de `new Date()` aqui dentro pra função
 * continuar pura e testável.
 */
export function buildCtaUrl(offer: ShowcaseOffer, formatSlug: string, isoDate: string): string {
  const [path, query = ''] = offer.href.split('?')
  const params = new URLSearchParams(query)
  params.set('utm_source', 'instagram')
  params.set('utm_medium', 'social')
  params.set('utm_campaign', `${formatSlug}-${isoDate}`)
  return `${path}?${params.toString()}`
}

/**
 * Legenda. Emoji é permitido com parcimônia aqui (decisão do CEO: o Instagram
 * é outro meio e legenda sem respiro performa pior), mas NUNCA colado em
 * número, preço ou percentual. Travessão continua proibido, como no blog.
 */
export function buildOfferCaption(offer: ShowcaseOffer, ctaUrl: string): string {
  const local = `${offer.city}-${offer.uf}`
  return [
    `${offer.course} em ${local} com ${offer.discountPct}% de desconto na mensalidade.`,
    '',
    `De ${formatBRL(offer.originalPrice)} por ${formatBRL(offer.finalPrice)} por mês na ${offer.institution}, ${MODALIDADE_LABEL[offer.modality]}.`,
    '',
    `${WEDGE_NO_FEE}. O valor e as vagas são confirmados pela instituição no ato da inscrição.`,
    '',
    `Veja se tem na sua cidade: ${ctaUrl}`,
  ].join('\n')
}

export const OFFER_HASHTAGS = [
  '#bolsadeestudo',
  '#faculdade',
  '#ead',
  '#graduacao',
  '#bolsaclick',
]
