import { NextRequest, NextResponse } from 'next/server'
import { brazilianLocationOrNull } from '@/app/lib/geo/brazil-location'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

type GeoResponse = {
  city: string
  region: string
  country: string
  countryCode: string
  latitude?: number
  longitude?: number
}

/** Empty payload — client must not treat this as a city to write into the form. */
const EMPTY: GeoResponse = {
  city: '',
  region: '',
  country: '',
  countryCode: '',
}

const fetchWithTimeout = async (url: string, ms = 4000): Promise<Response | null> => {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

const extractClientIp = (req: NextRequest): string | null => {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) {
    const ip = fwd.split(',')[0]?.trim()
    if (ip && ip !== '127.0.0.1' && ip !== '::1') return ip
  }
  const real = req.headers.get('x-real-ip')
  if (real && real !== '127.0.0.1' && real !== '::1') return real
  return null
}

function jsonLocation(loc: GeoResponse) {
  return NextResponse.json<GeoResponse>(loc, {
    headers: { 'Cache-Control': 'private, max-age=600' },
  })
}

function jsonEmpty() {
  return NextResponse.json<GeoResponse>(EMPTY, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  })
}

export async function GET(req: NextRequest) {
  const ip = extractClientIp(req)

  // 1) Tentar ipapi.co (suporta query por IP)
  try {
    const url = ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/'
    const r = await fetchWithTimeout(url, 4500)
    if (r?.ok) {
      const data = await r.json()
      const loc = brazilianLocationOrNull({
        city: data?.city,
        region: data?.region,
        regionCode: data?.region_code,
        country: data?.country_name,
        countryCode: data?.country_code,
        latitude: data?.latitude,
        longitude: data?.longitude,
      })
      if (loc) return jsonLocation(loc)
    }
  } catch {
    /* segue pro próximo */
  }

  // 2) Fallback: ipwho.is
  try {
    const url = ip ? `https://ipwho.is/${ip}` : 'https://ipwho.is/'
    const r = await fetchWithTimeout(url, 4500)
    if (r?.ok) {
      const data = await r.json()
      if (data?.success) {
        const loc = brazilianLocationOrNull({
          city: data?.city,
          region: data?.region,
          regionCode: data?.region_code,
          country: data?.country,
          countryCode: data?.country_code,
          latitude: data?.latitude,
          longitude: data?.longitude,
        })
        if (loc) return jsonLocation(loc)
      }
    }
  } catch {
    /* segue pro empty */
  }

  // Foreign IP or lookup failure: do not invent a city (and never Washington, DC).
  return jsonEmpty()
}
