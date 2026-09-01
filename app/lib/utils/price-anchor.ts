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
  /**
   * `true` quando `from`/`to` já são o valor TOTAL do curso (ex.:
   * pós-graduação e curso profissionalizante: `minPrice`/`maxPrice` vêm de
   * `priceWithDiscount`/`priceWithoutDiscount` do Tartarus, que já são
   * totais). `false` (default) quando `from`/`to` são mensalidade
   * (graduação), caso em que a economia total precisa multiplicar pela
   * duração.
   *
   * Misturar os dois — multiplicar um total por `durationMonths` de novo —
   * infla a economia em ~durationMonths×. Bug real observado num card de pós
   * (2026-08): "De R$ 1.689,99" e "Economize R$ 1.689,99" idênticos, porque
   * discountPct% × durationMonths coincidiu em ~100%.
   */
  priceIsTotal?: boolean
}

export interface PriceAnchor {
  /** % de desconto, arredondado pra inteiro. */
  discountPct: number
  /**
   * Economia total até o fim do curso, arredondada pra inteiro de reais.
   * `null` quando `priceIsTotal` é false e `durationMonths` não é um número
   * positivo (sem duração, mostra só riscado + %).
   */
  totalSavings: number | null
}

export function getPriceAnchor({
  from,
  to,
  durationMonths,
  priceIsTotal = false,
}: PriceAnchorInput): PriceAnchor | null {
  if (typeof from !== 'number' || typeof to !== 'number') return null
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null
  if (from <= to) return null

  const discountPct = Math.round((1 - to / from) * 100)

  let totalSavings: number | null = null
  if (priceIsTotal) {
    // from/to já são o total do curso: a economia é a diferença simples,
    // sem multiplicar por duração de novo.
    totalSavings = Math.round(from - to)
  } else if (
    typeof durationMonths === 'number' &&
    Number.isFinite(durationMonths) &&
    durationMonths > 0
  ) {
    totalSavings = Math.round((from - to) * durationMonths)
  }

  return { discountPct, totalSavings }
}
