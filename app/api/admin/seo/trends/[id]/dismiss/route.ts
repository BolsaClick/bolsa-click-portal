import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'
import { prisma } from '@/app/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withAdminAuth(request, ['seo'])
  if (isAuthError(auth)) return auth

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const dismissed = body.dismissed !== false // default true

  try {
    const updated = await prisma.seoTrendsEntry.update({
      where: { id },
      data: {
        dismissed,
        dismissedAt: dismissed ? new Date() : null,
        notes: body.notes ?? undefined,
      },
    })
    return NextResponse.json({ success: true, entry: updated })
  } catch (e) {
    return NextResponse.json(
      { error: 'not_found', message: e instanceof Error ? e.message : 'unknown' },
      { status: 404 },
    )
  }
}
