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
 *
 * ATENÇÃO: 0 aqui é AMBÍGUO — pode ser "a marca não tem desconto" ou "a
 * busca falhou/voltou vazia". Só use este número puro pra decidir se a copy
 * PROMETE um %; nunca pra decidir se a copy pode AFIRMAR ausência de bolsa
 * (isso exige `getInstitutionDiscountState`, que distingue os dois casos).
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

/**
 * Piso de quantidade abaixo do qual uma lista de ofertas "sem desconto" NÃO
 * é evidência suficiente pra afirmar publicamente que a marca não tem bolsa.
 *
 * Deliberadamente BAIXO: existe só pra barrar o caso degenerado (lista vazia
 * ou quase vazia) — a assinatura da falha conhecida "Cogna/Tartarus devolve
 * HTTP 200 com lista vazia sob carga" (não lança erro, nenhum catch pega, e
 * uma auditoria mediu 34% do cache zerado por essa causa). NÃO tenta filtrar
 * marcas que legitimamente têm poucas ofertas — um valor alto aqui
 * penalizaria casos reais e estreitos (o próprio catálogo restringe a busca
 * de graduação às ~20 buscas do TOP_CURSOS, deduplicadas por nome; uma marca
 * pequena ou pouco coberta pode legitimamente ficar com poucas dezenas).
 */
export const MIN_COURSES_FOR_ABSENCE_CLAIM = 3

export type DiscountClaimState =
  | { kind: 'HAS_DISCOUNT'; pct: number }
  | { kind: 'NO_DISCOUNT' }
  | { kind: 'UNKNOWN' }

/**
 * Decide se a página pode afirmar POSITIVAMENTE que uma marca não tem bolsa
 * — nunca a partir de um zero que pode ter se originado de uma falha de
 * busca. Três estados, não dois:
 *
 * - HAS_DISCOUNT: desconto real > 0 — mostra o % (comportamento de sempre).
 * - NO_DISCOUNT: desconto real é 0 E há evidência POSITIVA suficiente
 *   (nenhuma falha de busca conhecida nesta chamada + quantidade mínima de
 *   ofertas carregadas). Só este estado autoriza a copy "não tem bolsa
 *   própria ativa".
 * - UNKNOWN: não há evidência suficiente pra afirmar nada — a busca falhou
 *   (uma fonte rejeitou: `hadFetchFailure`) OU a lista veio vazia/curta
 *   demais pra confiar (`MIN_COURSES_FOR_ABSENCE_CLAIM`, que cobre o caso
 *   que NÃO lança erro — HTTP 200 com lista vazia sob carga). A copy cai
 *   numa formulação neutra: nem promete %, nem nega bolsa.
 *
 * `hadFetchFailure` vem de `getInstitutionCoursesWithStatus`
 * (app/lib/api/get-institution-courses.ts) — true quando QUALQUER chamada
 * de origem (por curso do TOP_CURSOS ou busca larga por marca; Tartarus ou
 * Athena) rejeitou. Isso cobre as falhas que LANÇAM erro (ex.: HTTP 400
 * embrulhando um 429 do parceiro). O piso de quantidade cobre a falha que
 * NÃO lança erro nenhum (200 com lista vazia) — os dois sinais são
 * complementares, nenhum sozinho cobre as duas falhas conhecidas.
 */
export function getInstitutionDiscountState(
  courses: Array<{ minPrice?: number | null; maxPrice?: number | null }>,
  hadFetchFailure: boolean,
): DiscountClaimState {
  const pct = getInstitutionMaxDiscountPct(courses)
  if (pct > 0) return { kind: 'HAS_DISCOUNT', pct }
  if (hadFetchFailure || courses.length < MIN_COURSES_FOR_ABSENCE_CLAIM) {
    return { kind: 'UNKNOWN' }
  }
  return { kind: 'NO_DISCOUNT' }
}
