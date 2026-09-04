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
 * Hook específico para a feature flag 'marketplace_enabled' (kill switch).
 *
 * Decisão de negócio (2026-08): a chamada createMarketplaceInscription
 * (create-inscription-marketplace, canalVendas.id=141) foi DESATIVADA porque
 * cria uma inscrição DUPLICADA na Cogna para ofertas ATHENAS — uma via
 * createInscription normal + outra via marketplace. Nasce OFF (default
 * `false`): com a flag desligada (estado atual) o marketplace não dispara.
 * Religável subindo esta mesma flag no PostHog para 100% — mesma flag do
 * lado servidor em confirm-matricula.ts (isServerFlagEnabled('marketplace_enabled', false)).
 * NÃO apagar createMarketplaceInscription nem o endpoint — só parar de chamar.
 */
export function useMarketplaceFeatureFlag() {
  const { flagValue } = usePostHogFeatureFlag('marketplace_enabled', false)
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
 * Padrão (false, 2026-07-27): WhatsApp escondido — Rodrigo removeu o CTA em
 * todo o site (foco no cadastro dentro do checkout até a página de sucesso;
 * o Ads mostrava 42 conversões desviadas pro WhatsApp). Fail-closed também
 * corrige o caso de o PostHog não responder a tempo (antes caía em "true").
 */
export function useWhatsappFeatureFlag() {
  const { flagValue } = usePostHogFeatureFlag('whatsapp_enabled', false)
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
          'marketplace_enabled': posthog.isFeatureEnabled('marketplace_enabled') ?? false,
          'pix-before-enrollment': posthog.isFeatureEnabled('pix-before-enrollment') ?? false,
          'pix_enabled': posthog.isFeatureEnabled('pix_enabled') ?? true,
          'whatsapp_enabled': posthog.isFeatureEnabled('whatsapp_enabled') ?? false,
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

