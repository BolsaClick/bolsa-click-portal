import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

/**
 * GET /api/blog
 * Listagem pública de posts publicados
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const categorySlug = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {
      isActive: true,
      publishedAt: { not: null },
    }

    if (categorySlug) {
      where.category = { slug: categorySlug }
    }

    if (featured === 'true') {
      where.featured = true
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [posts, total, categories] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          featuredImage: true,
          imageAlt: true,
          author: true,
          readingTime: true,
          tags: true,
          featured: true,
          publishedAt: true,
          createdAt: true,
          category: { select: { id: true, title: true, slug: true } },
        },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
      prisma.blogCategory.findMany({
        where: { isActive: true },
        select: { id: true, slug: true, title: true },
        orderBy: { order: 'asc' },
      }),
    ])

    return NextResponse.json({
      posts,
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
