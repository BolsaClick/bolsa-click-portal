import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { upsertNotealyContact } from '@/app/lib/api/notealy'

// Estágio 1 do CRM Notealy: cria/atualiza o contato com a tag de lead.
// Best-effort — nunca bloqueia o cadastro. O email de boas-vindas fica fora
// até o token ganhar o scope email:send (basta voltar a chamar sendNotealyEmail
// aqui com NOTEALY_TEMPLATE_WELCOME quando estiver pronto).
async function syncLeadToNotealy(params: {
  name: string
  email: string
  phone: string
  cpf: string
}) {
  try {
    await upsertNotealyContact({
      name: params.name,
      email: params.email,
      phone: params.phone,
      cpf: params.cpf,
      tagId: process.env.NOTEALY_TAG_LEAD,
    })
  } catch (error) {
    console.error('⚠️ Notealy (estágio 1) falhou:', error)
  }
}

// POST - Criar novo lead (não requer autenticação)
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

    if (!name || !cpf || !email || !phone) {
      return NextResponse.json(
        { error: 'name, cpf, email and phone are required' },
        { status: 400 }
      )
    }

    // Limpar CPF e telefone
    const cleanCpf = cpf.replace(/\D/g, '')
    const cleanPhone = phone.replace(/\D/g, '')

    // Verificar se já existe um lead com este CPF e curso
    const existingLead = await prisma.lead.findFirst({
      where: {
        cpf: cleanCpf,
        courseId: courseId || undefined,
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
          courseNames: courseNames || [],
          courseName,
          institutionName,
          modalidade,
          updatedAt: new Date(),
        },
      })

      await syncLeadToNotealy({
        name,
        email,
        phone: cleanPhone,
        cpf: cleanCpf,
      })

      return NextResponse.json({
        lead: updatedLead,
        message: 'Lead updated',
      })
    }

    // Criar novo lead
    const lead = await prisma.lead.create({
      data: {
        name,
        cpf: cleanCpf,
        email,
        phone: cleanPhone,
        courseNames: courseNames || [],
        courseId,
        courseName,
        institutionName,
        modalidade,
        status: 'NEW',
      },
    })

    await syncLeadToNotealy({
      name,
      email,
      phone: cleanPhone,
      cpf: cleanCpf,
    })

    return NextResponse.json({ lead }, { status: 201 })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
