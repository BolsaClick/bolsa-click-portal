'use client'

import { useLayoutEffect } from 'react'

/**
 * Layout-level flag so leftover Wati/WhatsApp iframes cannot cover inscription
 * CTAs — including /checkout/matricula error and mobile 375px, where widgets
 * were injected on a previous page (client nav).
 *
 * useLayoutEffect runs before paint. The inline script in checkout/layout
 * covers the first HTML paint on a full load, before React hydrates.
 *
 * O banner de cookies saiu DE PROPÓSITO desta lista: escondê-lo aqui era o que
 * deixava o checkout sem consent e, por consequência, sem PostHog e sem
 * medição nenhuma. Ele agora aparece no checkout e o CTA é protegido por
 * layout (ver globals.css: `html.cookie-banner-visible [data-checkout-inscription]`
 * e `.checkout-step-cta`). Só widgets de chat de terceiros seguem ocultos.
 */
const OVERLAY_SELECTOR = [
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
