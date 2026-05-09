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

  useEffect(() => {
    const open = () => setPrefsOpen(true)
    window.addEventListener(CONSENT_OPEN_EVENT, open)
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open)
  }, [])

  if (!hydrated) return null

  const showBanner = !hasDecision && !prefsOpen

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
