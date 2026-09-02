import { DISCOUNT_CEILING_PCT } from '../copy/claims'

/**
 * Piso de amostra abaixo do qual uma medição de InstitutionMaxDiscountCache
 * não é confiável o bastante pra guiar a copy pública — nem pra afirmar um
 * percentual, nem (com mais razão ainda) pra afirmar ausência de bolsa.
 *
 * scripts/precompute-institution-max-discount.ts já SÓ grava um registro
 * quando a medição atingiu este piso sem nenhuma falha de busca (ver o
 * script) — então, na prática, todo `row` desta tabela já é confiável por
 * construção. Esta constante e a checagem em `getBrandDiscountState` são
 * defesa em profundidade: se um dia o script mudar, ou um registro for
 * editado manualmente com sampleSize baixo, a leitura ainda protege contra
 * publicar um número (ou uma ausência) sem lastro.
 */
export const MIN_SAMPLE_FOR_RELIABLE_READ = 20

/** Formato mínimo que a leitura precisa do registro persistido (Prisma
 *  devolve mais campos, mas só estes entram na decisão).
 *  `maxDiscountPctRaw` é o valor BRUTO medido pelo script — SEM nenhum teto
 *  editorial aplicado. O teto (DISCOUNT_CEILING_PCT) é aplicado só aqui, na
 *  leitura (`getBrandDiscountState`), pra que mudar a constante valha pro
 *  site inteiro sem reprocessar dado nenhum. */
export interface PersistedBrandDiscount {
  maxDiscountPctRaw: number
  sampleSize: number
}

export type BrandDiscountState =
  | { kind: 'HAS_DISCOUNT'; pct: number }
  | { kind: 'NO_DISCOUNT' }
  | { kind: 'UNKNOWN' }

/**
 * Três estados, não dois — decide o que a página PODE afirmar sobre bolsa na
 * marca, a partir do valor JÁ PERSISTIDO (nunca deriva de uma busca ao vivo
 * aqui; ver o comentário do model InstitutionMaxDiscountCache em
 * schema.prisma pro histórico de por que isso importa).
 *
 * - HAS_DISCOUNT: há registro confiável (amostra suficiente) com desconto
 *   real > 0 — mostra o número da própria marca, truncado no teto editorial
 *   AQUI (único ponto do fluxo que aplica DISCOUNT_CEILING_PCT — o valor
 *   persistido é bruto; ver PersistedBrandDiscount).
 * - NO_DISCOUNT: há registro confiável com desconto 0 — evidência POSITIVA
 *   (o script só grava isto quando mediu amostra suficiente e sem falhas).
 *   Único estado que autoriza a copy "não tem bolsa própria ativa hoje"
 *   (ex.: IBMEC em graduação).
 * - UNKNOWN: nunca medido com confiança (nenhum registro, ou um registro com
 *   amostra abaixo do piso — não deveria acontecer dado o gate do script,
 *   mas a leitura não confia cegamente). Cai no padrão SEGURO: o
 *   comportamento de sempre (teto do catálogo), nunca uma afirmação de
 *   ausência sem evidência.
 */
export function getBrandDiscountState(
  row: PersistedBrandDiscount | null | undefined,
): BrandDiscountState {
  if (!row || row.sampleSize < MIN_SAMPLE_FOR_RELIABLE_READ) {
    return { kind: 'UNKNOWN' }
  }
  if (row.maxDiscountPctRaw > 0) {
    return { kind: 'HAS_DISCOUNT', pct: Math.min(row.maxDiscountPctRaw, DISCOUNT_CEILING_PCT) }
  }
  return { kind: 'NO_DISCOUNT' }
}

/**
 * Percentual pra EXIBIR na copy pública, a partir do registro persistido.
 * Colapsa HAS_DISCOUNT e UNKNOWN no mesmo comportamento visível — um número
 * positivo que autoriza a copy de bolsa — porque UNKNOWN é, por definição
 * (requisito do produto), o padrão seguro de hoje: o teto do catálogo. Só
 * NO_DISCOUNT retorna 0, e só ele pode virar a copy honesta de ausência.
 *
 * Chame isto UMA vez por render (ver `getBrandDiscountCached` em
 * app/faculdades/[slug]/page.tsx, memoizado por request) e derive título, meta
 * description, H1, resposta GEO e FAQ todos deste MESMO número — nunca
 * chamadas separadas que possam divergir entre si.
 */
export function getDisplayDiscountPct(row: PersistedBrandDiscount | null | undefined): number {
  const state = getBrandDiscountState(row)
  if (state.kind === 'HAS_DISCOUNT') return state.pct
  if (state.kind === 'NO_DISCOUNT') return 0
  return DISCOUNT_CEILING_PCT
}
