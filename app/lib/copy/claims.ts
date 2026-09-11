/**
 * Canon de claims públicas do Bolsa Click.
 *
 * Teto 80%: Farmácia - Bacharelado presencial, Unime (unidade Lauro de
 * Freitas/BA, UN944908) De R$ 1.622,99 → R$ 194,00 = 88% (Math.floor),
 * verificado ao vivo em 2026-09-02 direto na API (cogna/courses/search) e
 * reproduzido no funil `/curso/resultado?c=Farmácia&cn=Bacharelado&
 * cidade=Lauro+de+Freitas&estado=BA&modalidade=PRESENCIAL&nivel=GRADUACAO`
 * com De/Por e badge "-88%" idênticos. CTA "Inscreva-se" ativo: o endpoint
 * de checkout (`cogna/courses/details`) responde com businessKey/dmhId reais
 * para essa oferta+unidade. A mesma unidade tem outros 12 cursos de
 * bacharelado entre 70% e 88% (Educação Física 80%, Psicologia 79%,
 * Medicina Veterinária 78%, ...) — cluster real, não curso isolado, mas
 * concentrado numa marca/cidade só: Anhanguera não passou de 78% e Estácio
 * não passou de 70% em graduação presencial na amostra verificada. Teto
 * travado em 80, com margem abaixo do máximo observado. Não republicar 85,
 * 88 ou 92.
 */

export const DISCOUNT_CEILING_PCT = 80

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

/**
 * Cursos que não podem ser ofertados em EAD por norma do MEC — só existem
 * presenciais no catálogo real. Medido em 2026-09-04 (Psicologia, Enfermagem,
 * Direito: 0 ofertas EAD em São Paulo, preço presencial ~3x o de um EAD
 * comparável — ver decisão "Cursos que não podem ser EAD carregam a promessa
 * de preço errada" no cofre) e confirmado de novo em 2026-09-10 via auditoria
 * SXO das 15 páginas de curso mais visitadas (Odontologia entrou na mesma
 * lista; Medicina já era conhecida como MEC-restrita e tem `FeaturedCourse`
 * própria no catálogo).
 *
 * Comparar por `curso.name` (ex.: "Psicologia"), não por slug — o slug pode
 * ter sufixo de grau ("psicologia-bacharelado").
 *
 * Lista deliberadamente conservadora: só os 5 cursos com essa restrição já
 * MEDIDA no catálogo real entram aqui. Não adicionar curso por suposição
 * (Fisioterapia, Nutrição, Farmácia, Veterinária, Biomedicina também são
 * regulados por conselho profissional e provavelmente têm a mesma restrição,
 * mas isso não foi verificado contra o catálogo — verificar antes de incluir).
 */
export const MEC_PRESENCIAL_ONLY_COURSES = [
  'Psicologia',
  'Enfermagem',
  'Direito',
  'Medicina',
  'Odontologia',
] as const

export function isMecPresencialOnly(courseName: string): boolean {
  return (MEC_PRESENCIAL_ONLY_COURSES as readonly string[]).includes(courseName)
}
