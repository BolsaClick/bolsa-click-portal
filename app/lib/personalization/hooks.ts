'use client'

import { useCallback, useEffect, useState } from 'react'
import { useConsent } from '@/app/components/providers/ConsentProvider'
import {
  LastSearch,
  PERSONALIZATION_CHANGE_EVENT,
  VisitedCourse,
  clearAllPersonalization,
  clearLastSearch,
  clearVisitedCourses,
  pushVisitedCourse,
  readLastSearch,
  readVisitedCourses,
  writeLastSearch,
} from '@/app/lib/personalization/storage'

export function useLastSearch() {
  const { hydrated, isCategoryEnabled } = useConsent()
  const enabled = hydrated && isCategoryEnabled('personalization')
  const [lastSearch, setLastSearch] = useState<LastSearch | null>(null)

  useEffect(() => {
    if (!hydrated) return
    if (!enabled) {
      clearLastSearch()
      setLastSearch(null)
      return
    }
    setLastSearch(readLastSearch())

    const onChange = () => setLastSearch(readLastSearch())
    window.addEventListener(PERSONALIZATION_CHANGE_EVENT, onChange)
    return () => window.removeEventListener(PERSONALIZATION_CHANGE_EVENT, onChange)
  }, [hydrated, enabled])

  const saveSearch = useCallback(
    (s: Omit<LastSearch, 'ts'>) => {
      if (!enabled) return
      writeLastSearch(s)
    },
    [enabled],
  )

  return { lastSearch, saveSearch, enabled }
}

export function useVisitedCourses() {
  const { hydrated, isCategoryEnabled } = useConsent()
  const enabled = hydrated && isCategoryEnabled('personalization')
  const [visited, setVisited] = useState<VisitedCourse[]>([])

  useEffect(() => {
    if (!hydrated) return
    if (!enabled) {
      clearVisitedCourses()
      setVisited([])
      return
    }
    setVisited(readVisitedCourses())

    const onChange = () => setVisited(readVisitedCourses())
    window.addEventListener(PERSONALIZATION_CHANGE_EVENT, onChange)
    return () => window.removeEventListener(PERSONALIZATION_CHANGE_EVENT, onChange)
  }, [hydrated, enabled])

  const recordVisit = useCallback(
    (c: Omit<VisitedCourse, 'ts'>) => {
      if (!enabled) return
      pushVisitedCourse(c)
    },
    [enabled],
  )

  return { visited, recordVisit, enabled }
}

export { clearAllPersonalization }
