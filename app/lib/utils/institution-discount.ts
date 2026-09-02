import { getPriceAnchor } from './price-anchor'
import { DISCOUNT_CEILING_PCT } from '../copy/claims'

/**
 * Maior desconto REAL (%) entre as ofertas já carregadas de uma marca —
 * nunca inventado: deriva de minPrice/maxPrice de cada oferta (mesma lógica
 * de getPriceAnchor usada nos cards), pegando o teto entre elas.
 *
 * Cravado em DISCOUNT_CEILING_PCT (claims.ts): o catálogo tem outliers
 * pontuais (curso/cidade isolados) que passam do teto vetado editorialmente
 * ("Não republicar 80, 85 ou 92" — ver claims.ts). Uma marca cujo desconto
 * real fica ABAIXO do teto mostra o próprio número — nunca o teto genérico
 * do catálogo inteiro, que pode não valer pra ela (ex.: IBMEC = 0 hoje).
 */
export function getInstitutionMaxDiscountPct(
  courses: Array<{ minPrice?: number | null; maxPrice?: number | null }>,
): number {
  let max = 0
  for (const c of courses) {
    const anchor = getPriceAnchor({ from: c.maxPrice, to: c.minPrice })
    if (anchor && anchor.discountPct > max) max = anchor.discountPct
  }
  return Math.min(max, DISCOUNT_CEILING_PCT)
}
