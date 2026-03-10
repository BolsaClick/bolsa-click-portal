import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { elysium } from '@/app/lib/api/axios'

interface ElysiumStudentResponse {
  id?: string
  message?: string
  success?: boolean
}

// POST - Criar novo estudante (salva localmente e envia para Elysium)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      cpf,
      email,
      phone,
      courseNames,
      courseId,
      courseName,
      institutionName,
      modalidade,
    } = body

    if (!name || !cpf || !email) {
      return NextResponse.json(
        { error: 'name, cpf and email are required' },
        { status: 400 }
      )
    }

    // Limpar CPF e telefone
    const cleanCpf = cpf.replace(/\D/g, '')
    const cleanPhone = phone ? phone.replace(/\D/g, '') : ''

    // 1. Cadastrar no Elysium (API externa)
    let elysiumId: string | null = null
    try {
      const elysiumPayload = {
        name,
        cpf: cleanCpf,
        email,
        phone: cleanPhone,
        courseNames: courseNames || [courseName].filter(Boolean),
      }
      console.log('📤 Enviando estudante para Elysium:', { ...elysiumPayload, cpf: '***' })
      const elysiumResponse = await elysium.post<ElysiumStudentResponse>('/students', elysiumPayload)
      elysiumId = elysiumResponse.data?.id || null
      console.log('✅ Estudante cadastrado no Elysium:', elysiumId)
    } catch (elysiumError) {
      const axiosErr = elysiumError as { response?: { status?: number; data?: unknown } }
      console.error('⚠️ Erro ao cadastrar no Elysium (continuando):', {
        status: axiosErr.response?.status,
        data: axiosErr.response?.data,
      })
      // Continua mesmo se Elysium falhar - não bloqueia o fluxo
    }

    // 2. Verificar se já existe um lead/estudante com este CPF
    const existingLead = await prisma.lead.findFirst({
      where: {
        cpf: cleanCpf,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (existingLead) {
      // Atualizar lead existente
      const updatedLead = await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          name,
          email,
          phone: cleanPhone,
          courseNames: courseNames || existingLead.courseNames,
          courseId: courseId || existingLead.courseId,
          courseName: courseName || existingLead.courseName,
          institutionName: institutionName || existingLead.institutionName,
          modalidade: modalidade || existingLead.modalidade,
          updatedAt: new Date(),
        },
      })

      return NextResponse.json({
        student: updatedLead,
        elysiumId,
        message: 'Student updated',
      })
    }

    // 3. Criar novo registro
    const student = await prisma.lead.create({
      data: {
        name,
        cpf: cleanCpf,
        email,
        phone: cleanPhone,
        courseNames: courseNames || [courseName].filter(Boolean),
        courseId,
        courseName,
        institutionName,
        modalidade,
        status: 'NEW',
      },
    })

    return NextResponse.json(
      {
        student,
        elysiumId,
        message: 'Student created'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
