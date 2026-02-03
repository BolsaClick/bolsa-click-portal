import { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronRight, Calendar, ArrowLeft } from 'lucide-react'
import { ContactCTA } from './ContactCTA'

interface ArticleLayoutProps {
  children: ReactNode
  category: string
  categoryHref: string
  title: string
  lastUpdated?: string
}

export function ArticleLayout({
  children,
  category,
  categoryHref,
  title,
  lastUpdated,
}: ArticleLayoutProps) {
  return (
    <>
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-bolsa-primary via-blue-800 to-blue-900 pt-28 pb-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="mx-auto max-w-4xl px-4 relative z-10">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-white/70">
            <Link href="/central-de-ajuda" className="hover:text-white transition-colors">
              Central de Ajuda
            </Link>
            <ChevronRight size={14} />
            <Link href={categoryHref} className="hover:text-white transition-colors">
              {category}
            </Link>
          </nav>

          {/* Título */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
            {title}
          </h1>

          {/* Data de atualização */}
          {lastUpdated && (
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Calendar size={14} />
              <span>Atualizado em {lastUpdated}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50 min-h-screen">
        <div className="mx-auto max-w-4xl px-4 py-10">
          {/* Back Link */}
          <Link
            href={categoryHref}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-bolsa-primary transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Voltar para {category}
          </Link>

          {/* Article Content */}
          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
            <div className="prose prose-lg max-w-none prose-headings:text-blue-950 prose-a:text-bolsa-primary prose-a:no-underline hover:prose-a:underline">
              {children}
            </div>
          </article>

          {/* CTA de Contato */}
          <ContactCTA />
        </div>
      </div>
    </>
  )
}
