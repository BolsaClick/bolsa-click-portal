'use client'

import { usePostHog } from 'posthog-js/react'

type PostHogProperties = Record<string, string | number | boolean | null | undefined>

export function usePostHogTracking() {
  const posthog = usePostHog()

  const trackEvent = (eventName: string, properties?: PostHogProperties) => {
    if (posthog) {
      posthog.capture(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
      })
    }
  }

  const identifyUser = (userId: string, properties?: PostHogProperties) => {
    if (posthog) {
      posthog.identify(userId, properties)
    }
  }

  const setUserProperties = (properties: PostHogProperties) => {
    if (posthog) {
      posthog.setPersonProperties(properties)
    }
  }

  return {
    trackEvent,
    identifyUser,
    setUserProperties,
    posthog,
  }
}

