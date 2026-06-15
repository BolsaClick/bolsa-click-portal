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
 * Padrão (true): checkout habilitado com cobrança de matrícula via PIX.
 * Quando disabled no PostHog: sem pagamento, sem endpoint de checkout — só create-inscription.
 */
export function usePixEnabledFeatureFlag() {
  const { flagValue } = usePostHogFeatureFlag('pix_enabled', true)
  return flagValue as boolean
}

/**
 * Hook específico para feature flag de visibilidade do WhatsApp.
 * Controla a exibição de todos os elementos de WhatsApp (links, botões, widget, checkbox).
 * Padrão (true): WhatsApp visível. Configure rollout % no PostHog para controlar a porcentagem de usuários.
 */
export function useWhatsappFeatureFlag() {
  const { flagValue } = usePostHogFeatureFlag('whatsapp_enabled', true)
  return flagValue as boolean
}

/**
 * Hook para acessar todas as feature flags de uma vez
 * Útil para A/B tests que consultam múltiplas flags
 */
export function useFeatureFlags() {
  const posthog = usePostHog()
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean | string>>({})
  const [isFeatureFlagLoading, setIsFeatureFlagLoading] = useState(true)

  useEffect(() => {
    if (!posthog) {
      setIsFeatureFlagLoading(false)
      return
    }

    const getAllFlags = () => {
      try {
        const flags: Record<string, boolean | string> = {
          'course_card_redesign_v2': posthog.isFeatureEnabled('course_card_redesign_v2') ?? false,
          'marketplace': posthog.isFeatureEnabled('marketplace') ?? false,
          'pix-before-enrollment': posthog.isFeatureEnabled('pix-before-enrollment') ?? false,
          'pix_enabled': posthog.isFeatureEnabled('pix_enabled') ?? true,
          'whatsapp_enabled': posthog.isFeatureEnabled('whatsapp_enabled') ?? true,
        }
        setFeatureFlags(flags)
        setIsFeatureFlagLoading(false)

        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 PostHog Feature Flags:', flags)
        }
      } catch (error) {
        console.error('Erro ao obter feature flags:', error)
        setIsFeatureFlagLoading(false)
      }
    }

    getAllFlags()

    const unsubscribe = posthog.onFeatureFlags(() => {
      getAllFlags()
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [posthog])

  return { featureFlags, isFeatureFlagLoading }
}

