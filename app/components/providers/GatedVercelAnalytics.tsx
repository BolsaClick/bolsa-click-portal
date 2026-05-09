'use client'

import { Analytics } from '@vercel/analytics/react'
import { useConsent } from './ConsentProvider'

export function GatedVercelAnalytics() {
  const { hydrated, isCategoryEnabled } = useConsent()
  if (!hydrated || !isCategoryEnabled('analytics')) return null
  return <Analytics />
}
