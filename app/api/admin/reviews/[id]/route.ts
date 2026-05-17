import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'

type Action = 'approve' | 'reject' | 'spam'

interface PatchBody {
  action: Action
  rejectReason?: string
}

const NEW_STATUS_BY_ACTION: Record<Action, 'APPROVED' | 'REJECTED' | 'SPAM'> = {
  approve: 'APPROVED',
  reject: 'REJECTED',
  spam: 'SPAM',
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAdminAuth(request, ['reviews'])
  if (isAuthError(auth)) return auth

  const { id } = await params
  const data = (await request.json().catch(() => ({}))) as Partial<PatchBody>

  if (!data.action || !(data.action in NEW_STATUS_BY_ACTION)) {
    return NextResponse.json({ error: 'action inválida' }, { status: 400 })
  }

  const existing = await prisma.review.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Review não encontrado' }, { status: 404 })
  }

  const newStatus = NEW_STATUS_BY_ACTION[data.action]

  const updated = await prisma.review.update({
    where: { id },
    data: {
      status: newStatus,
      moderatedAt: new Date(),
      moderatedBy: auth.uid,
      rejectReason: newStatus === 'REJECTED' ? (data.rejectReason ?? null) : null,
    },
  })

  return NextResponse.json({ review: updated })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAdminAuth(request, ['reviews'])
  if (isAuthError(auth)) return auth

  const { id } = await params
  await prisma.review.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
