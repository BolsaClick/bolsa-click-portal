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

  // Demanda alta (≥ 60) MAS ainda exige ao menos 1 oferta local: sem nenhuma
  // oferta, a página é duplicata do conteúdo nacional + nome da cidade — thin em
  // escala que afoga o crawl budget (Google joga pra "Detectada, não indexada").
  // Com ≥ 1 oferta + alta demanda, o comparativo local tem substância pra rankear.
  if ((trendScore ?? 0) >= 60 && offerCount >= 1) return true

  return false
}
