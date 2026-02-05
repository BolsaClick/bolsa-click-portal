import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { getHelpArticle, getAllArticleSlugs } from '../../_lib/data'

export const revalidate = 3600 // Revalidar a cada 1 hora

interface PageProps {
  params: Promise<{ category: string; article: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs()
  return slugs.map(({ category, article }) => ({ category, article }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug, article: articleSlug } = await params
  const article = await getHelpArticle(categorySlug, articleSlug)

  if (!article) {
    return {
      title: 'Artigo não encontrado | Central de Ajuda',
    }
  }

  return {
    title: article.metaTitle || `${article.title} | Central de Ajuda`,
    description: article.metaDescription || article.description,
    robots: 'index, follow',
    alternates: {
      canonical: `https://www.bolsaclick.com.br/central-de-ajuda/${categorySlug}/${articleSlug}`,
    },
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { category: categorySlug, article: articleSlug } = await params
  const article = await getHelpArticle(categorySlug, articleSlug)

  if (!article) {
    notFound()
  }

  // Formatar data de atualização
  const lastUpdated = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <ArticleLayout
      category={article.category.title}
      categoryHref={`/central-de-ajuda/${article.category.slug}`}
      title={article.title}
      lastUpdated={lastUpdated}
    >
      <div dangerouslySetInnerHTML={{ __html: article.content }} />
    </ArticleLayout>
  )
}
