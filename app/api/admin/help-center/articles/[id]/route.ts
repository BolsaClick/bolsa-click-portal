import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'

/**
 * GET /api/admin/help-center/articles/[id]
 * Retorna um artigo específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAdminAuth(request, ['help_center'])
  if (isAuthError(authResult)) return authResult

  try {
    const { id } = await params

    const article = await prisma.helpArticle.findUnique({
      where: { id },
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

    if (!article) {
      return NextResponse.json(
        { error: 'Artigo não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ article })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/help-center/articles/[id]
 * Atualiza um artigo
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAdminAuth(request, ['help_center'])
  if (isAuthError(authResult)) return authResult

  try {
    const { id } = await params
    const body = await request.json()
    const {
      categoryId,
      title,
      description,
      content,
      slug,
      metaTitle,
      metaDescription,
      keywords,
      isActive,
      publishedAt,
      order,
    } = body

    // Verificar se artigo existe
    const existingArticle = await prisma.helpArticle.findUnique({
      where: { id },
    })

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Artigo não encontrado' },
        { status: 404 }
      )
    }

    // Se mudou categoria ou slug, verificar duplicidade
    const newCategoryId = categoryId || existingArticle.categoryId
    const newSlug = slug || existingArticle.slug

    if (categoryId !== existingArticle.categoryId || slug !== existingArticle.slug) {
      const duplicateArticle = await prisma.helpArticle.findUnique({
        where: {
          categoryId_slug: {
            categoryId: newCategoryId,
            slug: newSlug,
          },
        },
      })

      if (duplicateArticle && duplicateArticle.id !== id) {
        return NextResponse.json(
          { error: 'Já existe um artigo com este slug nesta categoria' },
          { status: 400 }
        )
      }
    }

    // Se está sendo ativado e não tem publishedAt, definir agora
    let finalPublishedAt = publishedAt !== undefined ? (publishedAt ? new Date(publishedAt) : null) : undefined
    if (isActive === true && !existingArticle.publishedAt && !publishedAt) {
      finalPublishedAt = new Date()
    }

    const article = await prisma.helpArticle.update({
      where: { id },
      data: {
        ...(categoryId !== undefined && { categoryId }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(content !== undefined && { content }),
        ...(slug !== undefined && { slug }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(keywords !== undefined && { keywords }),
        ...(isActive !== undefined && { isActive }),
        ...(finalPublishedAt !== undefined && { publishedAt: finalPublishedAt }),
        ...(order !== undefined && { order }),
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

    return NextResponse.json({ article })
  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/help-center/articles/[id]
 * Exclui um artigo
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAdminAuth(request, ['help_center'])
  if (isAuthError(authResult)) return authResult

  try {
    const { id } = await params

    // Verificar se artigo existe
    const existingArticle = await prisma.helpArticle.findUnique({
      where: { id },
    })

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Artigo não encontrado' },
        { status: 404 }
      )
    }

    await prisma.helpArticle.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
