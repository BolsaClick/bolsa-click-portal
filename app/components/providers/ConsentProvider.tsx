'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  ALL_ACCEPTED,
  CATEGORY_META,
  CONSENT_VERSION,
  ConsentCategoriesState,
  ConsentCategory,
  ConsentState,
  DEFAULT_DENIED,
} from '@/app/lib/consent/categories'
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_OPEN_EVENT,
  acceptAll,
  consentVersionKey,
  readConsent,
  rejectAll,
  writeConsent,
} from '@/app/lib/consent/storage'

type PostHogLite = { capture: (event: string, props?: Record<string, unknown>) => void }

function logConsentDecision(categories: ConsentCategoriesState) {
  if (typeof window === 'undefined') return

  // Server-side log para auditoria LGPD
  try {
    fetch('/api/consent-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categories,
        version: CONSENT_VERSION,
        ts: Date.now(),
      }),
      keepalive: true,
    }).catch(() => {
      /* offline / network — segue */
    })
  } catch {
    /* ignore */
  }

  // Evento PostHog quando analytics estiver habilitado
  try {
    const ph = (window as unknown as { posthog?: PostHogLite }).posthog
    if (ph && categories.analytics) {
      ph.capture('consent_given', {
        categories,
        version: CONSENT_VERSION,
      })
    }
  } catch {
    /* ignore */
  }
}

type ConsentContextValue = {
  hydrated: boolean
  state: ConsentState | null
  categories: ConsentCategoriesState
  versionKey: string
  hasDecision: boolean
  isCategoryEnabled: (c: ConsentCategory) => boolean
  acceptAll: () => void
  rejectAll: () => void
  save: (categories: ConsentCategoriesState) => void
  openPreferences: () => void
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  const [state, setState] = useState<ConsentState | null>(null)

  useEffect(() => {
    setState(readConsent())
    setHydrated(true)

    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<ConsentState>).detail
      if (detail) setState(detail)
    }
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange)
  }, [])

  const categories = useMemo<ConsentCategoriesState>(
    () => state?.categories ?? DEFAULT_DENIED,
    [state]
  )

  const value = useMemo<ConsentContextValue>(() => {
    return {
      hydrated,
      state,
      categories,
      versionKey: consentVersionKey(state),
      hasDecision: !!state,
      isCategoryEnabled: (c: ConsentCategory) => !!categories[c],
      acceptAll: () => {
        const next = acceptAll()
        setState(next)
        logConsentDecision(next.categories)
      },
      rejectAll: () => {
        const next = rejectAll()
        setState(next)
        logConsentDecision(next.categories)
      },
      save: (cats: ConsentCategoriesState) => {
        const next = writeConsent(cats)
        setState(next)
        logConsentDecision(next.categories)
      },
      openPreferences: () => {
        window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT))
      },
    }
  }, [hydrated, state, categories])

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  )
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext)
  if (!ctx) {
    return {
      hydrated: false,
      state: null,
      categories: DEFAULT_DENIED,
      versionKey: 'no-consent',
      hasDecision: false,
      isCategoryEnabled: () => false,
      acceptAll: () => {},
      rejectAll: () => {},
      save: () => {},
      openPreferences: () => {},
    }
  }
  return ctx
}

export { ALL_ACCEPTED, CATEGORY_META, DEFAULT_DENIED }
