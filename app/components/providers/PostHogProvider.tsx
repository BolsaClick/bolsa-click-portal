"use client"

import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react"
import { Suspense, useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import type { PostHog } from "posthog-js"
import { useConsent } from "./ConsentProvider"
import { whenIdle } from '@/app/lib/utils/when-idle'
import {
  discardPostHogBuffer,
  flushPostHogBuffer,
} from '@/app/lib/analytics/pre-consent-buffer'


export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { hydrated, hasDecision, isCategoryEnabled } = useConsent()
  const initializedRef = useRef(false)
  const [posthogClient, setPosthogClient] = useState<PostHog | null>(null)
  const analyticsAllowed = hydrated && isCategoryEnabled("analytics")

  // Recusa explícita de analytics: a fila em memória é descartada na hora, sem
  // nunca ter saído do device. É o outro lado do contrato do buffer — ele só
  // existe porque o aceite pode chegar DEPOIS do evento, nunca para contornar
  // a decisão de quem disse não.
  useEffect(() => {
    if (hydrated && hasDecision && !analyticsAllowed) {
      discardPostHogBuffer()
    }
  }, [hydrated, hasDecision, analyticsAllowed])

  useEffect(() => {
    if (!analyticsAllowed || initializedRef.current) return

    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "/ingest"
    // ui_host é o domínio REAL do PostHog (dashboard), não o proxy — o SDK usa
    // isso pra montar links (toolbar, "ver no PostHog"), que precisam apontar
    // pra app.posthog.com/us.posthog.com e não pro nosso /ingest. Region-aware
    // via env própria; default assume US (mesma região do NEXT_PUBLIC_POSTHOG_HOST
    // atual, us.i.posthog.com).
    const posthogUiHost = process.env.NEXT_PUBLIC_POSTHOG_UI_HOST || "https://us.posthog.com"

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
      ui_host: posthogUiHost,
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
              ui_host: posthogUiHost,
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

      // Dispara o consent_given que o ConsentProvider não conseguiu emitir: no
      // 1º "aceitar", o PostHog ainda não existia (ele é gated pelo próprio
      // consent), então o evento foi enfileirado em sessionStorage. Emite uma
      // única vez e limpa — não re-dispara em reloads.
      try {
        const pending = sessionStorage.getItem("ph_pending_consent")
        if (pending) {
          sessionStorage.removeItem("ph_pending_consent")
          posthog.capture("consent_given", JSON.parse(pending))
        }
      } catch {
        /* sessionStorage indisponível / JSON inválido — ignora */
      }

      // Sobe o que ficou represado antes do aceite — com o timestamp ORIGINAL
      // de cada evento, senão o funil chegaria todo colado no instante do
      // consent e a ordem (viewed → identified → submitted) se perderia.
      const flushed = flushPostHogBuffer(posthog)
      if (process.env.NODE_ENV === "development" && flushed > 0) {
        console.log(`✅ PostHog: ${flushed} evento(s) pré-consent enviados`)
      }
    })
  }, [analyticsAllowed])

  // O PHProvider fica SEMPRE montado, mesmo sem cliente. Antes a árvore
  // trocava de forma quando o consent chegava (`<>{children}</>` virava
  // `<PHProvider>{children}</PHProvider>`), e trocar o tipo do pai faz o React
  // desmontar e remontar TODA a subárvore: o estado de componente ia junto.
  //
  // Medido no browser em 2026-10-08, com sondas de mount/unmount em cada nível
  // de ClientProviders e A/B contra o HEAD. Com a troca de forma, ao clicar em
  // "Aceitar tudo": desmontavam as sondas DENTRO do PostHogProvider (PostHog,
  // QueryClient, Auth, Global) e sobrevivia só a de FORA — a fronteira do
  // remount era exatamente este componente. Efeito visível: "Enfermagem"
  // digitado na home voltava vazio, em um nó de DOM novo. Com o provider fixo,
  // zero unmounts e o valor preservado.
  //
  // Isso era inofensivo enquanto o banner não aparecia no checkout. Agora que
  // aparece, seria o pior lugar possível: aceitar cookies no meio do
  // formulário apagaria os dados já digitados pelo candidato. Mantendo o
  // provider fixo, o consent passa a trocar só o VALOR do contexto — re-render,
  // nunca remount.
  //
  // ATENÇÃO — ESTE FIX TEM UM PAR. NÃO MEXA EM UM SEM O OUTRO.
  //
  // O remount mascarava a perda de eventos, porque remontar re-disparava os
  // efeitos e os eventos apareciam por acidente. Com o remount fechado, os
  // efeitos NÃO re-disparam e o buffer deixa de ser cinto de segurança e vira a
  // ÚNICA coisa que salva o `checkout_viewed`. Ou seja: o fix do remount
  // sozinho nos faria PERDER o topo do funil.
  //
  // Por isso este arquivo e o app/lib/analytics/pre-consent-buffer.ts são uma
  // coisa só: corrigir o remount sem o buffer troca "apaga o formulário do
  // candidato" por "perde o denominador do funil em silêncio". Quem reverter um
  // tem de reverter o outro.
  //
  // Sem `client`, o PHProvider cai no singleton global do SDK (ainda sem
  // `init()`): `usePostHog()` devolve um objeto não-inicializado, que o
  // `isPostHogReady` de usePostHogTracking reconhece como "não pronto" e manda
  // para a fila. Nada é enviado nem persistido antes do aceite.
  // O tipo do PHProvider exige `client` definido OU `apiKey`. Passar `apiKey`
  // resolveria o tipo, mas faria o PRÓPRIO provider chamar `init()` — isto é,
  // ligaria o PostHog sem consent, exatamente o que não pode acontecer. O cast
  // mantém o runtime correto (sem client o SDK usa o singleton não
  // inicializado) sem abrir essa porta.
  return (
    <PHProvider client={posthogClient as PostHog}>
      {posthogClient ? <SuspendedPostHogPageView /> : null}
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