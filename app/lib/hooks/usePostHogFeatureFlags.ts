'use client'

import { usePostHog } from 'posthog-js/react'
import { useEffect, useState } from 'react'

/**
 * Hook para usar feature flags do PostHog
 * @param flagKey - Nome da feature flag no PostHog
 * @param defaultValue - Valor padrão caso a flag não esteja disponível
 * @returns Valor da feature flag (boolean ou string)
 */
export function usePostHogFeatureFlag(flagKey: string, defaultValue: boolean | string = false) {
  const posthog = usePostHog()
  const [flagValue, setFlagValue] = useState<boolean | string>(defaultValue)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!posthog) {
      setIsLoading(false)
      return
    }

    // Função para obter o valor da feature flag
    const getFeatureFlag = () => {
      try {
        const value = posthog.isFeatureEnabled(flagKey)
        setFlagValue(value ?? defaultValue)
        setIsLoading(false)
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔍 PostHog Feature Flag "${flagKey}":`, value ?? defaultValue)
        }
      } catch (error) {
        console.error(`Erro ao obter feature flag "${flagKey}":`, error)
        setFlagValue(defaultValue)
        setIsLoading(false)
      }
    }

    // Obter valor inicial
    getFeatureFlag()

    // Escutar mudanças na feature flag
    const unsubscribe = posthog.onFeatureFlags(() => {
      getFeatureFlag()
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [posthog, flagKey, defaultValue])

  return { flagValue, isLoading }
}

/**
 * Hook específico para feature flag de marketplace
 */
export function useMarketplaceFeatureFlag() {
  const { flagValue } = usePostHogFeatureFlag('marketplace', false)
  return flagValue as boolean
}

/**
 * Hook específico para feature flag de cobrança PIX antes da matrícula
 */
export function usePixBeforeEnrollmentFeatureFlag() {
  const { flagValue } = usePostHogFeatureFlag('pix-before-enrollment', false)
  return flagValue as boolean
}

/**
 * Hook específico para feature flag pix_enabled (PostHog).
 * Padrão (false): sem pagamento, sem endpoint de checkout, sem taxas/valores — só create-inscription.
 * Quando enabled no PostHog: checkout com endpoint, taxas/valores e PIX.
 */
export function usePixEnabledFeatureFlag() {
  const { flagValue } = usePostHogFeatureFlag('pix_enabled', false)
  return flagValue as boolean
}

