/**
 * Filtro Prisma de quem entra em /comparar/[pair] (páginas, sitemap e links).
 *
 * A comparação é de GRADUAÇÃO — preços dos TOP_CURSOS e copy de "bolsas de
 * até X% nas duas faculdades". Uma marca só de pós (a Mackenzie entrou assim
 * em set/2026, sem desconto) geraria páginas com promessa falsa e tabela
 * vazia. Regra pelo dado (`academicLevels`), sem exceção por slug.
 */
export const COMPARABLE_INSTITUTION = {
  isActive: true,
  academicLevels: { has: 'GRADUACAO' },
} as const
