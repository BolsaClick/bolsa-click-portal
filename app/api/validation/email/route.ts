import { NextRequest, NextResponse } from 'next/server'
import { getEmailMxRejectionMessage } from '@/app/lib/validation/email-mx'

/**
 * POST /api/validation/email — checa se o domínio do e-mail tem registro MX
 * antes do checkout aceitar o cadastro (ver `email-mx.ts` para a lógica de
 * fail-open). Usado pelos checkouts que falam direto com a API do parceiro
 * (Cogna via Tartarus, client-side) e por isso não têm uma rota própria
 * nossa para gatear antes de criar a inscrição.
 *
 * Sempre responde 200 quando não há prova de que o e-mail é inválido — o
 * `ok: false` só aparece quando a consulta DNS PROVOU que o domínio não tem
 * MX. Erro de rede no fetch do client também deve tratar como válido (ver
 * `validate-email.ts`), então o contrato aqui é sempre "na dúvida, aceita".
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const email = typeof body?.email === 'string' ? body.email : ''

    if (!email) {
      return NextResponse.json({ ok: true })
    }

    const rejectionMessage = await getEmailMxRejectionMessage(email)
    if (rejectionMessage) {
      return NextResponse.json({ ok: false, error: rejectionMessage }, { status: 422 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    // Qualquer falha inesperada aqui também é fail-open: nunca travar o
    // checkout por causa desta checagem auxiliar.
    console.error('⚠️ /api/validation/email falhou — aceitando por fail-open:', error)
    return NextResponse.json({ ok: true })
  }
}
