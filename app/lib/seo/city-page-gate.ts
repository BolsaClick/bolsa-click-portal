// Quality gate compartilhado pra páginas de cidade (curso × cidade e
// faculdade × cidade). Decide se a URL deve ser indexada ou retornar
// noindex,follow + canonical pra versão nacional.
//
// Motivação: páginas com 0 ou 1 oferta local viram thin content em escala.
// Helpful Content Update penaliza conjuntos grandes de páginas low-value.
// Conservador: melhor perder cauda longa de baixa oferta do que arriscar
// penalidade no domínio inteiro.

/** Mínimo de ofertas locais pra considerar a página indexável. */
export const MIN_OFFERS_TO_INDEX = 2

/**
 * Decide se uma página de curso×cidade ou faculdade×cidade deve ser indexada.
 *
 * @param offerCount Quantidade de ofertas LOCAIS encontradas (não fallback)
 * @param trendScore Pontuação 0-100 de demanda do curso (Google Trends)
 * @returns true se deve emitir index,follow; false pra noindex,follow + canonical nacional
 */
export function shouldIndexCityPage(
  offerCount: number,
  trendScore: number | null | undefined = 0
): boolean {
  // Oferta local suficiente → index (comparativo tem valor SEO)
  if (offerCount >= MIN_OFFERS_TO_INDEX) return true

  // Sem oferta local (ou só 1) MAS demanda alta → index assim mesmo, o conteúdo
  // de curso + FAQ + contexto da cidade rankeia pela intenção informacional.
  // Threshold mais alto (≥ 60) pra compensar a falta de oferta concreta.
  if ((trendScore ?? 0) >= 60) return true

  return false
}
