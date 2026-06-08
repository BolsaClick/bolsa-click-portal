import { readConsent } from '@/app/lib/consent/storage'

type FbqFn = (...args: unknown[]) => void

function getFbq(): FbqFn | null {
  if (typeof window === 'undefined') return null
  const fbq = (window as unknown as Record<string, unknown>).fbq
  return typeof fbq === 'function' ? (fbq as FbqFn) : null
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : undefined
}

function marketingAllowed(): boolean {
  return readConsent()?.categories.marketing === true
}

function newEventId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export interface FbqUser {
  email?: string
  phone?: string
  /** CPF (só dígitos) → external_id */
  externalId?: string
  firstName?: string
  lastName?: string
  city?: string
  state?: string
}

export function trackFbq(eventName: string, data?: Record<string, unknown>): void {
  const fbq = getFbq()
  if (!fbq) return
  try {
    if (data) {
      fbq('track', eventName, data)
    } else {
      fbq('track', eventName)
    }
  } catch {
    // Pixel internal error — keep app running.
  }
}

export function trackFbqCustom(eventName: string, data?: Record<string, unknown>): void {
  const fbq = getFbq()
  if (!fbq) return
  try {
    if (data) {
      fbq('trackCustom', eventName, data)
    } else {
      fbq('trackCustom', eventName)
    }
  } catch {
    // ignore
  }
}

/**
 * Dispara o evento no pixel do browser E na Conversions API (server), com o
 * MESMO event_id para deduplicação. Espelha trackTikTokDual. O envio server
 * garante a entrega mesmo com ad-blocker/ITP, e o advanced matching (user)
 * eleva o EMQ. Tudo gateado pelo consentimento de marketing (paridade LGPD).
 *
 * Passe `eventId` explícito quando precisar casar com um id server-side
 * conhecido (ex.: Purchase usa externalTransactionId nos dois lados).
 */
export async function trackFbqDual(
  eventName: string,
  data?: Record<string, unknown>,
  user?: FbqUser,
  eventId?: string,
): Promise<void> {
  if (!marketingAllowed()) return

  const id = eventId ?? newEventId()

  // 1) Pixel do browser, com eventID para dedup.
  const fbq = getFbq()
  if (fbq) {
    try {
      fbq('track', eventName, data ?? {}, { eventID: id })
    } catch {
      // Pixel internal error — segue para o server.
    }
  }

  // 2) Conversions API (server).
  try {
    fetch('/api/facebook/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        event: eventName,
        event_id: id,
        properties: data,
        user,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        fbp: readCookie('_fbp'),
        fbc: readCookie('_fbc'),
      }),
    }).catch(() => {})
  } catch {
    // ignore
  }
}
