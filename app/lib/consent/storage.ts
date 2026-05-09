import {
  ALL_ACCEPTED,
  CONSENT_COOKIE_MAX_AGE,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  ConsentCategoriesState,
  ConsentState,
  DEFAULT_DENIED,
} from './categories'

export const CONSENT_CHANGE_EVENT = 'bc:consent-change'
export const CONSENT_OPEN_EVENT = 'bc:consent-open'
export const CONSENT_MAX_AGE_DAYS = 365

const isBrowser = () => typeof window !== 'undefined'

export function readConsent(): ConsentState | null {
  if (!isBrowser()) return null
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ConsentState
    if (parsed?.version !== CONSENT_VERSION) return null
    if (!parsed.categories) return null

    // Renew automático: invalidar consent mais antigo que CONSENT_MAX_AGE_DAYS
    const ts = parsed.ts ?? 0
    const ageMs = Date.now() - ts
    const maxAgeMs = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000
    if (ageMs > maxAgeMs) return null

    return {
      version: parsed.version,
      ts: parsed.ts ?? Date.now(),
      categories: { ...DEFAULT_DENIED, ...parsed.categories },
    }
  } catch {
    return null
  }
}

export function writeConsent(categories: ConsentCategoriesState): ConsentState {
  const state: ConsentState = {
    version: CONSENT_VERSION,
    ts: Date.now(),
    categories: { ...categories, necessary: true },
  }
  if (!isBrowser()) return state
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state))
    document.cookie =
      `${CONSENT_STORAGE_KEY}=${encodeURIComponent(JSON.stringify(state))};` +
      `Path=/;Max-Age=${CONSENT_COOKIE_MAX_AGE};SameSite=Lax`
    window.dispatchEvent(
      new CustomEvent<ConsentState>(CONSENT_CHANGE_EVENT, { detail: state })
    )
  } catch {
    // storage indisponível — segue só com state em memória
  }
  return state
}

export function acceptAll(): ConsentState {
  return writeConsent(ALL_ACCEPTED)
}

export function rejectAll(): ConsentState {
  return writeConsent(DEFAULT_DENIED)
}

export function clearConsent(): void {
  if (!isBrowser()) return
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY)
    document.cookie = `${CONSENT_STORAGE_KEY}=;Path=/;Max-Age=0;SameSite=Lax`
  } catch {
    // ignore
  }
}

export function consentVersionKey(state: ConsentState | null): string {
  if (!state) return 'no-consent'
  return Object.entries(state.categories)
    .map(([k, v]) => `${k}:${v ? 1 : 0}`)
    .join('|')
}
