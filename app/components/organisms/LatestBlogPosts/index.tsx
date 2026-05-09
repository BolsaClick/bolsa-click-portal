'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, BookOpen } from 'lucide-react'

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

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

export default function LatestBlogPosts({ posts }: Props) {
  if (posts.length === 0) return null

  const [hero, ...rest] = posts
  const secondary = rest.slice(0, 2)

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16 hairline-b pb-8">
          <div className="md:col-span-7">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-ink-300" />
              Editorial · Bolsa Click
            </span>
            <h2 className="font-display display-tight text-4xl md:text-5xl text-ink-900 leading-[1.05]">
              Histórias e <span className="italic text-ink-700">guias práticos</span>
            </h2>
          </div>
          <div className="md:col-span-4 md:col-start-9 md:self-end">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-3 font-mono text-[12px] tracking-[0.22em] uppercase text-ink-900 border-b-2 border-ink-900 pb-1 hover:text-bolsa-secondary hover:border-bolsa-secondary transition-colors"
            >
              Ver todas as edições
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        {/* Magazine layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14">
          {/* Hero post */}
          <article className="lg:col-span-7 group">
            <Link href={`/blog/${hero.slug}`} className="flex flex-col">
              <div className="relative aspect-[16/10] mb-6 overflow-hidden bg-paper-warm">
                {hero.featuredImage ? (
                  <Image
                    src={hero.featuredImage}
                    alt={hero.imageAlt || hero.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={48} className="text-ink-300" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mb-4 font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
                {hero.categories[0] && <span>{hero.categories[0].title}</span>}
                {hero.categories[0] && <span className="text-ink-300">·</span>}
                <span className="num-tabular">{fmtDate(hero.publishedAt)}</span>
                <span className="text-ink-300">·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={11} /> {hero.readingTime} min
                </span>
              </div>

              <h3 className="font-display display-tight text-3xl md:text-4xl text-ink-900 leading-[1.1] mb-4 group-hover:italic transition-all duration-300">
                {hero.title}
              </h3>
              <p className="text-ink-500 leading-relaxed text-[15px] line-clamp-3">
                {hero.excerpt}
              </p>
            </Link>
          </article>

          {/* Secondary posts */}
          <div className="lg:col-span-5 flex flex-col divide-y divide-hairline">
            {secondary.map((post) => (
              <article key={post.slug} className="group py-6 first:pt-0 last:pb-0">
                <Link href={`/blog/${post.slug}`} className="flex gap-5">
                  <div className="relative w-28 h-28 md:w-32 md:h-32 flex-shrink-0 overflow-hidden bg-paper-warm">
                    {post.featuredImage ? (
                      <Image
                        src={post.featuredImage}
                        alt={post.imageAlt || post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={24} className="text-ink-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">
                      {post.categories[0] && <span>{post.categories[0].title}</span>}
                      {post.categories[0] && <span className="text-ink-300">·</span>}
                      <span className="num-tabular">{post.readingTime} min</span>
                    </div>
                    <h3 className="font-display text-lg md:text-xl text-ink-900 leading-snug group-hover:italic transition-all duration-300 line-clamp-3">
                      {post.title}
                    </h3>
                    <span className="mt-auto pt-2 font-mono num-tabular text-[10px] tracking-[0.2em] uppercase text-ink-300">
                      {fmtDate(post.publishedAt)}
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
