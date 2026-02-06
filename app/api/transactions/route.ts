import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// POST - Criar nova transação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      cpf,
      email,
      phone,
      leadId,
      courseId,
      courseName,
      institutionName,
      amountInCents,
      externalTransactionId,
      elysiumStudentId,
      pixBrCode,
      pixQrCodeBase64,
      paymentMethod = 'pix',
      metadata,
    } = body

    if (!name || !cpf || !email || !phone || amountInCents === undefined) {
      return NextResponse.json(
        { error: 'name, cpf, email, phone and amountInCents are required' },
        { status: 400 }
      )
    }

    // Limpar CPF e telefone
    const cleanCpf = cpf.replace(/\D/g, '')
    const cleanPhone = phone.replace(/\D/g, '')

    // Se não foi passado leadId, tentar encontrar um lead existente pelo CPF e curso
    let resolvedLeadId = leadId
    if (!resolvedLeadId) {
      try {
        const existingLead = await prisma.lead.findFirst({
          where: {
            cpf: cleanCpf,
            courseId: courseId || undefined,
          },
          orderBy: { createdAt: 'desc' },
        })
        if (existingLead) {
          resolvedLeadId = existingLead.id
          console.log(`📎 Lead encontrado e vinculado: ${resolvedLeadId}`)
        }
      } catch (leadError) {
        console.error('Erro ao buscar lead:', leadError)
        // Não bloquear o fluxo
      }
    }

    // Criar transação
    const transaction = await prisma.transaction.create({
      data: {
        name,
        cpf: cleanCpf,
        email,
        phone: cleanPhone,
        leadId: resolvedLeadId,
        courseId,
        courseName,
        institutionName,
        amountInCents,
        externalTransactionId,
        elysiumStudentId,
        pixBrCode,
        pixQrCodeBase64,
        paymentMethod,
        metadata,
        status: 'PENDING',
      },
    })

    console.log('✅ Transação criada:', transaction.id)

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Listar transações (com filtros opcionais)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cpf = searchParams.get('cpf')
    const email = searchParams.get('email')
    const status = searchParams.get('status')
    const externalId = searchParams.get('externalId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: {
      cpf?: string
      email?: string
      status?: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED'
      externalTransactionId?: string
    } = {}

    if (cpf) where.cpf = cpf.replace(/\D/g, '')
    if (email) where.email = email
    if (status) where.status = status as 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED'
    if (externalId) where.externalTransactionId = externalId

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ])

    return NextResponse.json({ transactions, total, limit, offset })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
