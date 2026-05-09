'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, BookOpen, Clock } from 'lucide-react'

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

const fmtDate = (iso: string, opts?: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...opts,
  })

export default function CategoryPageClient({ category, posts, otherCategories }: Props) {
  return (
    <div className="bg-paper">
      {/* HERO navy editorial */}
      <section className="relative bg-bolsa-primary overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-32 w-[28rem] h-[28rem] rounded-full bg-bolsa-secondary/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-blue-400/15 blur-3xl"
        />
        <div className="container mx-auto px-4 pt-24 pb-14 md:pt-28 md:pb-16 relative">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-white/60 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft size={12} />
              Voltar ao blog
            </Link>

            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/60 inline-flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-white/30" />
              Categoria
            </span>
            <h1 className="font-display text-3xl md:text-4xl lg:text-[52px] font-semibold text-white leading-[1.05] mb-4">
              {category.title}
            </h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-3xl mb-6">
              {category.description}
            </p>
            <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-white/70">
              <BookOpen size={13} />
              <span className="num-tabular">
                {posts.length} {posts.length === 1 ? 'artigo' : 'artigos'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* GRID DE POSTS */}
      <section className="container mx-auto px-4 py-14 md:py-16">
        {posts.length === 0 ? (
          <div className="bg-white border border-hairline rounded-2xl py-16 px-6 text-center max-w-2xl mx-auto">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 inline-flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-ink-300" />
              Em breve
              <span className="h-px w-8 bg-ink-300" />
            </span>
            <h3 className="font-display text-2xl md:text-3xl text-ink-900 leading-tight mb-3">
              Ainda não há artigos{' '}
              <span className="italic text-ink-700">por aqui.</span>
            </h3>
            <p className="text-ink-500 text-[14px] mb-6 leading-relaxed max-w-md mx-auto">
              Estamos preparando conteúdos incríveis sobre {category.title.toLowerCase()}.
              Enquanto isso, explore outras categorias:
            </p>
            {otherCategories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {otherCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/blog/categoria/${cat.slug}`}
                    className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-paper-warm border border-hairline text-ink-700 text-[12px] font-semibold hover:border-ink-300 hover:text-ink-900 transition-colors"
                  >
                    {cat.title}
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase text-ink-900 hover:text-bolsa-secondary transition-colors"
            >
              <ArrowLeft size={12} />
              Ver todos os artigos
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-baseline justify-between hairline-b pb-3 mb-8 max-w-6xl mx-auto">
              <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
                Artigos em {category.title}
              </h2>
              <span className="font-mono num-tabular text-[11px] text-ink-500">
                ({String(posts.length).padStart(2, '0')})
              </span>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-10 md:gap-y-12 max-w-6xl mx-auto">
              {posts.map((post) => (
                <li key={post.id} className="group">
                  <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
                    <div className="relative aspect-[4/3] mb-4 overflow-hidden bg-paper-warm">
                      {post.featuredImage ? (
                        <Image
                          src={post.featuredImage}
                          alt={post.imageAlt || post.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen size={28} className="text-ink-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3 font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">
                      <span>{category.title}</span>
                      <span className="text-ink-300">·</span>
                      <span className="inline-flex items-center gap-1.5 num-tabular">
                        <Clock size={11} /> {post.readingTime} min
                      </span>
                    </div>

                    <h3 className="font-display text-xl md:text-[22px] text-ink-900 leading-snug mb-3 group-hover:italic transition-all duration-300 line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-ink-500 text-[14px] leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between mt-4 pt-3 hairline-t">
                      <span className="font-mono num-tabular text-[10px] tracking-[0.2em] uppercase text-ink-300">
                        {fmtDate(post.publishedAt, { month: 'short' })}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.2em] uppercase text-ink-700 group-hover:text-bolsa-secondary transition-colors">
                        Ler
                        <ArrowRight
                          size={12}
                          className="transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
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
              Bolsas de até 80% em mais de 30 mil faculdades. Cadastro grátis, sem ENEM.
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
