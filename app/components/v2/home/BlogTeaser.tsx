/**
 * BlogTeaser — "Guias e histórias" na home v3 (peça de SEO).
 *
 * Versão v2 própria (o organismo original LatestBlogPosts segue intocado);
 * o shape dos posts espelha o prisma.blogPost.findMany usado na home real.
 * Sem posts (falha de fetch no preview): placeholders CLARAMENTE estruturais
 * ("Título do artigo") — nunca um artigo fake que pareça real.
 */

import { BookOpen, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import Mascot from '../mascot/Mascot'

export interface BlogTeaserPost {
  slug: string
  title: string
  featuredImage: string | null
  imageAlt: string | null
  readingTime: number
  publishedAt: string
  category: string | null
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

function PlaceholderCard() {
  return (
    <div aria-hidden="true" className="flex h-full flex-col overflow-hidden rounded-2xl border border-dashed border-ink-300/60 bg-white">
      <div className="flex aspect-[16/10] items-center justify-center bg-paper-warm">
        <BookOpen size={32} className="text-ink-300" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-300">
          Categoria
        </p>
        <p className="mt-1.5 text-[15px] font-bold leading-snug text-ink-300">Título do artigo</p>
        <p className="mt-auto pt-3 text-[11px] text-ink-300">— min de leitura</p>
      </div>
    </div>
  )
}

export default function BlogTeaser({ posts }: { posts: BlogTeaserPost[] }) {
  const usePlaceholders = posts.length === 0

  return (
    <section aria-labelledby="blog-titulo" className="border-y border-ink-100 bg-white">
      <div className="mx-auto w-full max-w-screen-lg px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-bolsa-secondary">
                Blog do Bolsa Click
              </p>
              <h2 id="blog-titulo" className="mt-1 font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
                Guias e histórias
              </h2>
              <p className="mt-1 text-[13px] text-ink-500">
                Prouni, ENEM, EAD e vida de calouro — sem juridiquês.
              </p>
            </div>
            <Mascot pose="lendo" size={104} className="hidden shrink-0 sm:block" />
          </div>
          <Link
            href="/blog"
            className="flex min-h-[44px] shrink-0 items-center text-[14px] font-bold text-bolsa-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolsa-primary"
          >
            Ver todos os artigos →
          </Link>
        </div>

        <div className="-mx-4 mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0 [scrollbar-width:thin]">
          {usePlaceholders
            ? Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="w-[260px] shrink-0 snap-start lg:w-auto">
                  <PlaceholderCard />
                </div>
              ))
            : posts.slice(0, 4).map((post) => (
                <a
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white transition-shadow hover:shadow-[0_12px_28px_-14px_rgba(2,62,115,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolsa-primary lg:w-auto"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-paper-warm">
                    {post.featuredImage ? (
                      <Image
                        src={post.featuredImage}
                        alt={post.imageAlt || post.title}
                        fill
                        sizes="(min-width: 1024px) 25vw, 260px"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <BookOpen size={32} className="text-ink-300" aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    {post.category && (
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-bolsa-secondary">
                        {post.category}
                      </p>
                    )}
                    <h3 className="mt-1.5 text-[15px] font-bold leading-snug text-ink-900 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="mt-auto flex items-center gap-2 pt-3 text-[11px] text-ink-500">
                      <Clock size={11} aria-hidden />
                      {post.readingTime} min · {fmtDate(post.publishedAt)}
                    </p>
                  </div>
                </a>
              ))}
        </div>

        {usePlaceholders && (
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-300">
            dev: posts reais indisponíveis neste render — placeholders estruturais
          </p>
        )}
      </div>
    </section>
  )
}
