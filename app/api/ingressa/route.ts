import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { upsertNotealyContact } from '@/app/lib/api/notealy'
import { sendFacebookEvent } from '@/app/lib/analytics/fb-capi'

// Tag fixa do funil ingressa no Notealy (criada 2026-07-14). Hardcoded — não
// depende de env.
const NOTEALY_TAG_INGRESSA = '2efcf93c-f924-4b32-a3d0-37995d1b5d69'

interface IngressaBody {
  name: string
  phone: string
  partner?: string
  partnerName?: string
  curso?: string | null
  utm?: Record<string, string>
  /** eventID gerado no browser p/ deduplicar Pixel (client) × CAPI (server). */
  eventId?: string
}

// Rate-limit por IP (mesmo padrão do simulador/teste vocacional).
const submitsByIp = new Map<string, { count: number; resetAt: number }>()
const SUBMIT_WINDOW_MS = 24 * 60 * 60 * 1000
const SUBMIT_MAX = 20

function checkSubmitLimit(ip: string): boolean {
  const now = Date.now()
  const entry = submitsByIp.get(ip)
  if (!entry || entry.resetAt < now) {
    submitsByIp.set(ip, { count: 1, resetAt: now + SUBMIT_WINDOW_MS })
    return true
  }
  if (entry.count >= SUBMIT_MAX) return false
  entry.count += 1
  return true
}

async function sendLeadToMeta(params: {
  leadId: string
  name: string
  phone: string
  partner?: string
  eventId?: string
  request: NextRequest
}) {
  try {
    const [firstName, ...rest] = params.name.trim().split(/\s+/)
    const clientIp =
      params.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      params.request.headers.get('x-real-ip') ??
      undefined
    await sendFacebookEvent({
      eventName: 'Lead',
      // Mesmo eventID do Pixel do browser → o Meta deduplica (não conta 2×).
      eventId: params.eventId || `ingressa_${params.leadId}`,
      userData: {
        phone: params.phone,
        firstName: firstName || undefined,
        lastName: rest.length ? rest.join(' ') : undefined,
        clientIp,
        userAgent: params.request.headers.get('user-agent') ?? undefined,
      },
      customData: {
        ...(params.partner ? { content_name: params.partner } : {}),
        content_category: 'ingressa-landing',
        content_type: 'product',
      },
      actionSource: 'website',
      eventSourceUrl: params.request.headers.get('referer') ?? undefined,
    })
  } catch (error) {
    console.error('⚠️ Meta CAPI Lead (ingressa) falhou:', error)
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkSubmitLimit(ip)) {
    return NextResponse.json({ error: 'Limite diário atingido. Tente amanhã.' }, { status: 429 })
  }

  let body: IngressaBody
  try {
    body = (await request.json()) as IngressaBody
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { name, phone, partner, curso } = body
  if (!name?.trim() || name.trim().length < 2) {
    return NextResponse.json({ error: 'Nome inválido' }, { status: 400 })
  }
  const cleanPhone = phone?.replace(/\D/g, '') ?? ''
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return NextResponse.json({ error: 'Telefone inválido' }, { status: 400 })
  }

  const cleanName = name.trim().slice(0, 80)
  const partnerSlug = typeof partner === 'string' ? partner.slice(0, 40) : 'desconhecido'
  const cursoName = typeof curso === 'string' && curso.trim() ? curso.trim() : undefined

  // 1) Persistir Lead (email vazio: landing de mídia paga captura só nome+WhatsApp).
  let leadId = ''
  try {
    const lead = await prisma.lead.create({
      data: {
        name: cleanName,
        email: '',
        phone: cleanPhone,
        courseNames: cursoName ? [cursoName] : [],
        courseName: cursoName,
        institutionName: typeof body.partnerName === 'string' ? body.partnerName : undefined,
        source: `ingressa-${partnerSlug}`,
        extraData: JSON.parse(
          JSON.stringify({ partner: partnerSlug, curso: cursoName, utm: body.utm ?? {} })
        ),
        status: 'NEW',
      },
    })
    leadId = lead.id
  } catch (error) {
    console.error('Falha ao criar Lead (ingressa):', error)
  }

  // 2) Notealy (best-effort).
  try {
    await upsertNotealyContact({
      name: cleanName,
      phone: cleanPhone,
      tagId: NOTEALY_TAG_INGRESSA,
    })
  } catch (error) {
    console.error('⚠️ Notealy (ingressa) falhou:', error)
  }

  // 3) Meta CAPI (best-effort).
  if (leadId) {
    await sendLeadToMeta({ leadId, name: cleanName, phone: cleanPhone, partner: partnerSlug, eventId: body.eventId, request })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
