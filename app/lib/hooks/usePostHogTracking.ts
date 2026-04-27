'use client'

import { useCallback } from 'react'
import { usePostHog } from 'posthog-js/react'

type PostHogProperties = Record<string, string | number | boolean | null | undefined>

export function usePostHogTracking() {
  const posthog = usePostHog()

  // Memoized so consumers can safely use these in useEffect deps
  // without re-firing the effect on every render.
  const trackEvent = useCallback(
    (eventName: string, properties?: PostHogProperties) => {
      if (posthog) {
        posthog.capture(eventName, {
          ...properties,
          timestamp: new Date().toISOString(),
        })
      }
    },
    [posthog],
  )

  const identifyUser = useCallback(
    (userId: string, properties?: PostHogProperties) => {
      if (posthog) {
        posthog.identify(userId, properties)
      }
    },
    [posthog],
  )

  const setUserProperties = useCallback(
    (properties: PostHogProperties) => {
      if (posthog) {
        posthog.setPersonProperties(properties)
      }
    },
    [posthog],
  )

  return {
    trackEvent,
    identifyUser,
    setUserProperties,
    posthog,
  }
}

