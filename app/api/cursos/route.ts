import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

/**
 * GET /api/cursos
 * Lista todos os cursos em destaque ativos
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type') // BACHARELADO, LICENCIATURA, TECNOLOGO
    const nivel = searchParams.get('nivel') // GRADUACAO, POS_GRADUACAO
    const search = searchParams.get('search')

    const where: {
      isActive: boolean
      type?: 'BACHARELADO' | 'LICENCIATURA' | 'TECNOLOGO'
      nivel?: 'GRADUACAO' | 'POS_GRADUACAO'
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' }
        fullName?: { contains: string; mode: 'insensitive' }
        description?: { contains: string; mode: 'insensitive' }
      }>
    } = {
      isActive: true,
    }

    if (type) {
      where.type = type as 'BACHARELADO' | 'LICENCIATURA' | 'TECNOLOGO'
    }

    if (nivel) {
      where.nivel = nivel as 'GRADUACAO' | 'POS_GRADUACAO'
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [courses, total] = await Promise.all([
      prisma.featuredCourse.findMany({
        where,
        orderBy: { order: 'asc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          slug: true,
          name: true,
          fullName: true,
          type: true,
          nivel: true,
          description: true,
          duration: true,
          averageSalary: true,
          marketDemand: true,
          imageUrl: true,
          areas: true,
        },
      }),
      prisma.featuredCourse.count({ where }),
    ])

    return NextResponse.json({
      courses,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar cursos' },
      { status: 500 }
    )
  }
}
