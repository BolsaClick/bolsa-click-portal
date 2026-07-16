'use client'

/**
 * MascotPop — o mascote "aparece" (pop/bounce ≤600ms, uma vez) em resposta a
 * uma ação do usuário e some sozinho depois de ~2s.
 *
 * - Disparo por prop `trigger` (número que incrementa a cada ação) — o
 *   chamador nunca espera a animação: ela roda em paralelo, não bloqueante.
 * - prefers-reduced-motion: aparição estática, sem animação.
 * - Decorativo (aria-hidden): feedback visual, nunca a única confirmação.
 */

import { useEffect, useRef, useState } from 'react'

import Mascot, { type MascotPose } from './Mascot'

export interface MascotPopProps {
  pose: MascotPose
  /** Incremente (1, 2, 3…) a cada ação; cada incremento dispara um pop. 0 = oculto. */
  trigger: number
  size?: number
  className?: string
  /** Tempo visível após o pop, em ms. */
  lingerMs?: number
}

export default function MascotPop({
  pose,
  trigger,
  size = 96,
  className = '',
  lingerMs = 2000,
}: MascotPopProps) {
  const [visible, setVisible] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (trigger <= 0) return

    setVisible(true)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // requestAnimationFrame: garante que o elemento montou antes de animar.
    const raf = requestAnimationFrame(() => {
      const el = boxRef.current
      if (el && !reduceMotion) {
        el.animate(
          [
            { transform: 'scale(0.3) translateY(24px)', opacity: 0 },
            { transform: 'scale(1.12) translateY(-8px)', opacity: 1, offset: 0.6 },
            { transform: 'scale(0.97) translateY(0)', opacity: 1, offset: 0.85 },
            { transform: 'scale(1) translateY(0)', opacity: 1 },
          ],
          { duration: 550, easing: 'cubic-bezier(0.22, 1.2, 0.36, 1)' },
        )
      }
    })

    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setVisible(false), lingerMs)

    return () => {
      cancelAnimationFrame(raf)
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [trigger, lingerMs])

  if (!visible) return null

  return (
    <div ref={boxRef} aria-hidden="true" className={`pointer-events-none ${className}`}>
      <Mascot pose={pose} size={size} />
    </div>
  )
}
