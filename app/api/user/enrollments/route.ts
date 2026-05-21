import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { adminAuth } from '@/app/lib/firebase/admin'
import { sendUtmifyOrder, paymentMethodToUtmify } from '@/app/lib/api/utmify'

function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || null
}

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
      // Tracking UTMify (capturados no client a partir do localStorage da UTMify)
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      src,
      sck,
    } = body

    const ipAddress = getClientIp(request)

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

    const trackingFields = {
      utmSource: utmSource ? String(utmSource) : null,
      utmMedium: utmMedium ? String(utmMedium) : null,
      utmCampaign: utmCampaign ? String(utmCampaign) : null,
      utmContent: utmContent ? String(utmContent) : null,
      utmTerm: utmTerm ? String(utmTerm) : null,
      src: src ? String(src) : null,
      sck: sck ? String(sck) : null,
      ipAddress,
    }

    let enrollment
    if (existingEnrollment) {
      enrollment = await prisma.enrollment.update({
        where: { id: existingEnrollment.id },
        data: {
          status: 'IN_PROGRESS',
          paymentStatus: paymentId ? 'PROCESSING' : 'PENDING',
          externalId: externalId ? String(externalId) : null,
          paymentId: paymentId ? String(paymentId) : null,
          enrollmentDate: new Date(),
          updatedAt: new Date(),
          ...trackingFields,
        },
      })
    } else {
      enrollment = await prisma.enrollment.create({
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
          ...trackingFields,
        },
      })
    }

    // UTMify webhook (fire-and-forget — não bloqueia a resposta da API).
    // Matrícula sem paymentId = inscrição gratuita do ponto de vista UTMify
    // (sem cobrança no nosso checkout — Cogna cobra mensalidades depois).
    // Status: waiting_payment se houver pagamento em aberto, paid se gratuita.
    const hasPayment = Boolean(paymentId)
    const utmifyStatus: 'waiting_payment' | 'paid' = hasPayment ? 'waiting_payment' : 'paid'
    void dispatchUtmifyForEnrollment(enrollment, user, utmifyStatus, hasPayment ? 'pix' : 'free_price')

    return NextResponse.json(
      { enrollment, message: existingEnrollment ? 'Enrollment updated' : undefined },
      { status: existingEnrollment ? 200 : 201 }
    )
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

    // Transição PENDING/PROCESSING → PAID dispara o evento "paid" pra UTMify.
    // Idempotente: utmifyPaidSentAt evita reenvio.
    if (
      paymentStatus === 'PAID' &&
      enrollment.paymentStatus !== 'PAID' &&
      !enrollment.utmifyPaidSentAt
    ) {
      void dispatchUtmifyForEnrollment(updatedEnrollment, user, 'paid', 'pix')
    }

    return NextResponse.json({ enrollment: updatedEnrollment })
  } catch (error) {
    console.error('Error updating enrollment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper de disparo do webhook UTMify, com persistência dos timestamps de envio
// (utmifyWaitingSentAt / utmifyPaidSentAt) pra garantir idempotência.
type EnrollmentForUtmify = {
  id: string
  courseId: string
  courseName: string
  institutionName: string
  originalPrice: number | null
  finalPrice: number | null
  createdAt: Date
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  utmTerm: string | null
  src: string | null
  sck: string | null
  ipAddress: string | null
  utmifyWaitingSentAt: Date | null
  utmifyPaidSentAt: Date | null
}

type UserForUtmify = {
  name: string | null
  email: string
  phone: string | null
  cpf: string | null
}

async function dispatchUtmifyForEnrollment(
  enrollment: EnrollmentForUtmify,
  user: UserForUtmify,
  status: 'waiting_payment' | 'paid',
  paymentMethod: string
): Promise<void> {
  try {
    if (!user.cpf) return // UTMify exige document — sem CPF não dá pra enviar

    // Idempotência: já enviamos esse status pra esse enrollment? skip.
    if (status === 'waiting_payment' && enrollment.utmifyWaitingSentAt) return
    if (status === 'paid' && enrollment.utmifyPaidSentAt) return

    // Preço em centavos (UTMify trabalha em centavos). Free price = 0.
    const priceFloat = enrollment.finalPrice ?? enrollment.originalPrice ?? 0
    const priceInCents = Math.round(priceFloat * 100)

    const ok = await sendUtmifyOrder({
      orderId: enrollment.id,
      paymentMethod: paymentMethodToUtmify(paymentMethod),
      status,
      createdAt: enrollment.createdAt,
      approvedDate: status === 'paid' ? new Date() : null,
      customer: {
        name: user.name || '',
        email: user.email,
        phone: user.phone,
        document: user.cpf,
        ip: enrollment.ipAddress,
      },
      products: [
        {
          id: enrollment.courseId,
          name: `${enrollment.courseName} — ${enrollment.institutionName}`,
          quantity: 1,
          priceInCents,
        },
      ],
      trackingParameters: {
        src: enrollment.src,
        sck: enrollment.sck,
        utm_source: enrollment.utmSource,
        utm_campaign: enrollment.utmCampaign,
        utm_medium: enrollment.utmMedium,
        utm_content: enrollment.utmContent,
        utm_term: enrollment.utmTerm,
      },
      commission: {
        totalPriceInCents: priceInCents,
      },
    })

    if (ok) {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data:
          status === 'paid'
            ? { utmifyPaidSentAt: new Date() }
            : { utmifyWaitingSentAt: new Date() },
      })
    }
  } catch (error) {
    console.error('Erro ao despachar UTMify:', error)
  }
}
