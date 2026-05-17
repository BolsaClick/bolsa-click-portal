import { NextRequest, NextResponse } from 'next/server'
import { normalizeEmail, normalizePhone, sha256 } from '@/app/lib/analytics/hash'

const ENDPOINT = 'https://business-api.tiktok.com/open_api/v1.3/event/track/'

interface TikTokUser {
  email?: string
  phone?: string
  externalId?: string
}

interface Body {
  event: string
  event_id: string
  properties?: Record<string, unknown>
  user?: TikTokUser
  url?: string
  referrer?: string
}

export async function POST(request: NextRequest) {
  const pixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN
  if (!pixelId || !accessToken) {
    return NextResponse.json({ ok: false, skipped: 'env_missing' }, { status: 200 })
  }

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  if (!body.event || !body.event_id) {
    return NextResponse.json({ error: 'event_and_event_id_required' }, { status: 400 })
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    undefined
  const userAgent = request.headers.get('user-agent') ?? undefined

  const user: Record<string, string> = {}
  if (body.user?.email) user.email = await sha256(normalizeEmail(body.user.email))
  if (body.user?.phone) user.phone = await sha256(normalizePhone(body.user.phone))
  if (body.user?.externalId) user.external_id = await sha256(body.user.externalId)
  if (ip) user.ip = ip
  if (userAgent) user.user_agent = userAgent

  const payload = {
    event_source: 'web',
    event_source_id: pixelId,
    data: [
      {
        event: body.event,
        event_time: Math.floor(Date.now() / 1000),
        event_id: body.event_id,
        user,
        properties: body.properties ?? {},
        page: {
          url: body.url,
          referrer: body.referrer,
        },
      },
    ],
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': accessToken,
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error('[tiktok-events-api] http error', res.status, text)
      return NextResponse.json({ ok: false, status: res.status }, { status: 200 })
    }
    const data = (await res.json()) as { code?: number; message?: string }
    if (data.code && data.code !== 0) {
      console.error('[tiktok-events-api] api error', data.code, data.message)
    }
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('[tiktok-events-api] fetch failed', err)
    return NextResponse.json({ ok: false, error: 'fetch_failed' }, { status: 200 })
  }
}
