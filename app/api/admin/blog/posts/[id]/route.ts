import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/admin/blog/posts/[id]
 * Busca um post pelo ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const authResult = await withAdminAuth(request, ['blog'])
  if (isAuthError(authResult)) return authResult

  try {
    const { id } = await context.params

    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        categories: { select: { id: true, title: true, slug: true } },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/blog/posts/[id]
 * Atualiza um post
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const authResult = await withAdminAuth(request, ['blog'])
  if (isAuthError(authResult)) return authResult

  try {
    const { id } = await context.params
    const body = await request.json()

    // Extract categoryIds from body (not a direct Prisma field)
    const { categoryIds, ...data } = body

    // Recalcula reading time se content foi atualizado
    if (data.content) {
      const textContent = data.content.replace(/<[^>]*>/g, '')
      const wordCount = textContent.split(/\s+/).filter(Boolean).length
      data.readingTime = Math.max(1, Math.ceil(wordCount / 200))
    }

    // Converte publishedAt para Date se fornecido
    if (data.publishedAt !== undefined) {
      data.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null
    }

    // Build categories update if categoryIds provided
    if (categoryIds !== undefined) {
      data.categories = {
        set: categoryIds.map((cid: string) => ({ id: cid })),
      }
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data,
      include: {
        categories: { select: { id: true, title: true, slug: true } },
      },
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/blog/posts/[id]
 * Deleta um post
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const authResult = await withAdminAuth(request, ['blog'])
  if (isAuthError(authResult)) return authResult

  try {
    const { id } = await context.params

    await prisma.blogPost.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
