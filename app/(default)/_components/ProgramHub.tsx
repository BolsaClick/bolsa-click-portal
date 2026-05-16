import { ReactNode } from 'react'
import Link from 'next/link'
import { VisibleFaq } from '@/app/cursos/[slug]/_seo/CourseSeoSections'

const SITE_URL = 'https://www.bolsaclick.com.br'

interface FaqItem {
  question: string
  answer: string
}

interface ProgramHubProps {
  slug: string
  title: string
  h1: string
  lede: string
  faqItems: FaqItem[]
  articleSummary: string
  datePublished: string
  dateModified: string
  children: ReactNode
}

export function ProgramHub({
  slug,
  title,
  h1,
  lede,
  faqItems,
  articleSummary,
  datePublished,
  dateModified,
  children,
}: ProgramHubProps) {
  const pageUrl = `${SITE_URL}/${slug}`

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: title, item: pageUrl },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: h1,
    description: articleSummary,
    author: { '@type': 'Organization', name: 'Bolsa Click', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Bolsa Click',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/assets/logo-bolsa-click-rosa.png`,
      },
    },
    datePublished,
    dateModified,
    mainEntityOfPage: pageUrl,
    url: pageUrl,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, faqSchema, articleSchema]),
        }}
      />

      <header className="bg-paper border-b border-hairline py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <nav
            className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500 mb-4"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-ink-900">Início</Link>
            <span className="mx-2">/</span>
            <span className="text-ink-700">{title}</span>
          </nav>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-ink-900 mb-6">
            {h1}
          </h1>
          <p className="text-lg md:text-xl text-ink-700 max-w-3xl">{lede}</p>
        </div>
      </header>

      <article className="bg-white py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral prose-headings:font-display prose-h2:text-3xl prose-h2:font-semibold prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3 prose-p:text-ink-700 prose-p:leading-relaxed prose-a:text-bolsa-secondary">
          {children}
        </div>
      </article>

      <VisibleFaq
        items={faqItems}
        heading="Perguntas frequentes"
      />

      <section className="bg-paper py-12 md:py-16 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-6">
            Outros programas e atalhos
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-hairline">
            {[
              { slug: 'enem', label: 'ENEM' },
              { slug: 'prouni', label: 'PROUNI' },
              { slug: 'sisu', label: 'SISU' },
              { slug: 'fies', label: 'FIES' },
              { slug: 'encceja', label: 'ENCCEJA' },
            ]
              .filter(l => l.slug !== slug)
              .map(l => (
                <li key={l.slug} className="bg-paper">
                  <Link
                    href={`/${l.slug}`}
                    className="block px-5 py-4 transition-colors hover:bg-white font-display text-lg text-ink-900"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            <li className="bg-paper">
              <Link
                href="/bolsas-de-estudo"
                className="block px-5 py-4 transition-colors hover:bg-white font-display text-lg text-bolsa-secondary"
              >
                Ver bolsas no Bolsa Click →
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </>
  )
}
