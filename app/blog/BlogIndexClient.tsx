'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowRight, BookOpen, ChevronDown, Clock, Loader2, Search } from 'lucide-react'

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

const fmtDate = (iso: string, opts?: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...opts,
  })

export default function BlogIndexClient({
  posts: initialPosts,
  categories,
  featuredPosts,
}: Props) {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [posts, setPosts] = useState(initialPosts)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialPosts.length >= 24)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredPosts = activeCategory
    ? posts.filter((p) => p.categories.some((c) => c.id === activeCategory))
    : posts

  const handleSearch = useCallback(
    async (query: string) => {
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
        /* silent */
      } finally {
        setSearching(false)
      }
    },
    [initialPosts],
  )

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const params = new URLSearchParams({ page: String(nextPage), limit: '12' })
      if (search.trim()) params.set('search', search)
      const res = await fetch(`/api/blog?${params}`)
      if (res.ok) {
        const data = await res.json()
        setPosts((prev) => [...prev, ...data.posts])
        setPage(nextPage)
        setHasMore(nextPage < data.pagination.totalPages)
      }
    } catch {
      /* silent */
    } finally {
      setLoadingMore(false)
    }
  }

  const showFeatured = featuredPosts.length > 0 && !search && !activeCategory
  const heroPost = showFeatured ? featuredPosts[0] : null
  const sideFeatured = showFeatured ? featuredPosts.slice(1, 4) : []

  return (
    <div className="bg-paper">
      {/* HERO editorial */}
      <section className="relative bg-paper-warm overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-bolsa-secondary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 -left-32 w-[28rem] h-[28rem] rounded-full bg-bolsa-primary/10 blur-3xl"
        />
        <div className="container mx-auto px-4 pt-24 pb-12 md:pt-28 md:pb-16 relative">
          <div className="max-w-4xl">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 inline-flex items-center gap-3 mb-5">
              <span className="h-px w-8 bg-ink-300" />
              Editorial · Bolsa Click
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-[64px] font-semibold text-ink-900 leading-[1.05] mb-4">
              O blog{' '}
              <span className="italic text-ink-700">do estudante.</span>
            </h1>
            <p className="text-ink-500 text-base md:text-lg max-w-2xl leading-relaxed">
              Guias práticos sobre bolsas de estudo, ENEM, vestibular, escolha de curso e
              carreira — escritos por quem entende do assunto.
            </p>

            {/* Search */}
            <div className="mt-8 max-w-md">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Buscar artigos…"
                  className="w-full pl-11 pr-11 py-3 bg-white border border-hairline text-ink-900 placeholder:text-ink-300 rounded-full text-[14px] focus:outline-none focus:border-ink-900 focus:ring-2 focus:ring-bolsa-secondary/15 transition-colors"
                />
                {searching && (
                  <Loader2
                    size={14}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-bolsa-secondary animate-spin"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* FEATURED — GE-style overlay (1 hero + 2 cards empilhados) */}
      {showFeatured && heroPost && (
        <section className="container mx-auto px-4 py-14 md:py-16">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              Em destaque
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              ({String(featuredPosts.length).padStart(2, '0')})
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-1.5 lg:h-[520px]">
            {/* Hero post */}
            <article className="lg:col-span-7 group relative overflow-hidden">
              <Link
                href={`/blog/${heroPost.slug}`}
                className="block relative aspect-[16/10] lg:aspect-auto lg:h-full"
              >
                {heroPost.featuredImage ? (
                  <Image
                    src={heroPost.featuredImage}
                    alt={heroPost.imageAlt || heroPost.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-paper-warm flex items-center justify-center">
                    <BookOpen size={48} className="text-ink-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-3 font-mono text-[10px] tracking-[0.22em] uppercase text-white/65">
                    {heroPost.categories[0] && (
                      <>
                        <span>{heroPost.categories[0].title}</span>
                        <span className="text-white/35">·</span>
                      </>
                    )}
                    <span className="num-tabular">{fmtDate(heroPost.publishedAt, { month: 'short' })}</span>
                    <span className="text-white/35">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={11} /> {heroPost.readingTime} min
                    </span>
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl lg:text-[36px] text-white leading-[1.05] group-hover:italic transition-all duration-300">
                    {heroPost.title}
                  </h3>
                </div>
              </Link>
            </article>

            {/* Side featured */}
            <div className="lg:col-span-5 flex flex-col gap-1.5">
              {sideFeatured.map((post) => (
                <article key={post.id} className="group relative flex-1 overflow-hidden">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block relative aspect-[16/7] lg:aspect-auto lg:h-full"
                  >
                    {post.featuredImage ? (
                      <Image
                        src={post.featuredImage}
                        alt={post.imageAlt || post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        sizes="(min-width: 1024px) 40vw, 100vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-paper-warm flex items-center justify-center">
                        <BookOpen size={24} className="text-ink-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                      <div className="flex items-center gap-2 mb-2 font-mono text-[10px] tracking-[0.2em] uppercase text-white/60">
                        {post.categories[0] && (
                          <>
                            <span>{post.categories[0].title}</span>
                            <span className="text-white/35">·</span>
                          </>
                        )}
                        <span className="num-tabular">{post.readingTime} min</span>
                      </div>
                      <h3 className="font-display text-lg md:text-xl text-white leading-snug group-hover:italic transition-all duration-300 line-clamp-2">
                        {post.title}
                      </h3>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LISTA DE POSTS — estilo GE (imagem esquerda + texto direita) */}
      <section className="container mx-auto px-4 pb-16 md:pb-20">
        <div className="flex items-center justify-between hairline-b pb-3 mb-2 mt-8">
          <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
            {search
              ? 'Resultados'
              : activeCategory
                ? categories.find((c) => c.id === activeCategory)?.title ?? 'Categoria'
                : 'Últimas notícias'}
          </h2>

          <div className="flex items-center gap-3">
            {search && (
              <button
                onClick={() => handleSearch('')}
                className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink-400 hover:text-bolsa-primary transition-colors"
              >
                Limpar ×
              </button>
            )}

            {categories.length > 0 && !search && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-1 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-400 hover:text-ink-900 transition-colors"
                >
                  {activeCategory ? (
                    <span
                      className="text-bolsa-primary cursor-pointer mr-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveCategory(null)
                        setDropdownOpen(false)
                      }}
                    >
                      ×
                    </span>
                  ) : null}
                  Categoria
                  <ChevronDown
                    size={11}
                    className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-hairline rounded-xl shadow-[0_8px_32px_-8px_rgba(11,31,60,0.14)] py-1.5 min-w-[200px] max-h-72 overflow-y-auto">
                    <button
                      onClick={() => { setActiveCategory(null); setDropdownOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${
                        !activeCategory ? 'text-ink-900 font-semibold' : 'text-ink-500 hover:text-ink-900'
                      }`}
                    >
                      Todas as categorias
                    </button>
                    <div className="my-1 border-t border-hairline" />
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { setActiveCategory(cat.id === activeCategory ? null : cat.id); setDropdownOpen(false) }}
                        className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${
                          activeCategory === cat.id ? 'text-ink-900 font-semibold' : 'text-ink-500 hover:text-ink-900'
                        }`}
                      >
                        {cat.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-ink-500 text-[15px] mb-4">
              {search
                ? 'Nenhum artigo encontrado. Tente outras palavras-chave.'
                : 'Ainda não há artigos nessa categoria.'}
            </p>
            {search && (
              <button
                onClick={() => handleSearch('')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-900 text-white font-semibold rounded-full text-[13px] hover:bg-bolsa-secondary transition-colors"
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          <>
            <ul className="divide-y divide-hairline">
              {filteredPosts.map((post) => (
                <li key={post.id} className="group">
                  <Link href={`/blog/${post.slug}`} className="flex gap-5 md:gap-7 py-6">
                    {/* Imagem */}
                    <div className="relative w-28 h-20 md:w-52 md:h-36 flex-shrink-0 overflow-hidden bg-paper-warm">
                      {post.featuredImage ? (
                        <Image
                          src={post.featuredImage}
                          alt={post.imageAlt || post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          sizes="(min-width: 768px) 210px, 112px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen size={24} className="text-ink-300" />
                        </div>
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex flex-col flex-1 min-w-0">
                      {post.categories[0] && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            router.push(`/blog/categoria/${post.categories[0].slug}`)
                          }}
                          className="font-mono text-[10px] tracking-[0.22em] uppercase text-bolsa-primary mb-2 text-left hover:underline w-fit"
                        >
                          {post.categories[0].title}
                        </button>
                      )}

                      <h3 className="font-display text-lg md:text-xl lg:text-2xl text-ink-900 leading-snug mb-2 group-hover:text-bolsa-secondary transition-colors line-clamp-3">
                        {post.title}
                      </h3>

                      <p className="text-ink-500 text-[14px] leading-relaxed line-clamp-2 hidden md:block mb-3">
                        {post.excerpt}
                      </p>

                      <div className="mt-auto flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-400">
                        <span className="num-tabular">{fmtDate(post.publishedAt, { month: 'short' })}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={10} /> {post.readingTime} min
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {hasMore && !activeCategory && (
              <div className="text-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-hairline text-ink-700 font-semibold text-[13px] hover:border-ink-400 hover:text-ink-900 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Carregando…
                    </>
                  ) : (
                    <>
                      Ver mais artigos
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA FINAL */}
      <section className="bg-bolsa-primary py-14 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/60 inline-flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-white/30" />
              Próximo passo
            </span>
            <h2 className="font-display text-3xl md:text-[40px] font-semibold text-white leading-tight mb-4">
              Encontre sua bolsa{' '}
              <span className="italic text-white/85">depois da leitura.</span>
            </h2>
            <p className="text-white/75 text-[15px] md:text-base leading-relaxed mb-8 max-w-xl mx-auto">
              Bolsas de até 80% nas maiores redes de ensino do país. Sem ENEM, cadastro grátis.
            </p>
            <Link
              href="/cursos"
              className="inline-flex items-center gap-3 px-8 py-4 bg-bolsa-secondary text-white font-semibold rounded-full text-[15px] hover:bg-bolsa-secondary/90 transition-colors shadow-lg shadow-bolsa-secondary/30"
            >
              Buscar bolsas de estudo
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
