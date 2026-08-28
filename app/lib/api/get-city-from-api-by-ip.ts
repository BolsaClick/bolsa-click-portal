import { brazilCityStateOrNull } from '@/app/lib/geo/brazil-location'
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
    const fromIp = brazilCityStateOrNull(location?.city, location?.region)
    if (!fromIp) return null

    const response = await getLocalities(fromIp.city)
    const list = response?.data
    if (!Array.isArray(list) || list.length === 0) {
      // Unknown to our Brazilian localities catalog — do not write the raw IP city
      // (that path previously filled "Washington - DC" from US/cloud IPs).
      return null
    }

    const regionUpper = fromIp.state
    const matchByState = list.find(
      (item: { city?: string; state?: string }) =>
        (item.state || '').toUpperCase().trim() === regionUpper
    )
    const matched = brazilCityStateOrNull(matchByState?.city, matchByState?.state)
    if (matched) return matched

    const first = list[0]
    return brazilCityStateOrNull(first?.city, first?.state)
  } catch (error) {
    console.error('Erro ao obter cidade da API por IP:', error)
    try {
      const fallback = await getLocationByIP()
      return brazilCityStateOrNull(fallback?.city, fallback?.region)
    } catch {
      // ignore
    }
    return null
  }
}
