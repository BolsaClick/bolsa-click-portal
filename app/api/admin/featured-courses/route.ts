import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'

/**
 * GET /api/admin/featured-courses
 * Lista todos os cursos em destaque
 */
export async function GET(request: NextRequest) {
  const authResult = await withAdminAuth(request, ['courses'])
  if (isAuthError(authResult)) return authResult

  try {
    const courses = await prisma.featuredCourse.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Error fetching featured courses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/featured-courses
 * Cria um novo curso em destaque
 */
export async function POST(request: NextRequest) {
  const authResult = await withAdminAuth(request, ['courses'])
  if (isAuthError(authResult)) return authResult

  try {
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
      areas = [],
      skills = [],
      careerPaths = [],
      averageSalary,
      marketDemand,
      imageUrl,
      keywords = [],
      isActive = true,
    } = body

    // Validação
    if (!slug || !apiCourseName || !name || !fullName || !type || !nivel) {
      return NextResponse.json(
        { error: 'slug, apiCourseName, name, fullName, type e nivel são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se slug já existe
    const existingCourse = await prisma.featuredCourse.findUnique({
      where: { slug },
    })

    if (existingCourse) {
      return NextResponse.json(
        { error: 'Já existe um curso com este slug' },
        { status: 400 }
      )
    }

    // Obter maior ordem atual
    const maxOrder = await prisma.featuredCourse.aggregate({
      _max: { order: true },
    })

    const course = await prisma.featuredCourse.create({
      data: {
        slug,
        apiCourseName,
        name,
        fullName,
        type,
        nivel,
        description: description || '',
        longDescription: longDescription || '',
        duration: duration || '',
        areas,
        skills,
        careerPaths,
        averageSalary: averageSalary || '',
        marketDemand: marketDemand || 'MEDIA',
        imageUrl: imageUrl || '',
        keywords,
        isActive,
        order: (maxOrder._max.order || 0) + 1,
      },
    })

    return NextResponse.json({ course }, { status: 201 })
  } catch (error) {
    console.error('Error creating featured course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
