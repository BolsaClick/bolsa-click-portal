/**
 * Title e meta description de /comparar/[pair] — o que aparece no SERP.
 *
 * Medido no Search Console (jul–out/2026): as 8 comparações rankeadas estão
 * em posição ~4,9 com CTR ~1,2%. As consultas se dividem em duas intenções:
 *
 *  - "anhanguera ou estacio", "qual faculdade é melhor estacio ou anhanguera"
 *    → quer um veredito com critério (nota MEC).
 *  - "unopar e anhanguera são as mesmas", "anhanguera e unopar é a mesma
 *    coisa", "wyden estacio" → quer saber se é a mesma empresa. ~1.200
 *    impressões, ZERO cliques: o título antigo ("Qual a Melhor Faculdade?")
 *    não respondia a pergunta.
 *
 * Por isso o título muda conforme o par seja do mesmo grupo educacional ou
 * não, e a description responde nos primeiros ~60 caracteres (padrão de
 * abertura do CLAUDE.md). Orçamentos: title ≤ 60 com o sufixo " | Bolsa
 * Click" do layout; description ≤ 155. Cada peça é uma escada de candidatos,
 * do mais informativo ao mais curto — vence o primeiro que cabe.
 */
import { WEDGE_NO_FEE } from '@/app/lib/copy/claims'
import { getEducationGroup } from '@/app/lib/utils/education-group'

/** Sufixo aplicado por `title.template` em app/layout.tsx (`%s | Bolsa Click`). */
const BRAND_SUFFIX_LEN = ' | Bolsa Click'.length
export const TITLE_MAX = 60
export const DESCRIPTION_MAX = 155

export interface CompareSide {
  slug: string
  name: string
  mecRating: number | null
  /** Desconto exibível da marca (getDisplayDiscountPct) — 0 = sem bolsa ativa. */
  discountPct: number
}

function firstThatFits(candidates: Array<string | null>, max: number): string {
  const valid = candidates.filter((c): c is string => !!c)
  return valid.find(c => c.length <= max) ?? valid[valid.length - 1]
}

function discountPhrase(a: CompareSide, b: CompareSide): string | null {
  const max = Math.max(a.discountPct, b.discountPct)
  if (max <= 0) return null
  return `bolsa de até ${max}%`
}

function discountPhrasePerBrand(a: CompareSide, b: CompareSide): string | null {
  if (a.discountPct <= 0 || b.discountPct <= 0) return discountPhrase(a, b)
  if (a.discountPct === b.discountPct) return `bolsa de até ${a.discountPct}% nas duas`
  return `bolsa de até ${a.discountPct}% na ${a.name} e ${b.discountPct}% na ${b.name}`
}

/**
 * Frase de bolsa pro CORPO da página, com o número medido de cada marca:
 * "bolsas de até 80% nas duas faculdades" / "bolsas de até 80% na Estácio e
 * 69% na Pitágoras". Marca sem bolsa ativa (0) não ganha número.
 */
export function pairDiscountClause(a: CompareSide, b: CompareSide): string | null {
  if (a.discountPct <= 0 && b.discountPct <= 0) return null
  if (a.discountPct === b.discountPct) return `bolsas de até ${a.discountPct}% nas duas faculdades`
  const parts = [a, b].filter(s => s.discountPct > 0).map(s => `${s.discountPct}% na ${s.name}`)
  return `bolsas de até ${parts.join(' e ')}`
}

/** "A Estácio tem nota MEC 4; a Anhanguera, 3." — maior nota primeiro. */
function mecSentence(a: CompareSide, b: CompareSide): string | null {
  if (!a.mecRating || !b.mecRating) return null
  if (a.mecRating === b.mecRating) return `As duas têm nota MEC ${a.mecRating}.`
  const [hi, lo] = a.mecRating > b.mecRating ? [a, b] : [b, a]
  return `A ${hi.name} tem nota MEC ${hi.mecRating}; a ${lo.name}, ${lo.mecRating}.`
}

export function isSameGroup(a: CompareSide, b: CompareSide): boolean {
  const ga = getEducationGroup(a.slug)
  return !!ga && ga === getEducationGroup(b.slug)
}

export function buildCompareTitle(a: CompareSide, b: CompareSide): string {
  const max = TITLE_MAX - BRAND_SUFFIX_LEN
  const mec =
    a.mecRating && b.mecRating && a.mecRating !== b.mecRating
      ? `MEC ${a.mecRating} x ${b.mecRating}`
      : null

  if (isSameGroup(a, b)) {
    return firstThatFits(
      [
        `${a.name} e ${b.name} são a mesma faculdade?`,
        `${a.name} e ${b.name} são a mesma?`,
        `${a.name} ou ${b.name}?`,
      ],
      max
    )
  }

  return firstThatFits(
    [
      mec && `${a.name} ou ${b.name}: qual a melhor? ${mec}`,
      mec && `${a.name} ou ${b.name}? Nota ${mec} e bolsas`,
      `${a.name} ou ${b.name}: qual a melhor faculdade?`,
      `${a.name} ou ${b.name}: qual a melhor?`,
      `${a.name} ou ${b.name}?`,
    ],
    max
  )
}

export function buildCompareDescription(a: CompareSide, b: CompareSide): string {
  const ga = getEducationGroup(a.slug)
  const gb = getEducationGroup(b.slug)
  const mec = mecSentence(a, b)
  const perBrand = discountPhrasePerBrand(a, b)
  const upTo = discountPhrase(a, b)
  const cta = (d: string | null) => (d ? `Compare cursos com ${d}.` : `${WEDGE_NO_FEE}.`)

  if (ga && ga === gb) {
    const lead = `Não. ${a.name} e ${b.name} são faculdades distintas do mesmo grupo, a ${ga}.`
    return firstThatFits(
      [
        [lead, mec, cta(perBrand)].filter(Boolean).join(' '),
        [lead, mec, cta(upTo)].filter(Boolean).join(' '),
        [lead, cta(upTo)].join(' '),
        lead,
      ],
      DESCRIPTION_MAX
    )
  }

  // Grupos diferentes: veredito pela nota MEC primeiro (quando as duas têm),
  // depois a resposta à variante "são a mesma coisa?".
  const groups = ga && gb ? `São de grupos diferentes (${a.name}: ${ga}; ${b.name}: ${gb}).` : null
  const groupsShort = ga && gb ? `São de grupos diferentes, ${ga} e ${gb}.` : null
  const lead = mec ?? `${a.name} ou ${b.name}? Veja nota MEC, modalidades e polos lado a lado.`
  return firstThatFits(
    [
      [lead, groups, cta(perBrand)].filter(Boolean).join(' '),
      [lead, groups, cta(upTo)].filter(Boolean).join(' '),
      [lead, groupsShort, cta(upTo)].filter(Boolean).join(' '),
      [lead, groupsShort].filter(Boolean).join(' '),
      [lead, cta(upTo)].join(' '),
      lead,
    ],
    DESCRIPTION_MAX
  )
}
