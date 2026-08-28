'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { useConsent } from '../../providers/ConsentProvider'
import { CONSENT_OPEN_EVENT } from '@/app/lib/consent/storage'
import { isInscriptionRoute } from '@/app/lib/consent/inscription-route'
import { CookieBanner } from './CookieBanner'
import { CookiePreferences } from './CookiePreferences'

export default function CookieConsent() {
  const pathname = usePathname()
  const { hydrated, hasDecision, categories, acceptAll, rejectAll, save } =
    useConsent()
  const [prefsOpen, setPrefsOpen] = useState(false)

  // Fixed banner (z-[1100], full-width on mobile) sits on top of the
  // inscription form CTAs. Hide on every checkout/matricula rail — not only
  // /checkout/estacio. Accept / refuse / customize still work elsewhere.
  const hideBannerOnRoute = isInscriptionRoute(pathname)
  const showBanner = hydrated && !hasDecision && !prefsOpen && !hideBannerOnRoute

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
      <AnimatePresence>
        {showBanner && (
          <CookieBanner
            onAcceptAll={acceptAll}
            onReject={rejectAll}
            onCustomize={() => setPrefsOpen(true)}
          />
        )}
      </AnimatePresence>

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
