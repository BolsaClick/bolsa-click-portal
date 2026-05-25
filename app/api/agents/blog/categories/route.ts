import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAgentAuth, isAgentAuthError } from '@/app/lib/middleware/agent-auth'

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
