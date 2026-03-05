'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, ArrowRight, BookOpen } from 'lucide-react'

interface BlogPostCard {
  slug: string
  title: string
  excerpt: string
  featuredImage: string | null
  imageAlt: string | null
  readingTime: number
  publishedAt: string
  categories: { title: string; slug: string }[]
}

interface Props {
  posts: BlogPostCard[]
}

export default function LatestBlogPosts({ posts }: Props) {
  if (posts.length === 0) return null

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-950">
            Últimas do Blog
          </h2>
          <Link
            href="/blog"
            className="text-bolsa-primary font-medium flex items-center gap-1 hover:gap-2 transition-all text-sm md:text-base"
          >
            Ver todos <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article key={post.slug} className="group h-full">
              <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
                <div className="relative h-48 rounded-xl overflow-hidden mb-4 bg-gray-100 flex-shrink-0">
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

                <div className="flex flex-col flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.categories.map((cat) => (
                      <span
                        key={cat.slug}
                        className="text-xs font-semibold text-bolsa-primary"
                      >
                        {cat.title}
                      </span>
                    ))}
                    <span className="text-gray-300">&middot;</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
                      {post.readingTime} min
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-blue-950 group-hover:text-bolsa-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-2 mt-auto">
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
      </div>
    </section>
  )
}
