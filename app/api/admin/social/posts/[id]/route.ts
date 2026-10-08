import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'
import { parseSocialSlides } from '@/app/lib/social/slides'

/**
 * PATCH  /api/admin/social/posts/[id]   move a peça na fila (aprovar/reprovar/agendar)
 * DELETE /api/admin/social/posts/[id]   descarta um rascunho
 *
 * TRANSIÇÕES PERMITIDAS. A máquina de estados é explícita porque é ela que
 * carrega a decisão do CEO: nada vai a público sem aprovação humana, nem
 * depois da API da Meta ligada.
 *
 *   DRAFT     -> APPROVED   (aprovação do Rodrigo; carimba quem e quando)
 *   APPROVED  -> DRAFT      (voltar atrás antes de publicar)
 *   APPROVED  -> PUBLISHED  (só o publicador faz isso, nunca a tela)
 *   APPROVED  -> FAILED     (tentativa de publicação deu errado)
 *   FAILED    -> APPROVED   (retentar)
 *
 * PUBLISHED é terminal: o post já está no feed e o banco não desfaz isso.
 */
type RouteContext = { params: Promise<{ id: string }> }

type Status = 'DRAFT' | 'APPROVED' | 'PUBLISHED' | 'FAILED'

const TRANSICOES: Record<Status, Status[]> = {
  DRAFT: ['APPROVED'],
  APPROVED: ['DRAFT', 'PUBLISHED', 'FAILED'],
  PUBLISHED: [],
  FAILED: ['APPROVED'],
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await withAdminAuth(request, ['blog'])
  if (isAuthError(auth)) return auth

  const { id } = await context.params

  let body: { status?: Status; scheduledFor?: string | null; caption?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const post = await prisma.socialPost.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'Peça não encontrada' }, { status: 404 })

  const data: Record<string, unknown> = {}

  if (body.status && body.status !== post.status) {
    const permitidas = TRANSICOES[post.status as Status]
    if (!permitidas.includes(body.status)) {
      return NextResponse.json(
        {
          error: `Transição ${post.status} -> ${body.status} não é permitida.`,
          permitidas,
        },
        { status: 409 },
      )
    }

    if (body.status === 'APPROVED') {
      // Revalida o conteúdo congelado NO MOMENTO da aprovação. Entre a geração
      // e o clique pode ter entrado registro corrompido ou um slide com preço
      // sem ressalva: aprovar é o último portão antes do público, então é aqui
      // que a regra tem que morder de novo.
      try {
        parseSocialSlides(post.slides)
      } catch (error) {
        console.error('[admin social] aprovação bloqueada, slides inválidos', id, error)
        return NextResponse.json(
          { error: 'Os slides desta peça não passam na validação. Aprovação bloqueada.' },
          { status: 422 },
        )
      }
      data.approvedAt = new Date()
      data.approvedBy = auth.uid
    }

    if (body.status === 'DRAFT') {
      data.approvedAt = null
      data.approvedBy = null
    }

    data.status = body.status
  }

  if (body.scheduledFor !== undefined) {
    data.scheduledFor = body.scheduledFor ? new Date(body.scheduledFor) : null
  }

  // A legenda é texto editorial e pode ser ajustada à mão. Os SLIDES não: eles
  // carregam preço vindo do catálogo e não se editam por aqui, senão o número
  // publicado deixa de ter origem rastreável.
  if (typeof body.caption === 'string') data.caption = body.caption

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 })
  }

  try {
    const atualizado = await prisma.socialPost.update({ where: { id }, data })
    return NextResponse.json({ post: atualizado })
  } catch (error) {
    console.error('[admin social] update falhou:', error)
    return NextResponse.json({ error: 'Falha ao atualizar a peça' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await withAdminAuth(request, ['blog'])
  if (isAuthError(auth)) return auth

  const { id } = await context.params
  const post = await prisma.socialPost.findUnique({ where: { id }, select: { status: true } })
  if (!post) return NextResponse.json({ error: 'Peça não encontrada' }, { status: 404 })

  // Histórico de publicação é o que faz a rotação funcionar. Apagar um
  // PUBLISHED faria o mesmo card voltar à roda como se nunca tivesse saído.
  if (post.status === 'PUBLISHED') {
    return NextResponse.json(
      { error: 'Peça já publicada não pode ser apagada: é o histórico que alimenta a rotação.' },
      { status: 409 },
    )
  }

  try {
    await prisma.socialPost.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[admin social] delete falhou:', error)
    return NextResponse.json({ error: 'Falha ao apagar a peça' }, { status: 500 })
  }
}
