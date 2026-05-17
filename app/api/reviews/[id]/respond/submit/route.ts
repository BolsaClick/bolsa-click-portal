import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { isExpired } from '@/app/lib/review-tokens'

interface SubmitBody {
  token: string
  body: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const data = (await request.json().catch(() => ({}))) as Partial<SubmitBody>

  if (!data.token || !data.body?.trim()) {
    return NextResponse.json({ error: 'Token e resposta obrigatórios' }, { status: 400 })
  }

  if (data.body.trim().length < 20) {
    return NextResponse.json(
      { error: 'A resposta precisa ter pelo menos 20 caracteres' },
      { status: 400 }
    )
  }

  const tokenRecord = await prisma.institutionResponseToken.findUnique({
    where: { token: data.token },
  })

  if (!tokenRecord || tokenRecord.reviewId !== id) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 404 })
  }

  if (tokenRecord.usedAt) {
    return NextResponse.json({ error: 'Token já foi usado' }, { status: 410 })
  }

  if (isExpired(tokenRecord.expiresAt)) {
    return NextResponse.json({ error: 'Token expirado' }, { status: 410 })
  }

  // Reconfirmar que o email continua autorizado e ativo
  const authorized = await prisma.institutionResponderEmail.findUnique({
    where: {
      institutionId_email: {
        institutionId: tokenRecord.institutionId,
        email: tokenRecord.email,
      },
    },
  })

  if (!authorized?.isActive) {
    return NextResponse.json(
      { error: 'Email não está mais autorizado a responder por essa faculdade' },
      { status: 403 }
    )
  }

  await prisma.$transaction([
    prisma.review.update({
      where: { id },
      data: {
        response: data.body.trim().slice(0, 2000),
        respondedAt: new Date(),
        responderEmail: tokenRecord.email,
      },
    }),
    prisma.institutionResponseToken.update({
      where: { token: data.token },
      data: { usedAt: new Date() },
    }),
  ])

  return NextResponse.json({ ok: true })
}
