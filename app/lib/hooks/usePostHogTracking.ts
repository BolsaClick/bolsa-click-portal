'use client'

import { useCallback } from 'react'
import { usePostHog } from 'posthog-js/react'
import { bufferPostHogOp } from '@/app/lib/analytics/pre-consent-buffer'

type PostHogProperties = Record<string, string | number | boolean | null | undefined>

/**
 * O PostHog está REALMENTE utilizável?
 *
 * Testar só a verdade do objeto (`if (posthog)`) não serve, e isto custou uma
 * rodada de verificação: `usePostHog()` nunca devolve undefined. O
 * `PostHogContext` do posthog-js/react tem valor DEFAULT — um getter que
 * retorna o singleton global do SDK — então, mesmo sem nenhum `PHProvider`
 * montado (que é exatamente o estado antes do consent), o hook devolve um
 * objeto. Um objeto que ainda não passou por `init()`: sem token, sem
 * transporte.
 *
 * `__loaded` é o que o próprio SDK marca ao concluir o `init()`. É esse o
 * sinal certo para decidir entre enviar agora ou enfileirar.
 */
function isPostHogReady(posthog: unknown): boolean {
  return !!(posthog as { __loaded?: boolean } | null | undefined)?.__loaded
}

export function usePostHogTracking() {
  const posthog = usePostHog()
  const ready = isPostHogReady(posthog)

  // Memoized so consumers can safely use these in useEffect deps
  // without re-firing the effect on every render.
  //
  // Sem PostHog inicializado (consent de analytics ainda não dado) a chamada
  // NÃO é descartada: vai para a fila em MEMÓRIA do pre-consent-buffer, que só
  // sobe se a pessoa aceitar e é jogada fora se recusar. Antes disso o
  // `checkout_viewed` se perdia — ele dispara no mount do checkout, isto é,
  // antes de a pessoa ter decidido qualquer coisa.
  const trackEvent = useCallback(
    (eventName: string, properties?: PostHogProperties) => {
      const withTimestamp = {
        ...properties,
        timestamp: new Date().toISOString(),
      }
      if (ready) {
        posthog.capture(eventName, withTimestamp)
      } else {
        bufferPostHogOp({ kind: 'capture', event: eventName, properties: withTimestamp })
      }
    },
    [posthog, ready],
  )

  const identifyUser = useCallback(
    (userId: string, properties?: PostHogProperties) => {
      if (ready) {
        posthog.identify(userId, properties)
      } else {
        bufferPostHogOp({ kind: 'identify', distinctId: userId, properties })
      }
    },
    [posthog, ready],
  )

  const setUserProperties = useCallback(
    (properties: PostHogProperties) => {
      if (ready) {
        posthog.setPersonProperties(properties)
      } else {
        bufferPostHogOp({ kind: 'person', properties })
      }
    },
    [posthog, ready],
  )

  return {
    trackEvent,
    identifyUser,
    setUserProperties,
    posthog,
  }
}

