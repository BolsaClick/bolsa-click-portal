'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useConsent } from '../../providers/ConsentProvider'
import { CONSENT_OPEN_EVENT } from '@/app/lib/consent/storage'
import { CookieBanner } from './CookieBanner'
import { CookiePreferences } from './CookiePreferences'

export default function CookieConsent() {
  const { hydrated, hasDecision, categories, acceptAll, rejectAll, save } =
    useConsent()
  const [prefsOpen, setPrefsOpen] = useState(false)
  const [forceHidden, setForceHidden] = useState(false)

  useEffect(() => {
    const open = () => setPrefsOpen(true)
    window.addEventListener(CONSENT_OPEN_EVENT, open)
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open)
  }, [])

  const showBanner = !hasDecision && !prefsOpen

  useEffect(() => {
    if (showBanner) {
      setForceHidden(false)
      return
    }
    // A saída do banner anima via requestAnimationFrame (framer-motion), que o
    // browser suspende por completo com a aba em segundo plano — sem esse
    // fallback o banner some do AnimatePresence mas fica preso em tela
    // indefinidamente. setTimeout ainda dispara (só com clamp) em aba oculta,
    // ao contrário do rAF, então força o hard-hide bem depois da transição
    // normal (300ms) já ter tido chance de terminar sozinha.
    const timer = setTimeout(() => setForceHidden(true), 500)
    return () => clearTimeout(timer)
  }, [showBanner])

  if (!hydrated) return null

  return (
    <>
      <div
        aria-hidden={!showBanner || undefined}
        className={forceHidden ? 'invisible pointer-events-none' : undefined}
      >
        <AnimatePresence>
          {showBanner && (
            <CookieBanner
              onAcceptAll={acceptAll}
              onReject={rejectAll}
              onCustomize={() => setPrefsOpen(true)}
            />
          )}
        </AnimatePresence>
      </div>

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
