import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'

/**
 * GET /api/admin/featured-courses/[id]
 * Retorna um curso em destaque específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAdminAuth(request, ['courses'])
  if (isAuthError(authResult)) return authResult

  try {
    const { id } = await params

    const course = await prisma.featuredCourse.findUnique({
      where: { id },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ course })
  } catch (error) {
    console.error('Error fetching featured course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/featured-courses/[id]
 * Atualiza um curso em destaque
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
    const {
      slug,
      apiCourseName,
      name,
      fullName,
      type,
      nivel,
      description,
      longDescription,
      duration,
      areas,
      skills,
      careerPaths,
      averageSalary,
      marketDemand,
      imageUrl,
      keywords,
      isActive,
      order,
    } = body

    // Verificar se curso existe
    const existingCourse = await prisma.featuredCourse.findUnique({
      where: { id },
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      )
    }

    // Se mudou o slug, verificar duplicidade
    if (slug && slug !== existingCourse.slug) {
      const courseWithSlug = await prisma.featuredCourse.findUnique({
        where: { slug },
      })

      if (courseWithSlug) {
        return NextResponse.json(
          { error: 'Já existe um curso com este slug' },
          { status: 400 }
        )
      }
    }

    const course = await prisma.featuredCourse.update({
      where: { id },
      data: {
        ...(slug !== undefined && { slug }),
        ...(apiCourseName !== undefined && { apiCourseName }),
        ...(name !== undefined && { name }),
        ...(fullName !== undefined && { fullName }),
        ...(type !== undefined && { type }),
        ...(nivel !== undefined && { nivel }),
        ...(description !== undefined && { description }),
        ...(longDescription !== undefined && { longDescription }),
        ...(duration !== undefined && { duration }),
        ...(areas !== undefined && { areas }),
        ...(skills !== undefined && { skills }),
        ...(careerPaths !== undefined && { careerPaths }),
        ...(averageSalary !== undefined && { averageSalary }),
        ...(marketDemand !== undefined && { marketDemand }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(keywords !== undefined && { keywords }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json({ course })
  } catch (error) {
    console.error('Error updating featured course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/featured-courses/[id]
 * Exclui um curso em destaque
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAdminAuth(request, ['courses'])
  if (isAuthError(authResult)) return authResult

  try {
    const { id } = await params

    // Verificar se curso existe
    const existingCourse = await prisma.featuredCourse.findUnique({
      where: { id },
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      )
    }

    await prisma.featuredCourse.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting featured course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
