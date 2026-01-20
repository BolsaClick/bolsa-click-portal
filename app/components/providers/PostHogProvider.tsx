"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react"
import { Suspense, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.posthog.com"
    
    if (!posthogKey) {
      console.warn("⚠️ NEXT_PUBLIC_POSTHOG_KEY não está definida")
      return
    }
    
    posthog.init(posthogKey, {
      api_host: posthogHost,
      ui_host: posthogHost,
      capture_pageview: false, // We capture pageviews manually
      capture_pageleave: true, // Enable pageleave capture
      debug: process.env.NODE_ENV === "development",
      advanced_disable_feature_flags_on_first_load: false, // Habilitar feature flags
      loaded: () => {
        // Garantir que feature flags sejam carregadas
        if (process.env.NODE_ENV === "development") {
          console.log("✅ PostHog loaded with feature flags enabled", {
            api_host: posthogHost,
            ui_host: posthogHost,
          })
        }
      },
    })
  }, [])

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  )
}

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthogClient = usePostHog()

  useEffect(() => {
    if (pathname && posthogClient) {
      let url = window.origin + pathname
      const search = searchParams.toString()
      if (search) {
        url += "?" + search
      }
      posthogClient.capture("$pageview", { "$current_url": url })
    }
  }, [pathname, searchParams, posthogClient])

  return null
}

function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  )
}