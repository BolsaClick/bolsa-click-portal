'use client'

import { useState, useEffect } from 'react'

const heroTexts = [
  {
    course: 'Administração',
    discount: '85%',
    institution: 'Anhanguera',
  },
  {
    course: 'Engenharia Civil',
    discount: '70%',
    institution: 'Unopar',
  },
  {
    course: 'Psicologia',
    discount: 'R$ 99/mês',
    institution: 'Pitágoras',
  },
]

export default function HeroTextRotator() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroTexts.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const current = heroTexts[currentIndex]

  return (
    <div className="flex flex-col items-center" role="region" aria-live="polite">
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-3">
        Em destaque agora
      </span>
      <p
        key={currentIndex}
        className="text-center text-ink-900 animate-fade-in"
      >
        <span className="font-display text-xl md:text-2xl italic">
          {current.course}
        </span>
        <span className="font-mono text-ink-500 mx-2">—</span>
        <span className="font-mono text-base md:text-lg num-tabular text-bolsa-secondary">
          {current.discount}
        </span>
        <span className="font-mono text-ink-500 mx-2">·</span>
        <span className="font-mono text-sm tracking-wider uppercase text-ink-700">
          {current.institution}
        </span>
      </p>

      <div className="mt-6 flex justify-center gap-1.5">
        {heroTexts.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-px transition-all duration-500 ${
              index === currentIndex ? 'w-8 bg-ink-900' : 'w-3 bg-ink-300 hover:bg-ink-500'
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
