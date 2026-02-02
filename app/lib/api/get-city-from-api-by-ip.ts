import { getLocationByIP } from './get-location-by-ip'
import { getLocalities } from './get-localites'

export interface CityFromAPI {
  city: string
  state: string
}

/**
 * Obtém localização por IP e busca a cidade correspondente na API de cidades (Tartarus).
 * Assim a cidade/estado padrão é sempre uma cidade que existe na nossa API (igual ao filtro da home).
 */
export async function getCityFromOurAPIByIP(): Promise<CityFromAPI | null> {
  try {
    const location = await getLocationByIP()
    if (!location?.city?.trim()) return null

    const response = await getLocalities(location.city.trim())
    const list = response?.data
    if (!Array.isArray(list) || list.length === 0) {
      return { city: location.city, state: location.region }
    }

    const regionUpper = (location.region || '').toUpperCase().trim()
    const matchByState = list.find(
      (item: { city?: string; state?: string }) =>
        (item.state || '').toUpperCase().trim() === regionUpper
    )
    if (matchByState) {
      return { city: matchByState.city || location.city, state: matchByState.state || location.region }
    }

    const first = list[0]
    return { city: first.city || location.city, state: first.state || location.region }
  } catch (error) {
    console.error('Erro ao obter cidade da API por IP:', error)
    try {
      const fallback = await getLocationByIP()
      if (fallback) {
        return { city: fallback.city, state: fallback.region }
      }
    } catch {
      // ignore
    }
    return { city: 'São Paulo', state: 'SP' }
  }
}
