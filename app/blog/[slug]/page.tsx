import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/app/lib/prisma'
import BlogPostClient from './BlogPostClient'
import Breadcrumb from '@/app/components/atoms/Breadcrumb'

type Props = {
  params: Promise<{ slug: string }>
}

export const revalidate = 3600

function generateHeadingId(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function addHeadingIds(html: string): string {
  return html.replace(
    /<h([2-3])([^>]*)>(.*?)<\/h\1>/gi,
    (_match, level, attrs, content) => {
      const text = content.replace(/<[^>]*>/g, '')
      const id = generateHeadingId(text)
      if (attrs.includes('id=')) return _match
      return `<h${level}${attrs} id="${id}">${content}</h${level}>`
    }
  )
}

function extractTocItems(html: string): { id: string; text: string; level: number }[] {
  const items: { id: string; text: string; level: number }[] = []
  const regex = /<h([2-3])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h\1>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    items.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]*>/g, ''),
    })
  }
  return items
}

async function getPostBySlug(slug: string) {
  try {
    return await prisma.blogPost.findUnique({
      where: { slug, isActive: true, publishedAt: { not: null } },
      include: {
        categories: { select: { id: true, title: true, slug: true } },
      },
    })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
}

async function getRelatedPosts(categoryIds: string[], currentId: string) {
  try {
    return await prisma.blogPost.findMany({
      where: {
        categories: { some: { id: { in: categoryIds } } },
        id: { not: currentId },
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
        readingTime: true,
        publishedAt: true,
        categories: { select: { title: true, slug: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 4,
    })
  } catch {
    return []
  }
}

export async function generateStaticParams() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { isActive: true, publishedAt: { not: null } },
      select: { slug: true },
    })
    return posts.map(p => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return { title: 'Artigo não encontrado' }
  }

  const firstCategory = post.categories[0]
  const title = post.metaTitle || `${post.title} | Blog`
  const description = post.metaDescription || post.excerpt
  const imageUrl = post.featuredImage || 'https://www.bolsaclick.com.br/assets/logo-bolsa-click-rosa.png'

  return {
    title,
    description,
    keywords: post.keywords,
    robots: 'index, follow',
    alternates: {
      canonical: `https://www.bolsaclick.com.br/blog/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.bolsaclick.com.br/blog/${slug}`,
      siteName: 'Bolsa Click',
      locale: 'pt_BR',
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author],
      section: firstCategory?.title,
      tags: post.tags,
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.imageAlt || post.title,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@bolsaclick',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const categoryIds = post.categories.map(c => c.id)
  const relatedPosts = await getRelatedPosts(categoryIds, post.id)

  // Process content: add heading IDs and extract TOC
  const processedContent = addHeadingIds(post.content)
  const tocItems = extractTocItems(processedContent)

  // Check if post was updated after publishing
  const hasBeenUpdated = post.publishedAt
    ? post.updatedAt.getTime() - post.publishedAt.getTime() > 60000
    : false

  // Word count para JSON-LD
  const textContent = post.content.replace(/<[^>]*>/g, '')
  const wordCount = textContent.split(/\s+/).filter(Boolean).length

  const imageUrl = post.featuredImage || undefined
  const firstCategory = post.categories[0]

  const jsonLdSchemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      ...(imageUrl ? { image: imageUrl } : {}),
      datePublished: post.publishedAt?.toISOString(),
      dateModified: post.updatedAt.toISOString(),
      author: {
        '@type': 'Person',
        name: post.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Bolsa Click',
        url: 'https://www.bolsaclick.com.br',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.bolsaclick.com.br/assets/logo-bolsa-click-rosa.png',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://www.bolsaclick.com.br/blog/${slug}`,
      },
      wordCount,
      keywords: post.keywords.join(', '),
      articleSection: post.categories.map(c => c.title).join(', '),
      inLanguage: 'pt-BR',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bolsaclick.com.br' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.bolsaclick.com.br/blog' },
        ...(firstCategory ? [{ '@type': 'ListItem', position: 3, name: firstCategory.title, item: `https://www.bolsaclick.com.br/blog/categoria/${firstCategory.slug}` }] : []),
        { '@type': 'ListItem', position: firstCategory ? 4 : 3, name: post.title, item: `https://www.bolsaclick.com.br/blog/${slug}` },
      ],
    },
  ]

  const serializedPost = JSON.parse(JSON.stringify({
    ...post,
    content: processedContent,
  }))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas) }}
      />
      <div className="container mx-auto px-4 pt-20 pb-2 md:hidden">
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
          ...(firstCategory ? [{ label: firstCategory.title, href: `/blog/categoria/${firstCategory.slug}` }] : []),
          { label: post.title },
        ]} />
      </div>
      <BlogPostClient
        post={serializedPost}
        relatedPosts={JSON.parse(JSON.stringify(relatedPosts))}
        tocItems={tocItems}
        hasBeenUpdated={hasBeenUpdated}
      />
    </>
  )
}
