import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'
import { setAdminClaims, removeAdminClaims } from '@/app/lib/firebase/admin-claims'

// GET - Listar admins
export async function GET(request: NextRequest) {
  const auth = await withAdminAuth(request, ['admin_management'])
  if (isAuthError(auth)) return auth

  try {
    const admins = await prisma.adminUser.findMany({
      include: {
        user: {
          select: {
            id: true,
            firebaseUid: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ admins })
  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Criar novo admin
export async function POST(request: NextRequest) {
  const auth = await withAdminAuth(request, ['admin_management'])
  if (isAuthError(auth)) return auth

  try {
    const body = await request.json()
    const { userId, role, permissions } = body

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      )
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verificar se já é admin
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { userId },
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'User is already an admin' },
        { status: 400 }
      )
    }

    // Definir permissões baseadas no role
    const rolePermissions = {
      SUPER_ADMIN: [
        'dashboard',
        'help_center',
        'courses',
        'users',
        'admin_management',
      ],
      ADMIN: ['dashboard', 'help_center', 'courses', 'users'],
      EDITOR: ['dashboard', 'help_center', 'courses'],
    }

    const finalPermissions =
      permissions || rolePermissions[role as keyof typeof rolePermissions] || []

    // Criar AdminUser no banco
    const adminUser = await prisma.adminUser.create({
      data: {
        userId,
        role,
        permissions: finalPermissions,
        createdBy: auth.uid,
      },
      include: {
        user: {
          select: {
            id: true,
            firebaseUid: true,
            email: true,
            name: true,
          },
        },
      },
    })

    // Definir custom claims no Firebase
    await setAdminClaims(user.firebaseUid, {
      admin: true,
      role: role as 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR',
      permissions: finalPermissions,
    })

    return NextResponse.json({ admin: adminUser }, { status: 201 })
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remover admin
export async function DELETE(request: NextRequest) {
  const auth = await withAdminAuth(request, ['admin_management'])
  if (isAuthError(auth)) return auth

  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('id')

    if (!adminId) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    // Buscar admin
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: adminId },
      include: { user: true },
    })

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Não permitir remover a si mesmo
    if (adminUser.user.firebaseUid === auth.uid) {
      return NextResponse.json(
        { error: 'Cannot remove yourself as admin' },
        { status: 400 }
      )
    }

    // Remover do banco
    await prisma.adminUser.delete({
      where: { id: adminId },
    })

    // Remover claims do Firebase
    await removeAdminClaims(adminUser.user.firebaseUid)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing admin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
