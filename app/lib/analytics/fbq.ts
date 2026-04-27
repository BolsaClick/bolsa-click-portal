type FbqFn = (...args: unknown[]) => void

function getFbq(): FbqFn | null {
  if (typeof window === 'undefined') return null
  const fbq = (window as unknown as Record<string, unknown>).fbq
  return typeof fbq === 'function' ? (fbq as FbqFn) : null
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
