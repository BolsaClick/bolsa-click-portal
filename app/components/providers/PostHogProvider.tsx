"use client"

import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react"
import { Suspense, useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import type { PostHog } from "posthog-js"
import { useConsent } from "./ConsentProvider"

// Defere init pra reduzir INP: PostHog é carregado dinamicamente e
// inicializado em requestIdleCallback (não compete com hidratação no
// main thread). Reduz INP > 200ms reportado em 96 URLs no GSC.
function whenIdle(cb: () => void): void {
  if (typeof window === "undefined") return
  const win = window as typeof window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number
  }
  if (typeof win.requestIdleCallback === "function") {
    win.requestIdleCallback(cb, { timeout: 5000 })
  } else {
    setTimeout(cb, 1)
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { hydrated, isCategoryEnabled } = useConsent()
  const initializedRef = useRef(false)
  const [posthogClient, setPosthogClient] = useState<PostHog | null>(null)
  const analyticsAllowed = hydrated && isCategoryEnabled("analytics")

  useEffect(() => {
    if (!analyticsAllowed || initializedRef.current) return

    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "/ingest"

    if (!posthogKey) {
      console.warn("⚠️ NEXT_PUBLIC_POSTHOG_KEY não está definida")
      return
    }

    initializedRef.current = true

    // Dynamic import tira o posthog-js (~50KB) do bundle inicial.
    // Combinado com whenIdle, garante que init não compita com hydration.
    whenIdle(async () => {
      const { default: posthog } = await import("posthog-js")
      posthog.init(posthogKey, {
      api_host: posthogHost,
      ui_host: posthogHost,
      capture_pageview: false, // We capture pageviews manually
      capture_pageleave: true, // Enable pageleave capture
      debug: process.env.NODE_ENV === "development",
      advanced_disable_feature_flags_on_first_load: false, // Habilitar feature flags
      // Decode URL-encoded UTM/campaign props so the same campaign isn't counted twice
      // (e.g. "[ABO] Campanha 01" vs "%5BABO%5D Campanha 01").
      sanitize_properties: (properties) => {
        if (!properties) return properties
        for (const key of Object.keys(properties)) {
          if (!/utm_|campaign|referrer/i.test(key)) continue
          const value = properties[key]
          if (typeof value !== "string" || !value.includes("%")) continue
          try {
            properties[key] = decodeURIComponent(value)
          } catch {
            // leave as-is if not decodable
          }
        }
        return properties
      },
      loaded: () => {
          if (process.env.NODE_ENV === "development") {
            console.log("✅ PostHog loaded with feature flags enabled", {
              api_host: posthogHost,
              ui_host: posthogHost,
            })
          }
        },
      })
      setPosthogClient(posthog)
      // Expõe a instância no window: vários call sites fora da árvore React
      // (captureChatEvent, ConsentProvider, ShareButton) usam window.posthog —
      // com o bundle npm (sem snippet) ele nunca existia e esses eventos
      // no-opavam em silêncio (chat_*, consent_given, vocational_test_shared
      // com ZERO ingestões confirmadas na auditoria de 2026-07-17).
      ;(window as unknown as Record<string, unknown>).posthog = posthog
    })
  }, [analyticsAllowed])

  if (!analyticsAllowed || !posthogClient) return <>{children}</>

  return (
    <PHProvider client={posthogClient}>
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