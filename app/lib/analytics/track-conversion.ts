'use client'

import { useCallback } from 'react'
import { trackFbqDual, type FbqUser } from './fbq'
import { pushDataLayerEvent } from './gtag'
import { usePostHogTracking } from '@/app/lib/hooks/usePostHogTracking'

/**
 * Wrapper de espelhamento de conversão: UMA chamada dispara Meta (Pixel +
 * Conversions API), Google (dataLayer/GA4) e PostHog, com o MESMO event_id
 * amarrando Meta ↔ PostHog.
 *
 * Por que existe: cada vendor tem vocabulário próprio (Meta 'Purchase', GA4
 * 'purchase', PostHog 'enrollment_converted') e cada superfície chamava os três
 * na mão — fácil esquecer um e criar receita visível num vendor e invisível em
 * outro (foi exatamente o gap do /checkout/success e das LPs). Concentrar num
 * único ponto mata a classe inteira desses gaps: quem espelha aqui não tem como
 * mandar pro pixel sem mandar pro PostHog.
 *
 * Cada campo (`meta`/`ga4`/`posthog`) é opcional — passe só os vendors que fazem
 * sentido pro evento. O consentimento continua sendo tratado por vendor:
 * trackFbqDual checa marketing; o dataLayer é inerte sem GTM (só carrega com
 * marketing); o PostHog só existe sob consent de analytics. O wrapper não muda
 * nada disso — só garante o mesmo id e a chamada única.
 */

type PostHogProperties = Record<string, string | number | boolean | null | undefined>

export interface ConversionMirrorSpec {
  /**
   * Id compartilhado entre o Pixel/CAPI do Meta e o PostHog (dedup + join
   * cross-vendor). Gerado automaticamente se omitido. Passe explícito quando
   * precisar casar com um id server-side conhecido (ex.: externalTransactionId
   * no Purchase, para dedupar com o confirmPaidMatricula).
   */
  eventId?: string
  /** Meta Pixel + Conversions API (via trackFbqDual). */
  meta?: { event: string; data?: Record<string, unknown>; user?: FbqUser }
  /** Google (dataLayer → GTM/GA4/Ads). Use o schema GA4 ecommerce nos params. */
  ga4?: { event: string; params?: Record<string, unknown> }
  /** PostHog (funil interno). O event_id compartilhado entra como propriedade. */
  posthog?: { event: string; props?: PostHogProperties }
}

function newEventId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Hook que devolve `mirror(spec)`. Retorna o event_id usado — útil quando o
 * caller precisa referenciá-lo depois (ex.: gravar na URL de sucesso).
 */
export function useConversionMirror() {
  const { trackEvent } = usePostHogTracking()

  return useCallback(
    (spec: ConversionMirrorSpec): string => {
      const id = spec.eventId ?? newEventId()

      if (spec.meta) {
        void trackFbqDual(spec.meta.event, spec.meta.data, spec.meta.user, id)
      }
      if (spec.ga4) {
        pushDataLayerEvent(spec.ga4.event, spec.ga4.params)
      }
      if (spec.posthog) {
        // event_id como propriedade permite cruzar o evento do PostHog com o
        // mesmo evento no Meta CAPI (e com o enrollment_paid_confirmed server).
        trackEvent(spec.posthog.event, { ...spec.posthog.props, event_id: id })
      }

      return id
    },
    [trackEvent],
  )
}
