import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/app/lib/prisma'
import CategoryPageClient from './CategoryPageClient'
import Breadcrumb from '@/app/components/atoms/Breadcrumb'

type Props = {
  params: Promise<{ slug: string }>
}

export const revalidate = 3600

async function getCategoryBySlug(slug: string) {
  try {
    return await prisma.blogCategory.findUnique({
      where: { slug, isActive: true },
    })
  } catch {
    return null
  }
}

async function getCategoryPosts(categoryId: string) {
  try {
    return await prisma.blogPost.findMany({
      where: {
        categories: { some: { id: categoryId } },
        isActive: true,
        publishedAt: { not: null },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        featuredImage: true,
        imageAlt: true,
        author: true,
        readingTime: true,
        tags: true,
        publishedAt: true,
        categories: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { publishedAt: 'desc' },
    })
  } catch {
    return []
  }
}

export async function generateStaticParams() {
  try {
    const categories = await prisma.blogCategory.findMany({
      where: { isActive: true },
      select: { slug: true },
    })
    return categories.map(c => ({ slug: c.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    return { title: 'Categoria não encontrada' }
  }

  const title = category.metaTitle || `${category.title} - Blog Bolsa Click`
  const description = category.metaDescription || `Artigos sobre ${category.title.toLowerCase()}. ${category.description}`

  return {
    title,
    description,
    robots: 'index, follow',
    alternates: {
      canonical: `https://www.bolsaclick.com.br/blog/categoria/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.bolsaclick.com.br/blog/categoria/${slug}`,
      siteName: 'Bolsa Click',
      locale: 'pt_BR',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      site: '@bolsaclick',
      title,
      description,
    },
  }
}

export default async function BlogCategoryPage({ params }: Props) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const [posts, otherCategories] = await Promise.all([
    getCategoryPosts(category.id),
    prisma.blogCategory.findMany({
      where: { isActive: true, slug: { not: slug } },
      select: { slug: true, title: true },
      orderBy: { order: 'asc' },
      take: 5,
    }).catch(() => []),
  ])

  const jsonLdSchemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: category.title,
      description: category.description,
      url: `https://www.bolsaclick.com.br/blog/categoria/${slug}`,
      isPartOf: {
        '@type': 'Blog',
        name: 'Blog Bolsa Click',
        url: 'https://www.bolsaclick.com.br/blog',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Bolsa Click',
        url: 'https://www.bolsaclick.com.br',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bolsaclick.com.br' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.bolsaclick.com.br/blog' },
        { '@type': 'ListItem', position: 3, name: category.title, item: `https://www.bolsaclick.com.br/blog/categoria/${slug}` },
      ],
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas) }}
      />
      <div className="container mx-auto px-4 pt-20 pb-2 hidden md:block">
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: category.title },
        ]} />
      </div>
      <CategoryPageClient
        category={category}
        posts={JSON.parse(JSON.stringify(posts))}
        otherCategories={otherCategories}
      />
    </>
  )
}
