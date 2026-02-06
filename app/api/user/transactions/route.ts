import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { adminAuth } from '@/app/lib/firebase/admin'

// GET - Buscar transações e matrículas do usuário autenticado
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    if (!adminAuth) {
      console.error('Firebase Admin not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.split('Bearer ')[1]

    let decodedToken
    try {
      decodedToken = await adminAuth.verifyIdToken(token)
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Buscar usuário pelo firebaseUid
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Buscar transações pelo CPF ou email do usuário
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          ...(user.cpf ? [{ cpf: user.cpf }] : []),
          { email: user.email },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Buscar matrículas do usuário
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      transactions,
      enrollments,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
      },
    })
  } catch (error) {
    console.error('Error fetching user transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
