'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, Calendar, User, Tag, ArrowRight, BookOpen, GraduationCap, Building2, RefreshCw } from 'lucide-react'
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
  { label: 'Todas as Faculdades', href: '/faculdades', icon: Building2 },
  { label: 'Todos os Cursos', href: '/cursos', icon: BookOpen },
]

export default function BlogPostClient({ post, relatedPosts, tocItems, hasBeenUpdated }: Props) {
  const postUrl = `https://www.bolsaclick.com.br/blog/${post.slug}`

  return (
    <div className="min-h-screen bg-white">
      <ReadingProgress />

      {/* Article Header */}
      <header className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white pt-24 md:pt-28 pb-10 md:pb-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.categories.map(cat => (
              <Link
                key={cat.slug}
                href={`/blog/categoria/${cat.slug}`}
                className="inline-block bg-bolsa-primary text-white text-xs font-semibold px-3 py-1 rounded-full hover:bg-pink-600 transition"
              >
                {cat.title}
              </Link>
            ))}
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>

          <p className="text-lg text-blue-200 mb-6">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-blue-300">
            <span className="flex items-center gap-1.5">
              <User size={14} />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {new Date(post.publishedAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {post.readingTime} min de leitura
            </span>
            {hasBeenUpdated && (
              <span className="flex items-center gap-1.5 text-blue-400">
                <RefreshCw size={14} />
                Atualizado em {new Date(post.updatedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="container mx-auto px-4 -mt-6 relative z-10 max-w-4xl">
          <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl">
            <Image
              src={post.featuredImage}
              alt={post.imageAlt || post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Content + Sidebar */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10 max-w-6xl mx-auto">
          {/* Main Content */}
          <article className="flex-1 min-w-0 max-w-4xl">
            {/* Mobile TOC */}
            {tocItems.length > 0 && (
              <div className="mb-8 lg:hidden">
                <TableOfContents items={tocItems} />
              </div>
            )}

            <div
              className="prose prose-lg max-w-none
                prose-headings:text-blue-950 prose-headings:font-bold prose-headings:scroll-mt-4
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-bolsa-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                prose-strong:text-blue-950
                prose-ul:my-4 prose-ol:my-4
                prose-li:text-gray-700 prose-li:mb-1
                prose-blockquote:border-bolsa-primary prose-blockquote:bg-pink-50 prose-blockquote:py-1 prose-blockquote:rounded-r-lg
                prose-img:rounded-xl prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags + Share */}
            <div className="mt-10 pt-6 border-t border-gray-200 space-y-4">
              {post.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={16} className="text-gray-400" />
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <ShareButtons url={postUrl} title={post.title} />
            </div>

            {/* Author Box */}
            <div className="mt-8 p-6 bg-blue-50 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-bolsa-primary flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-blue-950">{post.author}</p>
                  <p className="text-sm text-gray-600">
                    Equipe de conteúdo do Bolsa Click. Especialistas em educação superior e bolsas de estudo no Brasil.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
            {/* Desktop TOC */}
            {tocItems.length > 0 && (
              <div className="hidden lg:block sticky top-28">
                <TableOfContents items={tocItems} />
              </div>
            )}

            {/* CTA Box */}
            <div className="bg-gradient-to-br from-bolsa-primary to-pink-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Encontre sua bolsa!</h3>
              <p className="text-sm text-pink-100 mb-4">
                Bolsas de até 80% de desconto. Inscrição 100% gratuita.
              </p>
              <Link
                href="/cursos"
                className="inline-flex items-center gap-2 bg-white text-bolsa-primary font-bold text-sm px-5 py-2.5 rounded-full hover:shadow-lg transition-all"
              >
                Buscar Bolsas
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Internal Links */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-bold text-blue-950 mb-4">Explore mais</h3>
              <nav aria-label="Links internos">
                <ul className="space-y-2">
                  {sidebarLinks.map(link => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-bolsa-primary transition-colors py-1"
                      >
                        <link.icon size={14} className="flex-shrink-0" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-slate-50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-blue-950 mb-6">
              Artigos Relacionados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedPosts.map(related => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="relative h-36 bg-gray-100">
                    {related.featuredImage ? (
                      <Image
                        src={related.featuredImage}
                        alt={related.imageAlt || related.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={24} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-blue-950 text-sm line-clamp-2 group-hover:text-bolsa-primary transition-colors">
                      {related.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                      <Clock size={12} />
                      {related.readingTime} min
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="bg-gradient-to-r from-bolsa-primary to-pink-600 py-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Pronto para garantir sua bolsa de estudo?
          </h2>
          <p className="text-pink-100 mb-6">
            Compare preços e encontre a melhor bolsa para você.
          </p>
          <Link
            href="/cursos"
            className="inline-flex items-center gap-2 bg-white text-bolsa-primary font-bold px-8 py-3 rounded-full hover:shadow-lg transition-all hover:scale-105"
          >
            Ver Bolsas Disponíveis
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
