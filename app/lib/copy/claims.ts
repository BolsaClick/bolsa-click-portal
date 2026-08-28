/**
 * Canon de claims públicas do Bolsa Click.
 *
 * Teto 78%: vitrine home (Publicidade e Propaganda presencial SP,
 * Anhanguera Campus Marte) De R$ 1.497,92 → R$ 316 = 78% (Math.floor).
 * Mesma oferta no funil `/curso/resultado` com De/Por equivalentes e CTA
 * "Inscreva-se" ativo. Não republicar 80, 85 ou 92.
 */

export const DISCOUNT_CEILING_PCT = 78

export const DISCOUNT_CEILING_LABEL = `até ${DISCOUNT_CEILING_PCT}%` as const

export const PARTNER_NETWORKS = [
  'Anhanguera',
  'Unopar',
  'Pitágoras',
  'Estácio',
  'Unime',
  'Wyden',
] as const

export type PartnerNetwork = (typeof PARTNER_NETWORKS)[number]

export const PARTNER_NETWORKS_LIST =
  'Anhanguera, Unopar, Pitágoras, Estácio, Unime e Wyden'

export const WEDGE_NO_FEE = 'Cadastro grátis, sem taxa de adesão'
