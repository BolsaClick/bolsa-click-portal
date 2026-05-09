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
        icon={renderIcon(category.icon, 24)}
      />

      <section className="bg-paper py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
              <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
                Artigos da categoria
              </h2>
              <span className="font-mono num-tabular text-[11px] text-ink-500">
                ({String(category.articles.length).padStart(2, '0')})
              </span>
            </div>

            <ul className="grid gap-4 md:gap-5 md:grid-cols-2">
              {category.articles.map((article) => (
                <li key={article.slug}>
                  <HelpArticleCard
                    title={article.title}
                    description={article.description}
                    href={`/central-de-ajuda/${category.slug}/${article.slug}`}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
