import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/app/lib/prisma'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bolsaclick.com.br'

// Rate limit em memória — 10 shares/IP/hora
const sharesByIp = new Map<string, { count: number; resetAt: number }>()
const SHARE_WINDOW_MS = 60 * 60 * 1000
const SHARE_MAX = 10

function checkShareLimit(ip: string): boolean {
  const now = Date.now()
  const entry = sharesByIp.get(ip)
  if (!entry || entry.resetAt < now) {
    sharesByIp.set(ip, { count: 1, resetAt: now + SHARE_WINDOW_MS })
    return true
  }
  if (entry.count >= SHARE_MAX) return false
  entry.count += 1
  return true
}

interface ShareBody {
  profile: {
    hollandCode: string
    primary?: { code: string; name: string; description?: string }
    secondary?: { code: string; name: string }
    tertiary?: { code: string; name: string }
    intelligences?: Array<{ code: string; name: string }>
    recommendations?: Array<{ courseSlug: string; matchPercent: number; reasoning: string }>
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  if (!checkShareLimit(ip)) {
    return NextResponse.json(
      { error: 'Muitos compartilhamentos. Tente novamente em uma hora.' },
      { status: 429 }
    )
  }

  let body: ShareBody
  try {
    body = (await request.json()) as ShareBody
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { profile } = body
  if (!profile || typeof profile !== 'object') {
    return NextResponse.json({ error: 'profile obrigatório' }, { status: 400 })
  }

  // Valida hollandCode (3 letras RIASEC)
  const hollandCode = String(profile.hollandCode ?? '').toUpperCase()
  if (!/^[RIASEC]{3}$/.test(hollandCode)) {
    return NextResponse.json({ error: 'hollandCode inválido' }, { status: 400 })
  }

  // Valida que tem o mínimo necessário pra renderizar
  if (!profile.primary?.name || !Array.isArray(profile.recommendations)) {
    return NextResponse.json({ error: 'profile incompleto' }, { status: 400 })
  }

  // Gera shareToken hex 16 chars (32 bits de entropia x2 = colisões praticamente impossíveis)
  const shareToken = randomBytes(8).toString('hex')

  try {
    await prisma.vocationalTestResult.create({
      data: {
        shareToken,
        hollandCode,
        profileData: JSON.parse(JSON.stringify(profile)),
      },
    })
  } catch (error) {
    console.error('Falha ao persistir share:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }

  return NextResponse.json({
    shareToken,
    shareUrl: `${SITE_URL}/teste-vocacional/resultado/${shareToken}`,
  })
}
