import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'

/**
 * GET /api/admin/help-center/categories/[id]
 * Retorna uma categoria específica com seus artigos
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAdminAuth(request, ['help_center'])
  if (isAuthError(authResult)) return authResult

  try {
    const { id } = await params

    const category = await prisma.helpCategory.findUnique({
      where: { id },
      include: {
        articles: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/help-center/categories/[id]
 * Atualiza uma categoria
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
    const { title, description, icon, slug, isActive, order } = body

    // Verificar se categoria existe
    const existingCategory = await prisma.helpCategory.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Se mudou o slug, verificar se não existe outro com o mesmo slug
    if (slug && slug !== existingCategory.slug) {
      const categoryWithSlug = await prisma.helpCategory.findUnique({
        where: { slug },
      })

      if (categoryWithSlug) {
        return NextResponse.json(
          { error: 'Já existe uma categoria com este slug' },
          { status: 400 }
        )
      }
    }

    const category = await prisma.helpCategory.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(slug !== undefined && { slug }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/help-center/categories/[id]
 * Exclui uma categoria e seus artigos
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAdminAuth(request, ['help_center'])
  if (isAuthError(authResult)) return authResult

  try {
    const { id } = await params

    // Verificar se categoria existe
    const existingCategory = await prisma.helpCategory.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Deletar categoria (artigos serão deletados em cascata)
    await prisma.helpCategory.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
