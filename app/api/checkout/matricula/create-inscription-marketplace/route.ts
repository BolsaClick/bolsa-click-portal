import { NextResponse } from 'next/server'
import {
  createMarketplaceInscription,
  type MarketplaceInscriptionData,
} from '@/app/lib/api/create-inscription-marketplace'
import type { OfferDetails } from '@/app/lib/api/get-offer-details'

export const runtime = 'nodejs'

interface Body {
  formData: MarketplaceInscriptionData
  offerDetails: OfferDetails
}

/**
 * POST /api/checkout/matricula/create-inscription-marketplace
 *
 * Proxy server-side de `cogna/courses/create-inscription-marketplace`
 * (achado 3.1.6). `createMarketplaceInscription` já NUNCA lança — sempre
 * resolve `{success, data?, error?}` (captura o próprio erro internamente) —
 * então aqui só repassamos o retorno como está, sem reinterpretar. Um erro
 * inesperado antes de chegar lá (JSON inválido) ainda responde no mesmo
 * formato pra quem chama não precisar tratar dois formatos de erro.
 */
export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ success: false, error: 'invalid_json' }, { status: 400 })
  }

  if (!body?.formData || !body?.offerDetails) {
    return NextResponse.json({ success: false, error: 'missing_fields' }, { status: 422 })
  }

  try {
    const result = await createMarketplaceInscription(body.formData, body.offerDetails)
    return NextResponse.json(result)
  } catch (err) {
    // Defensivo: createMarketplaceInscription não deveria lançar (ela mesma
    // captura tudo), mas se algo inesperado escapar não queremos um 500 sem
    // corpo JSON — o client sempre espera {success, error}.
    console.error('[checkout/matricula/create-inscription-marketplace] falhou', err)
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ success: false, error: message })
  }
}
