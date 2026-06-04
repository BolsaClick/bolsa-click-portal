import { NextRequest, NextResponse } from 'next/server'
import {
  createAthenaEnrollment,
  extractCheckoutResult,
  type CreateEnrollmentInput,
  type AthenaEnrollmentResponse,
} from '@/app/lib/api/athena-offers'

/**
 * POST /api/athena-checkout — cria a inscrição Estácio na Athena (POST /api/enrollments)
 * e devolve { numeroInscricao, paymentUrl } para o portal redirecionar à página de sucesso.
 *
 * ATL016 (CPF já inscrito) é tratado como sucesso: a Athena devolve a inscrição/link existente.
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

    const result = await createAthenaEnrollment(body)
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
