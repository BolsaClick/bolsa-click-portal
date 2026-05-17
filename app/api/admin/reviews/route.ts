import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await withAdminAuth(request, ['reviews'])
  if (isAuthError(auth)) return auth

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const status = searchParams.get('status') || ''
    const institutionSlug = searchParams.get('institution') || ''
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (status && ['PENDING', 'APPROVED', 'REJECTED', 'SPAM'].includes(status)) {
      where.status = status
    }

    if (institutionSlug) {
      where.institution = { slug: institutionSlug }
    }

    if (search) {
      where.OR = [
        { authorName: { contains: search, mode: 'insensitive' } },
        { authorEmail: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [reviews, total, counts] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          institution: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
      prisma.review.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ])

    const countsByStatus = counts.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = c._count.status
      return acc
    }, {})

    return NextResponse.json({
      reviews,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      countsByStatus,
    })
  } catch (error) {
    console.error('Error listing reviews:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
