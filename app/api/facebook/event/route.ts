import { NextRequest, NextResponse } from 'next/server'
import { sendFacebookEvent, type FbUserData } from '@/app/lib/analytics/fb-capi'

interface BodyUser {
  email?: string
  phone?: string
  externalId?: string
  firstName?: string
  lastName?: string
  city?: string
  state?: string
}

interface Body {
  event: string
  event_id: string
  properties?: Record<string, unknown>
  user?: BodyUser
  url?: string
  referrer?: string
  fbp?: string
  fbc?: string
}

export async function POST(request: NextRequest) {
  if (!process.env.FB_CONVERSIONS_ACCESS_TOKEN) {
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

  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    undefined
  const userAgent = request.headers.get('user-agent') ?? undefined

  const userData: FbUserData = {
    ...body.user,
    fbp: body.fbp,
    fbc: body.fbc,
    clientIp,
    userAgent,
  }

  await sendFacebookEvent({
    eventName: body.event,
    eventId: body.event_id,
    userData,
    customData: body.properties,
    eventSourceUrl: body.url,
    actionSource: 'website',
  })

  return NextResponse.json({ ok: true }, { status: 200 })
}
