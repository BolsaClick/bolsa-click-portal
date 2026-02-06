import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

type Props = {
  params: Promise<{ id: string }>
}

// GET - Buscar transação por ID
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar status da transação
export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, externalTransactionId, elysiumStudentId, metadata, pixBrCode, pixQrCodeBase64 } = body

    // Verificar se transação existe
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Preparar dados para atualização
    const updateData: {
      status?: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED'
      externalTransactionId?: string
      elysiumStudentId?: string
      metadata?: object
      pixBrCode?: string
      pixQrCodeBase64?: string
      paidAt?: Date
      failedAt?: Date
      cancelledAt?: Date
    } = {}

    if (status) {
      updateData.status = status

      // Atualizar timestamps baseado no status
      if (status === 'PAID') {
        updateData.paidAt = new Date()
      } else if (status === 'FAILED') {
        updateData.failedAt = new Date()
      } else if (status === 'CANCELLED') {
        updateData.cancelledAt = new Date()
      }
    }

    if (externalTransactionId) updateData.externalTransactionId = externalTransactionId
    if (elysiumStudentId) updateData.elysiumStudentId = elysiumStudentId
    if (metadata) updateData.metadata = metadata
    if (pixBrCode) updateData.pixBrCode = pixBrCode
    if (pixQrCodeBase64) updateData.pixQrCodeBase64 = pixQrCodeBase64

    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
    })

    console.log(`✅ Transação ${id} atualizada para status: ${status}`)

    // Se pagamento foi confirmado, atualizar Lead para CONVERTED
    if (status === 'PAID' && existingTransaction.leadId) {
      try {
        await prisma.lead.update({
          where: { id: existingTransaction.leadId },
          data: {
            status: 'CONVERTED',
            convertedAt: new Date(),
          },
        })
        console.log(`✅ Lead ${existingTransaction.leadId} convertido`)
      } catch (leadError) {
        console.error('Erro ao atualizar lead:', leadError)
        // Não bloquear o fluxo
      }
    }

    // Se pagamento foi confirmado, criar Enrollment automaticamente
    if (status === 'PAID') {
      try {
        // Buscar usuário pelo CPF ou email
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { cpf: existingTransaction.cpf },
              { email: existingTransaction.email },
            ],
          },
        })

        if (user && existingTransaction.courseId) {
          // Verificar se já existe enrollment para este curso
          const existingEnrollment = await prisma.enrollment.findFirst({
            where: {
              userId: user.id,
              courseId: existingTransaction.courseId,
            },
          })

          if (!existingEnrollment) {
            // Criar novo enrollment
            const enrollment = await prisma.enrollment.create({
              data: {
                userId: user.id,
                courseId: existingTransaction.courseId,
                courseName: existingTransaction.courseName || 'Curso',
                institutionName: existingTransaction.institutionName || 'Instituição',
                modalidade: 'EAD', // Default
                originalPrice: existingTransaction.amountInCents / 100,
                finalPrice: existingTransaction.amountInCents / 100,
                status: 'ENROLLED',
                paymentStatus: 'PAID',
                paymentId: existingTransaction.externalTransactionId || existingTransaction.id,
                enrollmentDate: new Date(),
              },
            })
            console.log(`✅ Matrícula criada automaticamente: ${enrollment.id}`)
          } else {
            // Atualizar enrollment existente
            await prisma.enrollment.update({
              where: { id: existingEnrollment.id },
              data: {
                status: 'ENROLLED',
                paymentStatus: 'PAID',
                paymentId: existingTransaction.externalTransactionId || existingTransaction.id,
                enrollmentDate: new Date(),
              },
            })
            console.log(`✅ Matrícula atualizada: ${existingEnrollment.id}`)
          }
        }
      } catch (enrollmentError) {
        console.error('Erro ao criar/atualizar matrícula:', enrollmentError)
        // Não bloquear o fluxo
      }
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
