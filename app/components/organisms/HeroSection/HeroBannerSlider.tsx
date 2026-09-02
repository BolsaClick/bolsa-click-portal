'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Banner {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  linkUrl: string | null
}

interface HeroBannerSliderProps {
  banners: Banner[]
  /**
   * Título + prova social do site (H1 transacional), injetado pelo
   * `HeroSection` e renderizado SOBRE a imagem — não é copy por banner.
   * Fica fora da pista que rola (`track`), então não se move com o swipe.
   */
  overlay?: ReactNode
}

// Troca automática a cada 6s. Pausa sozinho quando a aba está em segundo
// plano, quando o `prefers-reduced-motion` do sistema pede menos movimento,
// e por alguns segundos sempre que a pessoa interage (arrasta, clica nas
// setas/bolinhas, foca por teclado) — pra não competir com o gesto dela.
const AUTOPLAY_MS = 6000
const RESUME_AFTER_INTERACTION_MS = 9000

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
 * CLS: a altura da faixa é fixa por breakpoint (reservada antes de qualquer
 * imagem carregar), então nada empurra o layout quando a imagem chega.
 *
 * Mobile: renderiza em qualquer viewport (74% do tráfego é mobile). O que
 * antes protegia o celular de baixar o banner "de desktop" era esconder o
 * componente inteiro (`hidden md:block`); agora cada imagem é pedida em
 * `sizes="100vw"`, então o próprio `next/image` serve, pelo srcset, um
 * recorte proporcional à viewport real — o celular nunca baixa o arquivo
 * pensado pra 1920px.
 *
 * Overlay: título + prova social vivem SOBRE a imagem (não numa faixa
 * separada abaixo). É uma camada `absolute` fora da pista que rola — puro
 * CSS, sem custo de JS — com dois reforços de contraste que não dependem de
 * a imagem do banner ser escura: (1) gradiente de baixo pra cima cobrindo
 * boa parte da altura, forte o bastante pra funcionar mesmo sobre fotos
 * muito claras; (2) `text-shadow` no texto como reforço de borda. O texto
 * fica com `pointer-events-none` (deixa o toque atravessar pro link do
 * slide); só as bolinhas de navegação recebem clique.
 */
export default function HeroBannerSlider({ banners, overlay }: HeroBannerSliderProps) {
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
    <section aria-label="Ofertas em destaque" className="relative">
      <div className="h-16 md:h-20" />

      <div
        className="relative w-full bg-ink-900 h-[380px] sm:h-[440px] md:h-[480px] lg:h-[560px]"
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
          className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollBehavior: reducedMotion ? 'auto' : 'smooth' }}
        >
          {banners.map((banner, index) => {
            const isActive = index === currentIndex
            const image = (
              <div className="relative h-full w-full">
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  className="object-cover object-center md:object-top"
                  // Toda imagem é renderizada em 100vw — o `sizes` avisa o
                  // next/image que a largura pedida deve seguir a viewport
                  // real, então no celular ele busca no srcset um recorte bem
                  // menor que o desktop, em vez de baixar a imagem grande.
                  sizes="100vw"
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
                className="relative h-full w-full flex-none snap-center"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} de ${banners.length}: ${banner.title}`}
              >
                {banner.linkUrl ? (
                  <a
                    href={banner.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full w-full"
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

        {overlay && (
          <>
            {/* Reforço de contraste nº1: gradiente escuro de baixo pra cima,
                forte o bastante pra funcionar mesmo sobre banners muito
                claros — não assume que a imagem já é escura por padrão. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-ink-900/95 via-ink-900/55 via-45% to-transparent"
            />
            {/* Título + prova social do site, com as bolinhas de navegação
                logo abaixo — os dois no MESMO bloco `flex-col`, ancorado
                pelo `pb`. Isso garante, num lugar só, que nada fica embaixo
                da faixa que o card do Filter cobre ao subir por cima da
                imagem (`-mt-10 md:-mt-14` no HeroSection): o `pb` aqui
                (48/56/64px) é sempre maior que aquele overlap (40/56px), daí
                as bolinhas nunca ficam escondidas atrás do card.
                `pointer-events-none` no bloco de texto deixa o toque
                atravessar pro link do slide (o texto em si não é clicável);
                reforço de contraste nº2 é o text-shadow, que herda pros
                filhos (dt/dd/span). As bolinhas reativam pointer-events
                pra continuarem clicáveis. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex flex-col items-center gap-3 px-4 pb-12 pt-10 sm:pb-14 md:pb-16 [text-shadow:0_2px_10px_rgba(11,31,60,0.55)]">
              {overlay}
              {banners.length > 1 && (
                <div className="pointer-events-auto flex justify-center gap-2">
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
              )}
            </div>
          </>
        )}

        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo((currentIndex - 1 + banners.length) % banners.length)}
              className="absolute left-3 top-4 z-[5] rounded-full bg-white/90 p-2 text-bolsa-primary shadow-md hover:bg-white transition sm:top-6"
              aria-label="Banner anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => goTo((currentIndex + 1) % banners.length)}
              className="absolute right-3 top-4 z-[5] rounded-full bg-white/90 p-2 text-bolsa-primary shadow-md hover:bg-white transition sm:top-6"
              aria-label="Próximo banner"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    </section>
  )
}
