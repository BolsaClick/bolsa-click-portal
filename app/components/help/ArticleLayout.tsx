import { ReactNode } from 'react'
import Link from 'next/link'
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
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600">
        <Link href="/central-de-ajuda" className="hover:text-[var(--bolsa-primary)]">
          Central de Ajuda
        </Link>
        <span>/</span>
        <Link href={categoryHref} className="hover:text-[var(--bolsa-primary)]">
          {category}
        </Link>
      </nav>

      {/* Título */}
      <h1 className="mb-4 text-3xl font-bold text-[var(--bolsa-black)] md:text-4xl">
        {title}
      </h1>

      {/* Data de atualização */}
      {lastUpdated && (
        <p className="mb-8 text-sm text-gray-500">
          Última atualização: {lastUpdated}
        </p>
      )}

      {/* Conteúdo */}
      <article className="prose prose-lg max-w-none">
        {children}
      </article>

      {/* CTA de Contato */}
      <ContactCTA />
    </div>
  )
}
