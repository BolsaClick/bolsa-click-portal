import { prisma } from '@/app/lib/prisma'
import { cache } from 'react'

export interface HelpCategoryData {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  articleCount: number
}

export interface HelpArticleListItem {
  slug: string
  title: string
  description: string
}

export interface HelpArticleData {
  id: string
  slug: string
  title: string
  description: string
  content: string
  metaTitle: string | null
  metaDescription: string | null
  category: {
    slug: string
    title: string
  }
}

/**
 * Busca todas as categorias ativas da Central de Ajuda
 */
export const getHelpCategories = cache(async (): Promise<HelpCategoryData[]> => {
  const categories = await prisma.helpCategory.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: {
          articles: {
            where: { isActive: true }
          }
        }
      }
    }
  })

  return categories.map(cat => ({
    id: cat.id,
    slug: cat.slug,
    title: cat.title,
    description: cat.description,
    icon: cat.icon,
    articleCount: cat._count.articles,
  }))
})

/**
 * Busca uma categoria por slug com seus artigos
 */
export const getHelpCategoryBySlug = cache(async (slug: string) => {
  const category = await prisma.helpCategory.findUnique({
    where: { slug, isActive: true },
    include: {
      articles: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        select: {
          slug: true,
          title: true,
          description: true,
        }
      }
    }
  })

  if (!category) return null

  return {
    id: category.id,
    slug: category.slug,
    title: category.title,
    description: category.description,
    icon: category.icon,
    articles: category.articles as HelpArticleListItem[],
  }
})

/**
 * Busca um artigo por slug da categoria e do artigo
 */
export const getHelpArticle = cache(async (
  categorySlug: string,
  articleSlug: string
): Promise<HelpArticleData | null> => {
  const category = await prisma.helpCategory.findUnique({
    where: { slug: categorySlug, isActive: true },
  })

  if (!category) return null

  const article = await prisma.helpArticle.findUnique({
    where: {
      categoryId_slug: {
        categoryId: category.id,
        slug: articleSlug,
      },
      isActive: true,
    },
    include: {
      category: {
        select: {
          slug: true,
          title: true,
        }
      }
    }
  })

  if (!article) return null

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    description: article.description,
    content: article.content,
    metaTitle: article.metaTitle,
    metaDescription: article.metaDescription,
    category: article.category,
  }
})

/**
 * Busca todos os slugs de categorias para generateStaticParams
 */
export const getAllCategorySlugs = cache(async (): Promise<string[]> => {
  const categories = await prisma.helpCategory.findMany({
    where: { isActive: true },
    select: { slug: true },
  })
  return categories.map(c => c.slug)
})

/**
 * Busca todos os slugs de artigos para generateStaticParams
 */
export const getAllArticleSlugs = cache(async (): Promise<{ category: string; article: string }[]> => {
  const articles = await prisma.helpArticle.findMany({
    where: { isActive: true },
    include: {
      category: {
        select: { slug: true, isActive: true }
      }
    }
  })

  return articles
    .filter(a => a.category.isActive)
    .map(a => ({
      category: a.category.slug,
      article: a.slug,
    }))
})
