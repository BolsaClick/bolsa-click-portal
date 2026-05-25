import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'
import { pingIndexNow, INDEXNOW_HOST } from '@/app/lib/seo/indexnow'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/admin/blog/posts/[id]
 * Carrega 1 post pra tela de edição.
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/blog/posts/[id]
 *
 * Update parcial. Aceita qualquer subset dos campos do POST. Quando:
 *   - content muda → recalcula readingTime
 *   - slug muda → valida que não colide com outro post
 *   - categoryIds vem → faz `set` (substitui o set completo, não append)
 *   - publishedAt mudou de null pra date com isActive=true → dispara IndexNow
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const authResult = await withAdminAuth(request, ['blog'])
  if (isAuthError(authResult)) return authResult

  try {
    const { id } = await context.params
    const body = await request.json()

    const existing = await prisma.blogPost.findUnique({
      where: { id },
      select: { slug: true, publishedAt: true, isActive: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 })
    }

    // Validação de slug duplicado quando muda
    if (body.slug && body.slug !== existing.slug) {
      const collision = await prisma.blogPost.findUnique({
        where: { slug: body.slug },
        select: { id: true },
      })
      if (collision && collision.id !== id) {
        return NextResponse.json(
          { error: `Já existe outro post com slug "${body.slug}"`, postId: collision.id },
          { status: 409 },
        )
      }
    }

    // Recalcula readingTime se content foi enviado
    const data: Record<string, unknown> = {}
    const passthrough = [
      'slug',
      'title',
      'excerpt',
      'content',
      'metaTitle',
      'metaDescription',
      'keywords',
      'featuredImage',
      'imageAlt',
      'author',
      'tags',
      'isActive',
      'featured',
      'updatedBy',
    ] as const

    for (const key of passthrough) {
      if (key in body) data[key] = body[key]
    }

    if (typeof body.content === 'string') {
      const textContent = body.content.replace(/<[^>]*>/g, '')
      const wordCount = textContent.split(/\s+/).filter(Boolean).length
      data.readingTime = Math.max(1, Math.ceil(wordCount / 200))
    }

    if ('publishedAt' in body) {
      data.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null
    }

    if (Array.isArray(body.categoryIds)) {
      data.categories = {
        set: (body.categoryIds as string[]).map(catId => ({ id: catId })),
      }
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data,
      include: {
        categories: { select: { id: true, title: true, slug: true } },
      },
    })

    // IndexNow: dispara se passou de não-publicado → publicado-ativo,
    // OU se já estava publicado-ativo e o slug mudou (URL nova precisa ser indexada).
    const wasPublishedActive = existing.publishedAt && existing.isActive
    const isPublishedActive = post.publishedAt && post.isActive
    const slugChanged = body.slug && body.slug !== existing.slug

    if ((!wasPublishedActive && isPublishedActive) || (isPublishedActive && slugChanged)) {
      void pingIndexNow([`https://${INDEXNOW_HOST}/blog/${post.slug}`]).catch(() => {})
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/blog/posts/[id]
 * Hard delete. A UI já confirma com `confirm()` antes.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const authResult = await withAdminAuth(request, ['blog'])
  if (isAuthError(authResult)) return authResult

  try {
    const { id } = await context.params

    const existing = await prisma.blogPost.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 })
    }

    await prisma.blogPost.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
