import { prisma } from '@/app/lib/prisma'

/**
 * Trust signals do Bolsa Click — fonte única de verdade pra components
 * que exibem credibilidade institucional (TrustBadges, PartnersStrip, Stats).
 *
 * REGRA CLAUDE.md: nunca inventar números. Quando dado real não está
 * disponível, retornar null e deixar o component degradar graciosamente.
 */

export interface TrustData {
  /** Ano de fundação/início de operação. Banda anual — schema.org aceita YYYY. */
  foundingYear: number
  /** Nomes oficiais das marcas parceiras institucionais (Cogna Educação + YDUQS). */
  partnerBrandNames: string[]
  /** Label dos grupos controladores dos parceiros institucionais (plural). */
  partnerGroupLabel: string
  /** Total de usuários cadastrados — null se contagem não disponível ou < 100. */
  studentCount: number | null
}

// Cogna: Anhanguera, Unopar, Pitágoras, Ampli, Unime. YDUQS: Estácio.
const PARTNER_BRANDS = ['Anhanguera', 'Unopar', 'Pitágoras', 'Ampli', 'Unime', 'Estácio'] as const
const FOUNDING_YEAR = 2024

/**
 * Tenta agregar contagem real de usuários cadastrados. Falhas (DB indisponível)
 * ou contagens muito baixas retornam null pra evitar exibição quebrada.
 */
async function safeCountStudents(): Promise<number | null> {
  try {
    const count = await prisma.user.count()
    return count >= 100 ? count : null
  } catch {
    return null
  }
}

export async function getTrustData(): Promise<TrustData> {
  const studentCount = await safeCountStudents()

  return {
    foundingYear: FOUNDING_YEAR,
    partnerBrandNames: [...PARTNER_BRANDS],
    partnerGroupLabel: 'grupos Cogna Educação e YDUQS',
    studentCount,
  }
}

/**
 * Versão síncrona pra components que não precisam do studentCount
 * (TrustBadges no header — evita query extra no SSR do pillar).
 */
export function getStaticTrustData(): Omit<TrustData, 'studentCount'> {
  return {
    foundingYear: FOUNDING_YEAR,
    partnerBrandNames: [...PARTNER_BRANDS],
    partnerGroupLabel: 'grupos Cogna Educação e YDUQS',
  }
}
