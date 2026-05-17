import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import {
  getStructuredRecommendations,
  ChatMessage,
  Recommendation,
} from '@/app/lib/teste-vocacional/openai'
import { upsertNotealyContact } from '@/app/lib/api/notealy'
import { TOP_CURSOS } from '@/app/cursos/_data/cursos'

interface SubmitBody {
  conversation: ChatMessage[]
  name: string
  email: string
  phone: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Rate limit: 5 submits/IP/dia
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

// Valida e sanitiza as recomendações da AI: descarta slugs que não existem
// no TOP_CURSOS, e completa se sobrar menos de 3 (fallback com top genéricos).
function sanitizeRecommendations(raw: Recommendation[]): Recommendation[] {
  const validSlugs = new Set(TOP_CURSOS.map(c => c.slug))
  const seen = new Set<string>()
  const valid: Recommendation[] = []

  for (const r of raw) {
    if (!validSlugs.has(r.courseSlug) || seen.has(r.courseSlug)) continue
    seen.add(r.courseSlug)
    valid.push({
      courseSlug: r.courseSlug,
      matchPercent: Math.max(50, Math.min(100, Math.round(r.matchPercent))),
      reasoning: String(r.reasoning).slice(0, 600),
    })
    if (valid.length === 3) break
  }

  // Fallback se AI alucinou ou retornou poucas opções
  const fallbackSlugs = ['administracao', 'direito', 'analise-e-desenvolvimento-de-sistemas']
  for (const slug of fallbackSlugs) {
    if (valid.length >= 3) break
    if (!seen.has(slug) && validSlugs.has(slug)) {
      valid.push({
        courseSlug: slug,
        matchPercent: 60,
        reasoning: 'Recomendação genérica baseada em popularidade — refaça o teste pra ter um match personalizado.',
      })
      seen.add(slug)
    }
  }

  return valid.slice(0, 3)
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

  const { conversation, name, email, phone } = body

  if (!Array.isArray(conversation) || conversation.length < 4) {
    return NextResponse.json(
      { error: 'Conversa muito curta — termine o quiz antes de enviar.' },
      { status: 400 }
    )
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

  // Chamar AI pra extrair top 3 estruturado
  let rawRecommendations: Recommendation[] = []
  try {
    rawRecommendations = await getStructuredRecommendations(conversation)
  } catch (error) {
    console.error('Falha ao gerar recomendações:', error)
    return NextResponse.json(
      { error: 'Erro ao processar suas respostas. Tente em alguns instantes.' },
      { status: 502 }
    )
  }

  const recommendations = sanitizeRecommendations(rawRecommendations)

  // Salvar lead em Prisma
  try {
    await prisma.lead.create({
      data: {
        name: name.trim().slice(0, 80),
        email: email.toLowerCase().trim(),
        phone: cleanPhone,
        courseNames: recommendations.map(r => {
          const curso = TOP_CURSOS.find(c => c.slug === r.courseSlug)
          return curso?.apiCourseName ?? r.courseSlug
        }),
        source: 'teste-vocacional',
        extraData: {
          conversation,
          suggestedCourses: recommendations,
        },
        status: 'NEW',
      },
    })
  } catch (error) {
    console.error('Falha ao criar Lead:', error)
    // Não bloqueia a resposta — usuário ainda vê o resultado
  }

  // Sincronizar com Notealy (best-effort)
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

  return NextResponse.json({ recommendations })
}
