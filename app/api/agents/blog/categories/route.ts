import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAgentAuth, isAgentAuthError } from '@/app/lib/middleware/agent-auth'

function generateSlug(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * GET /api/agents/blog/categories
 *
 * Lista categorias ativas pra agente externo escolher categoryIds antes de
 * publicar via POST /api/agents/blog/posts.
 *
 * Default: só categorias com isActive = true. Use ?includeInactive=1 pra
 * incluir desativadas (útil pra debug/migração).
 *
 * Mesma auth do endpoint /posts — header X-Agent-Key (ou Authorization Bearer).
 */
export async function GET(request: NextRequest) {
  const authResult = await withAgentAuth(request)
  if (isAgentAuthError(authResult)) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === '1'

    const categories = await prisma.blogCategory.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        isActive: true,
        _count: { select: { posts: true } },
      },
    })

    // Achatamos _count.posts em postCount pra response mais limpa
    const flat = categories.map(c => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      isActive: c.isActive,
      postCount: c._count.posts,
    }))

    return NextResponse.json({ categories: flat, total: flat.length })
  } catch (error) {
    console.error('Error listing blog categories via agent:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/agents/blog/categories
 *
 * Cria uma nova categoria. Slug é gerado automaticamente a partir do title
 * se não for fornecido.
 *
 * Body obrigatório: title
 * Body opcional: slug, description, metaTitle, metaDescription, isActive
 */
export async function POST(request: NextRequest) {
  const authResult = await withAgentAuth(request)
  if (isAgentAuthError(authResult)) return authResult

  try {
    const body = await request.json()
    const { title, slug: providedSlug, description, metaTitle, metaDescription, isActive = true } = body

    if (!title) {
      return NextResponse.json(
        { error: 'title é obrigatório' },
        { status: 400 },
      )
    }

    const slug = providedSlug || generateSlug(title)

    const existing = await prisma.blogCategory.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: `Já existe uma categoria com o slug "${slug}"`, categoryId: existing.id },
        { status: 409 },
      )
    }

    const maxOrder = await prisma.blogCategory.aggregate({ _max: { order: true } })

    const category = await prisma.blogCategory.create({
      data: {
        slug,
        title,
        description: description || `Artigos sobre ${title}`,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        isActive,
        order: (maxOrder._max.order || 0) + 1,
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Error creating blog category via agent:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
