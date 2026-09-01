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
    <section aria-label="Ofertas em destaque" className="relative">
      <div className="h-16 md:h-20" />

      <div
        className="relative w-full bg-gray-100 h-[220px] sm:h-[300px] md:h-[400px] lg:h-[500px]"
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

        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo((currentIndex - 1 + banners.length) % banners.length)}
              className="absolute left-2 top-1/2 z-[5] -translate-y-1/2 rounded-full bg-white/85 p-2 text-bolsa-primary shadow hover:bg-white transition"
              aria-label="Banner anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => goTo((currentIndex + 1) % banners.length)}
              className="absolute right-2 top-1/2 z-[5] -translate-y-1/2 rounded-full bg-white/85 p-2 text-bolsa-primary shadow hover:bg-white transition"
              aria-label="Próximo banner"
            >
              <ChevronRight size={20} />
            </button>

            <div className="absolute bottom-6 left-0 right-0 z-[5] flex justify-center space-x-2">
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
          </>
        )}

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[80px] overflow-hidden z-[3]">
          <svg
            viewBox="0 0 1440 320"
            className="absolute bottom-0 w-full"
            preserveAspectRatio="none"
            style={{ height: '80px', width: '100%' }}
          >
            <path
              fill="#F8F8F8"
              d="M0,160L48,170.7C96,181,192,203,288,208C384,213,480,203,576,181.3C672,160,768,128,864,128C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>
      </div>
    </section>
  )
}
