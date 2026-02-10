import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getCheckoutStatus } from '@/app/lib/api/checkout-status'

type Props = {
  params: Promise<{ transactionId: string }>
}

// GET - Consultar status do checkout e retornar QR code PIX se pendente
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { transactionId } = await params

    // 1. Buscar transação local pelo externalTransactionId (ID do Elysium)
    const transaction = await prisma.transaction.findFirst({
      where: { externalTransactionId: transactionId },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // 2. Consultar status ao vivo no Elysium
    let resolvedStatus: string = transaction.status
    try {
      const statusResponse = await getCheckoutStatus(transactionId)
      const normalizedStatus = statusResponse.status?.toLowerCase()
      const isPaid = normalizedStatus === 'paid' || (statusResponse as { paid?: boolean }).paid === true

      if (isPaid) {
        resolvedStatus = 'PAID'
      } else if (normalizedStatus === 'failed') {
        resolvedStatus = 'FAILED'
      } else if (normalizedStatus === 'cancelled') {
        resolvedStatus = 'CANCELLED'
      } else {
        resolvedStatus = 'PENDING'
      }
    } catch (elysiumError) {
      console.error('Erro ao consultar status no Elysium:', elysiumError)
      // Usar status local se Elysium estiver indisponível
    }

    // 3. Sincronizar status local se mudou
    if (resolvedStatus !== transaction.status) {
      const updateData: Record<string, unknown> = { status: resolvedStatus }
      if (resolvedStatus === 'PAID') updateData.paidAt = new Date()
      if (resolvedStatus === 'FAILED') updateData.failedAt = new Date()
      if (resolvedStatus === 'CANCELLED') updateData.cancelledAt = new Date()

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: updateData,
      })
    }

    // 4. Retornar resposta combinada
    return NextResponse.json({
      status: resolvedStatus,
      localTransactionId: transaction.id,
      externalTransactionId: transactionId,
      paymentMethod: transaction.paymentMethod,
      pixBrCode: transaction.pixBrCode,
      pixQrCodeBase64: transaction.pixQrCodeBase64,
      amountInCents: transaction.amountInCents,
      courseName: transaction.courseName,
      institutionName: transaction.institutionName,
      metadata: transaction.metadata,
      createdAt: transaction.createdAt,
    })
  } catch (error) {
    console.error('Erro ao verificar status do checkout:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
