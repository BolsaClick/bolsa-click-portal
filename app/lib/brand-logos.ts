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
  IBMEC: '/assets/logo-ibmec.svg',
}

/**
 * Chaves do mapa ordenadas da mais longa pra mais curta, calculado uma vez.
 * Usado no fallback por substring: testar a chave mais longa primeiro evita
 * que uma chave curta (ex: UNAES) roube o casamento de um nome que na
 * verdade pertence a outra marca mais longa.
 */
const BRAND_KEYS_LONGEST_FIRST = Object.keys(BRAND_LOGOS).sort((a, b) => b.length - a.length)

/**
 * Retorna o caminho do logo da marca, ou null se não houver mapeamento.
 * Normaliza a chave (uppercase + sem acento) pra casar "Estácio"/"PITÁGORAS" etc.
 * O caller decide o fallback (texto, ícone, logo genérico, etc).
 *
 * Primeiro tenta igualdade exata (rápido e sem ambiguidade — funciona pra
 * Anhanguera/Unopar/Pitágoras porque o catálogo grava a marca "pura"). Se não
 * casar, cai pra busca por SUBSTRING com limite de palavra: o catálogo grava
 * Estácio e Wyden como nome completo da unidade ("CENTRO UNIVERSITÁRIO
 * ESTÁCIO DE SANTA CATARINA", "CENTRO UNIVERSITÁRIO FAVIP WYDEN"), nunca a
 * marca isolada, então igualdade exata nunca casava e o card ficava sem logo.
 * Mesma abordagem usada em `toMarca()` de app/lib/api/attio.ts, pro mesmo
 * problema (lá pro campo `marca` do Attio).
 *
 * O limite de palavra (\b) evita que uma chave curta case dentro de uma
 * palavra maior por acidente (ex: "UNIME" não pode casar dentro de
 * "REUNIME-SE" ou de um nome de unidade que só contenha essas letras em
 * sequência sem ser a marca).
 */
export function getBrandLogo(brand: string | null | undefined): string | null {
  if (!brand) return null
  const key = brand
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
  if (BRAND_LOGOS[key]) return BRAND_LOGOS[key]

  for (const candidate of BRAND_KEYS_LONGEST_FIRST) {
    if (new RegExp(`\\b${candidate}\\b`).test(key)) return BRAND_LOGOS[candidate]
  }
  return null
}
