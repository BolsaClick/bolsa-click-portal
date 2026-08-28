'use client'

import { useEffect } from 'react'

/**
 * Layout-level flag so the cookie banner (and other fixed bottom widgets)
 * cannot cover inscription CTAs — even if CookieConsent's pathname check
 * misses on mobile or on the /checkout/matricula error state.
 */
export function InscriptionRouteFlag() {
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('on-inscription-route')
    return () => {
      root.classList.remove('on-inscription-route')
    }
  }, [])

  return null
}
