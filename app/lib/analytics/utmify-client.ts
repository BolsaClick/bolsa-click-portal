// Helper client-only para extrair os parâmetros de tracking que a UTMify
// armazena no browser. O script da UTMify (cdn.utmify.com.br/scripts/utms)
// guarda os UTMs em localStorage e cookies. Esta função lê tanto o storage
// quanto a URL atual como fallback.

export interface UtmifyTrackingParams {
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  utmTerm: string | null
  src: string | null
  sck: string | null
}

const EMPTY: UtmifyTrackingParams = {
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  utmContent: null,
  utmTerm: null,
  src: null,
  sck: null,
}

function readUrlParams(): Partial<UtmifyTrackingParams> {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  return {
    utmSource: params.get('utm_source'),
    utmMedium: params.get('utm_medium'),
    utmCampaign: params.get('utm_campaign'),
    utmContent: params.get('utm_content'),
    utmTerm: params.get('utm_term'),
    src: params.get('src'),
    sck: params.get('sck'),
  }
}

function readLocalStorage(): Partial<UtmifyTrackingParams> {
  if (typeof window === 'undefined') return {}
  try {
    // UTMify usa "utmify_utms" como chave principal (objeto JSON).
    const raw = window.localStorage.getItem('utmify_utms')
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, string | undefined>
    return {
      utmSource: parsed.utm_source ?? null,
      utmMedium: parsed.utm_medium ?? null,
      utmCampaign: parsed.utm_campaign ?? null,
      utmContent: parsed.utm_content ?? null,
      utmTerm: parsed.utm_term ?? null,
      src: parsed.src ?? null,
      sck: parsed.sck ?? null,
    }
  } catch {
    return {}
  }
}

/**
 * Retorna os UTMs atuais. Prioridade: URL > localStorage da UTMify > null.
 * URL ganha porque um usuário vindo numa sessão velha + nova campanha deve
 * atribuir à campanha nova.
 */
export function readUtmifyParams(): UtmifyTrackingParams {
  if (typeof window === 'undefined') return EMPTY
  const fromUrl = readUrlParams()
  const fromStorage = readLocalStorage()
  return {
    utmSource: fromUrl.utmSource || fromStorage.utmSource || null,
    utmMedium: fromUrl.utmMedium || fromStorage.utmMedium || null,
    utmCampaign: fromUrl.utmCampaign || fromStorage.utmCampaign || null,
    utmContent: fromUrl.utmContent || fromStorage.utmContent || null,
    utmTerm: fromUrl.utmTerm || fromStorage.utmTerm || null,
    src: fromUrl.src || fromStorage.src || null,
    sck: fromUrl.sck || fromStorage.sck || null,
  }
}
