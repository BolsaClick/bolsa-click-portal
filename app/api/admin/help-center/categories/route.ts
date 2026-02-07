import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'

/**
 * GET /api/admin/help-center/categories
 * Lista todas as categorias da central de ajuda
 */
export async function GET(request: NextRequest) {
  const authResult = await withAdminAuth(request, ['help_center'])
  if (isAuthError(authResult)) return authResult

  try {
    const categories = await prisma.helpCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/help-center/categories
 * Cria uma nova categoria
 */
export async function POST(request: NextRequest) {
  const authResult = await withAdminAuth(request, ['help_center'])
  if (isAuthError(authResult)) return authResult

  try {
    const body = await request.json()
    const { title, description, icon, slug, isActive = true } = body

    if (!title || !description || !icon || !slug) {
      return NextResponse.json(
        { error: 'title, description, icon e slug são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se slug já existe
    const existingCategory = await prisma.helpCategory.findUnique({
      where: { slug },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Já existe uma categoria com este slug' },
        { status: 400 }
      )
    }

    // Obter maior ordem atual
    const maxOrder = await prisma.helpCategory.aggregate({
      _max: { order: true },
    })

    const category = await prisma.helpCategory.create({
      data: {
        title,
        description,
        icon,
        slug,
        isActive,
        order: (maxOrder._max.order || 0) + 1,
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
