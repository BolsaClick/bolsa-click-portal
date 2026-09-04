'use client'

import { useEffect, useState } from 'react'

const DESKTOP_QUERY = '(min-width: 1024px)' // breakpoint `lg` do Tailwind

/**
 * Estado (confirmado no cliente) de "estamos numa viewport desktop
 * (>=1024px)". `initialValue` deve vir de uma checagem server-side por
 * User-Agent (`isMobileUserAgent`) — assim a maioria dos usuários reais já
 * nasce no estado certo (celular → false, desktop → true) sem esperar o
 * efeito, e o hook só corrige exceções (UA ambíguo, resize, emulação de
 * DevTools, rotação de tablet).
 *
 * Existe pra permitir NÃO montar componentes pesados e exclusivos de
 * desktop (ex.: FiltersPanel dentro do <aside> escondido por CSS) na
 * hidratação do celular — hidratar algo que está `display:none` custa o
 * mesmo tempo de main thread que hidratar algo visível.
 */
export function useIsDesktopViewport(initialValue: boolean): boolean {
  const [isDesktop, setIsDesktop] = useState(initialValue)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mql = window.matchMedia(DESKTOP_QUERY)
    setIsDesktop(mql.matches)

    const handleChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  return isDesktop
}
