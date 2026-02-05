import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

/**
 * GET /api/cursos/[slug]
 * Busca um curso em destaque pelo slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const course = await prisma.featuredCourse.findUnique({
      where: {
        slug,
        isActive: true,
      },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar curso' },
      { status: 500 }
    )
  }
}
