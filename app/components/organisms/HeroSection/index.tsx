'use client'

import React, { useState, useEffect } from 'react'

const heroTexts = [
  {
    title: "Administração com 85% OFF",
    subtitle: "na Faculdade Anhanguera",
    description: "Realize seu sonho de fazer administração com bolsas exclusivas"
  },
  {
    title: "Engenharia Civil",
    subtitle: "com até 70% de desconto",
    description: "Vagas limitadas para o próximo semestre"
  },
  {
    title: "Psicologia",
    subtitle: "mensalidades a partir de R$99,00",
    description: "Estude na melhor faculdade de psicologia do Brasil"
  }
]

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const theme = process.env.NEXT_PUBLIC_THEME
  const sectionBg = theme === 'anhanguera' ? 'bg-[#d63c06]' : 'bg-emerald-700'

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % heroTexts.length)
        setIsAnimating(false)
      }, 500)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section
      aria-label="Seção principal de destaque"
      className={`relative ${sectionBg} text-white pt-36 pb-40`}
    >
      <div className="container mx-auto px-4 pt-10 text-center">
        <div className="h-[200px] md:h-[240px] flex flex-col pb-32 pt-20 md:pb-20 items-center justify-center">
          <div
            role="region"
            aria-live="polite"
            className={`transition-all duration-500 ${
              isAnimating ? 'opacity-0 transform -translate-y-4' : 'opacity-100 transform translate-y-0'
            }`}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Bolsas de Estudo de até 95% de Desconto
            </h1>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-4 leading-tight">
              {heroTexts[currentIndex].title}
              <br className="hidden md:block" />
              <span className="text-emerald-400 block text-xl" aria-hidden="true">
                {heroTexts[currentIndex].subtitle}
              </span>
            </h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-emerald-100">
              {heroTexts[currentIndex].description}
            </p>
          </div>
        </div>

        {/* Indicadores */}
        <div className="flex justify-center pt-20 space-x-1">
          {heroTexts.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAnimating(true)
                setTimeout(() => {
                  setCurrentIndex(index)
                  setIsAnimating(false)
                }, 500)
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-6 bg-bolsa-secondary' : 'w-2 bg-bolsa-secondary/50 hover:bg-emerald-300'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* SVG decorativo na base */}
      <div className="absolute bottom-0 left-0 right-0 h-[150px] overflow-hidden z-10">
        <svg
          viewBox="0 0 1440 320"
          className="absolute bottom-0 w-full"
          preserveAspectRatio="none"
          style={{ height: '150px', width: '100%' }}
        >
          <path
            fill="#F8F8F8"
            d="M0,160L48,170.7C96,181,192,203,288,208C384,213,480,203,576,181.3C672,160,768,128,864,128C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F8F8F8] z-10" />
      </div>
    </section>
  )
}

export default Hero
