'use client'

import { useState, useEffect, useCallback } from 'react'

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

export default function HeroTextRotator() {
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
        setCurrentIndex((prev) => (prev + 1) % heroTexts.length)
        setIsAnimating(false)
      }, 500)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <div
        role="region"
        aria-live="polite"
        className={`transition-all duration-500 ${
          isAnimating ? 'opacity-0 transform -translate-y-4' : 'opacity-100 transform translate-y-0'
        }`}
      >
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

      {/* Indicadores */}
      <div className="flex justify-center pt-20 space-x-1">
        {heroTexts.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'w-6 bg-bolsa-secondary' : 'w-2 bg-bolsa-secondary/50 hover:bg-emerald-300'
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </>
  )
}
