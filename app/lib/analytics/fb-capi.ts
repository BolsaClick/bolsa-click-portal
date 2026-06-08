import { normalizeEmail, normalizePhone, sha256 } from './hash'

/**
 * Conversions API (server-side) do Meta. Espelha o que /api/tiktok/event faz
 * para o TikTok: envia o evento direto para o Graph API, com advanced matching
 * (email/telefone/CPF hasheados em SHA-256) + fbp/fbc/ip/user_agent. Garante que
 * conversões cheguem ao Events Manager mesmo com ad-blocker, ITP ou aba fechada.
 *
 * Dedup com o pixel do browser: usar o MESMO `eventId` nos dois lados.
 */

const GRAPH_VERSION = 'v21.0'

export interface FbUserData {
  email?: string
  phone?: string
  /** CPF (só dígitos) → external_id */
  externalId?: string
  firstName?: string
  lastName?: string
  city?: string
  state?: string
  /** Cookie _fbp do browser (não hasheado) */
  fbp?: string
  /** Cookie _fbc do browser (não hasheado) */
  fbc?: string
  clientIp?: string
  userAgent?: string
}

export interface SendFacebookEventInput {
  eventName: string
  eventId: string
  /** Unix em segundos. Default: agora. */
  eventTime?: number
  userData: FbUserData
  customData?: Record<string, unknown>
  eventSourceUrl?: string
  /** Default 'website'. Use 'system_generated' para eventos puramente server. */
  actionSource?: 'website' | 'app' | 'system_generated' | 'other'
}

function pixelIds(): string[] {
  const raw = process.env.NEXT_PUBLIC_FB_PIXEL_IDS
  if (!raw) return []
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
}

async function buildUserData(u: FbUserData): Promise<Record<string, unknown>> {
  const data: Record<string, unknown> = {}
  if (u.email) data.em = [await sha256(normalizeEmail(u.email))]
  if (u.phone) data.ph = [await sha256(normalizePhone(u.phone))]
  if (u.externalId) data.external_id = [await sha256(u.externalId.replace(/\D/g, ''))]
  if (u.firstName) data.fn = [await sha256(u.firstName.trim().toLowerCase())]
  if (u.lastName) data.ln = [await sha256(u.lastName.trim().toLowerCase())]
  if (u.city) data.ct = [await sha256(u.city.trim().toLowerCase().replace(/\s/g, ''))]
  if (u.state) data.st = [await sha256(u.state.trim().toLowerCase().replace(/\s/g, ''))]
  // Não hasheados:
  if (u.fbp) data.fbp = u.fbp
  if (u.fbc) data.fbc = u.fbc
  if (u.clientIp) data.client_ip_address = u.clientIp
  if (u.userAgent) data.client_user_agent = u.userAgent
  return data
}

/**
 * Best-effort: nunca lança. Loga e segue, igual ao route do TikTok.
 * Envia para TODOS os pixels configurados em NEXT_PUBLIC_FB_PIXEL_IDS.
 */
export async function sendFacebookEvent(input: SendFacebookEventInput): Promise<void> {
  const accessToken = process.env.FB_CONVERSIONS_ACCESS_TOKEN
  const ids = pixelIds()
  if (!accessToken || ids.length === 0) {
    if (!accessToken) console.warn('[fb-capi] FB_CONVERSIONS_ACCESS_TOKEN ausente — pulando')
    return
  }

  const userData = await buildUserData(input.userData)
  const testEventCode = process.env.FB_TEST_EVENT_CODE || undefined

  const eventPayload = {
    event_name: input.eventName,
    event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
    event_id: input.eventId,
    action_source: input.actionSource ?? 'website',
    ...(input.eventSourceUrl ? { event_source_url: input.eventSourceUrl } : {}),
    user_data: userData,
    ...(input.customData ? { custom_data: input.customData } : {}),
  }

  await Promise.all(
    ids.map(async (pixelId) => {
      try {
        const res = await fetch(
          `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: [eventPayload],
              access_token: accessToken,
              ...(testEventCode ? { test_event_code: testEventCode } : {}),
            }),
          }
        )
        if (!res.ok) {
          const text = await res.text().catch(() => '')
          console.error('[fb-capi] http error', pixelId, res.status, text)
          return
        }
        const json = (await res.json().catch(() => ({}))) as {
          error?: { message?: string }
        }
        if (json.error) {
          console.error('[fb-capi] api error', pixelId, json.error.message)
        }
      } catch (err) {
        console.error('[fb-capi] fetch failed', pixelId, err)
      }
    })
  )
}
