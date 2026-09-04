import { NextResponse } from 'next/server'
import { validateVoucher } from '@/app/lib/api/validate-voucher'
import { tartarusErrorResponse } from '@/app/lib/checkout/tartarus-proxy'

export const runtime = 'nodejs'

interface Body {
  voucher: string
  cpf: string
  paymentPlanId: string
}

/**
 * POST /api/checkout/matricula/validate-voucher
 *
 * Proxy server-side de `cogna/courses/validate-voucher` (achado 3.1.6).
 * `validateVoucher` já modela 200/204/400 como retorno normal (não exceção —
 * ver comentário em `app/lib/api/validate-voucher.ts`), então aqui só
 * repassamos o que ela devolve, com 200 nesta rota (o status "de negócio"
 * vai dentro do corpo, em `.status`). Só 500/falha de rede vira erro HTTP
 * de verdade — `tartarusErrorResponse` repassa igual às outras rotas.
 */
export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ message: 'invalid_json' }, { status: 400 })
  }

  if (!body?.voucher || !body?.cpf || !body?.paymentPlanId) {
    return NextResponse.json({ message: 'missing_fields' }, { status: 422 })
  }

  try {
    const result = await validateVoucher(body.voucher, body.cpf, body.paymentPlanId)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[checkout/matricula/validate-voucher] falhou', err)
    return tartarusErrorResponse(err)
  }
}
