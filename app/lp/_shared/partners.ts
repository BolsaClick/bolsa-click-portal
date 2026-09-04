// Fonte de verdade dos parceiros do ingressa (landings de conversão / mídia
// paga) — usada pela landing de marca (/lp/[partner]) e pela de curso
// (/lp/[partner]/[curso]) pra não duplicar/derivar cor de marca.

export const PARTNERS: string[] = [
  'anhanguera',
  'unopar',
  'pitagoras',
  'unime',
  'estacio',
  // Site de captação dedicado à PÓS da Anhanguera (pos.anhangueracursos.com.br,
  // ver middleware.ts). NÃO tem linha própria em `Institution` — reusa a
  // instituição/marca "anhanguera" (ver `institutionSlugFor`), só muda o nível
  // acadêmico buscado e a copy/URL pública.
  'anhanguera-pos',
]

// Parceiro (segmento de URL / partner id) → slug da `Institution` no banco.
// Quase sempre é o próprio partner; `anhanguera-pos` é uma VARIANTE de
// conteúdo (nível acadêmico diferente) da mesma instituição "anhanguera", não
// uma instituição parceira nova — evita duplicar a linha no banco (não
// inventa dado novo, só reaproveita cor/logo/copy institucional).
const PARTNER_INSTITUTION_SLUG: Record<string, string> = {
  'anhanguera-pos': 'anhanguera',
}

export function institutionSlugFor(partner: string): string {
  return PARTNER_INSTITUTION_SLUG[partner] ?? partner
}

// Nível acadêmico das ofertas buscadas pra esse partner — default GRADUACAO
// (comportamento de sempre). Só `anhanguera-pos` diverge.
const PARTNER_ACADEMIC_LEVEL: Record<string, string> = {
  'anhanguera-pos': 'POS_GRADUACAO',
}

export function academicLevelFor(partner: string): string {
  return PARTNER_ACADEMIC_LEVEL[partner] ?? 'GRADUACAO'
}

// Cor de marca por parceiro (extraída dos sites oficiais / do concorrente
// matricula.digital). Hero, acentos e CTA usam essa cor — a landing fica com a
// cara da marca, o que converte melhor no tráfego de anúncio de brand.
export const DEFAULT_BRAND = '#023e73'
export const PARTNER_BRAND: Record<string, string> = {
  anhanguera: '#f94d12', // laranja (site oficial)
  // Herda a cor oficial da Anhanguera — mesma marca, variante de conteúdo (pós).
  'anhanguera-pos': '#f94d12',
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
// `anhanguera-pos` (lançamento inicial) entra indexável desde já: é o único
// conteúdo do domínio pos.anhangueracursos.com.br (site de marca dedicado, não
// uma sub-rota entre várias) — noindex ali deixaria o domínio inteiro sem
// nenhuma página indexável.
// Único ponto de verdade: mude aqui, não espalhe `robots` hardcoded pelas páginas.
export const PARTNER_INDEXABLE: Record<string, boolean> = {
  estacio: true,
  'anhanguera-pos': true,
}

export function isIndexable(partner: string): boolean {
  return PARTNER_INDEXABLE[partner] === true
}

// ─── URL pública por parceiro (canonical/OG) ────────────────────────────────
// A maioria dos parceiros vive em `${siteUrl}/{partner}` dentro do domínio
// multi-marca ingressa.digital (siteUrl vem de NEXT_PUBLIC_SITE_URL/seoSite,
// fixo por deploy). `anhanguera-pos` é um domínio PRÓPRIO e dedicado (só essa
// marca/nível, sem segmento de partner na URL pública — ver rewrite em
// middleware.ts) — por isso precisa de um override explícito aqui em vez de
// derivar de `siteUrl`.
const PARTNER_SITE_URL: Record<string, string> = {
  'anhanguera-pos': 'https://pos.anhangueracursos.com.br',
}

/**
 * URL pública canônica da landing de marca desse parceiro.
 * `fallbackSiteUrl` é o `theme.siteUrl`/`seoSite.siteUrl` do deploy atual
 * (ingressa.digital, etc.) — usado pros parceiros sem domínio próprio.
 */
export function partnerCanonicalUrl(partner: string, fallbackSiteUrl: string): string {
  const dedicated = PARTNER_SITE_URL[partner]
  return dedicated ?? `${fallbackSiteUrl}/${partner}`
}
