'use client'

import { useEffect, useState } from 'react'
import { useConsent } from '../../providers/ConsentProvider'
import { CONSENT_OPEN_EVENT } from '@/app/lib/consent/storage'
import { CookieBanner } from './CookieBanner'
import { CookiePreferences } from './CookiePreferences'

export default function CookieConsent() {
  const { hydrated, hasDecision, categories, acceptAll, rejectAll, save } =
    useConsent()
  const [prefsOpen, setPrefsOpen] = useState(false)

  // Sem exceção de rota: o banner aparece também no checkout. Entre o #87 e o
  // #90 ele foi escondido nas rotas de inscrição porque, fixo no rodapé do
  // mobile, cobria o CTA dos passos 02/03. O preço disso era alto demais:
  // quem entra direto no checkout nunca era perguntado, nunca consentia, e o
  // PostHog — que só inicializa com consent — nunca carregava. O funil de
  // checkout inteiro ficava cego e nenhum teste A/B rodava ali.
  //
  // O CTA agora é defendido por LAYOUT, não escondendo a pergunta:
  // `html.cookie-banner-visible [data-checkout-inscription]` (globals.css)
  // reserva espaço no rodapé enquanto o banner estiver na tela, e
  // `.checkout-step-cta` tem z-index acima do banner.
  const showBanner = hydrated && !hasDecision && !prefsOpen

  useEffect(() => {
    const open = () => setPrefsOpen(true)
    window.addEventListener(CONSENT_OPEN_EVENT, open)
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('cookie-banner-visible', showBanner)
    return () => {
      root.classList.remove('cookie-banner-visible')
    }
  }, [showBanner])

  if (!hydrated) return null

  return (
    <>
      {showBanner ? (
        <CookieBanner
          onAcceptAll={acceptAll}
          onReject={rejectAll}
          onCustomize={() => setPrefsOpen(true)}
        />
      ) : null}

      <CookiePreferences
        open={prefsOpen}
        initial={categories}
        onClose={() => setPrefsOpen(false)}
        onSave={(c) => {
          save(c)
          setPrefsOpen(false)
        }}
        onAcceptAll={() => {
          acceptAll()
          setPrefsOpen(false)
        }}
        onReject={() => {
          rejectAll()
          setPrefsOpen(false)
        }}
      />
    </>
  )
}
