import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAdminAuth(request, ['reviews'])
  if (isAuthError(auth)) return auth

  const { id: institutionId } = await params

  const institution = await prisma.institution.findUnique({
    where: { id: institutionId },
    select: { id: true, name: true, slug: true },
  })
  if (!institution) {
    return NextResponse.json({ error: 'Faculdade não encontrada' }, { status: 404 })
  }

  const responders = await prisma.institutionResponderEmail.findMany({
    where: { institutionId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ institution, responders })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAdminAuth(request, ['reviews'])
  if (isAuthError(auth)) return auth

  const { id: institutionId } = await params
  const data = (await request.json().catch(() => ({}))) as { email?: string }

  if (!data.email || !isValidEmail(data.email)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }

  const email = data.email.toLowerCase().trim()

  try {
    const responder = await prisma.institutionResponderEmail.upsert({
      where: { institutionId_email: { institutionId, email } },
      create: { institutionId, email, isActive: true },
      update: { isActive: true },
    })
    return NextResponse.json({ responder })
  } catch (error) {
    console.error('Error creating responder:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
