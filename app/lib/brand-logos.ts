/**
 * Mapping de marcas (vindas da API tartarus) → caminho do logo em /public/assets.
 * Chave: brand em UPPERCASE.
 */
export const BRAND_LOGOS: Record<string, string> = {
  ANHANGUERA: '/assets/logo-anhanguera-bolsa-click.svg',
  UNOPAR: '/assets/logo-unopar.svg',
  PITAGORAS: '/assets/logo-pitagoras.svg',  UNIME: '/assets/logo-unime-p.png',
  UNAES: '/assets/logo-bolsa-click-rosa.png',
  ESTACIO: '/estacio-logo.png',
  WYDEN: '/assets/wyden.svg',
}

/**
 * Retorna o caminho do logo da marca, ou null se não houver mapeamento.
 * Normaliza a chave (uppercase + sem acento) pra casar "Estácio"/"PITÁGORAS" etc.
 * O caller decide o fallback (texto, ícone, logo genérico, etc).
 */
export function getBrandLogo(brand: string | null | undefined): string | null {
  if (!brand) return null
  const key = brand
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
  return BRAND_LOGOS[key] ?? null
}
