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
  estacio: '#022549', // navy (matricula.digital)
  unopar: '#0a3c7d', // azul (site oficial)
  pitagoras: '#e2521d', // laranja-vermelho (site oficial)
  unime: '#e31b22', // vermelho (unime.edu.br)
}

export function brandColorFor(partner: string): string {
  return PARTNER_BRAND[partner] ?? DEFAULT_BRAND
}

export function isPartner(slug: string): boolean {
  return PARTNERS.includes(slug)
}
