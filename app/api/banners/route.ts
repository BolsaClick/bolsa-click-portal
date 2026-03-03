import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

/**
 * GET /api/banners
 * Retorna banners ativos ordenados por order (endpoint público)
 */
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        subtitle: true,
        imageUrl: true,
        linkUrl: true,
      },
    })

    return NextResponse.json({ banners })
  } catch (error) {
    console.error('Error fetching public banners:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
