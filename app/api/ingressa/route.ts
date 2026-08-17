import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { sendFacebookEvent } from '@/app/lib/analytics/fb-capi'
import { capturePostHogServerEvent } from '@/app/lib/analytics/posthog-server'
import { upsertCandidato } from '@/app/lib/api/attio'
import { utmFromBody, utmFromRequest, mergeUtm } from '@/app/lib/analytics/utm'

interface IngressaBody {
  name: string
  phone: string
  /** Id anônimo estável da visita — ver app/lp/_shared/visitor-id.ts. */
  visitorId?: string
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

  // 2) CRM (best-effort). Este é o fluxo que motivou casar por TELEFONE em vez
  // de email: a landing de mídia paga capta só nome e WhatsApp, e no objeto
  // `people` padrão do Attio (único atributo único = email) este lead ficaria
  // sem chave de casamento.
  try {
    await upsertCandidato({
      phone: cleanPhone,
      name: cleanName,
      brand: typeof body.partnerName === 'string' ? body.partnerName : partnerSlug,
      courseName: cursoName || undefined,
      estagio: 'lead',
      origemFluxo: 'ingressa',
      leadId: leadId || undefined,
      utm: mergeUtm(utmFromBody(body.utm), utmFromRequest(request)),
    })
  } catch (error) {
    console.error('⚠️ Attio (ingressa) falhou:', error)
  }

  // 3) Meta CAPI (best-effort).
  if (leadId) {
    await sendLeadToMeta({ leadId, name: cleanName, phone: cleanPhone, partner: partnerSlug, eventId: body.eventId, request })
  }

  // 3.5) Funde a pessoa anônima da visita com a identificada.
  //
  // O `checkout_viewed` do espelho server-side foi gravado com o id do
  // navegador; daqui pra frente a pessoa é o telefone. Sem este `$identify`
  // com `$anon_distinct_id`, o PostHog trata as duas como pessoas distintas e
  // a conversão visita→lead da landing fica impossível de calcular.
  if (typeof body.visitorId === 'string' && body.visitorId) {
    try {
      await capturePostHogServerEvent({
        event: '$identify',
        distinctId: cleanPhone,
        properties: { $anon_distinct_id: body.visitorId.slice(0, 64) },
      })
    } catch (error) {
      console.error('⚠️ PostHog $identify (ingressa) falhou:', error)
    }
  }

  // 4) PostHog (best-effort) — mídia paga por parceiro era invisível no funil:
  // o lead chegava ao Meta (Pixel+CAPI) mas nunca ao PostHog. Mesmo eventId do
  // CAPI em $insert_id; distinct_id = telefone (único identificador do fluxo).
  //
  // Além do `lead_submitted` legado, espelha `checkout_identified` +
  // `checkout_submitted` — o MESMO vocabulário do funil de checkout principal
  // (app/lib/analytics/checkout-funnel.ts) — pra o funil do ingressa ser
  // comparável ao do bolsaclick.com.br. Isso É o espelho server-side: o
  // PostHog do browser só dispara sob consentimento de cookie (quase ninguém
  // aceita), então sem isto o funil client-only ficava cego pra maioria dos
  // leads. `brand`/`flow` seguem o mesmo shape de `baseProps` no client.
  const partnerName = typeof body.partnerName === 'string' ? body.partnerName : undefined
  const flow = partnerSlug === 'estacio' ? 'estacio' : 'matricula'
  if (leadId) {
    const funnelProps = {
      flow,
      brand: partnerName ?? partnerSlug,
      course_name: cursoName ?? null,
      source: 'ingressa',
    }
    try {
      await capturePostHogServerEvent({
        event: 'checkout_identified',
        distinctId: cleanPhone,
        eventId: body.eventId ? `${body.eventId}_identified` : `ingressa_${leadId}_identified`,
        properties: { ...funnelProps, has_phone: true, has_email: false },
        personProperties: { name: cleanName, phone: cleanPhone },
      })
      await capturePostHogServerEvent({
        event: 'checkout_submitted',
        distinctId: cleanPhone,
        eventId: body.eventId ? `${body.eventId}_submitted` : `ingressa_${leadId}_submitted`,
        properties: funnelProps,
      })
      await capturePostHogServerEvent({
        event: 'lead_submitted',
        distinctId: cleanPhone,
        eventId: body.eventId || `ingressa_${leadId}`,
        properties: {
          lead_source: `ingressa-${partnerSlug}`,
          partner: partnerSlug,
          course_name: cursoName ?? null,
          utm_source: body.utm?.utm_source ?? null,
          utm_medium: body.utm?.utm_medium ?? null,
          utm_campaign: body.utm?.utm_campaign ?? null,
        },
      })
    } catch (error) {
      console.error('⚠️ PostHog (ingressa) falhou:', error)
    }
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
