import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HelpArticleCard } from '@/app/components/help/HelpArticleCard'
import { HelpCategoryHero } from '@/app/components/help/HelpCategoryHero'
import { getHelpCategoryBySlug, getAllCategorySlugs } from '../_lib/data'
import { renderIcon } from '../_lib/icons'

export const revalidate = 3600 // Revalidar a cada 1 hora

interface PageProps {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllCategorySlugs()
    return slugs.map((category) => ({ category }))
  } catch {
    // Tabela ainda não existe - retorna vazio para build dinâmico
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug } = await params
  const category = await getHelpCategoryBySlug(categorySlug)

  if (!category) {
    return {
      title: 'Categoria não encontrada | Central de Ajuda',
    }
  }

  return {
    title: `${category.title} | Central de Ajuda Bolsa Click`,
    description: category.description,
    robots: 'index, follow',
    alternates: {
      canonical: `https://www.bolsaclick.com.br/central-de-ajuda/${category.slug}`,
    },
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: categorySlug } = await params
  const category = await getHelpCategoryBySlug(categorySlug)

  if (!category) {
    notFound()
  }

  return (
    <>
      <HelpCategoryHero
        title={category.title}
        description={category.description}
        icon={renderIcon(category.icon, 28)}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="grid gap-5 md:grid-cols-2">
            {category.articles.map((article) => (
              <HelpArticleCard
                key={article.slug}
                title={article.title}
                description={article.description}
                href={`/central-de-ajuda/${category.slug}/${article.slug}`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
