import { NextRequest, NextResponse } from 'next/server'
import { searchAthenaOffers, normalizeAthenaOffer } from '@/app/lib/api/athena-offers'

/**
 * GET /api/athena-offers — busca ofertas Estácio (via Athena) por curso+cidade,
 * normalizadas para a interface `Course` do portal (source: 'ATHENA').
 *
 * Server-side: mantém ATHENA_BASE_URL fora do bundle do cliente.
 * Degradação graciosa: em falha devolve lista vazia (a busca Tartarus segue normal).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const offers = await searchAthenaOffers({
      courseName: searchParams.get('courseName') ?? undefined,
      city: searchParams.get('city') ?? undefined,
      state: searchParams.get('state') ?? undefined,
      modality: searchParams.get('modality') ?? undefined,
      academicLevel: searchParams.get('academicLevel') ?? undefined,
    })

    const data = offers
      .map(normalizeAthenaOffer)
      // Sem offerId não dá pra fazer checkout — descartar.
      .filter((c) => !!c.offerId)

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Erro no /api/athena-offers:', error)
    // Não derrubar a busca: devolver vazio.
    return NextResponse.json({ data: [] })
  }
}
