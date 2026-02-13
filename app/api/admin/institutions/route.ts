import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'

/**
 * GET /api/admin/institutions
 * Lista todas as instituições
 */
export async function GET(request: NextRequest) {
  const authResult = await withAdminAuth(request, ['courses'])
  if (isAuthError(authResult)) return authResult

  try {
    const institutions = await prisma.institution.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ institutions })
  } catch (error) {
    console.error('Error fetching institutions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/institutions
 * Cria uma nova instituição
 */
export async function POST(request: NextRequest) {
  const authResult = await withAdminAuth(request, ['courses'])
  if (isAuthError(authResult)) return authResult

  try {
    const body = await request.json()
    const {
      slug,
      name,
      shortName,
      fullName,
      description,
      longDescription,
      founded,
      type,
      campusCount,
      studentCount,
      coursesOffered,
      headquartersCity,
      headquartersState,
      mecRating,
      emecLink,
      modalities = [],
      academicLevels = [],
      highlights = [],
      logoUrl,
      imageUrl,
      imageAlt,
      keywords = [],
      metaTitle,
      metaDescription,
      isActive = true,
    } = body

    if (!slug || !name || !shortName || !fullName || !type) {
      return NextResponse.json(
        { error: 'slug, name, shortName, fullName e type são obrigatórios' },
        { status: 400 }
      )
    }

    const existing = await prisma.institution.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe uma instituição com este slug' },
        { status: 400 }
      )
    }

    const maxOrder = await prisma.institution.aggregate({
      _max: { order: true },
    })

    const institution = await prisma.institution.create({
      data: {
        slug,
        name,
        shortName,
        fullName,
        description: description || '',
        longDescription: longDescription || '',
        founded: founded ? parseInt(founded) : null,
        type,
        campusCount: campusCount ? parseInt(campusCount) : null,
        studentCount: studentCount || null,
        coursesOffered: coursesOffered ? parseInt(coursesOffered) : null,
        headquartersCity: headquartersCity || null,
        headquartersState: headquartersState || null,
        mecRating: mecRating ? parseInt(mecRating) : null,
        emecLink: emecLink || null,
        modalities,
        academicLevels,
        highlights,
        logoUrl: logoUrl || '',
        imageUrl: imageUrl || '',
        imageAlt: imageAlt || null,
        keywords,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        isActive,
        order: (maxOrder._max.order || 0) + 1,
      },
    })

    return NextResponse.json({ institution }, { status: 201 })
  } catch (error) {
    console.error('Error creating institution:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
