import { normalizeEmail, normalizePhone, sha256 } from './hash'

type TtqFn = (...args: unknown[]) => void

function getTtq(): TtqFn | null {
  if (typeof window === 'undefined') return null
  const ttq = (window as unknown as Record<string, unknown>).ttq
  if (!ttq) return null
  if (typeof ttq === 'function') return ttq as TtqFn
  // Snippet inicial cria ttq como objeto-array. Suporta .push() até carregar.
  return ttq as unknown as TtqFn
}

function callTtq(method: string, ...args: unknown[]): void {
  const ttq = getTtq()
  if (!ttq) return
  try {
    if (typeof ttq === 'function') {
      ttq(method, ...args)
    } else {
      const queue = (ttq as unknown as { push?: (a: unknown[]) => void }).push
      if (typeof queue === 'function') queue([method, ...args])
    }
  } catch {
    // ignore
  }
}

export function trackTikTok(
  eventName: string,
  data?: Record<string, unknown>,
  eventId?: string,
): void {
  const payload = { ...(data ?? {}), ...(eventId ? { event_id: eventId } : {}) }
  callTtq('track', eventName, payload)
}

export interface TikTokUser {
  email?: string
  phone?: string
  externalId?: string
}

export async function identifyTikTok(user: TikTokUser): Promise<void> {
  const payload: Record<string, string> = {}
  if (user.email) payload.email = await sha256(normalizeEmail(user.email))
  if (user.phone) payload.phone_number = await sha256(normalizePhone(user.phone))
  if (user.externalId) payload.external_id = await sha256(user.externalId)
  if (Object.keys(payload).length === 0) return
  callTtq('identify', payload)
}

export async function trackTikTokDual(
  eventName: string,
  data?: Record<string, unknown>,
  user?: TikTokUser,
): Promise<void> {
  const eventId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`

  if (user) {
    await identifyTikTok(user).catch(() => {})
  }
  trackTikTok(eventName, data, eventId)

  try {
    fetch('/api/tiktok/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        event: eventName,
        event_id: eventId,
        properties: data,
        user,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      }),
    }).catch(() => {})
  } catch {
    // ignore
  }
}
