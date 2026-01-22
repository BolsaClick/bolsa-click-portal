'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const heroImages = [
  {
    src: '/assets/images/hero-1.jpg',
    alt: 'Bolsas de Estudo com até 81% de desconto - Primeira mensalidade gratuita'
  },
  {
    src: '/assets/images/hero-2.jpg',
    alt: 'Bolsas para Graduação - Desconto garantido até o fim do curso'
  },
  {
    src: '/assets/images/hero-3.jpg',
    alt: 'Mega Bolsa - Matrículas abertas'
  }
]

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [mouseStart, setMouseStart] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [autoPlayPaused, setAutoPlayPaused] = useState(false)
  const [hasMoved, setHasMoved] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const minSwipeDistance = 50
  const minMoveDistance = 5 // Mínimo de movimento para considerar arrasto

  useEffect(() => {
    if (autoPlayPaused || isDragging) return

    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % heroImages.length)
        setIsAnimating(false)
      }, 600)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoPlayPaused, isDragging])

  // Cleanup do timeout quando componente desmontar
  useEffect(() => {
    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current)
      }
    }
  }, [])

  const goToSlide = (index: number) => {
    setIsAnimating(true)
    setDragOffset(0)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsAnimating(false)
      // Retoma o auto-play após 3 segundos
      setAutoPlayPaused(true)
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current)
      }
      autoPlayTimeoutRef.current = setTimeout(() => {
        setAutoPlayPaused(false)
      }, 3000)
    }, 600)
  }

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? heroImages.length - 1 : currentIndex - 1
    goToSlide(newIndex)
  }

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % heroImages.length
    goToSlide(newIndex)
  }

  // Touch handlers para mobile
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setIsDragging(true)
    setDragOffset(0)
    setHasMoved(false)
    setAutoPlayPaused(true)
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current)
    }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const currentX = e.targetTouches[0].clientX
    setTouchEnd(currentX)
    const offset = currentX - touchStart
    const absOffset = Math.abs(offset)
    
    // Só considera movimento se passar do mínimo
    if (absOffset > minMoveDistance) {
      setHasMoved(true)
    }
    
    setDragOffset(offset)
  }

  const onTouchEnd = () => {
    if (!touchStart) {
      setTouchStart(null)
      setTouchEnd(null)
      setIsDragging(false)
      setDragOffset(0)
      setHasMoved(false)
      // Retoma auto-play após 3 segundos
      autoPlayTimeoutRef.current = setTimeout(() => {
        setAutoPlayPaused(false)
      }, 3000)
      return
    }

    // Só troca slide se houve movimento significativo E distância suficiente
    if (hasMoved) {
      const endX = touchEnd ?? touchStart
      const distance = touchStart - endX
      const isLeftSwipe = distance > minSwipeDistance
      const isRightSwipe = distance < -minSwipeDistance

      if (isLeftSwipe) {
        goToNext()
      } else if (isRightSwipe) {
        goToPrevious()
      } else {
        setDragOffset(0)
        setIsDragging(false)
        setHasMoved(false)
        // Retoma auto-play após 3 segundos
        autoPlayTimeoutRef.current = setTimeout(() => {
          setAutoPlayPaused(false)
        }, 3000)
      }
    } else {
      // Clique simples, não troca slide
      setDragOffset(0)
      setIsDragging(false)
      setHasMoved(false)
      // Retoma auto-play após 3 segundos
      autoPlayTimeoutRef.current = setTimeout(() => {
        setAutoPlayPaused(false)
      }, 3000)
    }
    
    setTouchStart(null)
    setTouchEnd(null)
  }

  // Mouse handlers para desktop
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setMouseStart(e.clientX)
    setIsDragging(true)
    setDragOffset(0)
    setHasMoved(false)
    setAutoPlayPaused(true)
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current)
    }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (mouseStart === null || !isDragging) return
    const offset = e.clientX - mouseStart
    const absOffset = Math.abs(offset)
    
    // Só considera movimento se passar do mínimo
    if (absOffset > minMoveDistance) {
      setHasMoved(true)
    }
    
    setDragOffset(offset)
  }

  const onMouseUp = (e: React.MouseEvent) => {
    if (mouseStart === null) {
      setIsDragging(false)
      setDragOffset(0)
      setHasMoved(false)
      // Retoma auto-play após 3 segundos
      autoPlayTimeoutRef.current = setTimeout(() => {
        setAutoPlayPaused(false)
      }, 3000)
      return
    }
    
    // Só troca slide se houve movimento significativo E distância suficiente
    if (hasMoved) {
      const distance = mouseStart - e.clientX
      const isLeftSwipe = distance > minSwipeDistance
      const isRightSwipe = distance < -minSwipeDistance

      if (isLeftSwipe) {
        goToNext()
      } else if (isRightSwipe) {
        goToPrevious()
      } else {
        setDragOffset(0)
        setIsDragging(false)
        setHasMoved(false)
        // Retoma auto-play após 3 segundos
        autoPlayTimeoutRef.current = setTimeout(() => {
          setAutoPlayPaused(false)
        }, 3000)
      }
    } else {
      // Clique simples, não troca slide
      setDragOffset(0)
      setIsDragging(false)
      setHasMoved(false)
      // Retoma auto-play após 3 segundos
      autoPlayTimeoutRef.current = setTimeout(() => {
        setAutoPlayPaused(false)
      }, 3000)
    }
    
    setMouseStart(null)
  }

  return (
    <>
    <section
      aria-label="Seção principal de destaque"
      className="relative w-full h-[400px] md:h-[450px] lg:h-[500px] overflow-hidden select-none"
    >
      {/* Container do slider */}
      <div 
        ref={containerRef}
        className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={() => {
          if (mouseStart !== null && isDragging && hasMoved) {
            const distance = -dragOffset // dragOffset já é a diferença
            const isLeftSwipe = distance > minSwipeDistance
            const isRightSwipe = distance < -minSwipeDistance

            if (isLeftSwipe) {
              goToNext()
            } else if (isRightSwipe) {
              goToPrevious()
            } else {
              setDragOffset(0)
              setIsDragging(false)
              setHasMoved(false)
              autoPlayTimeoutRef.current = setTimeout(() => {
                setAutoPlayPaused(false)
              }, 3000)
            }
          } else {
            setDragOffset(0)
            setIsDragging(false)
            setHasMoved(false)
            autoPlayTimeoutRef.current = setTimeout(() => {
              setAutoPlayPaused(false)
            }, 3000)
          }
          setMouseStart(null)
        }}
      >
        <div
          className="flex h-full transition-transform ease-out"
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
            transition: isDragging ? 'none' : 'transform 0.6s ease-out'
          }}
        >
          {heroImages.map((image, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 w-full h-full overflow-hidden"
            >
              <div className="relative w-full h-full">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover object-center"
                  priority={index === 0}
                  quality={100}
                  unoptimized
                  sizes="100vw"
                  style={{ 
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                />
                {/* Overlay escuro para melhorar legibilidade se necessário */}
                <div className="absolute inset-0 bg-black/20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botões de navegação */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 transition-all duration-300 shadow-lg"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="w-6 h-6 text-gray-800" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 transition-all duration-300 shadow-lg"
        aria-label="Próximo slide"
      >
        <ChevronRight className="w-6 h-6 text-gray-800" />
      </button>

      {/* SVG decorativo na base */}
      <div className="absolute bottom-0 left-0 right-0 h-[100px] overflow-hidden z-10 pointer-events-none">
        <svg
          viewBox="0 0 1440 320"
          className="absolute bottom-0 w-full"
          preserveAspectRatio="none"
          style={{ height: '100px', width: '100%' }}
        >
          <path
            fill="#F8F8F8"
            d="M0,160L48,170.7C96,181,192,203,288,208C384,213,480,203,576,181.3C672,160,768,128,864,128C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F8F8F8] z-10" />
      </div>

    </section>
    {/* Indicadores - abaixo do SVG na área branca */}
    <div className="relative w-full flex justify-center items-center py-4 bg-[#F8F8F8]">
      <div className="flex items-center space-x-3">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-3 h-3 bg-gray-600 shadow-md'
                : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
    </>
  )
}

export default Hero
