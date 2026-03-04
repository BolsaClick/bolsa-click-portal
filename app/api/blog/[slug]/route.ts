import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

type RouteContext = { params: Promise<{ slug: string }> }

/**
 * GET /api/blog/[slug]
 * Busca post individual + posts relacionados
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params

    const post = await prisma.blogPost.findUnique({
      where: {
        slug,
        isActive: true,
        publishedAt: { not: null },
      },
      include: {
        category: { select: { id: true, title: true, slug: true } },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 })
    }

    // Posts relacionados (mesma categoria, excluindo o atual)
    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        categoryId: post.categoryId,
        id: { not: post.id },
        isActive: true,
        publishedAt: { not: null },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        featuredImage: true,
        imageAlt: true,
        readingTime: true,
        publishedAt: true,
        category: { select: { title: true, slug: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 4,
    })

    return NextResponse.json({ post, relatedPosts })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
