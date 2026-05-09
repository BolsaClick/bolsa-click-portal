import { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'
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
      {/* Hero compacto */}
      <section className="relative bg-bolsa-primary overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-32 w-[28rem] h-[28rem] rounded-full bg-bolsa-secondary/20 blur-3xl"
        />
        <div className="container mx-auto px-4 pt-16 pb-12 md:pt-20 md:pb-14 relative">
          <div className="max-w-3xl mx-auto">
            <nav className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-white/60 mb-6">
              <Link href="/central-de-ajuda" className="hover:text-white transition-colors">
                Central de ajuda
              </Link>
              <span aria-hidden="true">/</span>
              <Link href={categoryHref} className="hover:text-white transition-colors">
                {category}
              </Link>
            </nav>

            <h1 className="font-display text-3xl md:text-[40px] lg:text-[48px] font-semibold text-white leading-[1.05] mb-4">
              {title}
            </h1>

            {lastUpdated && (
              <p className="inline-flex items-center gap-2 text-white/60 font-mono text-[11px] tracking-[0.18em] uppercase">
                <Clock size={12} />
                Atualizado em {lastUpdated}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="bg-paper py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link
              href={categoryHref}
              className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase text-ink-500 hover:text-ink-900 transition-colors mb-8"
            >
              <ArrowLeft size={14} />
              Voltar para {category}
            </Link>

            <article className="bg-white border border-hairline rounded-2xl p-7 md:p-12 shadow-[0_30px_60px_-40px_rgba(11,31,60,0.18)]">
              <div
                className="prose prose-lg max-w-none
                  prose-headings:font-display prose-headings:font-semibold prose-headings:text-ink-900 prose-headings:tracking-tight
                  prose-h2:text-2xl prose-h2:md:text-[28px] prose-h2:mt-10 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-ink-700 prose-p:leading-relaxed prose-p:text-[16px]
                  prose-a:text-bolsa-secondary prose-a:no-underline prose-a:font-medium hover:prose-a:underline
                  prose-strong:text-ink-900 prose-strong:font-semibold
                  prose-li:text-ink-700 prose-li:leading-relaxed
                  prose-ul:my-5 prose-ol:my-5
                  prose-blockquote:border-l-2 prose-blockquote:border-bolsa-secondary prose-blockquote:bg-paper-warm prose-blockquote:py-1 prose-blockquote:px-5 prose-blockquote:not-italic prose-blockquote:font-display prose-blockquote:text-ink-900
                  prose-code:bg-paper-warm prose-code:text-ink-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[14px] prose-code:font-mono prose-code:font-normal
                  prose-hr:border-hairline prose-hr:my-10"
              >
                {children}
              </div>
            </article>

            <div className="mt-12">
              <ContactCTA />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
