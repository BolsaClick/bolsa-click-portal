// Fonte de verdade dos parceiros do ingressa (landings de conversão / mídia
// paga) — usada pela landing de marca (/lp/[partner]) e pela de curso
// (/lp/[partner]/[curso]) pra não duplicar/derivar cor de marca.

export const PARTNERS: string[] = ['anhanguera', 'unopar', 'pitagoras', 'unime', 'estacio']

// Cor de marca por parceiro (extraída dos sites oficiais / do concorrente
// matricula.digital). Hero, acentos e CTA usam essa cor — a landing fica com a
// cara da marca, o que converte melhor no tráfego de anúncio de brand.
export const DEFAULT_BRAND = '#023e73'
export const PARTNER_BRAND: Record<string, string> = {
  anhanguera: '#f94d12', // laranja (site oficial)
  // Azul oficial da Estácio — extraído de estacio.br em 2026-08-11 (cor mais
  // frequente no CSS computado da home, 11 ocorrências vs. #001F66 com 3;
  // Rodrigo aprovou uso da identidade visual oficial nesta data).
  estacio: '#144BC8',
  unopar: '#0a3c7d', // azul (site oficial)
  pitagoras: '#e2521d', // laranja-vermelho (site oficial)
  unime: '#e31b22', // vermelho (unime.edu.br)
}

// Azul-marinho escuro oficial da Estácio (estacio.br) — usado como acento
// secundário (texto sobre fundo claro, hairlines) onde o azul primário #144BC8
// não tem contraste suficiente.
export const PARTNER_BRAND_DARK: Record<string, string> = {
  estacio: '#001F66',
}

export function brandColorFor(partner: string): string {
  return PARTNER_BRAND[partner] ?? DEFAULT_BRAND
}

export function brandColorDarkFor(partner: string): string {
  return PARTNER_BRAND_DARK[partner] ?? DEFAULT_BRAND
}

export function isPartner(slug: string): boolean {
  return PARTNERS.includes(slug)
}

// ─── Indexação por marca (SEO) ──────────────────────────────────────────────
// As landings do ingressa nasceram noindex (mídia paga pura). Decisão do
// Rodrigo (2026-08-11): a Estácio vira indexável e assume SEO de marca própria
// no ingressa.digital — as demais marcas continuam noindex até serem
// trabalhadas uma a uma (uma landing indexada pela metade é pior que nenhuma).
// Único ponto de verdade: mude aqui, não espalhe `robots` hardcoded pelas páginas.
export const PARTNER_INDEXABLE: Record<string, boolean> = {
  estacio: true,
}

export function isIndexable(partner: string): boolean {
  return PARTNER_INDEXABLE[partner] === true
}
