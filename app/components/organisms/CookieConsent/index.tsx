'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
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

  // Hide on every inscription rail — not only /checkout/estacio.
  // Also trust window.location (mobile / error remounts can briefly report
  // an empty usePathname while the URL is still /checkout/matricula).
  // No AnimatePresence: the exit fade left a fixed overlay on top of step 02/03.
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
