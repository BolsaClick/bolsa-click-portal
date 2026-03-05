import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'

/**
 * GET /api/admin/blog/posts
 * Lista posts com paginação e filtros
 */
export async function GET(request: NextRequest) {
  const authResult = await withAdminAuth(request, ['blog'])
  if (isAuthError(authResult)) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const status = searchParams.get('status') || 'all' // draft | published | all

    const where: Record<string, unknown> = {}

    if (categoryId) {
      where.categories = { some: { id: categoryId } }
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (status === 'draft') where.publishedAt = null
    if (status === 'published') where.publishedAt = { not: null }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          categories: { select: { id: true, title: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ])

    return NextResponse.json({
      posts,
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

/**
 * POST /api/admin/blog/posts
 * Cria um novo post
 */
export async function POST(request: NextRequest) {
  const authResult = await withAdminAuth(request, ['blog'])
  if (isAuthError(authResult)) return authResult

  try {
    const body = await request.json()
    const {
      slug,
      title,
      excerpt,
      content,
      metaTitle,
      metaDescription,
      keywords = [],
      featuredImage,
      imageAlt,
      author = 'Equipe Bolsa Click',
      categoryIds = [],
      tags = [],
      isActive = true,
      featured = false,
      publishedAt,
      createdBy,
    } = body

    if (!slug || !title || !excerpt || !content || categoryIds.length === 0) {
      return NextResponse.json(
        { error: 'slug, title, excerpt, content e pelo menos uma categoria são obrigatórios' },
        { status: 400 }
      )
    }

    const existing = await prisma.blogPost.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um post com este slug' },
        { status: 400 }
      )
    }

    // Calcula reading time: ~200 palavras por minuto
    const textContent = content.replace(/<[^>]*>/g, '')
    const wordCount = textContent.split(/\s+/).filter(Boolean).length
    const readingTime = Math.max(1, Math.ceil(wordCount / 200))

    const post = await prisma.blogPost.create({
      data: {
        slug,
        title,
        excerpt,
        content,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        keywords,
        featuredImage: featuredImage || null,
        imageAlt: imageAlt || null,
        author,
        readingTime,
        categories: {
          connect: categoryIds.map((id: string) => ({ id })),
        },
        tags,
        isActive,
        featured,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        createdBy: createdBy || null,
      },
      include: {
        categories: { select: { id: true, title: true, slug: true } },
      },
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
