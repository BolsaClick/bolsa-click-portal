import { brazilianLocationOrNull, type BrazilianLocation } from '@/app/lib/geo/brazil-location'

export type LocationByIP = BrazilianLocation

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

function fromApiGeolocation(data: {
  city?: unknown
  region?: unknown
  country?: unknown
  countryCode?: unknown
  latitude?: unknown
  longitude?: unknown
}): LocationByIP | null {
  return brazilianLocationOrNull({
    city: data.city,
    region: data.region,
    country: data.country,
    countryCode: data.countryCode,
    latitude: data.latitude,
    longitude: data.longitude,
  })
}

function fromIpapi(data: {
  city?: unknown
  region?: unknown
  region_code?: unknown
  country_name?: unknown
  country_code?: unknown
  latitude?: unknown
  longitude?: unknown
}): LocationByIP | null {
  return brazilianLocationOrNull({
    city: data.city,
    region: data.region,
    regionCode: data.region_code,
    country: data.country_name,
    countryCode: data.country_code,
    latitude: data.latitude,
    longitude: data.longitude,
  })
}

function fromIpwho(data: {
  city?: unknown
  region?: unknown
  region_code?: unknown
  country?: unknown
  country_code?: unknown
  latitude?: unknown
  longitude?: unknown
}): LocationByIP | null {
  return brazilianLocationOrNull({
    city: data.city,
    region: data.region,
    regionCode: data.region_code,
    country: data.country,
    countryCode: data.country_code,
    latitude: data.latitude,
    longitude: data.longitude,
  })
}

export async function getLocationByIP(): Promise<LocationByIP | null> {
  // 1) Endpoint local — sem CORS, sem adblocker, IP detectado no servidor
  try {
    const r = await fetchWithTimeout('/api/geolocation', 4500)
    if (r?.ok) {
      const loc = fromApiGeolocation(await r.json())
      if (loc) return loc
    }
  } catch {
    /* tenta fallback externo */
  }

  // 2) Fallback direto: ipapi.co
  try {
    const response = await fetchWithTimeout('https://ipapi.co/json/', 4000)
    if (response?.ok) {
      const loc = fromIpapi(await response.json())
      if (loc) return loc
    }
  } catch {
    /* tenta próximo */
  }

  // 3) Fallback: ipwho.is
  try {
    const response = await fetchWithTimeout('https://ipwho.is/', 4000)
    if (response?.ok) {
      const loc = fromIpwho(await response.json())
      if (loc) return loc
    }
  } catch {
    /* sem localização brasileira */
  }

  // Foreign IP / lookup failure: leave the city field empty.
  // Never default to a US city (Washington, DC is the common datacenter hit).
  return null
}
