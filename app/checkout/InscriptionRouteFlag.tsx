'use client'

import { useLayoutEffect } from 'react'

/**
 * Layout-level flag so the cookie banner and leftover Wati iframes cannot
 * cover inscription CTAs — including /checkout/matricula error and mobile
 * 375px, where widgets were injected on a previous page (client nav).
 *
 * useLayoutEffect runs before paint. The inline script in checkout/layout
 * covers the first HTML paint on a full load, before React hydrates.
 */
const OVERLAY_SELECTOR = [
  '[aria-label="Aviso de cookies"]',
  '#wati-whatsapp',
  'iframe[src*="clare.ai"]',
  'iframe[src*="wati"]',
  'iframe[src*="whatsapp"]',
].join(',')

export function InscriptionRouteFlag() {
  useLayoutEffect(() => {
    const root = document.documentElement
    root.classList.add('on-inscription-route')
    document.querySelectorAll(OVERLAY_SELECTOR).forEach((node) => {
      if (!(node instanceof HTMLElement)) return
      node.style.setProperty('display', 'none', 'important')
      node.style.setProperty('pointer-events', 'none', 'important')
      node.setAttribute('aria-hidden', 'true')
    })
    return () => {
      root.classList.remove('on-inscription-route')
    }
  }, [])

  return null
}
