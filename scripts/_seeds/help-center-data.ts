/**
 * Agrega categorias + artigos da Central de Ajuda dos 4 scripts migrate-help-center-part*.ts
 * num único par de exports (`helpCategories`, `helpArticles`) consumido por `scripts/seed.ts`.
 *
 * Os 4 scripts originais continuam executáveis isoladamente (eles têm guard
 * `require.main === module` no main()).
 */

import { CATEGORIES, ARTICLES } from '../migrate-help-center'
import { ARTICLES_PART2 } from '../migrate-help-center-part2'
import { ARTICLES_PART3 } from '../migrate-help-center-part3'
import { ARTICLES_PART4 } from '../migrate-help-center-part4'

export type HelpCategorySeed = (typeof CATEGORIES)[number]

export type HelpArticleSeed = {
  slug: string
  title: string
  description: string
  metaTitle: string
  metaDescription: string
  content: string
  order: number
}

type ArticlesByCategory = Record<string, HelpArticleSeed[]>

function mergeArticlesByCategory(...sources: ArticlesByCategory[]): ArticlesByCategory {
  const merged: ArticlesByCategory = {}
  for (const source of sources) {
    for (const [categorySlug, articles] of Object.entries(source)) {
      if (!merged[categorySlug]) merged[categorySlug] = []
      merged[categorySlug].push(...articles)
    }
  }
  return merged
}

export const helpCategories: HelpCategorySeed[] = CATEGORIES

export const helpArticles: ArticlesByCategory = mergeArticlesByCategory(
  ARTICLES,
  ARTICLES_PART2,
  ARTICLES_PART3,
  ARTICLES_PART4,
)

export function countHelpArticles(): number {
  return Object.values(helpArticles).reduce((acc, list) => acc + list.length, 0)
}
