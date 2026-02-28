'use client'

import { useEffect } from 'react'

export function DataFastProvider() {
  useEffect(() => {
    import('datafast').then(({ initDataFast }) => {
      initDataFast({
        websiteId: 'dfid_2qBtY8GtmczBXS9ZBqmDA',
      })
    })
  }, [])

  return null
}
