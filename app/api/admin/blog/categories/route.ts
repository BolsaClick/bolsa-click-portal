import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'

/**
 * GET /api/admin/blog/categories
 * Lista todas as categorias do blog
 */
export async function GET(request: NextRequest) {
  const authResult = await withAdminAuth(request, ['blog'])
  if (isAuthError(authResult)) return authResult

  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { posts: true } },
      },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/blog/categories
 * Cria uma nova categoria
 */
export async function POST(request: NextRequest) {
  const authResult = await withAdminAuth(request, ['blog'])
  if (isAuthError(authResult)) return authResult

  try {
    const body = await request.json()
    const { slug, title, description, metaTitle, metaDescription, isActive = true } = body

    if (!slug || !title || !description) {
      return NextResponse.json(
        { error: 'slug, title e description são obrigatórios' },
        { status: 400 }
      )
    }

    const existing = await prisma.blogCategory.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: 'Já existe uma categoria com este slug' },
        { status: 400 }
      )
    }

    const maxOrder = await prisma.blogCategory.aggregate({
      _max: { order: true },
    })

    const category = await prisma.blogCategory.create({
      data: {
        slug,
        title,
        description,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        isActive,
        order: (maxOrder._max.order || 0) + 1,
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Error creating blog category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
