import {
  createAthenaEnrollment,
  extractCheckoutResult,
  isEnrollmentAccepted,
  type AthenaCheckoutResult,
  type AthenaEnrollmentResponse,
  type CreateEnrollmentInput,
} from '@/app/lib/api/athena-offers'

/**
 * Criação da inscrição na Athena (Estácio/YDUQS) em um único lugar, com o
 * tratamento de recusa que o checkout precisa.
 *
 * Extraído de `app/api/athena-checkout/route.ts` (comportamento idêntico) para
 * poder ser chamado também DEPOIS do pagamento da taxa, em
 * `app/lib/checkout/confirm-estacio.ts` — a inscrição saiu do request do
 * cliente e passou a acontecer na confirmação do pagamento.
 */

/**
 * Traduz a recusa do parceiro para uma frase que o candidato entenda.
 *
 * A mensagem crua da YDUQS fala em `codCursoPai` e `codCampusPai` — não serve
 * para a tela. E a recusa mais comum (MS004, 9 de 16 casos nos últimos 30 dias)
 * é a oferta não existir mais lá, o que tem uma ação clara: escolher outra.
 */
export function mensagemDaRecusa(errorCode: string | null): string {
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

export type AthenaEnrollmentAttempt =
  | { accepted: true; result: AthenaCheckoutResult }
  | {
      accepted: false
      /** Mensagem pronta para a tela do candidato. */
      message: string
      errorCode: string | null
      /** Texto técnico do parceiro — só para log/CRM, nunca para a tela. */
      providerMessage: string | null
    }

/**
 * Tenta criar a inscrição e devolve um resultado fechado (nunca estoura).
 *
 * Dois caminhos de recusa, os dois já observados em produção:
 *  1. HTTP 200 com `status: FAILED` — o athena-api captura o erro da YDUQS,
 *     grava FAILED e devolve o registro (por isso `isEnrollmentAccepted`).
 *  2. Exceção HTTP — aqui `ATL016` (CPF já inscrito) conta como SUCESSO: a
 *     Athena devolve a inscrição existente e é a mesma pessoa voltando.
 */
export async function runAthenaEnrollment(
  input: CreateEnrollmentInput,
): Promise<AthenaEnrollmentAttempt> {
  try {
    const result = await createAthenaEnrollment(input)

    if (!isEnrollmentAccepted(result)) {
      console.error('❌ Athena recusou a inscrição', {
        status: result.status,
        errorCode: result.errorCode,
        providerMessage: result.providerMessage,
        offerId: input.offerId,
      })
      return {
        accepted: false,
        message: mensagemDaRecusa(result.errorCode),
        errorCode: result.errorCode,
        providerMessage: result.providerMessage,
      }
    }

    return { accepted: true, result }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {
          data?: AthenaEnrollmentResponse & { code?: string; message?: string }
          status?: number
        }
      }
      const data = axiosError.response?.data
      const code = (data?.providerResponse?.code || data?.code || '').toUpperCase()

      // ATL016 = CPF já inscrito → sucesso, com a inscrição existente.
      if (code === 'ATL016' && data) {
        return { accepted: true, result: extractCheckoutResult(data) }
      }

      console.error('❌ Erro ao criar inscrição na Athena:', data ?? error)
      const providerMessage =
        data?.providerResponse?.message || data?.message || null
      return {
        accepted: false,
        message: mensagemDaRecusa(code || null),
        errorCode: code || null,
        providerMessage,
      }
    }

    console.error('❌ Erro ao criar inscrição na Athena:', error)
    return {
      accepted: false,
      message: mensagemDaRecusa(null),
      errorCode: null,
      providerMessage: error instanceof Error ? error.message : String(error),
    }
  }
}
