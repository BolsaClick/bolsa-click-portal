import { NextRequest, NextResponse } from 'next/server'
import { capturePostHogServerEvent } from '@/app/lib/analytics/posthog-server'
import { upsertCandidato } from '@/app/lib/api/attio'
import { prewarmPaymentLink } from '@/app/lib/api/cogna-payment-link'

// Chamado quando a inscrição é confirmada.
//
// Faz duas coisas: move o candidato para o estágio "inscrito" no CRM (Attio)
// e mede a conversão server-side.
//
// É o ponto de medição SERVER-SIDE de `enrollment_completed_server`
// (PostHog): a matrícula (create-inscription 201) acontece de verdade, mas o
// `enrollment_completed` do client só dispara se o PostHog já foi
// inicializado — e ele é gated por consentimento de cookie (só inicializa
// após "Aceitar"). No checkout quase ninguém aceita o banner, então a
// maioria das inscrições ficava invisível no funil. Este endpoint já é
// chamado no sucesso da inscrição independente de consentimento (é uma
// chamada server-to-server, não passa pelo PostHog client), então serve
// como fonte confiável de conversão agregada.
//
// Nome do evento é DISTINTO do client (`enrollment_completed_server` vs
// `enrollment_completed`) — evita duplicar contagem numa mesma métrica: quem
// consome o funil soma os dois eventos (ou usa o server como piso mínimo
// confiável), em vez de arriscar dupla contagem de uma mesma inscrição sob o
// mesmo nome de evento vindo de dois lados.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name, email, phone, cpf, courseName, courseId, brand, modalidade, city, source,
      inscriptionId,
      // Dados da inscrição no parceiro. Até 2026-08-19 o `inscriptionId` chegava
      // aqui e era usado só para deduplicar o evento do PostHog — o CRM ficava
      // sem ele, e quem não pagasse não tinha como entrar numa régua de
      // recuperação, porque não havia chave para consultar a cobrança.
      businessKey, paymentUrl, shift, monthlyPrice, enrollmentFee,
    } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    // Começa a gerar o link de pagamento AGORA, sem bloquear a resposta.
    // O endpoint da Cogna leva de 0,9s a 37s; disparando aqui, a descida corre
    // enquanto o candidato ainda está indo para a tela de sucesso, e lá ele
    // encontra o resultado pronto no cache em vez de esperar do zero.
    if (inscriptionId && /^\d+$/.test(String(inscriptionId))) {
      prewarmPaymentLink(inscriptionId, cpf)
    }

    // CRM: estágio "inscrito". A precedência no upsertCandidato faz este
    // estágio SUBSTITUIR um "inscricao_recusada" anterior — é o que tira da
    // lista de recuperação quem tentou de novo e conseguiu.
    if (phone) {
      try {
        await upsertCandidato({
          phone: String(phone),
          name,
          email,
          cpf,
          brand,
          courseName,
          modality: modalidade,
          city,
          estagio: 'inscrito',
          inscriptionId,
          businessKey,
          paymentUrl,
          shift,
          monthlyPrice,
          enrollmentFee,
          // A inscrição acabou de ser criada, então "agora" é a data correta —
          // e é ela que define a janela de cobrança: 91% paga no mesmo dia e
          // 100% até o sétimo.
          inscribedAt: new Date(),
        })
      } catch (attioError) {
        console.error('⚠️ Attio (inscrito) falhou:', attioError)
      }
    }

    // PostHog server-side — best-effort, nunca bloqueia/derruba o fluxo de
    // matrícula. distinct_id = CPF (mesmo id usado no identifyUser do
    // client, pra permitir join do funil quando o consent existir).
    // Nunca enviar CPF/email/telefone como PROPRIEDADE do evento — só
    // metadados/flags. $insert_id = inscriptionId dedupa retries.
    try {
      const cpfDigits = cpf ? String(cpf).replace(/\D/g, '') : undefined
      if (cpfDigits) {
        await capturePostHogServerEvent({
          event: 'enrollment_completed_server',
          distinctId: cpfDigits,
          eventId: inscriptionId ? String(inscriptionId) : undefined,
          properties: {
            course_id: courseId ?? null,
            course_name: courseName ?? null,
            brand: brand ?? null,
            modality: modalidade ?? null,
            source: source ?? null,
            // Cidade migrou pro evento: era enviada só ao CRM, e com a saída
            // dele o dado se perderia.
            city: city ?? null,
            host: request.headers.get('host') ?? null,
            inscription_id: inscriptionId ?? null,
            source_side: 'server',
          },
          // Dados de contato na PERSON (nunca no evento). Sem isto a person
          // criada aqui tinha só o CPF como distinct_id — dava pra contar as
          // inscrições, não pra saber quem eram nem reconciliar com o parceiro.
          personProperties: {
            cpf: cpfDigits,
            name: name ?? undefined,
            email: email ?? undefined,
            phone: phone ? String(phone).replace(/\D/g, '') : undefined,
            last_enrollment_status: 'succeeded',
            last_enrollment_course: courseName ?? null,
            last_enrollment_brand: brand ?? null,
            last_inscription_id: inscriptionId ?? null,
          },
        })
      }
    } catch (posthogError) {
      console.error('⚠️ PostHog server (enrollment_completed_server) falhou:', posthogError)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error confirming inscription:', error)
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
