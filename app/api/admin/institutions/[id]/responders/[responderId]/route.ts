import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'

interface PatchBody {
  isActive?: boolean
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; responderId: string }> }
) {
  const auth = await withAdminAuth(request, ['reviews'])
  if (isAuthError(auth)) return auth

  const { id: institutionId, responderId } = await params
  const data = (await request.json().catch(() => ({}))) as Partial<PatchBody>

  if (typeof data.isActive !== 'boolean') {
    return NextResponse.json({ error: 'isActive obrigatório' }, { status: 400 })
  }

  const existing = await prisma.institutionResponderEmail.findFirst({
    where: { id: responderId, institutionId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Responder não encontrado' }, { status: 404 })
  }

  const updated = await prisma.institutionResponderEmail.update({
    where: { id: responderId },
    data: { isActive: data.isActive },
  })

  return NextResponse.json({ responder: updated })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; responderId: string }> }
) {
  const auth = await withAdminAuth(request, ['reviews'])
  if (isAuthError(auth)) return auth

  const { id: institutionId, responderId } = await params

  const existing = await prisma.institutionResponderEmail.findFirst({
    where: { id: responderId, institutionId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Responder não encontrado' }, { status: 404 })
  }

  await prisma.institutionResponderEmail.delete({ where: { id: responderId } })
  return NextResponse.json({ ok: true })
}
