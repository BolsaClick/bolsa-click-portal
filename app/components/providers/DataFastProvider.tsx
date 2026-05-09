'use client'

import { useEffect, useRef } from 'react'
import { useConsent } from './ConsentProvider'

export function DataFastProvider() {
  const { hydrated, isCategoryEnabled } = useConsent()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!hydrated || initializedRef.current) return
    if (!isCategoryEnabled('analytics')) return
    initializedRef.current = true
    import('datafast').then(({ initDataFast }) => {
      initDataFast({
        websiteId: 'dfid_2qBtY8GtmczBXS9ZBqmDA',
      })
    })
  }, [hydrated, isCategoryEnabled])

  return null
}
