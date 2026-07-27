/**
 * Normaliza a marca da oferta para um rótulo de grupo exibível/agrupável.
 * Agrupa as várias razões sociais YDUQS ("UNIVERSIDADE ESTÁCIO DE SÁ",
 * "CENTRO UNIVERSITÁRIO ESTÁCIO DE…") sob "Estácio". Usado tanto no filtro de
 * instituição quanto no round-robin de mescla da busca.
 */
export function normalizeBrand(brand?: string): string {
  const n = (brand || '').toLowerCase()
  if (!n) return ''
  if (n.includes('anhanguera')) return 'Anhanguera'
  if (n.includes('unopar')) return 'Unopar'
  if (n.includes('pitagoras') || n.includes('pitágoras')) return 'Pitágoras'
  if (n.includes('unime')) return 'Unime'
  if (n.includes('estacio') || n.includes('estácio')) return 'Estácio'
  if (n.includes('ibmec')) return 'IBMEC'
  if (n.includes('wyden')) return 'Wyden'
  return brand!
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ')
}

/**
 * Label normalizado → valor aceito pelo filtro `brands` do Tartarus (enum
 * Cogna). Null = não é marca Cogna.
 */
const COGNA_BRAND_PARAM: Record<string, string> = {
  Anhanguera: 'ANHANGUERA',
  Unopar: 'UNOPAR',
  'Pitágoras': 'PITAGORAS',
  Unime: 'UNIME',
}
export function cognaBrandParam(label: string): string | null {
  return COGNA_BRAND_PARAM[label] ?? null
}

/**
 * Label normalizado → termo do filtro `brand` da Athena (substring do slug da
 * instituição, sem acento). Null = não é marca YDUQS.
 */
const YDUQS_BRAND_SLUG: Record<string, string> = {
  'Estácio': 'estacio',
  IBMEC: 'ibmec',
  Wyden: 'wyden',
}
export function yduqsBrandSlug(label: string): string | null {
  return YDUQS_BRAND_SLUG[label] ?? null
}
