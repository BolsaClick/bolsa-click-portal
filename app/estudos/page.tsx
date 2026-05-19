import { Metadata } from 'next'
import Link from 'next/link'

const SITE_URL = 'https://www.bolsaclick.com.br'

export const metadata: Metadata = {
  title: 'Estudos e Pesquisas Bolsa Click — Dados próprios sobre educação',
  description:
    'Pesquisas e relatórios próprios do Bolsa Click sobre o mercado de bolsas de estudo, panorama de cursos, salários por área e cobertura de polos no Brasil. Dados originais com metodologia transparente.',
  keywords: [
    'pesquisas bolsa click',
    'estudos educação brasil',
    'panorama bolsa estudo',
    'dados educação superior brasil',
    'relatório educação 2026',
  ],
  alternates: { canonical: `${SITE_URL}/estudos` },
  openGraph: {
    title: 'Estudos e Pesquisas Bolsa Click',
    description: 'Dados próprios sobre o mercado de bolsas de estudo no Brasil.',
    url: `${SITE_URL}/estudos`,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
  },
}

const studies = [
  {
    slug: 'panorama-bolsa-2026',
    title: 'Panorama da Bolsa de Estudo no Brasil 2026',
    summary:
      'Dados agregados sobre cobertura de cursos com bolsa, instituições parceiras, salários por área e distribuição geográfica de polos no Brasil. Catálogo Bolsa Click cruzado com CAGED 2025 e IBGE 2022.',
    date: '2026-05-19',
    available: true,
  },
]

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Estudos', item: `${SITE_URL}/estudos` },
  ],
}

export default function EstudosHubPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="bg-paper">
        <section className="bg-white border-b border-hairline">
          <div className="container mx-auto px-4 py-14 md:py-20 max-w-4xl">
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-500 mb-4">
              Pesquisas e dados próprios
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-ink-900 leading-[1.05] tracking-tight">
              Estudos Bolsa Click
            </h1>
            <p className="mt-6 text-lg md:text-xl text-ink-700 max-w-3xl leading-relaxed">
              Relatórios baseados em dados originais do nosso catálogo de cursos cruzados com fontes
              oficiais (CAGED, IBGE, MEC). Metodologia transparente, dados verificáveis, atualização
              recorrente. Material aberto pra jornalistas, pesquisadores e estudantes.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700 hairline-b pb-3 mb-6">
              Publicações
            </h2>
            <ul className="grid grid-cols-1 gap-px bg-hairline border border-hairline">
              {studies.map((s) => (
                <li key={s.slug} className="bg-white">
                  <Link
                    href={`/estudos/${s.slug}`}
                    className="group block p-6 md:p-8 transition-colors hover:bg-paper"
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
                        Publicado em {new Date(s.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                      {s.available && (
                        <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-emerald-700">
                          Disponível
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl text-ink-900 group-hover:italic transition-all">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-ink-700 leading-relaxed">{s.summary}</p>
                    <span className="mt-4 inline-flex items-center font-mono text-[11px] tracking-[0.16em] uppercase text-bolsa-secondary group-hover:text-ink-900">
                      Ler estudo →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-white border-t border-hairline py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="font-display text-2xl text-ink-900">Imprensa, jornalismo, pesquisa?</h2>
            <p className="mt-3 text-ink-700">
              Os dados publicados aqui são livres pra citação com atribuição. Solicitações de dados
              específicos ou colaborações editoriais via{' '}
              <a href="mailto:contato@bolsaclick.com.br" className="text-bolsa-secondary underline">contato@bolsaclick.com.br</a> (assunto: Imprensa).
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
