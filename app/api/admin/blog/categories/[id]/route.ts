import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * PATCH /api/admin/blog/categories/[id]
 * Atualiza uma categoria
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const authResult = await withAdminAuth(request, ['blog'])
  if (isAuthError(authResult)) return authResult

  try {
    const { id } = await context.params
    const body = await request.json()

    const category = await prisma.blogCategory.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error updating blog category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/blog/categories/[id]
 * Deleta uma categoria
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const authResult = await withAdminAuth(request, ['blog'])
  if (isAuthError(authResult)) return authResult

  try {
    const { id } = await context.params

    const postsCount = await prisma.blogPost.count({
      where: { categoryId: id },
    })

    if (postsCount > 0) {
      return NextResponse.json(
        { error: `Não é possível deletar. Esta categoria possui ${postsCount} post(s).` },
        { status: 400 }
      )
    }

    await prisma.blogCategory.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blog category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
