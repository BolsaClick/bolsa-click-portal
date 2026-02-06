import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { adminAuth } from '@/app/lib/firebase/admin'

async function verifyToken(request: NextRequest) {
  if (!adminAuth) {
    console.error('Firebase Admin not configured')
    return null
  }

  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split('Bearer ')[1]
  try {
    const decodedToken = await adminAuth.verifyIdToken(token)
    return decodedToken
  } catch (error) {
    console.error('Error verifying token:', error)
    return null
  }
}

// GET - Listar inscrições e transações do usuário
export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyToken(request)
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      include: {
        enrollments: {
          orderBy: { createdAt: 'desc' },
        },
      },
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

    // Encontrar transações que não têm enrollment correspondente
    // (para mostrar pagamentos pendentes/confirmados sem matrícula)
    const transactionsWithoutEnrollment = transactions.filter(tx => {
      if (!tx.courseId) return true // Mostrar todas transações sem curso
      return !user.enrollments.some(e => e.courseId === tx.courseId)
    })

    // Converter transações para formato de enrollment virtual
    const virtualEnrollments = transactionsWithoutEnrollment.map(tx => ({
      id: `tx-${tx.id}`,
      courseId: tx.courseId || '',
      courseName: tx.courseName || 'Matrícula',
      institutionName: tx.institutionName || 'Instituição',
      modalidade: 'EAD',
      turno: null,
      originalPrice: tx.amountInCents / 100,
      finalPrice: tx.amountInCents / 100,
      discount: null,
      status: tx.status === 'PAID' ? 'ENROLLED' : (tx.status === 'PENDING' || tx.status === 'PROCESSING' ? 'PENDING' : 'CANCELLED'),
      paymentStatus: tx.status,
      enrollmentDate: tx.paidAt ? tx.paidAt.toISOString() : null,
      startDate: null,
      externalId: tx.externalTransactionId,
      paymentId: tx.id,
      createdAt: tx.createdAt.toISOString(),
      updatedAt: tx.updatedAt.toISOString(),
      isTransaction: true,
      transactionId: tx.id,
    }))

    // Combinar matrículas reais com virtuais (de transações)
    const allEnrollments = [
      ...user.enrollments.map(e => ({
        ...e,
        enrollmentDate: e.enrollmentDate?.toISOString() || null,
        startDate: e.startDate?.toISOString() || null,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
        isTransaction: false,
      })),
      ...virtualEnrollments,
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      enrollments: allEnrollments,
      transactions,
    })
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Criar nova inscrição
export async function POST(request: NextRequest) {
  try {
    const decodedToken = await verifyToken(request)
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      courseId,
      courseName,
      institutionName,
      modalidade,
      turno,
      originalPrice,
      finalPrice,
      discount,
      externalId,
      paymentId,
    } = body

    if (!courseId || !courseName || !institutionName) {
      return NextResponse.json(
        { error: 'courseId, courseName and institutionName are required' },
        { status: 400 }
      )
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verificar se já existe uma inscrição para este curso
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: courseId,
      },
    })

    if (existingEnrollment) {
      // Atualizar inscrição existente
      const updatedEnrollment = await prisma.enrollment.update({
        where: { id: existingEnrollment.id },
        data: {
          status: 'IN_PROGRESS',
          paymentStatus: paymentId ? 'PROCESSING' : 'PENDING',
          externalId: externalId ? String(externalId) : null,
          paymentId: paymentId ? String(paymentId) : null,
          enrollmentDate: new Date(),
          updatedAt: new Date(),
        },
      })

      return NextResponse.json({
        enrollment: updatedEnrollment,
        message: 'Enrollment updated',
      })
    }

    // Criar nova inscrição
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId,
        courseName,
        institutionName,
        modalidade: modalidade || 'EAD',
        turno: turno || 'VIRTUAL',
        originalPrice: originalPrice ? parseFloat(String(originalPrice)) : null,
        finalPrice: finalPrice ? parseFloat(String(finalPrice)) : null,
        discount: discount ? parseFloat(String(discount)) : null,
        status: 'IN_PROGRESS',
        paymentStatus: paymentId ? 'PROCESSING' : 'PENDING',
        externalId: externalId ? String(externalId) : null,
        paymentId: paymentId ? String(paymentId) : null,
        enrollmentDate: new Date(),
      },
    })

    return NextResponse.json({ enrollment }, { status: 201 })
  } catch (error) {
    console.error('Error creating enrollment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar status da inscrição
export async function PATCH(request: NextRequest) {
  try {
    const decodedToken = await verifyToken(request)
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { enrollmentId, status, paymentStatus, externalId, paymentId } = body

    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'enrollmentId is required' },
        { status: 400 }
      )
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verificar se a inscrição pertence ao usuário
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        userId: user.id,
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    // Atualizar inscrição
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(externalId && { externalId }),
        ...(paymentId && { paymentId }),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ enrollment: updatedEnrollment })
  } catch (error) {
    console.error('Error updating enrollment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
