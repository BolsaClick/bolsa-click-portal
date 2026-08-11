import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { sendFacebookEvent } from '@/app/lib/analytics/fb-capi'

// A sincronização com o CRM saiu daqui em 2026-08-11 (troca de fornecedor). O
// lead continua persistido na tabela Lead e enviado ao Meta CAPI abaixo — este
// é o ponto onde o CRM novo entra.

// Meta Conversions API — Lead server-side (não depende do pixel do browser).
// Best-effort: nunca bloqueia o cadastro.
async function sendLeadToMeta(params: {
  leadId: string
  name: string
  email: string
  phone: string
  cpf: string
  courseName?: string
  request: NextRequest
}) {
  try {
    const [firstName, ...rest] = params.name.trim().split(/\s+/)
    const clientIp =
      params.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      params.request.headers.get('x-real-ip') ??
      undefined
    await sendFacebookEvent({
      eventName: 'Lead',
      eventId: `lead_${params.leadId}`,
      userData: {
        email: params.email,
        phone: params.phone,
        externalId: params.cpf,
        firstName: firstName || undefined,
        lastName: rest.length ? rest.join(' ') : undefined,
        clientIp,
        userAgent: params.request.headers.get('user-agent') ?? undefined,
      },
      customData: {
        ...(params.courseName ? { content_name: params.courseName } : {}),
        content_type: 'product',
      },
      actionSource: 'website',
      eventSourceUrl: params.request.headers.get('referer') ?? undefined,
    })
  } catch (error) {
    console.error('⚠️ Meta CAPI Lead falhou:', error)
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

      await sendLeadToMeta({
        leadId: updatedLead.id,
        name,
        email,
        phone: cleanPhone,
        cpf: cleanCpf,
        courseName,
        request,
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

    await sendLeadToMeta({
      leadId: lead.id,
      name,
      email,
      phone: cleanPhone,
      cpf: cleanCpf,
      courseName,
      request,
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
