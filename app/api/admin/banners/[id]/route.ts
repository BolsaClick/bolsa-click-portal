import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'
import { isValidSiteKey } from '@/app/lib/banners'

/**
 * PATCH /api/admin/banners/[id]
 * Atualiza um banner
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAdminAuth(request, ['dashboard'])
  if (isAuthError(authResult)) return authResult

  try {
    const { id } = await params
    const body = await request.json()
    const { title, subtitle, imageUrl, linkUrl, isActive, order, targetSites, startsAt, endsAt } = body

    if (targetSites !== undefined && (!Array.isArray(targetSites) || !targetSites.every(isValidSiteKey))) {
      return NextResponse.json(
        { error: 'targetSites deve conter apenas sites válidos' },
        { status: 400 }
      )
    }

    const existing = await prisma.banner.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json(
        { error: 'Banner não encontrado' },
        { status: 404 }
      )
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(linkUrl !== undefined && { linkUrl }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order }),
        ...(targetSites !== undefined && { targetSites }),
        ...(startsAt !== undefined && { startsAt: startsAt ? new Date(startsAt) : null }),
        ...(endsAt !== undefined && { endsAt: endsAt ? new Date(endsAt) : null }),
      },
    })

    return NextResponse.json({ banner })
  } catch (error) {
    console.error('Error updating banner:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/banners/[id]
 * Exclui um banner
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAdminAuth(request, ['dashboard'])
  if (isAuthError(authResult)) return authResult

  try {
    const { id } = await params

    const existing = await prisma.banner.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json(
        { error: 'Banner não encontrado' },
        { status: 404 }
      )
    }

    await prisma.banner.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting banner:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
