/* eslint-disable @typescript-eslint/no-explicit-any */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const brandMap: Record<string, string> = {
  'anhanguera': 'ANHANGUERA',
  'unopar': 'UNOPAR',
  'ampli': 'AMPLI',
  'pitagoras': 'PITAGORAS'
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const brand = searchParams.get('brand')
  const courseId = searchParams.get('courseId')
  const courseName = searchParams.get('courseName')
  const modality = searchParams.get('modality')
  const city = searchParams.get('city')
  const state = searchParams.get('state')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  if (!courseId || !courseName || !modality || !city || !state) {
    return new Response(JSON.stringify({ error: 'Parâmetros obrigatórios ausentes.' }), { status: 400 })
  }

  const brands = brand ? [brand] : Object.keys(brandMap)
  const unidadesFormatadas = []

  try {
    for (const b of brands) {
      const brandFormatted = brandMap[b]
      const url: string = `https://api.consultoriaeducacao.app.br/offers/v3/showCaseFilter?brand=${brandFormatted}&modality=${encodeURIComponent(modality)}&city=${encodeURIComponent(city)}&state=${state}&course=${courseId}&courseName=${encodeURIComponent(courseName)}&app=DC&size=999`

      const response = await fetch(url)
      if (!response.ok) continue

      const json = await response.json()
      const data = json.data || []

      // Se não há brand especificado, pegar somente as 3 primeiras unidades por faculdade
      const unidadesBrutas = !brand ? data.slice(0, 3) : data

      for (const unidade of unidadesBrutas) {
        // Filtro da modalidade precisa ser validado com base na unidade.modality
        if (unidade.modality !== modality) continue

        const upserted = await prisma.unidade.upsert({
          where: { externalId: unidade.unitId },
          update: {
            nome: unidade.unitAddress,
            cidade: unidade.unitCity,
            estado: unidade.unitState,
            cep: unidade.unitPostalCode,
            numero: unidade.unitNumber,
            complemento: unidade.unitComplement,
            bairro: unidade.unitDistrict,
            turno: unidade.classShift ?? null,
          },
          create: {
            externalId: unidade.unitId,
            nome: unidade.unitAddress,
            cidade: unidade.unitCity,
            estado: unidade.unitState,
            cep: unidade.unitPostalCode,
            numero: unidade.unitNumber,
            complemento: unidade.unitComplement,
            bairro: unidade.unitDistrict,
            endereco: unidade.unitAddress,
            turno: unidade.classShift ?? null,
          },
        })

        unidadesFormatadas.push({
          ...upserted,
          brand: unidade.brand ?? b,
          montlyFeeToMin: unidade.montlyFeeToMin ?? null,
        })
      }
    }

    const startIndex = (page - 1) * limit
    const paginated = unidadesFormatadas.slice(startIndex, startIndex + limit)

    return Response.json({
      total: unidadesFormatadas.length,
      page,
      limit,
      unidades: paginated
    })
  } catch (err: any) {
    console.error('[UNIDADES API ERROR]', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}