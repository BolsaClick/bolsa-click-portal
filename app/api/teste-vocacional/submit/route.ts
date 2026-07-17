import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import {
  getStructuredRecommendations,
  type ChatMessage,
  type Recommendation,
} from '@/app/lib/teste-vocacional/openai'
import { upsertNotealyContact } from '@/app/lib/api/notealy'
import { sendFacebookEvent } from '@/app/lib/analytics/fb-capi'
import { TOP_CURSOS } from '@/app/cursos/_data/cursos'
import {
  computeUserProfile,
  matchCourses,
  type LikertAnswers,
} from '@/app/lib/teste-vocacional/matching'
import {
  RIASEC_DESCRIPTIONS,
  GARDNER_DESCRIPTIONS,
} from '@/app/lib/teste-vocacional/methodology-profiles'

interface SubmitBody {
  likertAnswers: LikertAnswers
  conversation: ChatMessage[]
  name: string
  email: string
  phone: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const submitsByIp = new Map<string, { count: number; resetAt: number }>()
const SUBMIT_WINDOW_MS = 24 * 60 * 60 * 1000
const SUBMIT_MAX = 5

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

function sanitizeRecommendations(
  raw: Recommendation[],
  expectedSlugs: string[]
): Recommendation[] {
  const expectedSet = new Set(expectedSlugs)
  const seen = new Set<string>()
  const valid: Recommendation[] = []

  for (const r of raw) {
    if (!expectedSet.has(r.courseSlug) || seen.has(r.courseSlug)) continue
    seen.add(r.courseSlug)
    valid.push({
      courseSlug: r.courseSlug,
      matchPercent: Math.max(50, Math.min(100, Math.round(r.matchPercent))),
      reasoning: String(r.reasoning).slice(0, 600),
    })
    if (valid.length === 3) break
  }

  // Fallback: se AI hallucinou ou retornou poucos, completa com os esperados
  for (const slug of expectedSlugs) {
    if (valid.length >= 3) break
    if (!seen.has(slug)) {
      valid.push({
        courseSlug: slug,
        matchPercent: 70,
        reasoning: 'Curso compatível com seu perfil baseado no Holland Code e inteligências dominantes.',
      })
      seen.add(slug)
    }
  }

  return valid.slice(0, 3)
}

// Meta Conversions API — Lead server-side (espelha o /api/simulador).
// eventId determinístico pelo lead → idempotente em retries.
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
      eventId: `tv_${params.leadId}`,
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
        content_category: 'teste-vocacional',
        content_type: 'product',
      },
      actionSource: 'website',
      eventSourceUrl: params.request.headers.get('referer') ?? undefined,
    })
  } catch (error) {
    console.error('⚠️ Meta CAPI Lead (teste vocacional) falhou:', error)
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  if (!checkSubmitLimit(ip)) {
    return NextResponse.json(
      { error: 'Limite diário de testes atingido. Tente amanhã.' },
      { status: 429 }
    )
  }

  let body: SubmitBody
  try {
    body = (await request.json()) as SubmitBody
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { likertAnswers, conversation, name, email, phone } = body

  if (!likertAnswers || typeof likertAnswers !== 'object') {
    return NextResponse.json({ error: 'likertAnswers obrigatório' }, { status: 400 })
  }
  if (!Array.isArray(conversation)) {
    return NextResponse.json({ error: 'conversation obrigatório' }, { status: 400 })
  }
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

  // 1) Calcula perfil determinístico a partir das respostas Likert
  const profile = computeUserProfile(likertAnswers)

  // 2) Top 3 cursos pré-selecionados pelo matching
  const topMatches = matchCourses(profile).slice(0, 3)
  const topSlugs = topMatches.map(m => m.slug)

  // 3) AI personaliza reasoning + ajusta matchPercent
  let rawRecommendations: Recommendation[] = []
  try {
    rawRecommendations = await getStructuredRecommendations(
      profile,
      conversation,
      topSlugs
    )
  } catch (error) {
    console.error('Falha ao gerar recomendações:', error)
    // Fallback: usa os matches determinísticos com reasoning genérico
    rawRecommendations = topMatches.map(m => ({
      courseSlug: m.slug,
      matchPercent: m.score,
      reasoning: 'Curso alinhado com seu perfil vocacional.',
    }))
  }

  const recommendations = sanitizeRecommendations(rawRecommendations, topSlugs)

  const primaryDesc = RIASEC_DESCRIPTIONS[profile.primary]
  const secondaryDesc = RIASEC_DESCRIPTIONS[profile.secondary]
  const tertiaryDesc = RIASEC_DESCRIPTIONS[profile.tertiary]

  const profileResult = {
    hollandCode: profile.hollandCode,
    primary: { code: profile.primary, ...primaryDesc },
    secondary: { code: profile.secondary, name: secondaryDesc.name, short: secondaryDesc.short },
    tertiary: { code: profile.tertiary, name: tertiaryDesc.name, short: tertiaryDesc.short },
    intelligences: profile.topIntelligences.map(i => ({
      code: i,
      name: GARDNER_DESCRIPTIONS[i].name,
      short: GARDNER_DESCRIPTIONS[i].short,
    })),
    recommendations,
  }

  // 4) Persistir Lead em Prisma (best-effort)
  const courseNames = recommendations.map(r => {
    const curso = TOP_CURSOS.find(c => c.slug === r.courseSlug)
    return curso?.apiCourseName ?? r.courseSlug
  })
  let leadId = ''
  try {
    const lead = await prisma.lead.create({
      data: {
        name: name.trim().slice(0, 80),
        email: email.toLowerCase().trim(),
        phone: cleanPhone,
        courseNames,
        source: 'teste-vocacional',
        extraData: JSON.parse(JSON.stringify({
          likertAnswers,
          conversation,
          profile: profileResult,
        })),
        status: 'NEW',
      },
    })
    leadId = lead.id
  } catch (error) {
    console.error('Falha ao criar Lead:', error)
  }

  // 5) Notealy sync (best-effort)
  try {
    await upsertNotealyContact({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: cleanPhone,
      tagId: process.env.NOTEALY_TAG_TESTE_VOCACIONAL,
    })
  } catch (error) {
    console.error('⚠️ Falha ao sincronizar com Notealy:', error)
  }

  // 6) Meta CAPI — Lead (best-effort)
  if (leadId) {
    await sendLeadToMeta({
      leadId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: cleanPhone,
      courseName: courseNames[0],
      request,
    })
  }

  return NextResponse.json(profileResult)
}
