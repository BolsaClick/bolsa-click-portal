/* eslint-disable @next/next/no-img-element */
/**
 * Slides de carrossel do Instagram, gerados por código com `ImageResponse`
 * (next/og) — mesmo motor das imagens de Open Graph, mesma paleta, mesmo
 * logo. Quem já viu um link do Bolsa Click no WhatsApp reconhece o carrossel
 * no feed.
 *
 * Mora ao lado de `shared.tsx` e CONSOME as primitivas de lá (`SOCIAL_SIZE`,
 * cores, `getBolsaClickLogoDataUri`, `getMascotDataUri`) em vez de duplicá-las.
 * Ficou em arquivo próprio porque `shared.tsx` é importado por todo
 * `opengraph-image.tsx` do site: layout de slide 4:5 não tem uso nenhum
 * naquele caminho e só engordaria o módulo que roda em toda página.
 *
 * As três variantes (capa / conteúdo / CTA) são DE FORMA, não de assunto:
 * recebem texto pronto e não sabem o que é uma oferta. O mapeamento
 * formato→slide vive na rota (`app/api/og/social/[formato]/route.tsx`), que é
 * quem busca o dado real. Assim os outros formatos da grade (carrossel
 * educativo, notícia, prova social) reaproveitam estes mesmos três moldes.
 *
 * REGRA DE DADO: nenhum componente aqui inventa número. Preço, De/Por e
 * percentual chegam prontos de quem leu o catálogo. Não existe valor de
 * exemplo embutido — sem dado real, a rota falha visível.
 */
import type { ReactNode } from 'react'
import {
  OG_ACCENT,
  OG_INK,
  OG_MUTED,
  OG_PAPER,
} from '@/app/lib/og/shared'

/**
 * Identidade do rodapé.
 *
 * O @ do Instagram está EM ABERTO: o código do site referencia @bolsaclick em
 * vários lugares e o briefing do dono citou @bolsaclic, e o login-wall do
 * Instagram responde 200 pros dois, então o teste foi inconclusivo. Até a
 * confirmação, o rodapé assina com o DOMÍNIO, que é certo, e o handle entra
 * por env quando houver decisão — sem tocar em nenhuma das referências que já
 * existem no repo.
 */
export const SOCIAL_SITE_LABEL = 'bolsaclick.com.br'
export function socialFooterLabel(): string {
  const handle = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE?.trim()
  return handle ? `${handle} · ${SOCIAL_SITE_LABEL}` : SOCIAL_SITE_LABEL
}

export type SocialSlideKind = 'capa' | 'conteudo' | 'cta'
export const SOCIAL_SLIDE_KINDS = ['capa', 'conteudo', 'cta'] as const

/** Posição do contador "1/3" e do rodapé — todo slide compartilha a moldura. */
type SlideFrameProps = {
  logoSrc: string
  slideIndex: number
  slideTotal: number
  children: ReactNode
}

/**
 * Moldura 4:5: fundo papel, barra de acento no topo (âncora de marca que
 * sobrevive à miniatura do feed), logo + contador, conteúdo, rodapé.
 */
export function SocialCanvas({ logoSrc, slideIndex, slideTotal, children }: SlideFrameProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: OG_PAPER,
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', height: 14, background: OG_ACCENT }} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: '56px 72px 64px 72px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <img src={logoSrc} alt="Bolsa Click" height={56} />
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              fontWeight: 700,
              color: OG_MUTED,
              letterSpacing: '1px',
            }}
          >
            {slideIndex}/{slideTotal}
          </div>
        </div>
        {/*
          A sobra vertical fica AQUI, nas bordas do grupo de conteúdo, em vez
          de ser distribuída entre os blocos. Com `space-between` no contêiner
          externo, um slide com pouco texto abria buracos no meio da peça: a
          folga virava vão entre título e preço, e entre preço e mascote. Agora
          o conteúdo se agrupa centrado e a folga lê como margem, que é o que
          respiro deveria ser.
        */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            gap: 52,
          }}
        >
          {children}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', height: 6, width: 64, background: OG_ACCENT }} />
          <div style={{ display: 'flex', fontSize: 28, color: OG_INK, opacity: 0.7 }}>
            {socialFooterLabel()}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Rótulo de topo do slide — "OFERTA DA SEMANA", "COMO FUNCIONA". */
function SlideKicker({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        fontSize: 26,
        letterSpacing: '4px',
        textTransform: 'uppercase',
        color: OG_ACCENT,
        fontWeight: 700,
      }}
    >
      <div style={{ display: 'flex', width: 10, height: 10, background: OG_ACCENT, borderRadius: 999 }} />
      {children}
    </div>
  )
}

/**
 * Faixa inferior: conteúdo à esquerda, Bob à direita, os dois alinhados pela
 * base.
 *
 * É o que mata o buraco que sobrava embaixo à esquerda quando o mascote
 * flutuava sozinho no canto. Vale como padrão nos três slides: o olho desce a
 * diagonal do texto até o Bob em vez de cair num vazio. Bob mantém proporção
 * (docs/MASCOTES.md, regra 1) e nunca passa dos 240px de lado... na web. Aqui
 * a peça é 1080 de largura, não um viewport de componente, então a escala
 * equivalente é maior — o que a regra protege é a proporção e o papel de
 * acento, não o número absoluto de px.
 */
function SlideBottomRow({
  mascotSrc,
  mascotSize,
  children,
}: {
  mascotSrc: string
  mascotSize: number
  children: ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 28,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>{children}</div>
      <img
        src={mascotSrc}
        alt=""
        width={mascotSize}
        height={mascotSize}
        style={{ objectFit: 'contain' }}
      />
    </div>
  )
}

/**
 * De/Por. O "De" vem riscado e pequeno; o "Por" é o número que para o scroll.
 * Os dois chegam já formatados em BRL por quem leu o catálogo — este
 * componente não calcula nem arredonda nada.
 */
function SlidePriceBlock({
  priceFrom,
  priceTo,
  priceToSuffix,
  size,
}: {
  priceFrom: string
  priceTo: string
  priceToSuffix?: string
  size: number
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div
        style={{
          display: 'flex',
          fontSize: Math.round(size * 0.36),
          color: OG_MUTED,
          textDecoration: 'line-through',
        }}
      >
        De {priceFrom}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <div
          style={{
            display: 'flex',
            fontSize: size,
            fontWeight: 700,
            color: OG_ACCENT,
            letterSpacing: '-0.03em',
          }}
        >
          {priceTo}
        </div>
        {priceToSuffix ? (
          <div style={{ display: 'flex', fontSize: Math.round(size * 0.36), color: OG_MUTED }}>
            {priceToSuffix}
          </div>
        ) : null}
      </div>
    </div>
  )
}

/**
 * Ressalva de preço. Patamar tipográfico do rodapé: presente, legível, sem
 * competir com nada.
 */
function SlideDisclaimer({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', fontSize: 26, color: OG_MUTED, lineHeight: 1.3 }}>
      {children}
    </div>
  )
}

/**
 * REGRA: todo slide que imprime valor em reais carrega a ressalva, porque
 * qualquer slide pode ser printado e circular sozinho, fora do carrossel que
 * o explicava. Preço sem ressalva não sai.
 *
 * Isso não é recomendação em comentário, é o TIPO: ou o slide vem sem preço
 * nenhum, ou vem com De/Por E `disclaimer`. Passar preço sem ressalva não
 * compila. A razão é a mesma do slide de CTA: é o que separa o Bolsa Click de
 * quem promete desconto que não entrega, e decisão editorial que depende de
 * alguém lembrar já nasce perdida.
 */
type SlidePriceProps =
  | {
      priceFrom: string
      priceTo: string
      priceToSuffix?: string
      disclaimer: string
    }
  | {
      priceFrom?: never
      priceTo?: never
      priceToSuffix?: never
      disclaimer?: string
    }

/** Pílula de destaque — percentual real, nunca arredondado pra cima. */
function SlideBadge({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex' }}>
      <div
        style={{
          display: 'flex',
          padding: '12px 30px',
          background: OG_ACCENT,
          color: OG_PAPER,
          fontSize: 40,
          fontWeight: 700,
          borderRadius: 999,
        }}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * CAPA — o slide que para o scroll, e o único que a maioria vê.
 *
 * Por isso o PREÇO mora aqui, não só no slide de conteúdo: no feed o scroll
 * para no número, e um "-46%" sozinho é abstrato enquanto "R$ 179,28/mês" é
 * concreto. A hierarquia é deliberada e tem três degraus: curso (o que a
 * pessoa procura) > preço (o que a convence) > cidade (qualificador). A
 * cidade sai do corpo do título e vira linha menor, senão compete com o curso
 * pela mesma atenção.
 */
export function SocialCoverSlide({
  logoSrc,
  mascotSrc,
  slideIndex = 1,
  slideTotal,
  kicker,
  line1,
  locality,
  badge,
  priceFrom,
  priceTo,
  priceToSuffix,
  disclaimer,
  support,
}: {
  logoSrc: string
  mascotSrc: string
  slideIndex?: number
  slideTotal: number
  kicker: string
  line1: string
  /** Qualificador (cidade-UF). Um patamar abaixo do título, nunca no mesmo corpo. */
  locality?: string
  badge?: string
  support?: string
} & SlidePriceProps) {
  const headingSize = line1.length > 24 ? 86 : 104
  const hasPrice = Boolean(priceFrom && priceTo)
  return (
    <SocialCanvas logoSrc={logoSrc} slideIndex={slideIndex} slideTotal={slideTotal}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <SlideKicker>{kicker}</SlideKicker>
        <div
          style={{
            display: 'flex',
            fontSize: headingSize,
            fontWeight: 700,
            color: OG_INK,
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
          }}
        >
          {line1}
        </div>
        {locality ? (
          <div style={{ display: 'flex', fontSize: 46, color: OG_MUTED, lineHeight: 1.15 }}>
            {locality}
          </div>
        ) : null}
        {support ? (
          <div style={{ display: 'flex', fontSize: 32, color: OG_MUTED, lineHeight: 1.3 }}>
            {support}
          </div>
        ) : null}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        <SlideBottomRow mascotSrc={mascotSrc} mascotSize={360}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {hasPrice ? (
              <SlidePriceBlock
                priceFrom={priceFrom as string}
                priceTo={priceTo as string}
                priceToSuffix={priceToSuffix}
                size={88}
              />
            ) : null}
            {badge ? <SlideBadge>{badge}</SlideBadge> : null}
          </div>
        </SlideBottomRow>
        {disclaimer ? <SlideDisclaimer>{disclaimer}</SlideDisclaimer> : null}
      </div>
    </SocialCanvas>
  )
}

/** Uma linha de dado do slide de conteúdo. `strike` marca o preço "De". */
export type SocialDataRow = {
  label: string
  value: string
  strike?: boolean
}

/**
 * CONTEÚDO — onde o preço ganha contexto: instituição, cidade, modalidade.
 * Quem deslizou até aqui já viu o número na capa e quer saber de quem é.
 */
export function SocialContentSlide({
  logoSrc,
  mascotSrc,
  slideIndex = 2,
  slideTotal,
  kicker,
  heading,
  priceFrom,
  priceTo,
  priceToSuffix,
  disclaimer,
  rows,
}: {
  logoSrc: string
  mascotSrc: string
  slideIndex?: number
  slideTotal: number
  kicker: string
  heading: string
  /** Este slide sempre mostra preço, então a ressalva é obrigatória, não opcional. */
  priceFrom: string
  priceTo: string
  priceToSuffix?: string
  disclaimer: string
  rows: SocialDataRow[]
}) {
  return (
    <SocialCanvas logoSrc={logoSrc} slideIndex={slideIndex} slideTotal={slideTotal}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <SlideKicker>{kicker}</SlideKicker>
        <div
          style={{
            display: 'flex',
            fontSize: heading.length > 30 ? 56 : 70,
            fontWeight: 700,
            color: OG_INK,
            lineHeight: 1.06,
            letterSpacing: '-0.025em',
          }}
        >
          {heading}
        </div>
        <SlidePriceBlock
          priceFrom={priceFrom}
          priceTo={priceTo}
          priceToSuffix={priceToSuffix}
          size={108}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        <SlideBottomRow mascotSrc={mascotSrc} mascotSize={290}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {rows.map((row) => (
            <div
              key={`${row.label}-${row.value}`}
              style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 32 }}
            >
              <div style={{ display: 'flex', color: OG_MUTED, width: 200 }}>{row.label}</div>
              <div
                style={{
                  display: 'flex',
                  color: OG_INK,
                  fontWeight: 600,
                  textDecoration: row.strike ? 'line-through' : 'none',
                }}
              >
                {row.value}
              </div>
            </div>
            ))}
          </div>
        </SlideBottomRow>
        <SlideDisclaimer>{disclaimer}</SlideDisclaimer>
      </div>
    </SocialCanvas>
  )
}

/**
 * CTA — último slide. Passo a passo curto e para onde ir. O link real vive na
 * legenda e na bio (o Instagram não torna clicável o que está na imagem), então
 * aqui o texto diz para onde ir, não imprime a URL com UTM.
 *
 * O `disclaimer` não é firula jurídica: é o que separa o Bolsa Click de quem
 * promete desconto que não entrega. Todo formato que exibe preço fecha com
 * ele — decisão editorial registrada, não detalhe de layout.
 */
export function SocialCtaSlide({
  logoSrc,
  mascotSrc,
  slideIndex = 3,
  slideTotal,
  kicker,
  heading,
  steps,
  cta,
  disclaimer,
}: {
  logoSrc: string
  mascotSrc: string
  slideIndex?: number
  slideTotal: number
  kicker: string
  heading: string
  steps: string[]
  cta: string
  disclaimer?: string
}) {
  return (
    <SocialCanvas logoSrc={logoSrc} slideIndex={slideIndex} slideTotal={slideTotal}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <SlideKicker>{kicker}</SlideKicker>
        <div
          style={{
            display: 'flex',
            fontSize: 74,
            fontWeight: 700,
            color: OG_INK,
            lineHeight: 1.04,
            letterSpacing: '-0.025em',
          }}
        >
          {heading}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {steps.map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: 999,
                  background: OG_ACCENT,
                  color: OG_PAPER,
                  fontSize: 30,
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </div>
              <div style={{ display: 'flex', fontSize: 36, color: OG_INK, lineHeight: 1.25 }}>
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>
      <SlideBottomRow mascotSrc={mascotSrc} mascotSize={290}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex' }}>
            <div
              style={{
                display: 'flex',
                padding: '20px 40px',
                background: OG_INK,
                color: OG_PAPER,
                fontSize: 38,
                fontWeight: 700,
                borderRadius: 18,
              }}
            >
              {cta}
            </div>
          </div>
          {disclaimer ? (
            <div style={{ display: 'flex', fontSize: 25, color: OG_MUTED, lineHeight: 1.35 }}>
              {disclaimer}
            </div>
          ) : null}
        </div>
      </SlideBottomRow>
    </SocialCanvas>
  )
}

/**
 * Quadro de ERRO — some do feed porque nunca chega lá: é o que a rota devolve
 * quando não existe oferta real para o slide pedido. Vermelho e explícito de
 * propósito. O pior resultado possível neste pipeline seria um card bonito com
 * número inventado, então a falha tem que ser impossível de confundir com
 * conteúdo publicável.
 */
export function SocialErrorSlide({ title, detail }: { title: string; detail: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 36,
        background: OG_ACCENT,
        padding: '80px 72px',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 34,
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: OG_PAPER,
          fontWeight: 700,
        }}
      >
        Não publicável
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 76,
          fontWeight: 700,
          color: OG_PAPER,
          lineHeight: 1.08,
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', fontSize: 34, color: OG_PAPER, opacity: 0.9, lineHeight: 1.35 }}>
        {detail}
      </div>
    </div>
  )
}
