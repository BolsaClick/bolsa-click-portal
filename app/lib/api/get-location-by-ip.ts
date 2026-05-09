export interface LocationByIP {
  city: string
  region: string
  country: string
  countryCode: string
  latitude?: number
  longitude?: number
}

// Mapeamento de estados brasileiros para siglas UF
const stateToUF: Record<string, string> = {
  'Acre': 'AC',
  'Alagoas': 'AL',
  'Amapá': 'AP',
  'Amazonas': 'AM',
  'Bahia': 'BA',
  'Ceará': 'CE',
  'Distrito Federal': 'DF',
  'Espírito Santo': 'ES',
  'Goiás': 'GO',
  'Maranhão': 'MA',
  'Mato Grosso': 'MT',
  'Mato Grosso do Sul': 'MS',
  'Minas Gerais': 'MG',
  'Pará': 'PA',
  'Paraíba': 'PB',
  'Paraná': 'PR',
  'Pernambuco': 'PE',
  'Piauí': 'PI',
  'Rio de Janeiro': 'RJ',
  'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS',
  'Rondônia': 'RO',
  'Roraima': 'RR',
  'Santa Catarina': 'SC',
  'São Paulo': 'SP',
  'Sergipe': 'SE',
  'Tocantins': 'TO',
  // Também aceitar siglas já no formato correto
  'AC': 'AC', 'AL': 'AL', 'AP': 'AP', 'AM': 'AM', 'BA': 'BA',
  'CE': 'CE', 'DF': 'DF', 'ES': 'ES', 'GO': 'GO', 'MA': 'MA',
  'MT': 'MT', 'MS': 'MS', 'MG': 'MG', 'PA': 'PA', 'PB': 'PB',
  'PR': 'PR', 'PE': 'PE', 'PI': 'PI', 'RJ': 'RJ', 'RN': 'RN',
  'RS': 'RS', 'RO': 'RO', 'RR': 'RR', 'SC': 'SC', 'SP': 'SP',
  'SE': 'SE', 'TO': 'TO',
}

// Função para converter nome do estado para sigla UF
function convertStateToUF(stateName: string): string {
  // Se já for uma sigla de 2 letras, retornar como está
  if (stateName.length === 2 && /^[A-Z]{2}$/i.test(stateName)) {
    return stateName.toUpperCase()
  }
  
  // Tentar encontrar no mapeamento (case-insensitive)
  const normalizedState = stateName.trim()
  const found = Object.keys(stateToUF).find(
    key => key.toLowerCase() === normalizedState.toLowerCase()
  )
  
  if (found) {
    return stateToUF[found]
  }
  
  // Se não encontrar, retornar o valor original (pode ser uma sigla não mapeada)
  return normalizedState.toUpperCase()
}

const DEFAULT_LOCATION: LocationByIP = {
  city: 'São Paulo',
  region: 'SP',
  country: 'Brasil',
  countryCode: 'BR',
}

const fetchWithTimeout = async (url: string, ms = 4000): Promise<Response | null> => {
  if (typeof window === 'undefined' || typeof AbortController === 'undefined') {
    try {
      return await fetch(url, { headers: { Accept: 'application/json' } })
    } catch {
      return null
    }
  }
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: ctrl.signal,
    })
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

export async function getLocationByIP(): Promise<LocationByIP | null> {
  // 1) Endpoint local — sem CORS, sem adblocker, IP detectado no servidor
  try {
    const r = await fetchWithTimeout('/api/geolocation', 4500)
    if (r?.ok) {
      const data = await r.json()
      if (data?.city && data?.region) {
        return {
          city: String(data.city),
          region: convertStateToUF(String(data.region)),
          country: String(data.country ?? 'Brasil'),
          countryCode: String(data.countryCode ?? 'BR'),
          ...(typeof data.latitude === 'number' && typeof data.longitude === 'number'
            ? { latitude: data.latitude, longitude: data.longitude }
            : {}),
        }
      }
    }
  } catch {
    /* tenta fallback externo */
  }

  // 2) Fallback direto: ipapi.co
  try {
    const response = await fetchWithTimeout('https://ipapi.co/json/', 4000)
    if (response?.ok) {
      const data = await response.json()
      if (data?.city && (data?.region || data?.region_code)) {
        const stateUF = data.region_code || convertStateToUF(data.region || 'SP')
        const lat = typeof data.latitude === 'number' ? data.latitude : Number(data.latitude)
        const lng = typeof data.longitude === 'number' ? data.longitude : Number(data.longitude)
        return {
          city: data.city,
          region: stateUF,
          country: data.country_name || 'Brasil',
          countryCode: data.country_code || 'BR',
          ...(Number.isFinite(lat) && Number.isFinite(lng)
            ? { latitude: lat, longitude: lng }
            : {}),
        }
      }
    }
  } catch {
    /* tenta próximo */
  }

  // 3) Fallback: ipwho.is
  try {
    const response = await fetchWithTimeout('https://ipwho.is/', 4000)
    if (response?.ok) {
      const data = await response.json()
      if (data?.success && data?.city && (data?.region || data?.region_code)) {
        const stateUF = data.region_code || convertStateToUF(data.region || 'SP')
        const lat = typeof data.latitude === 'number' ? data.latitude : undefined
        const lng = typeof data.longitude === 'number' ? data.longitude : undefined
        return {
          city: data.city,
          region: stateUF,
          country: data.country || 'Brasil',
          countryCode: data.country_code || 'BR',
          ...(lat != null && lng != null ? { latitude: lat, longitude: lng } : {}),
        }
      }
    }
  } catch {
    /* fallback final */
  }

  // 4) Default — sem console.error pra não poluir o console
  return DEFAULT_LOCATION
}

