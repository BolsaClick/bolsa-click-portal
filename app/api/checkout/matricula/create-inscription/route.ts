import { NextResponse } from 'next/server'
import {
  createInscription,
  type CreateInscriptionRequest,
} from '@/app/lib/api/create-inscription'
import { tartarusErrorResponse } from '@/app/lib/checkout/tartarus-proxy'

export const runtime = 'nodejs'

interface Body {
  inscriptionData: CreateInscriptionRequest
  promoterId: string
  system?: string
}

/**
 * POST /api/checkout/matricula/create-inscription
 *
 * Proxy server-side de `cogna/courses/create-inscription` (achado 3.1.6 do
 * SECURITY_AUDIT.md — CRITICAL: era a chamada que criava a inscrição do
 * candidato na Cogna direto do navegador, sem autenticação nenhuma). Delega
 * pra `createInscription`, já existente — o payload (`buildInscriptionPayload`)
 * continua montado no client, só a chamada de rede muda de lugar. Em erro,
 * repassa status e corpo EXATOS do Tartarus (`tartarusErrorResponse`), pra
 * `getCognaErrorMessage`/`getCognaErrorDetails` no client continuarem
 * extraindo a mesma mensagem de sempre.
 */
export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ message: 'invalid_json' }, { status: 400 })
  }

  if (!body?.inscriptionData || !body?.promoterId) {
    return NextResponse.json({ message: 'missing_fields' }, { status: 422 })
  }

  try {
    const data = await createInscription(body.inscriptionData, body.promoterId, body.system ?? 'DC')
    return NextResponse.json(data)
  } catch (err) {
    console.error('[checkout/matricula/create-inscription] falhou', err)
    return tartarusErrorResponse(err)
  }
}
