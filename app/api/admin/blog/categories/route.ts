import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'

function generateSlug(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

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
 * Cria uma nova categoria (suporta criação rápida inline)
 */
export async function POST(request: NextRequest) {
  const authResult = await withAdminAuth(request, ['blog'])
  if (isAuthError(authResult)) return authResult

  try {
    const body = await request.json()
    const { title, slug: providedSlug, description, metaTitle, metaDescription, isActive = true } = body

    if (!title) {
      return NextResponse.json(
        { error: 'title é obrigatório' },
        { status: 400 }
      )
    }

    const slug = providedSlug || generateSlug(title)
    const finalDescription = description || `Artigos sobre ${title}`

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
        description: finalDescription,
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
