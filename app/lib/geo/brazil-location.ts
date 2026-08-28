/**
 * Bolsa Click is Brazil-only. IP geo providers (ipapi.co, ipwho.is) happily
 * return the visitor's real city — including US datacenter defaults like
 * Washington, DC. Those values must never be written into the homepage city
 * field or used as a search default.
 */

export const BRAZILIAN_UF = new Set([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
])

const STATE_TO_UF: Record<string, string> = {
  Acre: 'AC',
  Alagoas: 'AL',
  Amapá: 'AP',
  Amazonas: 'AM',
  Bahia: 'BA',
  Ceará: 'CE',
  'Distrito Federal': 'DF',
  'Espírito Santo': 'ES',
  Goiás: 'GO',
  Maranhão: 'MA',
  'Mato Grosso': 'MT',
  'Mato Grosso do Sul': 'MS',
  'Minas Gerais': 'MG',
  Pará: 'PA',
  Paraíba: 'PB',
  Paraná: 'PR',
  Pernambuco: 'PE',
  Piauí: 'PI',
  'Rio de Janeiro': 'RJ',
  'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS',
  Rondônia: 'RO',
  Roraima: 'RR',
  'Santa Catarina': 'SC',
  'São Paulo': 'SP',
  Sergipe: 'SE',
  Tocantins: 'TO',
  AC: 'AC', AL: 'AL', AP: 'AP', AM: 'AM', BA: 'BA',
  CE: 'CE', DF: 'DF', ES: 'ES', GO: 'GO', MA: 'MA',
  MT: 'MT', MS: 'MS', MG: 'MG', PA: 'PA', PB: 'PB',
  PR: 'PR', PE: 'PE', PI: 'PI', RJ: 'RJ', RN: 'RN',
  RS: 'RS', RO: 'RO', RR: 'RR', SC: 'SC', SP: 'SP',
  SE: 'SE', TO: 'TO',
}

export type BrazilianLocation = {
  city: string
  region: string
  country: string
  countryCode: 'BR'
  latitude?: number
  longitude?: number
}

export type RawGeoInput = {
  city?: unknown
  region?: unknown
  regionCode?: unknown
  country?: unknown
  countryCode?: unknown
  latitude?: unknown
  longitude?: unknown
}

export function convertStateToUf(stateName: string): string {
  const trimmed = stateName.trim()
  if (trimmed.length === 2 && /^[A-Z]{2}$/i.test(trimmed)) {
    return trimmed.toUpperCase()
  }

  const found = Object.keys(STATE_TO_UF).find(
    (key) => key.toLowerCase() === trimmed.toLowerCase(),
  )
  if (found) return STATE_TO_UF[found]

  return trimmed.toUpperCase()
}

export function isBrazilCountry(countryCode?: string, country?: string): boolean {
  const code = (countryCode ?? '').trim().toUpperCase()
  if (code === 'BR') return true

  const name = (country ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  return name === 'brasil' || name === 'brazil'
}

export function isBrazilianUf(region: string): boolean {
  return BRAZILIAN_UF.has(region.trim().toUpperCase())
}

/**
 * Accept a geo payload only when it is a real Brazilian city+UF.
 * Foreign IPs (Washington/DC, Mountain View/CA, etc.) return null — callers
 * must leave the city field empty rather than invent a location.
 */
export function brazilianLocationOrNull(input: RawGeoInput): BrazilianLocation | null {
  const city = String(input.city ?? '').trim()
  if (!city) return null

  const countryCode = String(input.countryCode ?? '').trim()
  const country = String(input.country ?? '').trim()
  if (!isBrazilCountry(countryCode, country)) return null

  const regionRaw = String(input.regionCode ?? input.region ?? '').trim()
  if (!regionRaw) return null

  const uf = convertStateToUf(regionRaw)
  if (!isBrazilianUf(uf)) return null

  const lat =
    typeof input.latitude === 'number' ? input.latitude : Number(input.latitude)
  const lng =
    typeof input.longitude === 'number' ? input.longitude : Number(input.longitude)

  return {
    city,
    region: uf,
    country: country || 'Brasil',
    countryCode: 'BR',
    ...(Number.isFinite(lat) && Number.isFinite(lng)
      ? { latitude: lat, longitude: lng }
      : {}),
  }
}
