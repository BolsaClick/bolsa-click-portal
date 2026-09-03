'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Banner {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  linkUrl: string | null
  width: number
  height: number
}

interface HeroBannerSliderProps {
  banners: Banner[]
}

// Troca automática a cada 6s. Pausa sozinho quando a aba está em segundo
// plano, quando o `prefers-reduced-motion` do sistema pede menos movimento,
// e por alguns segundos sempre que a pessoa interage (arrasta, clica nas
// setas/bolinhas, foca por teclado) — pra não competir com o gesto dela.
const AUTOPLAY_MS = 6000
const RESUME_AFTER_INTERACTION_MS = 9000

// ORÇAMENTO DE ALTURA (decisão de produto, 2026-09): o slot do banner é uma
// tarja larga e baixa — referência de mercado medida em 1920x420 — não uma
// caixa de largura fixa. A altura-alvo é 420px; a LARGURA é derivada da
// proporção real de cada imagem (largura = 420 × proporção), limitada a
// CEILING_WIDTH_PX pra não estourar em monitores ultra-wide.
//
// Consequência (é o teste que valida a fórmula): a arte de hoje, 1734x907
// (~1,913:1), vira uma caixa de ~803×420. Uma arte-tarja 1920x420 (4,571:1)
// pediria 1920px de largura pro mesmo orçamento de altura — estoura o teto
// de 1680px, então a largura cede pro teto e a altura cai proporcionalmente
// (larguraResolvida / proporção, ~367px) pra não cortar nada. Em qualquer
// proporção, em qualquer largura de tela, é a LARGURA que cede — nunca a
// altura corta a imagem.
// 480 e não 420: a largura do banner é DERIVADA deste orçamento
// (largura = orçamento × proporção), não do container. Com 420 a arte 1,913:1
// resolvia em ~803px e ficava mais ESTREITA que o card de busca (896px) — as
// duas peças competiam em vez de uma emoldurar a outra. A 550 ela vai a ~1052px,
// que deixa ~78px de moldura de cada lado do card de 896px.
// REGIME COVER (03/09, pedido do Rodrigo). Antes a caixa herdava a proporção da
// arte e a imagem entrava com `object-contain`: nunca cortava, mas a largura
// ficava refém da proporção — a arte 1,91:1 resolvia em ~1051px e não tinha como
// virar a tarja larga da referência sem esticar a altura pra 636px.
//
// Agora a caixa tem proporção PRÓPRIA e a arte entra com `object-cover`. O
// banner passa a ocupar a largura cheia do container em qualquer arte.
//
// O CUSTO É REAL E CONHECIDO: cover corta. Com a arte 1734x907 numa caixa de
// 2,8:1 e 1216px de largura, saem ~200px de altura — ~100px em cima e ~100px
// embaixo. Na arte da Anhanguera isso morde o logo (topo) e o botão "Garanta
// sua vaga" (base). Ajuste BANNER_ASPECT e BANNER_OBJECT_POSITION conforme a
// arte da campanha do momento; arte desenhada em 2,8:1 ou mais larga não perde
// nada, porque não sobra o que cortar.
//
// Ancorado no TOPO ('center top') e não no centro: centralizado, o corte comia
// as DUAS pontas — o logo do parceiro em cima e o CTA embaixo. Ancorando no
// topo, o logo e a headline ficam inteiros e o sacrifício é só a base.
const BANNER_ASPECT = 2.8
const BANNER_OBJECT_POSITION = 'center top'
const CEILING_WIDTH_PX = 1680

/**
 * Carrossel de banners CSS-first: a "pista" é uma faixa horizontal nativa com
 * `scroll-snap`, não um conjunto de camadas absolutas cross-fadendo via
 * estado do React. Isso resolve os três requisitos de uma vez:
 *
 * - **Toque/arrastar**: rolagem nativa do navegador — física, momentum e
 *   snap ficam por conta do compositor, sem nenhuma lib de gestos em JS.
 * - **INP**: o único JS que roda em intervalo é um `scrollTo` a cada 6s (não
 *   é uma resposta a input, e o trabalho em si é ínfimo); a detecção de qual
 *   slide está ativo usa `IntersectionObserver`, que roda fora da thread de
 *   input — nada compete com a responsividade a toque/clique/tecla.
 * - **Nenhuma biblioteca de carrossel**: só `next/image` + scroll-snap +
 *   IntersectionObserver, todos nativos da plataforma.
 *
 * CLS: cada banner chega do servidor já com `width`/`height` REAIS (sondados
 * em `getActiveBanners` → `probeBannerDimensions`, sem baixar o arquivo
 * inteiro). A altura de cada caixa é reservada via o clássico "padding-top
 * = height/width do próprio elemento" — funciona em qualquer navegador,
 * mesmo sem suporte à propriedade CSS `aspect-ratio` (só a partir de Safari
 * 15/Firefox 89, e o browserslist deste projeto ainda inclui Safari 14) —
 * a altura fica correta ANTES da imagem carregar, qualquer que seja a
 * largura que o `min()` do orçamento de altura resolver pra aquele viewport.
 *
 * Nunca corta: a caixa de cada slide usa exatamente a proporção real da
 * imagem (via padding-top), então `object-contain` nunca precisa cortar —
 * na prática a imagem preenche a caixa perfeitamente (a caixa TEM a
 * proporção dela). `object-contain` só entra como cinto-de-segurança pro
 * caso raro de a sondagem ter caído no fallback (ver `probeBannerDimensions`)
 * e a proporção real da imagem ser ligeiramente diferente.
 *
 * Desktop-only (`hidden md:block`): decisão de produto — não existe (e não
 * vai existir) arte pensada pra celular; a arte é uma tarja larga (~4:1)
 * desenhada pra 1920px, e o mesmo orçamento de 420px de altura aplicado a um
 * viewport de 390px devolveria uma faixa de ~97px com tipografia ilegível.
 * Melhor não mostrar do que mostrar quebrado — abaixo de `md` a dobra vai
 * direto da faixa com H1+estatísticas pro card de busca (ver `HeroSection`,
 * que só aplica a costura de 16px quando o banner existe).
 *
 * Sem overlay de texto: os banners cadastrados são peças publicitárias que
 * já trazem título e oferta próprios (ex.: "AINDA DÁ TEMPO / Ganhe 15%...").
 * Sobrepor o H1 do site a um criativo que já tem o dele empilha dois textos
 * concorrentes na mesma área — o carrossel só exibe a imagem. O H1 + prova
 * social do site vivem numa faixa própria, ANTES daqui (ver `HeroSection`).
 *
 * Setas e bolinhas de paginação: ficam num overlay `mx-auto max-w-[1680px]`
 * (mesmo teto da caixa da imagem) centralizado sobre a faixa — não presas
 * às bordas literais da viewport. Isso mantém os controles próximos da
 * imagem no caso comum (bordas próximas ao teto), mas é um compromisso
 * deliberado: pra uma arte muito mais estreita que o teto (ex.: um 4:5
 * retrato num desktop largo), os controles não colam nas bordas exatas da
 * imagem — ver ressalva no relatório da task.
 *
 * CONTIDO, não sangrado (decisão de produto, 2026-09, referência: home do
 * Quero Bolsa): a faixa não toca mais a borda da viewport. O contêiner
 * externo (`mx-auto w-full max-w-screen-lg px-4 sm:px-6 lg:px-8`) é o MESMO
 * container padrão do resto do site (`app/(default)/page.tsx`), pra alinhar
 * com o card de busca e as seções abaixo. Dentro dele, a matemática de
 * orçamento de altura/largura por proporção (acima) continua idêntica — o
 * `min(100%, ...)` da largura de cada slide agora resolve `100%` como o
 * espaço já com margem, então nunca precisa de alteração. A única mudança
 * é estética: cantos arredondados (`rounded-2xl`) na caixa de cada slide.
 */
export default function HeroBannerSlider({ banners }: HeroBannerSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const pausedRef = useRef(false)
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Qual slide está "ativo" (pros pontos e pro roving tabindex dos links) —
  // via IntersectionObserver, não listener de scroll + cálculo a cada frame.
  useEffect(() => {
    const track = trackRef.current
    if (!track || banners.length < 2) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = slideRefs.current.findIndex((el) => el === entry.target)
            if (idx !== -1) setCurrentIndex(idx)
          }
        })
      },
      { root: track, threshold: [0.6] }
    )
    slideRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [banners.length])

  const scrollToIndex = useCallback(
    (index: number) => {
      const track = trackRef.current
      const slide = slideRefs.current[index]
      if (!track || !slide) return
      track.scrollTo({
        left: slide.offsetLeft,
        behavior: reducedMotion ? 'auto' : 'smooth',
      })
    },
    [reducedMotion]
  )

  useEffect(() => {
    if (reducedMotion || banners.length < 2) return
    const id = setInterval(() => {
      if (pausedRef.current || document.hidden) return
      scrollToIndex((currentIndex + 1) % banners.length)
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [currentIndex, banners.length, reducedMotion, scrollToIndex])

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
    }
  }, [])

  const pauseAutoplay = useCallback(() => {
    pausedRef.current = true
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
  }, [])

  const resumeAutoplaySoon = useCallback(() => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
    resumeTimeoutRef.current = setTimeout(() => {
      pausedRef.current = false
    }, RESUME_AFTER_INTERACTION_MS)
  }, [])

  const goTo = (index: number) => {
    pauseAutoplay()
    scrollToIndex(index)
    resumeAutoplaySoon()
  }

  if (banners.length === 0) return null

  return (
    <section aria-label="Ofertas em destaque" className="relative hidden md:block">
      {/* Sem espaçador antes da faixa: o header (`Header/New`) é `sticky`,
          não `fixed` — já ocupa espaço próprio no fluxo do documento, então
          nenhuma compensação manual é necessária aqui. */}
      <div
        className="relative mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8"
        role="region"
        aria-roledescription="carrossel"
        aria-label="Banners promocionais"
        onPointerDown={pauseAutoplay}
        onPointerUp={resumeAutoplaySoon}
        onFocus={pauseAutoplay}
        onBlur={resumeAutoplaySoon}
      >
        <div
          ref={trackRef}
          className="flex w-full snap-x snap-mandatory items-center overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollBehavior: reducedMotion ? 'auto' : 'smooth' }}
        >
          {banners.map((banner, index) => {
            const isActive = index === currentIndex
            // Largura cheia do container, limitada só pelo teto de tarja. A
            // proporção da ARTE não entra mais nessa conta — é justamente o
            // acoplamento que o regime cover desfez.
            const boxWidthCss = `min(100%, ${CEILING_WIDTH_PX}px)`
            // A altura agora vem da proporção DA CAIXA, não da arte — é isso que
            // desacopla a largura do banner do formato do arquivo enviado.
            const paddingTopPct = 100 / BANNER_ASPECT
            const image = (
              <div
                className="relative mx-auto overflow-hidden rounded-2xl bg-gray-100"
                style={{ width: boxWidthCss }}
              >
                <div style={{ paddingTop: `${paddingTopPct}%` }} />
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  style={{ objectPosition: BANNER_OBJECT_POSITION }}
                  // Aproxima o hint de `sizes` da largura que a caixa
                  // realmente vai ocupar (ver `boxWidthCss`).
                  sizes={`(min-width: ${CEILING_WIDTH_PX}px) ${CEILING_WIDTH_PX}px, 100vw`}
                  quality={70}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  priority={index === 0}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                />
              </div>
            )
            return (
              <div
                key={banner.id}
                ref={(el) => {
                  slideRefs.current[index] = el
                }}
                className="relative w-full flex-none snap-center"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} de ${banners.length}: ${banner.title}`}
              >
                {banner.linkUrl ? (
                  <a
                    href={banner.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                    // Roving tabindex: só o slide ativo entra no fluxo de Tab.
                    // Evita que quem navega por teclado precise passar por
                    // todos os slides escondidos fora da viewport pra chegar
                    // no conteúdo seguinte da página.
                    tabIndex={isActive ? 0 : -1}
                  >
                    {image}
                  </a>
                ) : (
                  image
                )}
              </div>
            )
          })}
        </div>

        {banners.length > 1 && (
          <div className="pointer-events-none absolute inset-0 mx-auto max-w-[1680px]">
            <button
              type="button"
              onClick={() => goTo((currentIndex - 1 + banners.length) % banners.length)}
              className="pointer-events-auto absolute left-2 top-1/2 z-[5] -translate-y-1/2 rounded-full bg-white/85 p-2 text-bolsa-primary shadow hover:bg-white transition"
              aria-label="Banner anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => goTo((currentIndex + 1) % banners.length)}
              className="pointer-events-auto absolute right-2 top-1/2 z-[5] -translate-y-1/2 rounded-full bg-white/85 p-2 text-bolsa-primary shadow hover:bg-white transition"
              aria-label="Próximo banner"
            >
              <ChevronRight size={20} />
            </button>

            {/* bottom-3/md:bottom-4: sem mais nada sobrepondo a base do
                banner (a costura de 16px com o card de busca agora fica no
                TOPO — ver HeroSection), então as bolinhas só precisam de uma
                folga pequena da própria borda da imagem. */}
            <div className="pointer-events-auto absolute bottom-3 left-0 right-0 z-[5] flex justify-center space-x-2 md:bottom-4">
              {banners.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goTo(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'w-8 bg-bolsa-secondary' : 'w-2.5 bg-white/60 hover:bg-white/90'
                  }`}
                  aria-label={`Ir para o banner ${index + 1} de ${banners.length}`}
                  aria-current={index === currentIndex}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
