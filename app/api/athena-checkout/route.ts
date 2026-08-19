import { NextRequest, NextResponse } from 'next/server'
import {
  createAthenaEnrollment,
  extractCheckoutResult,
  isEnrollmentAccepted,
  type CreateEnrollmentInput,
  type AthenaEnrollmentResponse,
} from '@/app/lib/api/athena-offers'

/**
 * POST /api/athena-checkout — cria a inscrição Estácio na Athena (POST /api/enrollments)
 * e devolve { numeroInscricao, paymentUrl } para o portal redirecionar à página de sucesso.
 *
 * ATL016 (CPF já inscrito) é tratado como sucesso: a Athena devolve a inscrição/link existente.
 *
 */
/**
 * Traduz a recusa do parceiro para uma frase que o candidato entenda.
 *
 * A mensagem crua da YDUQS fala em `codCursoPai` e `codCampusPai` — não serve
 * para a tela. E a recusa mais comum (MS004, 9 de 16 casos nos últimos 30 dias)
 * é a oferta não existir mais lá, o que tem uma ação clara: escolher outra.
 */
function mensagemDaRecusa(errorCode: string | null): string {
  if (errorCode === 'ATL016') {
    return 'Este CPF já possui uma inscrição nesta instituição. Fale com a gente para retomar de onde parou.'
  }
  if (errorCode === 'MS004') {
    return 'Esta oferta não está mais disponível na instituição. Escolha outra opção de curso ou unidade.'
  }
  if (errorCode === 'MS002') {
    return 'A instituição não aceitou alguns dos dados informados. Confira os campos e tente novamente.'
  }
  return 'Não foi possível concluir a inscrição nesta oferta. Tente outra opção ou fale com a gente.'
}

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
