/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/parceiros/cursos/route.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const API_BASE = 'https://api.consultoriaeducacao.app.br/offers/v3/showCourses'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brand = searchParams.get('brand')?.toLowerCase()

  if (!brand) {
    return new Response(JSON.stringify({ error: 'Parâmetro brand é obrigatório' }), { status: 400 })
  }

  const url = `${API_BASE}?type=undergraduate&brand=${brand}&app=DC&partnerBrand=${brand}`

  try {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error('Erro ao buscar cursos da API do parceiro.')
    }

    const json = await res.json()
    const cursos = json.data

    const resultados = []

    for (const curso of cursos) {
      const nome = curso.course
      const externalId = curso.courseId
      const slug = gerarSlug(nome)

      const upserted = await prisma.curso.upsert({
        where: { brand_externalId: { brand, externalId } },
        update: { nome, slug },
        create: { nome, slug, externalId },
      })

      resultados.push(upserted)
    }

    return Response.json({ total: resultados.length, cursos: resultados })
  } catch (error: any) {
    console.error('[ERRO]', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

function gerarSlug(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') 
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
}
