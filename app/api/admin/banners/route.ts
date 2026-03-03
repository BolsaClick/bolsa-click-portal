import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'

/**
 * GET /api/admin/banners
 * Lista todos os banners (ordenados por order)
 */
export async function GET(request: NextRequest) {
  const authResult = await withAdminAuth(request, ['dashboard'])
  if (isAuthError(authResult)) return authResult

  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ banners })
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/banners
 * Cria um novo banner
 */
export async function POST(request: NextRequest) {
  const authResult = await withAdminAuth(request, ['dashboard'])
  if (isAuthError(authResult)) return authResult

  try {
    const body = await request.json()
    const { title, subtitle, imageUrl, linkUrl, isActive = true } = body

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: 'title e imageUrl são obrigatórios' },
        { status: 400 }
      )
    }

    // Obter maior ordem atual
    const maxOrder = await prisma.banner.aggregate({
      _max: { order: true },
    })

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        imageUrl,
        linkUrl,
        isActive,
        order: (maxOrder._max.order || 0) + 1,
      },
    })

    return NextResponse.json({ banner }, { status: 201 })
  } catch (error) {
    console.error('Error creating banner:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
