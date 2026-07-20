'use client'

import { useEffect, useRef, useState } from 'react'

const SESSION_KEY = 'exitIntentShown'

/**
 * Detecta o padrão clássico de exit-intent: o mouse sai da viewport pelo topo
 * (`mouseleave` do documento com `clientY <= 0`). Dispara uma única vez por
 * sessão — controlado via sessionStorage pra sobreviver a navegações internas
 * (o layout raiz não desmonta os widgets globais entre rotas).
 */
export function useExitIntent(): boolean {
  const [triggered, setTriggered] = useState(false)
  const armedRef = useRef(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(SESSION_KEY)) {
      armedRef.current = false
      return
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (!armedRef.current || e.clientY > 0) return
      armedRef.current = false
      sessionStorage.setItem(SESSION_KEY, '1')
      setTriggered(true)
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [])

  return triggered
}
