import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { isExpired } from '@/app/lib/review-tokens'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ error: 'Token ausente' }, { status: 400 })
  }

  const record = await prisma.reviewVerificationToken.findUnique({
    where: { token },
    include: { review: { include: { institution: { select: { name: true, slug: true } } } } },
  })

  if (!record) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 404 })
  }

  if (record.usedAt) {
    // Idempotente: se já confirmou, devolve OK com a info do review
    return NextResponse.json({
      ok: true,
      alreadyVerified: true,
      institutionName: record.review.institution.name,
      institutionSlug: record.review.institution.slug,
    })
  }

  if (isExpired(record.expiresAt)) {
    return NextResponse.json({ error: 'Token expirado' }, { status: 410 })
  }

  await prisma.$transaction([
    prisma.review.update({
      where: { id: record.reviewId },
      data: { emailVerified: true, emailVerifiedAt: new Date() },
    }),
    prisma.reviewVerificationToken.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
  ])

  return NextResponse.json({
    ok: true,
    institutionName: record.review.institution.name,
    institutionSlug: record.review.institution.slug,
  })
}
