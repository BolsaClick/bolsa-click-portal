/**
 * Utilitário para gerenciar feature flags via variáveis de ambiente
 */

/**
 * Verifica se uma feature flag está ativa
 * @param flagName - Nome da feature flag
 * @returns true se a flag estiver ativa, false caso contrário
 */
export function isFeatureEnabled(flagName: string): boolean {
  const envKey = `NEXT_PUBLIC_FEATURE_${flagName.toUpperCase()}`
  const envValue = process.env[envKey]
  
  const result = envValue === 'true' || envValue === '1'
  
  // Debug sempre (para verificar se está funcionando)
  console.log(`🔍 Feature Flag "${flagName}":`, {
    envKey,
    envValue,
    result,
    allEnv: typeof window !== 'undefined' ? 'client-side' : 'server-side',
  })
  
  return result
}

/**
 * Verifica se a feature flag "marketplace" está ativa
 */
export function isMarketplaceEnabled(): boolean {
  return isFeatureEnabled('marketplace')
}

