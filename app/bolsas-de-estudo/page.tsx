import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/app/lib/prisma'
import { BRAZILIAN_CITIES } from '@/app/lib/constants/brazilian-cities'
import { TOP_CURSOS } from '@/app/cursos/_data/cursos'
import { VisibleFaq } from '@/app/cursos/[slug]/_seo/CourseSeoSections'

const SITE_URL = 'https://www.bolsaclick.com.br'

export const revalidate = 86400 // 24h — conteúdo institucional muda devagar

export const metadata: Metadata = {
  title: 'Bolsas de Estudo - Encontre Faculdade com até 80% de Desconto | Bolsa Click',
  description: `Bolsa Click: ${BRAZILIAN_CITIES.length} cidades cobertas, ${TOP_CURSOS.length}+ cursos de graduação e pós com bolsas de até 80% em faculdades parceiras. Inscrição grátis.`,
  keywords: [
    'bolsa de estudo',
    'bolsas de estudo',
    'faculdade com bolsa',
    'desconto faculdade',
    'mensalidade faculdade',
    'graduação com desconto',
    'bolsa de estudos brasil',
    'bolsa click',
  ],
  alternates: { canonical: `${SITE_URL}/bolsas-de-estudo` },
  openGraph: {
    title: 'Bolsas de Estudo no Brasil — Bolsa Click',
    description: `Encontre cursos de graduação e pós com até 80% de desconto em ${BRAZILIAN_CITIES.length} cidades.`,
    url: `${SITE_URL}/bolsas-de-estudo`,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bolsaclick',
    title: 'Bolsas de Estudo no Brasil — Bolsa Click',
    description: `Encontre cursos com até 80% de desconto em ${BRAZILIAN_CITIES.length} cidades.`,
  },
}

async function getActiveInstitutions() {
  return prisma.institution.findMany({
    where: { isActive: true },
    select: {
      slug: true,
      name: true,
      shortName: true,
      fullName: true,
      mecRating: true,
      modalities: true,
      campusCount: true,
    },
    orderBy: { order: 'asc' },
  })
}

export default async function BolsasDeEstudoHubPage() {
  const institutions = await getActiveInstitutions()

  const pageUrl = `${SITE_URL}/bolsas-de-estudo`

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Bolsas de Estudo', item: pageUrl },
    ],
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Bolsas de Estudo por Cidade no Brasil',
    numberOfItems: BRAZILIAN_CITIES.length,
    itemListElement: BRAZILIAN_CITIES.slice(0, 50).map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `Bolsas em ${c.name}/${c.state}`,
      url: `${SITE_URL}/bolsas-de-estudo/${c.slug}`,
    })),
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bolsa Click',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/cursos?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const faqItems = [
    {
      question: 'O que é o Bolsa Click?',
      answer: 'O Bolsa Click é um marketplace de bolsas de estudo que conecta estudantes a faculdades parceiras com descontos de até 80% na mensalidade. A inscrição é grátis e você pode comparar cursos, valores e modalidades em um só lugar.',
    },
    {
      question: 'Como funcionam as bolsas de estudo?',
      answer: 'As bolsas são descontos negociados pelo Bolsa Click diretamente com as faculdades parceiras. Você escolhe o curso, confirma a oferta, finaliza o cadastro pelo site e vai estudar pagando a mensalidade com desconto durante todo o curso.',
    },
    {
      question: 'O cadastro tem custo?',
      answer: 'Não. A busca, comparação e inscrição pelo Bolsa Click são gratuitas. Você só paga a mensalidade já com bolsa direto pra faculdade.',
    },
    {
      question: 'Quais faculdades estão no Bolsa Click?',
      answer: `Trabalhamos com ${institutions.length} faculdades parceiras com presença nacional, incluindo ${institutions.slice(0, 4).map(i => i.name).join(', ')} e outras. Todas reconhecidas pelo MEC.`,
    },
    {
      question: 'Em quantas cidades vocês têm ofertas?',
      answer: `Temos páginas de bolsas em ${BRAZILIAN_CITIES.length} cidades brasileiras, cobrindo todas as 27 capitais e os maiores municípios. As ofertas dependem das unidades de cada faculdade parceira na região.`,
    },
    {
      question: 'Posso usar PROUNI ou FIES junto com bolsa do Bolsa Click?',
      answer: 'Em geral, programas governamentais (PROUNI, FIES) não acumulam com a bolsa do Bolsa Click — você escolhe o caminho com maior desconto pra você. Nossa equipe ajuda a comparar o custo total na hora da inscrição.',
    },
  ]

  const jsonLd = [breadcrumbSchema, itemListSchema, websiteSchema, {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="bg-paper border-b border-hairline py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <nav
            className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500 mb-4"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-ink-900">Início</Link>
            <span className="mx-2">/</span>
            <span className="text-ink-700">Bolsas de Estudo</span>
          </nav>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-ink-900 mb-6 max-w-3xl">
            Bolsas de Estudo no Brasil
          </h1>
          <p className="text-lg md:text-xl text-ink-700 max-w-3xl">
            Encontre cursos de graduação e pós com até <strong>80% de desconto</strong> em
            {' '}{institutions.length} faculdades parceiras, em {BRAZILIAN_CITIES.length}
            {' '}cidades. Compare preços, modalidades e finalize a inscrição grátis pelo Bolsa Click.
          </p>
          <div className="mt-8 flex flex-wrap gap-6 font-mono text-[12px] tracking-[0.16em] uppercase text-ink-500">
            <span><strong className="text-ink-900 num-tabular">{TOP_CURSOS.length}+</strong> cursos</span>
            <span><strong className="text-ink-900 num-tabular">{institutions.length}</strong> faculdades</span>
            <span><strong className="text-ink-900 num-tabular">{BRAZILIAN_CITIES.length}</strong> cidades</span>
            <span><strong className="text-ink-900 num-tabular">até 80%</strong> de desconto</span>
          </div>
        </div>
      </header>

      <section className="bg-white py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-5xl prose prose-neutral">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            Como funcionam as bolsas pelo Bolsa Click
          </h2>
          <p className="text-ink-700 leading-relaxed">
            O Bolsa Click é um marketplace independente que negocia bolsas de estudo diretamente
            com as faculdades parceiras. Você escolhe o curso, a modalidade (EAD,
            semipresencial ou presencial) e a cidade — comparamos as ofertas e mostramos o
            desconto disponível antes de você se cadastrar.
          </p>
          <p className="text-ink-700 leading-relaxed mt-3">
            Diferente do PROUNI e FIES, o desconto é negociado entre você e a faculdade via Bolsa
            Click, sem prova específica e sem critério de renda — basta ter ENEM ou processo
            seletivo da própria instituição. A inscrição é grátis, e a bolsa vale durante todo o
            curso enquanto você mantém a matrícula ativa.
          </p>
        </div>
      </section>

      <section className="bg-paper py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              Bolsas por cidade
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              ({String(BRAZILIAN_CITIES.length).padStart(3, '0')})
            </span>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-hairline">
            {BRAZILIAN_CITIES.map(c => (
              <li key={c.slug} className="bg-paper">
                <Link
                  href={`/bolsas-de-estudo/${c.slug}`}
                  className="block px-4 py-3 transition-colors hover:bg-white"
                >
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">
                    {c.state}
                  </span>
                  <span className="block font-display text-base text-ink-900">
                    {c.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              Faculdades parceiras
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              ({String(institutions.length).padStart(2, '0')})
            </span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-hairline">
            {institutions.map(inst => (
              <li key={inst.slug} className="bg-white">
                <Link
                  href={`/faculdades/${inst.slug}`}
                  className="block px-5 py-4 transition-colors hover:bg-paper"
                >
                  <span className="block font-display text-lg text-ink-900">
                    {inst.fullName}
                  </span>
                  <span className="block font-mono text-[11px] text-ink-500 mt-1">
                    {inst.mecRating ? `Nota MEC ${inst.mecRating}` : 'Reconhecida pelo MEC'}
                    {inst.campusCount ? ` · ${inst.campusCount} polos` : ''}
                    {inst.modalities.length ? ` · ${inst.modalities.map(m => m === 'EAD' ? 'EAD' : m === 'PRESENCIAL' ? 'Presencial' : 'Semipresencial').join(', ')}` : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-paper py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              Cursos em destaque
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              ({String(TOP_CURSOS.length).padStart(2, '0')})
            </span>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-hairline">
            {TOP_CURSOS.map(c => (
              <li key={c.slug} className="bg-paper">
                <Link
                  href={`/cursos/${c.slug}`}
                  className="block px-4 py-3 transition-colors hover:bg-white"
                >
                  <span className="block font-display text-base text-ink-900">
                    {c.apiCourseName}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <VisibleFaq
        items={faqItems}
        heading="Perguntas frequentes sobre bolsas de estudo"
      />
    </>
  )
}
