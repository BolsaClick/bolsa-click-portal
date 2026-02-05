import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { setAdminClaims } from '@/app/lib/firebase/admin-claims'
import { adminAuth } from '@/app/lib/firebase/admin'

/**
 * API para configurar o primeiro admin do sistema.
 * Esta rota só funciona se não existir nenhum admin cadastrado.
 * Requer um secret token para segurança adicional.
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar se já existe algum admin
    const existingAdmin = await prisma.adminUser.findFirst()
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin already exists. Use the admin panel to manage admins.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { firebaseUid, setupSecret } = body

    // Verificar secret (use uma variável de ambiente)
    const expectedSecret = process.env.ADMIN_SETUP_SECRET || 'bolsa-click-admin-setup-2024'
    if (setupSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Invalid setup secret' },
        { status: 401 }
      )
    }

    if (!firebaseUid) {
      return NextResponse.json(
        { error: 'firebaseUid is required' },
        { status: 400 }
      )
    }

    // Buscar usuário pelo firebaseUid
    let user = await prisma.user.findUnique({
      where: { firebaseUid },
    })

    // Se o usuário não existir no banco, criar com dados do Firebase
    if (!user && adminAuth) {
      try {
        const firebaseUser = await adminAuth.getUser(firebaseUid)
        user = await prisma.user.create({
          data: {
            firebaseUid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || null,
            emailVerified: firebaseUser.emailVerified,
          },
        })
      } catch (error) {
        console.error('Error getting Firebase user:', error)
        return NextResponse.json(
          { error: 'User not found in Firebase' },
          { status: 404 }
        )
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const permissions = [
      'dashboard',
      'help_center',
      'courses',
      'users',
      'admin_management',
    ]

    // Criar AdminUser no banco
    const adminUser = await prisma.adminUser.create({
      data: {
        userId: user.id,
        role: 'SUPER_ADMIN',
        permissions,
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
    await setAdminClaims(firebaseUid, {
      admin: true,
      role: 'SUPER_ADMIN',
      permissions,
    })

    return NextResponse.json({
      success: true,
      message: 'Admin setup complete. Please log out and log back in to refresh your permissions.',
      admin: adminUser,
    })
  } catch (error) {
    console.error('Error in admin setup:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
