import { NextResponse } from 'next/server'
import { canCreateInscription } from '@/app/lib/api/create-inscription'
import { tartarusErrorResponse } from '@/app/lib/checkout/tartarus-proxy'

export const runtime = 'nodejs'

/**
 * GET /api/checkout/matricula/can-create-inscription?cpf=&idDMH=&system=
 *
 * Proxy server-side de `cogna/courses/can-create-inscription` (achado 3.1.6).
 * Trava de CPF já inscrito — o client trata isso como fail-open (falha aqui
 * não bloqueia o candidato; ver page.tsx), então o comportamento em erro não
 * precisa de tratamento especial, mas repassamos status/corpo mesmo assim
 * por consistência com as outras rotas deste proxy.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cpf = searchParams.get('cpf') ?? ''
  const idDMH = searchParams.get('idDMH') ?? ''
  const system = searchParams.get('system') || undefined

  try {
    const data = await canCreateInscription(cpf, idDMH, system)
    return NextResponse.json(data)
  } catch (err) {
    console.error('[checkout/matricula/can-create-inscription] falhou', err)
    return tartarusErrorResponse(err)
  }
}
