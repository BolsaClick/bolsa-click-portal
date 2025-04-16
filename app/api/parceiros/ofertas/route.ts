/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const brand = searchParams.get('brand')
  const courseId = searchParams.get('courseId') 
  const courseName = searchParams.get('courseName')
  const unitId = searchParams.get('unitId')
  const city = searchParams.get('city')
  const state = searchParams.get('state')
  const modalityFromQuery = searchParams.get('modality') 

  if (!brand || !courseId || !courseName || !unitId || !city || !state) {
    return new Response(
      JSON.stringify({ error: 'Parâmetros obrigatórios ausentes' }),
      { status: 400 }
    )
  }

  const modalidades = modalityFromQuery
    ? [modalityFromQuery]
    : ['A distância', 'Presencial', 'Semipresencial']

  const curso = await prisma.curso.findUnique({ where: { brand_externalId: { brand, externalId: courseId } } })
  const unidade = await prisma.unidade.findUnique({ where: { externalId: unitId } })

  if (!curso || !unidade) {
    return new Response(
      JSON.stringify({ error: 'Curso ou Unidade não encontrada no banco' }),
      { status: 400 }
    )
  }

  const turnoUnidade = unidade.turno ?? 'Turno não informado'
  const salvos: any[] = []

  for (const modality of modalidades) {
    const url = `https://api.consultoriaeducacao.app.br/offers/v3/showShiftOffers?brand=${brand.toUpperCase()}&modality=${encodeURIComponent(modality)}&courseId=${courseId}&courseName=${encodeURIComponent(courseName)}&unitId=${unitId}&city=${encodeURIComponent(city)}&state=${state}&app=DC`

    try {
      const res = await fetch(url)
      const json = await res.json()

      if (json.error || !json.data?.shifts) {
        continue
      }

      const shifts = json.data.shifts

      for (const turno in shifts) {
        const dias = shifts[turno]

        for (const dia in dias) {
          const oferta = dias[dia]

          const modalidadeFinal = oferta.modality ?? modality

          // 🛑 Ignora se não for a modalidade solicitada
          if (modalityFromQuery && modalidadeFinal !== modalityFromQuery) {
            continue
          }

          const precoOriginal =
            oferta.financialBusinessOffer?.baseValue ?? oferta.montlyFeeFrom ?? null

          const precoComBolsa =
            oferta.financialBusinessOffer?.installments?.[0]?.ponctualityDiscountNetValue ??
            oferta.montlyFeeTo ?? null

          const vencimento = oferta.expiredAt ? new Date(oferta.expiredAt) : null

          const saved = await prisma.faculdadeCurso.upsert({
            where: {
              cursoId_unidadeId_modalidade_turno: {
                cursoId: curso.id,
                unidadeId: unidade.id,
                modalidade: modalidadeFinal,
                turno: turnoUnidade,
              },
            },
            update: {
              precoOriginal,
              precoComBolsa,
              vencimento,
              ofertaId: oferta.offerId,
              origem: oferta.source ?? 'API',
              modalidade: modalidadeFinal,
              turno: turnoUnidade,
            },
            create: {
              cursoId: curso.id,
              unidadeId: unidade.id,
              modalidade: modalidadeFinal,
              turno: turnoUnidade,
              precoOriginal,
              precoComBolsa,
              vencimento,
              ofertaId: oferta.offerId,
              origem: oferta.source ?? 'API',
            },
          })

          salvos.push({
            ...saved,
            turno: turnoUnidade,
          })
        }
      }
    } catch (error: any) {
      console.error(`[OFERTAS API ERROR] (${modality})`, error)
    }
  }

  return Response.json({
    sucesso: true,
    modalidades: modalidades.length,
    total: salvos.length,
    ofertas: salvos,
  })
}
