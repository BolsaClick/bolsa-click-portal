import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { sendFacebookEvent } from '@/app/lib/analytics/fb-capi'
import { upsertCandidato, type OrigemFluxo } from '@/app/lib/api/attio'
import { utmFromRequest, utmFromBody, mergeUtm, type UtmParams } from '@/app/lib/analytics/utm'
import { isCampanhaAnhangueraHost } from '@/app/lib/campanha/host'

const FLUXOS_CONHECIDOS = new Set<OrigemFluxo>([
  'checkout-matricula',
  'checkout-estacio',
  'ingressa',
  'simulador',
  'teste-vocacional',
])

function toOrigemFluxo(source: unknown): OrigemFluxo | undefined {
  return typeof source === 'string' && FLUXOS_CONHECIDOS.has(source as OrigemFluxo)
    ? (source as OrigemFluxo)
    : undefined
}

/**
 * Normaliza a data de nascimento vinda dos formulários para um Date em UTC.
 *
 * Dois formatos chegam aqui e não dá pra assumir um só: o checkout de matrícula
 * usa máscara própria e manda `DD-MM-YYYY`; o do Estácio usa `<input
 * type="date">` e manda `YYYY-MM-DD`. Como ambos têm o mesmo formato de
 * separador, distinguir pelo tamanho do primeiro grupo é o que evita gravar
 * 11 de agosto como 8 de novembro.
 *
 * Sempre Date.UTC: `new Date(y, m, d)` cria meia-noite LOCAL, que no fuso do
 * Brasil vira 03:00Z e, em qualquer conversão que trunque pra data local,
 * pode voltar um dia.
 */
function parseBirthDate(value: unknown): Date | null {
  if (typeof value !== 'string') return null
  const parts = value.trim().split('-')
  if (parts.length !== 3) return null

  const [a, b, c] = parts
  // YYYY-MM-DD quando o primeiro grupo tem 4 dígitos; senão DD-MM-YYYY.
  const [year, month, day] =
    a.length === 4 ? [Number(a), Number(b), Number(c)] : [Number(c), Number(b), Number(a)]

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null
  if (year < 1900 || year > new Date().getUTCFullYear()) return null
  if (month < 1 || month > 12 || day < 1 || day > 31) return null

  const date = new Date(Date.UTC(year, month - 1, day))
  // Rejeita data inexistente (31/02 etc.), que o Date "conserta" em silêncio.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }
  return date
}

/**
 * Junta o `extraData` novo ao que já existe, sem perder o que outra superfície
 * gravou antes (ex.: as UTMs do ingressa quando a mesma pessoa depois passa
 * pelo checkout).
 */
function mergeExtraData(
  existing: unknown,
  incoming: unknown,
): Record<string, unknown> | undefined {
  const base = existing && typeof existing === 'object' ? (existing as Record<string, unknown>) : {}
  const next = incoming && typeof incoming === 'object' ? (incoming as Record<string, unknown>) : {}
  if (Object.keys(next).length === 0) return undefined
  return JSON.parse(JSON.stringify({ ...base, ...next }))
}

/**
 * CRM (Attio). Best-effort por construção: o lead já está persistido na tabela
 * Lead antes desta chamada, então uma falha aqui atrasa a sincronização mas
 * nunca perde o contato.
 */
async function syncCandidato(params: {
  leadId: string
  name: string
  email: string
  phone: string
  cpf: string
  birthDate?: Date | null
  courseName?: string
  institutionName?: string
  modalidade?: string
  source?: unknown
  utm?: UtmParams
  /** Override de origem — ver `isCampanhaAnhangueraHost` no caller. */
  origemSite?: string
}) {
  try {
    await upsertCandidato({
      phone: params.phone,
      name: params.name,
      email: params.email,
      cpf: params.cpf,
      birthDate: params.birthDate,
      brand: params.institutionName,
      courseName: params.courseName,
      modality: params.modalidade,
      estagio: 'lead',
      origemFluxo: toOrigemFluxo(params.source),
      origemSite: params.origemSite,
      leadId: params.leadId,
      utm: params.utm,
    })
  } catch (error) {
    console.error('⚠️ Attio (lead) falhou:', error)
  }
}

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
      birthDate,
      extraData,
      source,
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
    const parsedBirthDate = parseBirthDate(birthDate)
    // Explícito do client (localStorage da UTMify, sobrevive à navegação) tem
    // prioridade; o referer preenche o que faltar.
    const utm = mergeUtm(utmFromBody(body.utm), utmFromRequest(request))
    // Chamada direta do browser (não é webhook/proxy) — o header `host`
    // reflete o domínio real de quem está preenchendo o formulário. Só o host
    // de campanha (teste A/B de pagamento próprio, mesmo deploy do
    // anhanguera-cursos) recebe origem distinta.
    const origemSite = isCampanhaAnhangueraHost(request.headers.get('host'))
      ? 'landing_anhanguera'
      : undefined

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
          // Só sobrescreve quando veio dado novo — um fluxo que não pede
          // nascimento (teste vocacional, simulador) não pode apagar o que o
          // checkout já gravou.
          ...(parsedBirthDate ? { birthDate: parsedBirthDate } : {}),
          ...(mergeExtraData(existingLead.extraData, extraData)
            ? { extraData: mergeExtraData(existingLead.extraData, extraData) }
            : {}),
          ...(source ? { source } : {}),
          updatedAt: new Date(),
        },
      })

      await syncCandidato({
        leadId: updatedLead.id,
        name,
        email,
        phone: cleanPhone,
        cpf: cleanCpf,
        birthDate: updatedLead.birthDate,
        courseName,
        institutionName,
        modalidade,
        source: source ?? existingLead.source,
        utm,
        origemSite,
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
        ...(parsedBirthDate ? { birthDate: parsedBirthDate } : {}),
        ...(mergeExtraData(null, extraData) ? { extraData: mergeExtraData(null, extraData) } : {}),
        ...(source ? { source } : {}),
        status: 'NEW',
      },
    })

    await syncCandidato({
      leadId: lead.id,
      name,
      email,
      phone: cleanPhone,
      cpf: cleanCpf,
      birthDate: lead.birthDate,
      courseName,
      institutionName,
      modalidade,
      source,
      utm,
      origemSite,
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
