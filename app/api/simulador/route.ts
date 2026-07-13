import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { upsertNotealyContact } from '@/app/lib/api/notealy'
import { sendFacebookEvent } from '@/app/lib/analytics/fb-capi'

interface SimuladorBody {
  name: string
  email: string
  phone: string
  curso?: string
  modalidade?: string
  cidade?: string
  estado?: string
  enemScore?: number | null
  semEnem?: boolean
  rendaFamiliar?: number
  pessoas?: number
  elegibilidade?: unknown
}

// Tag fixa do funil "simulador-de-bolsa" no Notealy (criada em 2026-07-13).
// Hardcoded de propósito — não depende de env var. Se um dia precisar trocar,
// crie a nova tag no Notealy e atualize este ID.
const NOTEALY_TAG_SIMULADOR = 'b9a1258a-8edf-489e-8a7d-917a87ce78cf'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Rate-limit por IP em memória (mesmo padrão do teste vocacional).
const submitsByIp = new Map<string, { count: number; resetAt: number }>()
const SUBMIT_WINDOW_MS = 24 * 60 * 60 * 1000
const SUBMIT_MAX = 10

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

// Meta Conversions API — Lead server-side. Best-effort: nunca bloqueia.
async function sendLeadToMeta(params: {
  leadId: string
  name: string
  email: string
  phone: string
  courseName?: string
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
      eventId: `sim_${params.leadId}`,
      userData: {
        email: params.email,
        phone: params.phone,
        firstName: firstName || undefined,
        lastName: rest.length ? rest.join(' ') : undefined,
        clientIp,
        userAgent: params.request.headers.get('user-agent') ?? undefined,
      },
      customData: {
        ...(params.courseName ? { content_name: params.courseName } : {}),
        content_category: 'simulador-de-bolsa',
        content_type: 'product',
      },
      actionSource: 'website',
      eventSourceUrl: params.request.headers.get('referer') ?? undefined,
    })
  } catch (error) {
    console.error('⚠️ Meta CAPI Lead (simulador) falhou:', error)
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  if (!checkSubmitLimit(ip)) {
    return NextResponse.json(
      { error: 'Limite diário de simulações atingido. Tente amanhã.' },
      { status: 429 }
    )
  }

  let body: SimuladorBody
  try {
    body = (await request.json()) as SimuladorBody
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { name, email, phone, curso, modalidade } = body

  if (!name?.trim() || name.trim().length < 2) {
    return NextResponse.json({ error: 'Nome inválido' }, { status: 400 })
  }
  if (!email?.trim() || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }
  const cleanPhone = phone?.replace(/\D/g, '') ?? ''
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return NextResponse.json({ error: 'Telefone inválido' }, { status: 400 })
  }

  const cleanName = name.trim().slice(0, 80)
  const cleanEmail = email.toLowerCase().trim()
  const cursoLabel = typeof curso === 'string' ? curso.trim() : ''

  // 1) Persistir Lead (best-effort — não bloqueia a resposta).
  let leadId = ''
  try {
    const lead = await prisma.lead.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        courseNames: cursoLabel ? [cursoLabel] : [],
        courseName: cursoLabel || undefined,
        modalidade: typeof modalidade === 'string' ? modalidade : undefined,
        source: 'simulador-de-bolsa',
        extraData: JSON.parse(
          JSON.stringify({
            curso: cursoLabel,
            modalidade: body.modalidade,
            cidade: body.cidade,
            estado: body.estado,
            enemScore: body.enemScore,
            semEnem: body.semEnem,
            rendaFamiliar: body.rendaFamiliar,
            pessoas: body.pessoas,
            elegibilidade: body.elegibilidade,
          })
        ),
        status: 'NEW',
      },
    })
    leadId = lead.id
  } catch (error) {
    console.error('Falha ao criar Lead (simulador):', error)
  }

  // 2) Notealy sync (best-effort).
  try {
    await upsertNotealyContact({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      tagId: NOTEALY_TAG_SIMULADOR,
    })
  } catch (error) {
    console.error('⚠️ Falha ao sincronizar com Notealy (simulador):', error)
  }

  // 3) Meta CAPI (best-effort).
  if (leadId) {
    await sendLeadToMeta({
      leadId,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      courseName: cursoLabel || undefined,
      request,
    })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
