import { NextRequest, NextResponse } from 'next/server'
import { capturePostHogServerEvent } from '@/app/lib/analytics/posthog-server'
import { upsertNotealyContact, NOTEALY_TAG_INSCRICAO_RECUSADA } from '@/app/lib/api/notealy'

// Espelho de falha do /api/leads/confirm-inscription.
//
// Por que existe: o sucesso da inscrição já era medido server-side (o
// `enrollment_completed_server`), mas a FALHA só era medida no browser
// (`checkout_inscription_failed`, client-side) — e o PostHog do client é gated
// por consentimento de cookie, que quase ninguém aceita no checkout. Resultado
// prático: quando a Cogna recusava a inscrição, o candidato sumia. Não dava
// pra saber quem era, com que CPF tentou, nem o motivo — só sobrava o
// re-submit no log. Foi assim que 40 pessoas viraram números sem nome.
//
// Sendo server-to-server, este endpoint não passa pelo PostHog do navegador e
// portanto NÃO depende de consent: é o piso confiável de medição de falha,
// igual o confirm-inscription é o piso do sucesso.
//
// distinct_id = CPF (só dígitos), o MESMO id do identifyUser do client e do
// enrollment_completed_server — é o que permite ver, numa única person, a
// tentativa que falhou e a que depois deu certo.
//
// Privacidade: CPF/email/telefone vão como PERSON PROPERTIES (`$set`), nunca
// como propriedade de evento. Person properties são editáveis e deletáveis por
// pessoa no PostHog (LGPD); propriedades de evento são imutáveis.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      cpf,
      courseName,
      courseId,
      brand,
      modalidade,
      city,
      source,
      flow,
      errorMessage,
      errorStatus,
      errorBody,
      cognaKnownError,
    } = body

    const cpfDigits = cpf ? String(cpf).replace(/\D/g, '') : undefined
    if (!cpfDigits || cpfDigits.length !== 11) {
      // Sem CPF não há como amarrar a falha a uma pessoa — que é o ponto
      // inteiro deste endpoint. Responde 200 pra nunca virar erro no checkout.
      return NextResponse.json({ ok: false, reason: 'cpf ausente' })
    }

    const phoneDigits = phone ? String(phone).replace(/\D/g, '') : undefined

    // CRM — lista de recuperação. Quem chega aqui é o lead mais quente que
    // existe: preencheu tudo, apertou enviar e foi recusado pelo parceiro. Sem
    // esta tag ele ficava indistinguível de quem simplesmente desistiu no meio.
    // Best-effort: falha no CRM não pode impedir a medição no PostHog abaixo.
    if (name) {
      try {
        await upsertNotealyContact({
          name,
          email,
          phone: phoneDigits,
          cpf: cpfDigits,
          tagNames: [NOTEALY_TAG_INSCRICAO_RECUSADA],
          city,
          customFields: {
            curso: courseName,
            marca: brand,
            modalidade,
            // Motivo da recusa junto do contato: é o que decide se a
            // recuperação é reinscrever noutra oferta (oferta encerrada) ou
            // corrigir um dado (CPF/data inválida).
            motivo_recusa: errorMessage,
            origem_recusa: flow ?? 'matricula',
          },
        })
      } catch (notealyError) {
        console.error('⚠️ Notealy (inscrição recusada) falhou:', notealyError)
      }
    }

    try {
      await capturePostHogServerEvent({
        event: 'enrollment_failed_server',
        distinctId: cpfDigits,
        properties: {
          flow: flow ?? 'matricula',
          course_id: courseId ?? null,
          course_name: courseName ?? null,
          brand: brand ?? null,
          modality: modalidade ?? null,
          source: source ?? null,
          city: city ?? null,
          host: request.headers.get('host') ?? null,
          error_message: errorMessage ?? null,
          error_status: errorStatus ?? null,
          // Corpo bruto da resposta da Cogna truncado — as mensagens dela são
          // genéricas ("Não foi possível criar a inscrição"); a causa real
          // (CPF duplicado, oferta encerrada, dado inválido) vem no corpo.
          error_body: typeof errorBody === 'string' ? errorBody.slice(0, 800) : null,
          cogna_known_error: !!cognaKnownError,
          source_side: 'server',
        },
        personProperties: {
          cpf: cpfDigits,
          name: name ?? undefined,
          email: email ?? undefined,
          phone: phoneDigits,
          // Estado mais recente da pessoa no funil do parceiro. Vira coorte
          // direto no PostHog ("inscrição falhou") pra recuperação/retargeting.
          last_enrollment_status: 'failed',
          last_enrollment_error: errorMessage ?? null,
          last_enrollment_course: courseName ?? null,
          last_enrollment_brand: brand ?? null,
        },
      })
    } catch (posthogError) {
      console.error('⚠️ PostHog server (enrollment_failed_server) falhou:', posthogError)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error reporting inscription failure:', error)
    // Sempre 200: telemetria nunca pode quebrar o checkout.
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
