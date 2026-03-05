import { Metadata } from 'next'
import { prisma } from '@/app/lib/prisma'
import BlogIndexClient from './BlogIndexClient'
import Breadcrumb from '@/app/components/atoms/Breadcrumb'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Blog Bolsa Click - Dicas de Bolsas de Estudo, ENEM, Vestibular e Carreira',
  description: 'Artigos sobre bolsas de estudo, ENEM, vestibular, carreira, faculdades e dicas para conseguir sua bolsa com até 80% de desconto. Conteúdo atualizado pela equipe Bolsa Click.',
  keywords: [
    'blog bolsa de estudo',
    'dicas enem',
    'bolsa faculdade',
    'como conseguir bolsa de estudo',
    'vestibular',
    'graduação com desconto',
    'faculdade barata',
    'prouni',
    'fies',
    'carreira',
    'educação',
  ],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/blog',
  },
  openGraph: {
    title: 'Blog Bolsa Click - Tudo sobre Bolsas de Estudo',
    description: 'Dicas, guias e artigos sobre bolsas de estudo, ENEM, vestibular e carreira. Encontre seu caminho para a faculdade com desconto.',
    url: 'https://www.bolsaclick.com.br/blog',
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bolsaclick',
    title: 'Blog Bolsa Click - Tudo sobre Bolsas de Estudo',
    description: 'Dicas, guias e artigos sobre bolsas de estudo, ENEM, vestibular e carreira.',
  },
}

async function getBlogData() {
  try {
    const [posts, categories, featuredPosts] = await Promise.all([
      prisma.blogPost.findMany({
        where: { isActive: true, publishedAt: { not: null } },
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
          featured: true,
          publishedAt: true,
          categories: { select: { id: true, title: true, slug: true } },
        },
        orderBy: { publishedAt: 'desc' },
        take: 24,
      }),
      prisma.blogCategory.findMany({
        where: { isActive: true },
        select: { id: true, slug: true, title: true },
        orderBy: { order: 'asc' },
      }),
      prisma.blogPost.findMany({
        where: { isActive: true, publishedAt: { not: null }, featured: true },
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          featuredImage: true,
          imageAlt: true,
          author: true,
          readingTime: true,
          publishedAt: true,
          categories: { select: { title: true, slug: true } },
        },
        orderBy: { publishedAt: 'desc' },
        take: 3,
      }),
    ])

    return { posts, categories, featuredPosts }
  } catch (error) {
    console.error('Error fetching blog data:', error)
    return { posts: [], categories: [], featuredPosts: [] }
  }
}

export default async function BlogPage() {
  const { posts, categories, featuredPosts } = await getBlogData()

  const jsonLdSchemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Blog Bolsa Click',
      description: 'Artigos sobre bolsas de estudo, ENEM, vestibular, carreira e faculdades.',
      url: 'https://www.bolsaclick.com.br/blog',
      publisher: {
        '@type': 'Organization',
        name: 'Bolsa Click',
        url: 'https://www.bolsaclick.com.br',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.bolsaclick.com.br/assets/logo-bolsa-click-rosa.png',
        },
      },
      blogPost: posts.slice(0, 10).map(post => ({
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        url: `https://www.bolsaclick.com.br/blog/${post.slug}`,
        datePublished: post.publishedAt,
        author: {
          '@type': 'Person',
          name: post.author,
        },
        ...(post.featuredImage ? { image: post.featuredImage } : {}),
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bolsaclick.com.br' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.bolsaclick.com.br/blog' },
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
          { label: 'Blog' },
        ]} />
      </div>
      <BlogIndexClient
        posts={JSON.parse(JSON.stringify(posts))}
        categories={categories}
        featuredPosts={JSON.parse(JSON.stringify(featuredPosts))}
      />
    </>
  )
}
