import { isBrazilianUf } from '@/app/lib/geo/brazil-location'
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
    if (!location?.city?.trim() || !isBrazilianUf(location.region)) return null

    const response = await getLocalities(location.city.trim())
    const list = response?.data
    if (!Array.isArray(list) || list.length === 0) {
      // Unknown to our Brazilian localities catalog — do not write the raw IP city
      // (that path previously filled "Washington - DC" from US/cloud IPs).
      return null
    }

    const regionUpper = (location.region || '').toUpperCase().trim()
    const matchByState = list.find(
      (item: { city?: string; state?: string }) =>
        (item.state || '').toUpperCase().trim() === regionUpper
    )
    if (matchByState?.city && matchByState.state && isBrazilianUf(matchByState.state)) {
      return { city: matchByState.city, state: matchByState.state }
    }

    const first = list[0]
    if (first?.city && first?.state && isBrazilianUf(first.state)) {
      return { city: first.city, state: first.state }
    }
    return null
  } catch (error) {
    console.error('Erro ao obter cidade da API por IP:', error)
    try {
      const fallback = await getLocationByIP()
      if (fallback?.city && isBrazilianUf(fallback.region)) {
        return { city: fallback.city, state: fallback.region }
      }
    } catch {
      // ignore
    }
    return null
  }
}
