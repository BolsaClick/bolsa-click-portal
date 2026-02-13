import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'

/**
 * GET /api/admin/institutions/[id]
 * Retorna uma instituição específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAdminAuth(request, ['courses'])
  if (isAuthError(authResult)) return authResult

  try {
    const { id } = await params

    const institution = await prisma.institution.findUnique({
      where: { id },
    })

    if (!institution) {
      return NextResponse.json(
        { error: 'Instituição não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ institution })
  } catch (error) {
    console.error('Error fetching institution:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/institutions/[id]
 * Atualiza uma instituição
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAdminAuth(request, ['courses'])
  if (isAuthError(authResult)) return authResult

  try {
    const { id } = await params
    const body = await request.json()

    const existing = await prisma.institution.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Instituição não encontrada' },
        { status: 404 }
      )
    }

    if (body.slug && body.slug !== existing.slug) {
      const withSlug = await prisma.institution.findUnique({
        where: { slug: body.slug },
      })
      if (withSlug) {
        return NextResponse.json(
          { error: 'Já existe uma instituição com este slug' },
          { status: 400 }
        )
      }
    }

    const {
      slug, name, shortName, fullName, description, longDescription,
      founded, type, campusCount, studentCount, coursesOffered,
      headquartersCity, headquartersState, mecRating, emecLink,
      modalities, academicLevels, highlights, logoUrl, imageUrl,
      imageAlt, keywords, metaTitle, metaDescription, isActive, order,
    } = body

    const institution = await prisma.institution.update({
      where: { id },
      data: {
        ...(slug !== undefined && { slug }),
        ...(name !== undefined && { name }),
        ...(shortName !== undefined && { shortName }),
        ...(fullName !== undefined && { fullName }),
        ...(description !== undefined && { description }),
        ...(longDescription !== undefined && { longDescription }),
        ...(founded !== undefined && { founded: founded ? parseInt(founded) : null }),
        ...(type !== undefined && { type }),
        ...(campusCount !== undefined && { campusCount: campusCount ? parseInt(campusCount) : null }),
        ...(studentCount !== undefined && { studentCount: studentCount || null }),
        ...(coursesOffered !== undefined && { coursesOffered: coursesOffered ? parseInt(coursesOffered) : null }),
        ...(headquartersCity !== undefined && { headquartersCity: headquartersCity || null }),
        ...(headquartersState !== undefined && { headquartersState: headquartersState || null }),
        ...(mecRating !== undefined && { mecRating: mecRating ? parseInt(mecRating) : null }),
        ...(emecLink !== undefined && { emecLink: emecLink || null }),
        ...(modalities !== undefined && { modalities }),
        ...(academicLevels !== undefined && { academicLevels }),
        ...(highlights !== undefined && { highlights }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(imageAlt !== undefined && { imageAlt: imageAlt || null }),
        ...(keywords !== undefined && { keywords }),
        ...(metaTitle !== undefined && { metaTitle: metaTitle || null }),
        ...(metaDescription !== undefined && { metaDescription: metaDescription || null }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json({ institution })
  } catch (error) {
    console.error('Error updating institution:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/institutions/[id]
 * Exclui uma instituição
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAdminAuth(request, ['courses'])
  if (isAuthError(authResult)) return authResult

  try {
    const { id } = await params

    const existing = await prisma.institution.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Instituição não encontrada' },
        { status: 404 }
      )
    }

    await prisma.institution.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting institution:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
