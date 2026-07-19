'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { useConsent } from './ConsentProvider'

const ALLOWED = new Set(['LCP', 'INP', 'CLS', 'FCP', 'TTFB'])

export function WebVitalsReporter() {
  const { isCategoryEnabled } = useConsent()

  useReportWebVitals((metric) => {
    if (!isCategoryEnabled('analytics') || !ALLOWED.has(metric.name)) return
    const body = JSON.stringify({
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      navigationType: metric.navigationType,
      path: window.location.pathname,
      site: process.env.NEXT_PUBLIC_THEME ?? 'bolsaclick',
      ts: Date.now(),
    })
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/seo/vitals', new Blob([body], { type: 'application/json' }))
      return
    }
    fetch('/api/seo/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => undefined)
  })

  return null
}
