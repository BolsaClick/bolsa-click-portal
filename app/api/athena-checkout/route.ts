import { NextRequest, NextResponse } from 'next/server'
import type { CreateEnrollmentInput } from '@/app/lib/api/athena-offers'
import { getEmailMxRejectionMessage } from '@/app/lib/validation/email-mx'
import { runAthenaEnrollment } from '@/app/lib/checkout/athena-enrollment'

/**
 * POST /api/athena-checkout — cria a inscrição Estácio na Athena (POST /api/enrollments)
 * e devolve { numeroInscricao, paymentUrl } para o portal redirecionar à página de sucesso.
 *
 * ATL016 (CPF já inscrito) é tratado como sucesso: a Athena devolve a inscrição/link existente.
 *
 * LEGADO desde 2026-09-04: o checkout Estácio do portal NÃO passa mais por
 * aqui. Ele cobra a taxa da plataforma antes
 * (/api/athena-checkout/charge) e cria a inscrição só depois do pagamento
 * confirmar (/api/athena-checkout/confirm → confirm-estacio.ts). Esta rota
 * segue de pé para inscrição SEM cobrança — e, com PAYMENTS_DISABLED ligado
 * (2026-10-01), voltou a ser a rota ATIVA do checkout Estácio. A lógica de
 * recusa é a de app/lib/checkout/athena-enrollment.ts (até 2026-10-10 era uma
 * cópia dela aqui, que não gravava desfecho).
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

    // `runAthenaEnrollment` é o mesmo caminho do confirm-estacio: trata a
    // recusa com 200 + FAILED, o ATL016 como sucesso — e GRAVA O DESFECHO no
    // nosso banco (`PartnerInscriptionOutcome`). Com pagamentos desligados
    // esta é a rota ativa da Estácio e não existe Transaction: sem a gravação,
    // uma recusa MS002 aqui só ia para o log e ninguém ficava sabendo.
    const attempt = await runAthenaEnrollment(body, {
      flow: 'checkout-direto',
      // Só para o alerta ler "Administração", não um uuid. Vem na query e
      // NÃO no body, porque o body vai inteiro para a Athena.
      courseName: request.nextUrl.searchParams.get('curso')?.slice(0, 200) || null,
    })

    if (!attempt.accepted) {
      return NextResponse.json(
        {
          error: attempt.message,
          // Códigos ajudam o suporte a agrupar; a mensagem crua do parceiro
          // fica só no log, porque fala em codCursoPai e afins.
          errorCode: attempt.errorCode,
        },
        { status: attempt.kind === 'refused' ? 422 : 502 },
      )
    }

    return NextResponse.json(attempt.result)
  } catch (error: unknown) {
    console.error('❌ Erro ao criar inscrição na Athena:', error)
    return NextResponse.json({ error: 'Erro interno ao criar inscrição' }, { status: 500 })
  }
}
