import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { verifyTurnstile } from '@/app/lib/captcha'

const MAX_REVIEWS_PER_EMAIL_24H = 5

interface CreateReviewBody {
  institutionSlug: string
  authorName: string
  authorEmail: string
  rating: number
  recommends: boolean
  body: string
  turnstileToken: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as Partial<CreateReviewBody>

    if (
      !data.institutionSlug ||
      !data.authorName?.trim() ||
      !data.authorEmail?.trim() ||
      typeof data.rating !== 'number' ||
      typeof data.recommends !== 'boolean' ||
      !data.body?.trim() ||
      !data.turnstileToken
    ) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    if (!isValidEmail(data.authorEmail)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    if (data.rating < 1 || data.rating > 5) {
      return NextResponse.json({ error: 'Nota deve ser entre 1 e 5' }, { status: 400 })
    }

    if (data.body.trim().length < 30) {
      return NextResponse.json(
        { error: 'Escreva pelo menos 30 caracteres no comentário' },
        { status: 400 }
      )
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    const userAgent = request.headers.get('user-agent') ?? null

    const captchaOk = await verifyTurnstile(data.turnstileToken, ip ?? undefined)
    if (!captchaOk) {
      return NextResponse.json({ error: 'Verificação anti-spam falhou' }, { status: 400 })
    }

    const institution = await prisma.institution.findUnique({
      where: { slug: data.institutionSlug },
      select: { id: true, name: true, slug: true, isActive: true },
    })

    if (!institution || !institution.isActive) {
      return NextResponse.json({ error: 'Faculdade não encontrada' }, { status: 404 })
    }

    // Rate limit por email — máx 5 reviews em 24h em todo o site
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentByEmail = await prisma.review.count({
      where: {
        authorEmail: data.authorEmail.toLowerCase(),
        createdAt: { gte: oneDayAgo },
      },
    })
    if (recentByEmail >= MAX_REVIEWS_PER_EMAIL_24H) {
      return NextResponse.json(
        { error: 'Limite de reviews por email nas últimas 24h atingido. Tente novamente amanhã.' },
        { status: 429 }
      )
    }

    const review = await prisma.review.create({
      data: {
        institutionId: institution.id,
        authorName: data.authorName.trim().slice(0, 80),
        authorEmail: data.authorEmail.toLowerCase().trim(),
        rating: Math.round(data.rating),
        recommends: data.recommends,
        body: data.body.trim().slice(0, 2000),
        status: 'PENDING',
        ip,
        userAgent,
      },
    })

    return NextResponse.json({
      ok: true,
      reviewId: review.id,
      message: 'Avaliação recebida. Em breve passa por moderação e aparece no site.',
    })
  } catch (error) {
    console.error('Erro ao criar review:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
