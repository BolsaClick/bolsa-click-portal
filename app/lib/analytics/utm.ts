// Extração de UTMs no servidor.
//
// Existe porque a atribuição de mídia paga precisa chegar ao CRM, e nem toda
// superfície tem como mandar UTM explicitamente. O header `referer` da própria
// requisição carrega a URL da página que submeteu o formulário — e se a pessoa
// chegou por anúncio, os UTMs estão ali. É um fallback universal: funciona em
// qualquer rota, sem tocar em nenhum formulário.
//
// Não substitui o valor explícito do client (readUtmifyParams lê localStorage,
// que sobrevive à navegação entre páginas e por isso é mais confiável quando o
// candidato clicou no anúncio, navegou e só depois converteu). A regra é:
// explícito ganha, referer preenche o que faltar.

export interface UtmParams {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
}

function clean(value: string | null): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim().slice(0, 200)
  if (!trimmed) return undefined
  // O script da UTMify grava valores URL-encoded; decodifica pra não contar
  // "[ABO] Campanha 01" e "%5BABO%5D Campanha 01" como campanhas diferentes
  // (mesmo problema que o sanitize_properties do PostHog resolve).
  try {
    return decodeURIComponent(trimmed)
  } catch {
    return trimmed
  }
}

/** Lê UTMs da URL da página que submeteu (header `referer`). */
export function utmFromRequest(request: Request): UtmParams {
  const referer = request.headers.get('referer')
  if (!referer) return {}
  try {
    const params = new URL(referer).searchParams
    return {
      utmSource: clean(params.get('utm_source')),
      utmMedium: clean(params.get('utm_medium')),
      utmCampaign: clean(params.get('utm_campaign')),
      utmContent: clean(params.get('utm_content')),
    }
  } catch {
    return {}
  }
}

/**
 * Junta UTMs de várias origens: a primeira que trouxer valor para cada campo
 * vence. Passe o explícito antes do fallback.
 */
export function mergeUtm(...sources: Array<UtmParams | undefined | null>): UtmParams {
  const out: UtmParams = {}
  for (const source of sources) {
    if (!source) continue
    for (const key of ['utmSource', 'utmMedium', 'utmCampaign', 'utmContent'] as const) {
      if (!out[key] && source[key]) out[key] = source[key]
    }
  }
  return out
}

/** Normaliza o formato solto que chega no body (utm_source ou utmSource). */
export function utmFromBody(raw: unknown): UtmParams {
  if (!raw || typeof raw !== 'object') return {}
  const r = raw as Record<string, unknown>
  const pick = (...keys: string[]): string | undefined => {
    for (const k of keys) {
      const v = r[k]
      if (typeof v === 'string' && v.trim()) return clean(v)
    }
    return undefined
  }
  return {
    utmSource: pick('utm_source', 'utmSource'),
    utmMedium: pick('utm_medium', 'utmMedium'),
    utmCampaign: pick('utm_campaign', 'utmCampaign'),
    utmContent: pick('utm_content', 'utmContent'),
  }
}
