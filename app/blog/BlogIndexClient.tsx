'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Clock, Calendar, ArrowRight, BookOpen, Search, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

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
  featured: boolean
  publishedAt: string
  categories: { id: string; title: string; slug: string }[]
}

interface BlogCategory {
  id: string
  slug: string
  title: string
}

interface Props {
  posts: BlogPostCard[]
  categories: BlogCategory[]
  featuredPosts: BlogPostCard[]
}

export default function BlogIndexClient({ posts: initialPosts, categories, featuredPosts }: Props) {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [posts, setPosts] = useState(initialPosts)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialPosts.length >= 24)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searching, setSearching] = useState(false)

  const filteredPosts = activeCategory
    ? posts.filter(p => p.categories.some(c => c.id === activeCategory))
    : posts

  const handleSearch = useCallback(async (query: string) => {
    setSearch(query)
    if (!query.trim()) {
      setPosts(initialPosts)
      setPage(1)
      setHasMore(initialPosts.length >= 24)
      return
    }

    setSearching(true)
    try {
      const res = await fetch(`/api/blog?search=${encodeURIComponent(query)}&limit=24`)
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts)
        setHasMore(data.pagination.page < data.pagination.totalPages)
        setPage(1)
      }
    } catch {
      // silent
    } finally {
      setSearching(false)
    }
  }, [initialPosts])

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const params = new URLSearchParams({ page: String(nextPage), limit: '12' })
      if (search.trim()) params.set('search', search)

      const res = await fetch(`/api/blog?${params}`)
      if (res.ok) {
        const data = await res.json()
        setPosts(prev => [...prev, ...data.posts])
        setPage(nextPage)
        setHasMore(nextPage < data.pagination.totalPages)
      }
    } catch {
      // silent
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="min-h-screen pt-24">
      {/* Compact Header with Search */}
      <section className="container mx-auto px-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-950">Blog</h1>
            <p className="text-gray-500 mt-1">
              Dicas sobre bolsas de estudo, ENEM, vestibular e carreira.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar artigos..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:ring-2 focus:ring-bolsa-primary focus:border-transparent text-sm transition-colors"
            />
            {searching && (
              <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-bolsa-primary animate-spin" />
            )}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !activeCategory
                  ? 'bg-bolsa-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-bolsa-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Featured Posts */}
      {featuredPosts.length > 0 && !search && !activeCategory && (
        <section className="container mx-auto px-4 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-4">
            {featuredPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className={`group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all ${
                  index === 0 ? 'md:row-span-2' : ''
                }`}
              >
                <div className={`relative ${index === 0 ? 'h-64 md:h-full min-h-[320px]' : 'h-48 md:h-full min-h-[154px]'}`}>
                  {post.featuredImage ? (
                    <Image
                      src={post.featuredImage}
                      alt={post.imageAlt || post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-bolsa-primary to-pink-600" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {post.categories.map(cat => (
                        <span key={cat.slug} className="inline-block bg-bolsa-primary text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          {cat.title}
                        </span>
                      ))}
                    </div>
                    <h2 className={`font-bold text-white mb-2 group-hover:text-pink-200 transition-colors ${
                      index === 0 ? 'text-xl md:text-2xl' : 'text-base md:text-lg'
                    }`}>
                      {post.title}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {post.readingTime} min de leitura
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(post.publishedAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Posts Grid */}
      <section className="container mx-auto px-4 pb-16">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              {search ? 'Nenhum artigo encontrado para sua busca.' : 'Nenhum artigo encontrado nesta categoria.'}
            </p>
            {search && (
              <button
                onClick={() => handleSearch('')}
                className="text-bolsa-primary font-medium mt-2 hover:underline"
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                  className="group h-full"
                >
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
                        {post.categories.map(cat => (
                          <span
                            key={cat.slug}
                            role="link"
                            tabIndex={0}
                            className="text-xs font-semibold text-bolsa-primary hover:underline cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              router.push(`/blog/categoria/${cat.slug}`)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                e.stopPropagation()
                                router.push(`/blog/categoria/${cat.slug}`)
                              }
                            }}
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

                      <h2 className="text-lg font-bold text-blue-950 group-hover:text-bolsa-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>

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
                </motion.article>
              ))}
            </div>

            {/* Load More */}
            {hasMore && !activeCategory && (
              <div className="text-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-bolsa-primary text-white font-medium rounded-full hover:opacity-90 transition disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    'Carregar mais artigos'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-bolsa-primary to-pink-600 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Encontre sua bolsa de estudo ideal
          </h2>
          <p className="text-pink-100 mb-6 max-w-xl mx-auto">
            Bolsas de até 80% de desconto em mais de 1.000 faculdades. Inscrição 100% gratuita.
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
