import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAgentAuth, isAgentAuthError } from '@/app/lib/middleware/agent-auth'
import { pingIndexNow, INDEXNOW_HOST } from '@/app/lib/seo/indexnow'

/**
 * POST /api/agents/blog/posts
 *
 * Endpoint pra agentes externos publicarem posts no blog usando API key
 * estática (header X-Agent-Key ou Authorization: Bearer <key>).
 *
 * Espelha o contrato de /api/admin/blog/posts mas usa auth diferente.
 * Veja `app/lib/middleware/agent-auth.ts` pra detalhes de setup.
 *
 * Body obrigatório: slug, title, excerpt, content, categoryIds[≥1]
 *
 * CLAUDE.md: o agente DEVE rodar o validator anti-concorrentes antes de
 * chamar este endpoint (server NÃO refaz a validação editorial — confiamos
 * no agente porque a chave dá acesso completo de publicação).
 */
export async function POST(request: NextRequest) {
  const authResult = await withAgentAuth(request)
  if (isAgentAuthError(authResult)) return authResult

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
    } = body

    if (
      !slug ||
      !title ||
      !excerpt ||
      !content ||
      !Array.isArray(categoryIds) ||
      categoryIds.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            'Body inválido — campos obrigatórios: slug, title, excerpt, content, categoryIds (array com pelo menos 1 id)',
        },
        { status: 400 },
      )
    }

    const existing = await prisma.blogPost.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: `Já existe post com slug "${slug}"`, postId: existing.id },
        { status: 409 },
      )
    }

    // Reading time: ~200 palavras por minuto, igual ao admin route.
    const textContent = String(content).replace(/<[^>]*>/g, '')
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
        keywords: Array.isArray(keywords) ? keywords : [],
        featuredImage: featuredImage || null,
        imageAlt: imageAlt || null,
        author,
        readingTime,
        categories: {
          connect: (categoryIds as string[]).map(id => ({ id })),
        },
        tags: Array.isArray(tags) ? tags : [],
        isActive,
        featured,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        createdBy: authResult.agentName,
      },
      include: {
        categories: { select: { id: true, title: true, slug: true } },
      },
    })

    // IndexNow: notifica Bing/Yandex/Naver em segundos quando o post é
    // publicado ativamente. Falhas não bloqueiam a resposta.
    if (post.publishedAt && post.isActive) {
      void pingIndexNow([`https://${INDEXNOW_HOST}/blog/${post.slug}`]).catch(
        () => {},
      )
    }

    return NextResponse.json(
      {
        post: {
          id: post.id,
          slug: post.slug,
          url: `https://${INDEXNOW_HOST}/blog/${post.slug}`,
          publishedAt: post.publishedAt,
          isActive: post.isActive,
          readingTime: post.readingTime,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating blog post via agent:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/agents/blog/posts
 *
 * Lista de posts (paginação simples) pra agente checar o que já foi
 * publicado e evitar slug duplicado antes de tentar POST.
 */
export async function GET(request: NextRequest) {
  const authResult = await withAgentAuth(request)
  if (isAgentAuthError(authResult)) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const slugQuery = searchParams.get('slug')

    if (slugQuery) {
      const post = await prisma.blogPost.findUnique({
        where: { slug: slugQuery },
        select: {
          id: true,
          slug: true,
          title: true,
          publishedAt: true,
          isActive: true,
          createdAt: true,
        },
      })
      return NextResponse.json({ post })
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        select: {
          id: true,
          slug: true,
          title: true,
          publishedAt: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count(),
    ])

    return NextResponse.json({
      posts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Error listing blog posts via agent:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
