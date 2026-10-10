import { stripBrandSuffix } from './title'

/**
 * Orçamento do snippet no Google, medido como ele SAI na página — não como
 * está salvo no banco.
 *
 * - Title: o layout raiz aplica `%s | Bolsa Click`, e `stripBrandSuffix`
 *   remove a marca se ela já vier no valor salvo. Então o que conta é
 *   `stripBrandSuffix(valor) + " | Bolsa Click"` ≤ 60 → sobram 46 pro texto.
 * - Description: ≤ 155. O blog cai no `excerpt` quando `metaDescription`
 *   está vazio (app/blog/[slug]/page.tsx), então o resumo também é medido.
 *
 * Por quê: no GSC de jul–out/2026 o blog rankeia em posição 7,6 com CTR de
 * 0,35%. Titles salvos iam de 49 a 74 caracteres e descriptions de 143 a 175 —
 * e os posts com preço no título eram justamente os que cortavam no número.
 */
export const BRAND_SUFFIX = ' | Bolsa Click'
export const SNIPPET_TITLE_MAX = 60
export const SNIPPET_DESCRIPTION_MAX = 155
/** Quanto do title sobra pro texto editorial, já descontado o sufixo. */
export const SNIPPET_TITLE_BODY_MAX = SNIPPET_TITLE_MAX - BRAND_SUFFIX.length

/** Comprimento do <title> renderizado (com o sufixo de marca do layout). */
export function renderedTitleLength(raw: string): number {
  return stripBrandSuffix(raw).length + BRAND_SUFFIX.length
}

export interface BlogSnippetInput {
  title?: string | null
  metaTitle?: string | null
  excerpt?: string | null
  metaDescription?: string | null
}

export interface SnippetIssue {
  field: 'metaTitle' | 'metaDescription'
  message: string
}

/**
 * Valida o snippet EFETIVO de um post (mesma regra de fallback da página:
 * metaTitle || title, metaDescription || excerpt). Lista vazia = pode salvar.
 */
export function validateBlogSnippet(post: BlogSnippetInput): SnippetIssue[] {
  const issues: SnippetIssue[] = []

  const metaTitle = post.metaTitle?.trim()
  const effectiveTitle = metaTitle || post.title?.trim() || ''
  if (effectiveTitle) {
    const len = renderedTitleLength(effectiveTitle)
    if (len > SNIPPET_TITLE_MAX) {
      const source = metaTitle ? 'O meta title' : 'Sem meta title, o título do post'
      issues.push({
        field: 'metaTitle',
        message: `${source} aparece no Google com ${len} caracteres (contando "${BRAND_SUFFIX.trim()}"); o limite é ${SNIPPET_TITLE_MAX}. Corte ${len - SNIPPET_TITLE_MAX} — o texto pode ter até ${SNIPPET_TITLE_BODY_MAX}.`,
      })
    }
  }

  const metaDescription = post.metaDescription?.trim()
  const effectiveDescription = metaDescription || post.excerpt?.trim() || ''
  if (effectiveDescription.length > SNIPPET_DESCRIPTION_MAX) {
    const len = effectiveDescription.length
    issues.push({
      field: 'metaDescription',
      message: metaDescription
        ? `A meta description tem ${len} caracteres; o limite é ${SNIPPET_DESCRIPTION_MAX}. Corte ${len - SNIPPET_DESCRIPTION_MAX}.`
        : `Sem meta description, o Google recebe o resumo (${len} caracteres; limite ${SNIPPET_DESCRIPTION_MAX}). Preencha uma meta description de até ${SNIPPET_DESCRIPTION_MAX}.`,
    })
  }

  return issues
}
