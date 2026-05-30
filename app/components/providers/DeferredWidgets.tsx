'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Widgets não-críticos pro first paint / interatividade. Carregados com
// ssr:false E só montados depois que o browser fica idle — assim sonner,
// framer-motion (CookieConsent) e os scripts dos widgets NÃO competem com a
// hidratação inicial no main thread. Reduz TBT / JS execution time em mobile.
const Toaster = dynamic(() => import('sonner').then((m) => m.Toaster), {
  ssr: false,
})
const CookieConsent = dynamic(
  () => import('../organisms/CookieConsent'),
  { ssr: false },
)
const WatiWhatsappWidget = dynamic(
  () => import('../WatiWhatsappWidget').then((m) => m.WatiWhatsappWidget),
  { ssr: false },
)
const VocationalTab = dynamic(
  () => import('../VocationalTab').then((m) => m.VocationalTab),
  { ssr: false },
)

export function DeferredWidgets() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const win = window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number
      cancelIdleCallback?: (id: number) => void
    }
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    let idleId: number | undefined

    const reveal = () => setReady(true)

    if (typeof win.requestIdleCallback === 'function') {
      idleId = win.requestIdleCallback(reveal, { timeout: 3000 })
    } else {
      timeoutId = setTimeout(reveal, 1500)
    }

    return () => {
      if (idleId !== undefined && typeof win.cancelIdleCallback === 'function') {
        win.cancelIdleCallback(idleId)
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId)
    }
  }, [])

  if (!ready) return null

  return (
    <>
      <Toaster richColors position="top-right" />
      <WatiWhatsappWidget />
      <VocationalTab />
      <CookieConsent />
    </>
  )
}
