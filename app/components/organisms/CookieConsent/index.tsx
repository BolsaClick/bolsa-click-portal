'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { useConsent } from '../../providers/ConsentProvider'
import { CONSENT_OPEN_EVENT } from '@/app/lib/consent/storage'
import { CookieBanner } from './CookieBanner'
import { CookiePreferences } from './CookiePreferences'

export default function CookieConsent() {
  const pathname = usePathname()
  const { hydrated, hasDecision, categories, acceptAll, rejectAll, save } =
    useConsent()
  const [prefsOpen, setPrefsOpen] = useState(false)

  // Fixed banner (z-[1100], full-width on mobile) sits on top of the inscription
  // form CTA. Hide it on checkout so the 3-step form is completable; accept /
  // refuse / customize still work on every other route, and the preferences
  // modal can still be opened via CONSENT_OPEN_EVENT.
  const hideBannerOnRoute = pathname.startsWith('/checkout')

  useEffect(() => {
    const open = () => setPrefsOpen(true)
    window.addEventListener(CONSENT_OPEN_EVENT, open)
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open)
  }, [])

  if (!hydrated) return null

  const showBanner = !hasDecision && !prefsOpen && !hideBannerOnRoute

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
