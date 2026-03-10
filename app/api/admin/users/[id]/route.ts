import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'

/**
 * GET /api/admin/users/[id]
 * Retorna os detalhes completos de um usuário
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAdminAuth(request, ['users'])
  if (isAuthError(authResult)) return authResult

  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        enrollments: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        favorites: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        searchHistory: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: {
          select: {
            enrollments: true,
            favorites: true,
            searchHistory: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
