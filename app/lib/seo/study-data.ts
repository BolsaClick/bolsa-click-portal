// Agregados estatísticos do catálogo Bolsa Click pra alimentar estudos
// próprios (ex: /estudos/panorama-bolsa-2026). Cacheado 24h via unstable_cache
// pra evitar bater no DB a cada request. Vira fonte de dados primária
// (com schema Dataset) — sinal forte de autoridade pra LLMs.

import { unstable_cache } from 'next/cache'
import { prisma } from '@/app/lib/prisma'

export interface PanoramaData {
  totalCursosAtivos: number
  totalGraduacao: number
  totalPosGraduacao: number
  porTipo: Record<string, number>
  porDemanda: Record<string, number>
  totalInstituicoes: number
  totalInstituicoesComCityPages: number
  totalCidadesCobertas: number
  estadosCobertos: number
  topCursos: Array<{ slug: string; name: string; averageSalary: string; marketDemand: string }>
  cursosPorArea: Array<{ area: string; count: number }>
  cidadesPorEstado: Record<string, number>
  modalidades: string[]
  fontesDados: string[]
  dataGeracao: string
}

export const getPanoramaData = unstable_cache(
  async (): Promise<PanoramaData> => {
    const [
      total,
      grad,
      pos,
      byType,
      byDemand,
      instTotal,
      instCity,
      topCursos,
      allActive,
    ] = await Promise.all([
      prisma.featuredCourse.count({ where: { isActive: true } }),
      prisma.featuredCourse.count({ where: { isActive: true, nivel: 'GRADUACAO' } }),
      prisma.featuredCourse.count({ where: { isActive: true, nivel: 'POS_GRADUACAO' } }),
      prisma.featuredCourse.groupBy({
        by: ['type'],
        where: { isActive: true },
        _count: true,
      }),
      prisma.featuredCourse.groupBy({
        by: ['marketDemand'],
        where: { isActive: true },
        _count: true,
      }),
      prisma.institution.count({ where: { isActive: true } }),
      prisma.institution.count({ where: { isActive: true, hasCityPages: true } }),
      prisma.featuredCourse.findMany({
        where: { isActive: true, marketDemand: 'ALTA' },
        orderBy: { order: 'asc' },
        take: 10,
        select: { slug: true, name: true, averageSalary: true, marketDemand: true },
      }),
      prisma.featuredCourse.findMany({
        where: { isActive: true },
        select: { areas: true },
      }),
    ])

    // Agrega áreas (campo array de strings em FeaturedCourse) pra distribuição
    const areaCount = new Map<string, number>()
    for (const c of allActive) {
      for (const area of c.areas ?? []) {
        const key = area.trim()
        if (!key) continue
        areaCount.set(key, (areaCount.get(key) ?? 0) + 1)
      }
    }
    const cursosPorArea = Array.from(areaCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([area, count]) => ({ area, count }))

    // Cidades + estados — usa constante (escapa Prisma; cobertura é fixa do código)
    // 283 cidades cobrindo 27 estados conforme brazilian-cities.ts
    const { BRAZILIAN_CITIES } = await import('@/app/lib/constants/brazilian-cities')
    const cidadesPorEstado: Record<string, number> = {}
    for (const c of BRAZILIAN_CITIES) {
      cidadesPorEstado[c.state] = (cidadesPorEstado[c.state] ?? 0) + 1
    }
    const totalCidadesCobertas = BRAZILIAN_CITIES.length
    const estadosCobertos = Object.keys(cidadesPorEstado).length

    return {
      totalCursosAtivos: total,
      totalGraduacao: grad,
      totalPosGraduacao: pos,
      porTipo: Object.fromEntries(byType.map((t) => [t.type, t._count])),
      porDemanda: Object.fromEntries(byDemand.map((d) => [d.marketDemand, d._count])),
      totalInstituicoes: instTotal,
      totalInstituicoesComCityPages: instCity,
      totalCidadesCobertas,
      estadosCobertos,
      topCursos,
      cursosPorArea,
      cidadesPorEstado,
      modalidades: ['Presencial', 'EAD', 'Semipresencial'],
      fontesDados: [
        'Catálogo Bolsa Click (117 cursos enriquecidos)',
        'CAGED — Cadastro Geral de Empregados e Desempregados (Ministério do Trabalho)',
        'API Tartarus (oferta de cursos com bolsa em parceiros Cogna)',
        'IBGE 2022 (cidades brasileiras por população)',
      ],
      dataGeracao: new Date().toISOString().split('T')[0],
    }
  },
  ['panorama-bolsa-data-v1'],
  { revalidate: 86400, tags: ['panorama-bolsa'] },
)
