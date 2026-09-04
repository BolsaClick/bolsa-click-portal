import { NextRequest, NextResponse } from 'next/server'
import {
  createAthenaEnrollment,
  extractCheckoutResult,
  isEnrollmentAccepted,
  type CreateEnrollmentInput,
  type AthenaEnrollmentResponse,
} from '@/app/lib/api/athena-offers'
import { getEmailMxRejectionMessage } from '@/app/lib/validation/email-mx'
import { mensagemDaRecusa } from '@/app/lib/checkout/athena-enrollment'

/**
 * POST /api/athena-checkout — cria a inscrição Estácio na Athena (POST /api/enrollments)
 * e devolve { numeroInscricao, paymentUrl } para o portal redirecionar à página de sucesso.
 *
 * ATL016 (CPF já inscrito) é tratado como sucesso: a Athena devolve a inscrição/link existente.
 *
 * LEGADO desde 2026-09-04: o checkout Estácio do portal NÃO passa mais por
 * aqui. Ele cobra a taxa de matrícula do Bolsa Click antes
 * (/api/athena-checkout/charge) e cria a inscrição só depois do pagamento
 * confirmar (/api/athena-checkout/confirm → confirm-estacio.ts). Esta rota
 * segue de pé para inscrição SEM cobrança (uso interno/suporte); a lógica de
 * recusa é a mesma, compartilhada em app/lib/checkout/athena-enrollment.ts.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateEnrollmentInput

    // Validação mínima dos obrigatórios.
    const { offerId, student, address, options } = body || {}
    if (!offerId || !student?.name || !student?.cpf || !student?.email || !student?.mobile) {
      return NextResponse.json(
        { error: 'offerId e student (name, cpf, email, mobile) são obrigatórios' },
        { status: 400 },
      )
    }
    if (!address?.zipCode || !address?.state || !address?.city) {
      return NextResponse.json(
        { error: 'address (zipCode, state, city) é obrigatório' },
        { status: 400 },
      )
    }
    if (!options?.acceptTerms) {
      return NextResponse.json(
        { error: 'É necessário aceitar os termos (options.acceptTerms)' },
        { status: 400 },
      )
    }

    // Domínio sem MX não recebe e-mail nenhum — erro comprovado, não
    // suspeita. Fail-open embutido em getEmailMxRejectionMessage: só rejeita
    // quando a consulta DNS PROVA que o domínio não tem MX; timeout/erro de
    // rede deixa passar (ver app/lib/validation/email-mx.ts).
    const mxRejection = await getEmailMxRejectionMessage(student.email)
    if (mxRejection) {
      return NextResponse.json({ error: mxRejection }, { status: 422 })
    }

    const result = await createAthenaEnrollment(body)

    // O athena-api responde 200 mesmo quando a YDUQS recusa: ele captura o
    // erro, grava a inscrição como FAILED e devolve o registro. Sem checar
    // isto, o candidato ia para a tela de sucesso sem link de pagamento,
    // virava "inscrito" no CRM e contava como conversão.
    if (!isEnrollmentAccepted(result)) {
      console.error('❌ Athena recusou a inscrição', {
        status: result.status,
        errorCode: result.errorCode,
        providerMessage: result.providerMessage,
        offerId: body.offerId,
      })
      return NextResponse.json(
        {
          error: mensagemDaRecusa(result.errorCode),
          // Códigos ajudam o suporte a agrupar; a mensagem crua do parceiro
          // fica só no log, porque fala em codCursoPai e afins.
          errorCode: result.errorCode,
        },
        { status: 422 },
      )
    }

    return NextResponse.json(result)
  } catch (error: unknown) {
    // ATL016 = CPF já inscrito → tratar como sucesso, devolvendo a inscrição existente.
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: { data?: AthenaEnrollmentResponse & { code?: string; message?: string }; status?: number }
      }
      const data = axiosError.response?.data
      const code = (data?.providerResponse?.code || data?.code || '').toUpperCase()

      if (code === 'ATL016' && data) {
        return NextResponse.json(extractCheckoutResult(data))
      }

      console.error('❌ Erro ao criar inscrição na Athena:', data ?? error)
      const message =
        data?.providerResponse?.message ||
        data?.message ||
        'Erro ao criar inscrição'
      return NextResponse.json(
        { error: message },
        { status: axiosError.response?.status || 500 },
      )
    }

    console.error('❌ Erro ao criar inscrição na Athena:', error)
    return NextResponse.json({ error: 'Erro interno ao criar inscrição' }, { status: 500 })
  }
}
