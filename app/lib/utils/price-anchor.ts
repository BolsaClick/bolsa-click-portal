/**
 * Ancoragem de preço — helper puro, sem I/O.
 *
 * NUNCA inventa desconto: se `from`/`to` não forem números válidos ou se
 * `from` não for estritamente maior que `to`, retorna `null` (o chamador
 * degrada graciosamente, sem badge/riscado).
 */

export interface PriceAnchorInput {
  /** Preço cheio ("de"). Ex.: maxPrice / montlyFeeFrom. */
  from?: number | null
  /** Preço com desconto ("por"). Ex.: minPrice / montlyFeeTo. */
  to?: number | null
  /** Duração do curso em meses, quando disponível. */
  durationMonths?: number | null
}

export interface PriceAnchor {
  /** % de desconto, arredondado pra inteiro. */
  discountPct: number
  /**
   * Economia total até o fim do curso, arredondada pra inteiro de reais.
   * `null` quando `durationMonths` não é um número positivo (sem duração,
   * mostra só riscado + %).
   */
  totalSavings: number | null
}

export function getPriceAnchor({
  from,
  to,
  durationMonths,
}: PriceAnchorInput): PriceAnchor | null {
  if (typeof from !== 'number' || typeof to !== 'number') return null
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null
  if (from <= to) return null

  const discountPct = Math.round((1 - to / from) * 100)

  let totalSavings: number | null = null
  if (
    typeof durationMonths === 'number' &&
    Number.isFinite(durationMonths) &&
    durationMonths > 0
  ) {
    totalSavings = Math.round((from - to) * durationMonths)
  }

  return { discountPct, totalSavings }
}
