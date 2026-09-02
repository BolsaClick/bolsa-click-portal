import { NextResponse } from 'next/server'
import { getOfferDetails } from '@/app/lib/api/get-offer-details'
import { tartarusErrorResponse } from '@/app/lib/checkout/tartarus-proxy'

export const runtime = 'nodejs'

/**
 * GET /api/checkout/matricula/offer-details?groupId=&shift=&modality=&unitId=
 *
 * Proxy server-side de `cogna/courses/details` — antes chamado direto do
 * navegador (achado 3.1.6 do SECURITY_AUDIT.md). Delega pra `getOfferDetails`
 * (mesma função, mesmo mapeamento de resposta, só que agora executando no
 * servidor); o client só troca de onde importa a função, o retorno é
 * idêntico.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const groupId = searchParams.get('groupId') ?? ''
  const shift = searchParams.get('shift') ?? ''
  const modality = searchParams.get('modality') ?? ''
  const unitId = searchParams.get('unitId') ?? ''

  try {
    const data = await getOfferDetails(groupId, shift, modality, unitId)
    return NextResponse.json(data)
  } catch (err) {
    console.error('[checkout/matricula/offer-details] falhou', err)
    return tartarusErrorResponse(err)
  }
}
