import { NextRequest, NextResponse } from 'next/server'

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

const FALLBACK: GeoResponse = {
  city: 'São Paulo',
  region: 'SP',
  country: 'Brasil',
  countryCode: 'BR',
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

export async function GET(req: NextRequest) {
  const ip = extractClientIp(req)

  // 1) Tentar ipapi.co (suporta query por IP)
  try {
    const url = ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/'
    const r = await fetchWithTimeout(url, 4500)
    if (r?.ok) {
      const data = await r.json()
      if (data?.city && (data?.region || data?.region_code)) {
        const lat = typeof data.latitude === 'number' ? data.latitude : Number(data.latitude)
        const lng = typeof data.longitude === 'number' ? data.longitude : Number(data.longitude)
        return NextResponse.json<GeoResponse>(
          {
            city: String(data.city),
            region: String(data.region_code ?? data.region),
            country: String(data.country_name ?? 'Brasil'),
            countryCode: String(data.country_code ?? 'BR'),
            ...(Number.isFinite(lat) && Number.isFinite(lng)
              ? { latitude: lat, longitude: lng }
              : {}),
          },
          { headers: { 'Cache-Control': 'private, max-age=600' } },
        )
      }
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
      if (data?.success && data?.city && (data?.region || data?.region_code)) {
        const lat = typeof data.latitude === 'number' ? data.latitude : undefined
        const lng = typeof data.longitude === 'number' ? data.longitude : undefined
        return NextResponse.json<GeoResponse>(
          {
            city: String(data.city),
            region: String(data.region_code ?? data.region),
            country: String(data.country ?? 'Brasil'),
            countryCode: String(data.country_code ?? 'BR'),
            ...(lat != null && lng != null ? { latitude: lat, longitude: lng } : {}),
          },
          { headers: { 'Cache-Control': 'private, max-age=600' } },
        )
      }
    }
  } catch {
    /* segue pro fallback */
  }

  // 3) Default
  return NextResponse.json<GeoResponse>(FALLBACK, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  })
}
