'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  BookOpen,
  Building2,
  Clock,
  GraduationCap,
  RefreshCw,
  Tag,
  User,
} from 'lucide-react'
import ReadingProgress from '@/app/components/atoms/ReadingProgress'
import TableOfContents, { TocItem } from '@/app/components/atoms/TableOfContents'
import ShareButtons from '@/app/components/atoms/ShareButtons'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  featuredImage: string | null
  imageAlt: string | null
  author: string
  readingTime: number
  tags: string[]
  keywords: string[]
  publishedAt: string
  updatedAt: string
  categories: { id: string; title: string; slug: string }[]
}

interface RelatedPost {
  id: string
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
  post: BlogPost
  relatedPosts: RelatedPost[]
  tocItems: TocItem[]
  hasBeenUpdated: boolean
}

const sidebarLinks = [
  { label: 'Bolsa para Administração', href: '/cursos/administracao', icon: GraduationCap },
  { label: 'Bolsa para Direito', href: '/cursos/direito', icon: GraduationCap },
  { label: 'Bolsa para Enfermagem', href: '/cursos/enfermagem', icon: GraduationCap },
  { label: 'Bolsa para Psicologia', href: '/cursos/psicologia', icon: GraduationCap },
  { label: 'Bolsa para Pedagogia', href: '/cursos/pedagogia', icon: GraduationCap },
  { label: 'Faculdade Anhanguera', href: '/faculdades/anhanguera', icon: Building2 },
  { label: 'Faculdade Unopar', href: '/faculdades/unopar', icon: Building2 },
  { label: 'Todas as faculdades', href: '/faculdades', icon: Building2 },
  { label: 'Todos os cursos', href: '/cursos', icon: BookOpen },
]

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

export default function BlogPostClient({
  post,
  relatedPosts,
  tocItems,
  hasBeenUpdated,
}: Props) {
  const postUrl = `https://www.bolsaclick.com.br/blog/${post.slug}`

  return (
    <div className="bg-paper">
      <ReadingProgress />

      {/* HEADER navy editorial */}
      <header className="relative bg-bolsa-primary overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-32 w-[28rem] h-[28rem] rounded-full bg-bolsa-secondary/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-blue-400/15 blur-3xl"
        />
        <div className="container mx-auto px-4 pt-24 pb-16 md:pt-28 md:pb-20 relative">
          <div className="max-w-4xl mx-auto">
            <nav className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-white/60 mb-6">
              <Link href="/blog" className="hover:text-white transition-colors">
                Blog
              </Link>
              {post.categories[0] && (
                <>
                  <span aria-hidden="true">/</span>
                  <Link
                    href={`/blog/categoria/${post.categories[0].slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {post.categories[0].title}
                  </Link>
                </>
              )}
            </nav>

            <div className="flex flex-wrap gap-2 mb-6">
              {post.categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/blog/categoria/${cat.slug}`}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/90 text-[10px] font-bold tracking-[0.18em] uppercase hover:bg-white hover:text-ink-900 transition-colors"
                >
                  {cat.title}
                </Link>
              ))}
            </div>

            <h1 className="font-display text-3xl md:text-4xl lg:text-[52px] font-semibold text-white leading-[1.05] mb-5">
              {post.title}
            </h1>

            <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-3xl mb-8">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] tracking-[0.18em] uppercase text-white/70">
              <span className="inline-flex items-center gap-1.5">
                <User size={13} />
                {post.author}
              </span>
              <span className="text-white/30">·</span>
              <span className="inline-flex items-center gap-1.5 num-tabular normal-case tracking-normal">
                {fmtDate(post.publishedAt)}
              </span>
              <span className="text-white/30">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={13} />
                {post.readingTime} min
              </span>
              {hasBeenUpdated && (
                <>
                  <span className="text-white/30">·</span>
                  <span className="inline-flex items-center gap-1.5 text-bolsa-secondary">
                    <RefreshCw size={13} />
                    Atualizado em {fmtDate(post.updatedAt)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* IMAGEM destacada */}
      {post.featuredImage && (
        <div className="container mx-auto px-4 -mt-8 md:-mt-10 relative z-10 max-w-4xl">
          <div className="relative w-full aspect-[16/9] md:aspect-[16/8] rounded-2xl overflow-hidden border border-hairline shadow-[0_30px_60px_-30px_rgba(11,31,60,0.35)]">
            <Image
              src={post.featuredImage}
              alt={post.imageAlt || post.title}
              fill
              className="object-cover"
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
            />
          </div>
        </div>
      )}

      {/* CONTEÚDO + SIDEBAR */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
          {/* MAIN CONTENT */}
          <article className="flex-1 min-w-0 lg:max-w-3xl">
            {/* Mobile TOC */}
            {tocItems.length > 0 && (
              <div className="mb-10 lg:hidden">
                <TableOfContents items={tocItems} />
              </div>
            )}

            <div
              className="prose prose-lg max-w-none
                prose-headings:font-display prose-headings:font-semibold prose-headings:text-ink-900 prose-headings:tracking-tight prose-headings:scroll-mt-24
                prose-h2:text-2xl prose-h2:md:text-[30px] prose-h2:mt-12 prose-h2:mb-5 prose-h2:leading-tight
                prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:leading-tight
                prose-p:text-ink-700 prose-p:leading-relaxed prose-p:text-[16px] prose-p:mb-5
                prose-a:text-bolsa-secondary prose-a:no-underline prose-a:font-medium hover:prose-a:underline
                prose-strong:text-ink-900 prose-strong:font-semibold
                prose-li:text-ink-700 prose-li:leading-relaxed prose-li:mb-1.5
                prose-ul:my-6 prose-ol:my-6
                prose-blockquote:border-l-2 prose-blockquote:border-bolsa-secondary prose-blockquote:bg-paper-warm prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:font-display prose-blockquote:text-ink-900 prose-blockquote:rounded-r-lg
                prose-code:bg-paper-warm prose-code:text-ink-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[14px] prose-code:font-mono prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
                prose-img:rounded-2xl prose-img:border prose-img:border-hairline
                prose-hr:border-hairline prose-hr:my-12"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags + Share */}
            <div className="mt-12 pt-8 hairline-t space-y-6">
              {post.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={14} className="text-ink-300" />
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mr-1">
                    Tags
                  </span>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-paper-warm border border-hairline text-ink-700 text-[12px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <ShareButtons url={postUrl} title={post.title} />
            </div>

            {/* Author */}
            <aside className="mt-10 bg-paper-warm border border-hairline rounded-2xl p-6 md:p-7">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 inline-flex items-center gap-2 mb-4">
                <span className="h-px w-6 bg-ink-300" />
                Sobre o autor
              </span>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-ink-900 text-white flex items-center justify-center font-display text-[20px] font-semibold flex-shrink-0">
                  {post.author.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-display text-lg text-ink-900 leading-tight">{post.author}</p>
                  <p className="text-[13px] text-ink-500 mt-1.5 leading-relaxed">
                    Equipe de conteúdo do Bolsa Click. Especialistas em educação superior e bolsas
                    de estudo no Brasil.
                  </p>
                </div>
              </div>
            </aside>
          </article>

          {/* SIDEBAR */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
            {/* Desktop TOC */}
            {tocItems.length > 0 && (
              <div className="hidden lg:block sticky top-24">
                <TableOfContents items={tocItems} />
              </div>
            )}

            {/* CTA editorial */}
            <div className="bg-bolsa-primary rounded-2xl p-6 text-white relative overflow-hidden">
              <div
                aria-hidden="true"
                className="absolute -top-12 -right-10 w-32 h-32 rounded-full bg-bolsa-secondary/30 blur-2xl"
              />
              <div className="relative">
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/60 inline-flex items-center gap-2 mb-3">
                  <span className="h-px w-5 bg-white/30" />
                  Bolsa Click
                </span>
                <h3 className="font-display text-2xl text-white leading-tight mb-2">
                  Encontre sua bolsa{' '}
                  <span className="italic text-white/85">aqui.</span>
                </h3>
                <p className="text-[12px] text-white/70 leading-relaxed mb-5">
                  Até 80% de desconto em mais de 30 mil faculdades. Cadastro grátis, sem ENEM.
                </p>
                <Link
                  href="/cursos"
                  className="group inline-flex items-center gap-2 bg-bolsa-secondary text-white font-semibold text-[13px] px-5 py-2.5 rounded-full hover:bg-bolsa-secondary/90 transition-colors shadow-lg shadow-bolsa-secondary/30"
                >
                  Buscar bolsas
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </div>

            {/* Internal links */}
            <div className="bg-white border border-hairline rounded-2xl p-6">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 inline-flex items-center gap-2 mb-4">
                <span className="h-px w-5 bg-ink-300" />
                Explore mais
              </span>
              <ul className="space-y-1">
                {sidebarLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-3 text-[13px] text-ink-700 hover:text-ink-900 transition-colors py-1.5"
                    >
                      <link.icon size={13} className="text-ink-300 group-hover:text-bolsa-secondary transition-colors flex-shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* RELACIONADOS */}
      {relatedPosts.length > 0 && (
        <section className="bg-white border-t border-hairline py-14 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-baseline justify-between hairline-b pb-3 mb-8">
                <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
                  Artigos relacionados
                </h2>
                <span className="font-mono num-tabular text-[11px] text-ink-500">
                  ({String(relatedPosts.length).padStart(2, '0')})
                </span>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                {relatedPosts.map((related) => (
                  <li key={related.id} className="group">
                    <Link href={`/blog/${related.slug}`} className="flex flex-col h-full">
                      <div className="relative aspect-[4/3] mb-4 overflow-hidden bg-paper-warm">
                        {related.featuredImage ? (
                          <Image
                            src={related.featuredImage}
                            alt={related.imageAlt || related.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                            sizes="(min-width: 1024px) 22vw, 45vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen size={24} className="text-ink-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2 font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">
                        {related.categories[0] && (
                          <>
                            <span>{related.categories[0].title}</span>
                            <span className="text-ink-300">·</span>
                          </>
                        )}
                        <span className="inline-flex items-center gap-1 num-tabular">
                          <Clock size={10} /> {related.readingTime} min
                        </span>
                      </div>
                      <h3 className="font-display text-[18px] text-ink-900 leading-snug group-hover:italic transition-all duration-300 line-clamp-3">
                        {related.title}
                      </h3>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* CTA FINAL */}
      <section className="bg-bolsa-primary py-14 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/60 inline-flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-white/30" />
              Próximo passo
            </span>
            <h2 className="font-display text-3xl md:text-[40px] font-semibold text-white leading-tight mb-4">
              Pronto pra garantir{' '}
              <span className="italic text-white/85">sua bolsa?</span>
            </h2>
            <p className="text-white/75 text-[15px] md:text-base leading-relaxed mb-8 max-w-xl mx-auto">
              Compare ofertas em mais de 30 mil faculdades parceiras. Cadastro grátis, sem ENEM.
            </p>
            <Link
              href="/cursos"
              className="inline-flex items-center gap-3 px-8 py-4 bg-bolsa-secondary text-white font-semibold rounded-full text-[15px] hover:bg-bolsa-secondary/90 transition-colors shadow-lg shadow-bolsa-secondary/30"
            >
              Ver bolsas disponíveis
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
