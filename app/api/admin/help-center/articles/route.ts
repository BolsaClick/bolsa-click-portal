import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'

/**
 * GET /api/admin/help-center/articles
 * Lista todos os artigos, opcionalmente filtrado por categoria
 */
export async function GET(request: NextRequest) {
  const authResult = await withAdminAuth(request, ['help_center'])
  if (isAuthError(authResult)) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    const articles = await prisma.helpArticle.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: [{ categoryId: 'asc' }, { order: 'asc' }],
      include: {
        category: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json({ articles })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/help-center/articles
 * Cria um novo artigo
 */
export async function POST(request: NextRequest) {
  const authResult = await withAdminAuth(request, ['help_center'])
  if (isAuthError(authResult)) return authResult

  try {
    const body = await request.json()
    const {
      categoryId,
      title,
      description,
      content,
      slug,
      metaTitle,
      metaDescription,
      keywords = [],
      isActive = true,
      publishedAt,
    } = body

    if (!categoryId || !title || !description || !content || !slug) {
      return NextResponse.json(
        { error: 'categoryId, title, description, content e slug são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se categoria existe
    const category = await prisma.helpCategory.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se slug já existe na categoria
    const existingArticle = await prisma.helpArticle.findUnique({
      where: {
        categoryId_slug: {
          categoryId,
          slug,
        },
      },
    })

    if (existingArticle) {
      return NextResponse.json(
        { error: 'Já existe um artigo com este slug nesta categoria' },
        { status: 400 }
      )
    }

    // Obter maior ordem atual na categoria
    const maxOrder = await prisma.helpArticle.aggregate({
      where: { categoryId },
      _max: { order: true },
    })

    const article = await prisma.helpArticle.create({
      data: {
        categoryId,
        title,
        description,
        content,
        slug,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || description,
        keywords,
        isActive,
        publishedAt: publishedAt ? new Date(publishedAt) : (isActive ? new Date() : null),
        order: (maxOrder._max.order || 0) + 1,
      },
      include: {
        category: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json({ article }, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
