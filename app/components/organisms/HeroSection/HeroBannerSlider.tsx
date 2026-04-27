'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

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

export default function HeroBannerSlider({ banners }: HeroBannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating) return
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex(index)
        setIsAnimating(false)
      }, 500)
    },
    [isAnimating]
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length)
        setIsAnimating(false)
      }, 500)
    }, 5000)

    return () => clearInterval(interval)
  }, [banners.length])

  const handleBannerClick = (banner: Banner) => {
    if (banner.linkUrl) {
      window.open(banner.linkUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <section aria-label="Seção principal de destaque" className="relative hidden md:block">
      <div className="h-16 md:h-20" />

      <div className="relative w-full bg-gray-100 h-[400px] lg:h-[500px]">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
            }`}
            onClick={() => handleBannerClick(banner)}
            style={{ cursor: banner.linkUrl ? 'pointer' : 'default' }}
          >
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              fill
              className="object-cover object-center md:object-top"
              priority={index === 0}
              loading={index === 0 ? undefined : 'lazy'}
              sizes="(min-width: 1024px) 100vw, 100vw"
              quality={75}
            />
          </div>
        ))}

        {banners.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 z-[5] flex justify-center space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-bolsa-secondary'
                    : 'w-2.5 bg-white/60 hover:bg-white/90'
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-[80px] overflow-hidden z-[3]">
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
