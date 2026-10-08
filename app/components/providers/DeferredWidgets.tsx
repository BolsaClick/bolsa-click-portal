'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { isInscriptionRoute } from '@/app/lib/consent/inscription-route'

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
const VocationalTab = dynamic(
  () => import('../VocationalTab').then((m) => m.VocationalTab),
  { ssr: false },
)

export function DeferredWidgets() {
  const pathname = usePathname()
  const onInscription = isInscriptionRoute(pathname)
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
      {/* CookieConsent monta em TODA rota, inclusive o checkout. Ele ficava de
          fora das rotas de inscrição desde o #87 (o banner fixo cobria o CTA no
          mobile), e o efeito colateral era que justamente onde a medição mais
          importa ninguém era perguntado: sem decisão não há consent, sem
          consent o PostHog não inicializa e o funil de checkout inteiro ficava
          cego. O CTA passa a ser protegido por layout, não escondendo a
          pergunta — ver `html.cookie-banner-visible [data-checkout-inscription]`
          em globals.css e o z-index de `.checkout-step-cta`.
          VocationalTab continua fora: é isca de topo de funil e não tem o que
          fazer no meio de uma inscrição. */}
      <CookieConsent />
      {onInscription ? null : <VocationalTab />}
    </>
  )
}
