'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, ArrowRight, BookOpen, ArrowLeft } from 'lucide-react'

interface BlogPostCard {
  id: string
  slug: string
  title: string
  excerpt: string
  featuredImage: string | null
  imageAlt: string | null
  author: string
  readingTime: number
  tags: string[]
  publishedAt: string
  categories: { id: string; title: string; slug: string }[]
}

interface BlogCategory {
  id: string
  slug: string
  title: string
  description: string
}

interface OtherCategory {
  slug: string
  title: string
}

interface Props {
  category: BlogCategory
  posts: BlogPostCard[]
  otherCategories: OtherCategory[]
}

export default function CategoryPageClient({ category, posts, otherCategories }: Props) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white py-10 md:py-14">
        <div className="container mx-auto px-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-blue-300 hover:text-white transition mb-4"
          >
            <ArrowLeft size={14} />
            Voltar ao Blog
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {category.title}
          </h1>
          <p className="text-lg text-blue-200 max-w-2xl">
            {category.description}
          </p>
          <div className="flex items-center gap-2 text-sm text-blue-300 mt-4">
            <BookOpen size={16} />
            <span>{posts.length} {posts.length === 1 ? 'artigo' : 'artigos'}</span>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="container mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-16 max-w-md mx-auto">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">Nenhum artigo publicado nesta categoria ainda.</p>
            <p className="text-gray-400 text-sm mb-6">
              Estamos preparando conteúdos incríveis sobre {category.title.toLowerCase()}. Enquanto isso, explore outras categorias:
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {otherCategories.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/blog/categoria/${cat.slug}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-bolsa-primary hover:text-white transition"
                >
                  {cat.title}
                </Link>
              ))}
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-bolsa-primary font-medium hover:underline"
            >
              <ArrowLeft size={16} />
              Ver todos os artigos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <article key={post.id} className="group">
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="relative h-48 rounded-xl overflow-hidden mb-4 bg-gray-100">
                    {post.featuredImage ? (
                      <Image
                        src={post.featuredImage}
                        alt={post.imageAlt || post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <BookOpen size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {post.readingTime} min de leitura
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-blue-950 group-hover:text-bolsa-primary transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="text-sm text-gray-600 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(post.publishedAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="text-sm text-bolsa-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Ler mais <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-bolsa-primary to-pink-600 py-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Encontre sua bolsa de estudo ideal
          </h2>
          <p className="text-pink-100 mb-6 max-w-xl mx-auto">
            Bolsas de até 80% de desconto em mais de 1.000 faculdades.
          </p>
          <Link
            href="/cursos"
            className="inline-flex items-center gap-2 bg-white text-bolsa-primary font-bold px-8 py-3 rounded-full hover:shadow-lg transition-all hover:scale-105"
          >
            Buscar Bolsas de Estudo
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
