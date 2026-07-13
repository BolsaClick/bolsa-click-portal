import { Metadata } from 'next'
import Link from 'next/link'
import { VisibleFaq } from '@/app/cursos/[slug]/_seo/CourseSeoSections'

const SITE_URL = 'https://www.bolsaclick.com.br'
const PAGE_URL = `${SITE_URL}/programas`

const DATE_PUBLISHED = '2026-05-25'
const DATE_MODIFIED = '2026-05-25'
const DATE_MODIFIED_LABEL = '25 de maio de 2026'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Programas de Estudo no Brasil — ProUni, FIES, SISU, ENEM | Bolsa Click',
  description:
    'Guia central dos programas de estudo e financiamento no Brasil em 2026: ProUni, FIES, SISU, ENEM, ENCCEJA e faculdade sem ENEM. Compare requisitos, descontos e calendários oficiais.',
  keywords: [
    'programas de estudo',
    'programas do governo educação',
    'prouni',
    'fies',
    'sisu',
    'enem',
    'encceja',
    'faculdade sem enem',
    'bolsa de estudo brasil',
    'financiamento estudantil',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Programas de Estudo no Brasil — ProUni, FIES, SISU, ENEM',
    description: 'Guia central dos programas federais e alternativas para acessar o ensino superior.',
    url: PAGE_URL,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
  },
}

interface ProgramaCard {
  slug: string
  nome: string
  tipo: 'Bolsa' | 'Financiamento' | 'Exame' | 'Vagas públicas' | 'Ingresso'
  resumo: string
  quando: string
  href: string
}

const PROGRAMAS: ProgramaCard[] = [
  {
    slug: 'prouni',
    nome: 'ProUni',
    tipo: 'Bolsa',
    resumo:
      'Programa federal de bolsas integrais (100%) e parciais (50%) em faculdades particulares para estudantes com renda familiar até 1,5 ou 3 salários mínimos por pessoa e ENEM 450+.',
    quando: '2 edições/ano (jan-fev e jun-jul)',
    href: '/prouni',
  },
  {
    slug: 'fies',
    nome: 'FIES',
    tipo: 'Financiamento',
    resumo:
      'Fundo de Financiamento Estudantil — financia parte ou total da mensalidade durante o curso. Paga após formado com juros baixos. Exige ENEM 450+ e renda até 3 salários mínimos por pessoa.',
    quando: '2 edições/ano (jan-fev e jun-jul)',
    href: '/fies',
  },
  {
    slug: 'sisu',
    nome: 'SISU',
    tipo: 'Vagas públicas',
    resumo:
      'Sistema de Seleção Unificada — seleciona estudantes para vagas gratuitas em universidades federais e estaduais públicas usando a nota do ENEM. Não há mensalidade.',
    quando: '2 edições/ano (jan-fev e jun-jul)',
    href: '/sisu',
  },
  {
    slug: 'enem',
    nome: 'ENEM',
    tipo: 'Exame',
    resumo:
      'Exame Nacional do Ensino Médio — porta de entrada para ProUni, FIES, SISU e bolsas em faculdades particulares. Aplicado anualmente em 2 dias de prova.',
    quando: 'Inscrições maio/jun · Provas nov',
    href: '/enem',
  },
  {
    slug: 'encceja',
    nome: 'ENCCEJA',
    tipo: 'Exame',
    resumo:
      'Exame Nacional para Certificação de Competências de Jovens e Adultos — emite certificado de conclusão do ensino fundamental ou médio para quem tem 15+ ou 18+ anos e não terminou os estudos.',
    quando: 'Inscrições jun/jul · Prova ago',
    href: '/encceja',
  },
  {
    slug: 'sem-enem',
    nome: 'Faculdade sem ENEM',
    tipo: 'Ingresso',
    resumo:
      'Quatro caminhos para entrar em faculdade reconhecida pelo MEC sem precisar da nota do ENEM: vestibular agendado, vestibular tradicional, histórico do ensino médio ou transferência. Bolsas de até 80% via Bolsa Click.',
    quando: 'Inscrição o ano inteiro',
    href: '/sem-enem',
  },
]

const FAQ_ITEMS = [
  {
    question: 'Qual programa de estudo é o melhor para mim?',
    answer:
      'Depende de três fatores: sua renda familiar per capita, sua nota no ENEM e o tempo que você tem para esperar. ProUni vale mais para quem fecha o critério de renda (até 1,5 SM por pessoa) e tem ENEM bom — rende bolsa integral. SISU é a melhor opção para entrar em universidade pública (gratuita) com nota alta no ENEM. FIES funciona para quem aceita pagar a faculdade depois de formado, com juros subsidiados. Faculdade sem ENEM via Bolsa Click é o caminho mais rápido para quem não fez o ENEM ou não fecha critério de renda — descontos de até 80% sem nota de corte, com matrícula aberta o ano inteiro.',
  },
  {
    question: 'Posso usar ProUni e FIES juntos?',
    answer:
      'Sim, no caso do ProUni parcial (50%) combinado com FIES, o que cobre os outros 50% da mensalidade via financiamento. Não é possível combinar ProUni integral (100%) com FIES, porque não sobra mensalidade a financiar. Já bolsa própria de faculdade parceira em geral não acumula com programas federais — você escolhe o caminho com maior desconto efetivo.',
  },
  {
    question: 'Preciso do ENEM para todos os programas?',
    answer:
      'Não. ProUni, FIES e SISU exigem ENEM 450+ com redação acima de zero. ENCCEJA é o próprio exame de certificação (não exige ENEM). Faculdade sem ENEM via vestibular agendado, prova interna ou histórico do ensino médio dispensa completamente o ENEM e ainda permite bolsa de até 80% nas parceiras Bolsa Click.',
  },
  {
    question: 'Quando abrem as inscrições dos programas federais em 2026?',
    answer:
      'ProUni e FIES seguem o calendário oficial do MEC em 2 edições anuais (jan-fev e jun-jul). SISU também tem 2 edições por ano, geralmente nas mesmas janelas. ENEM 2026 segue padrão histórico: inscrições em maio/junho e provas em dois domingos de novembro. ENCCEJA tem inscrições em junho/julho e prova em agosto. Calendários oficiais publicados em acessounico.mec.gov.br e gov.br/inep.',
  },
  {
    question: 'Como o Bolsa Click se relaciona com os programas federais?',
    answer:
      'O Bolsa Click é um marketplace independente que negocia bolsas próprias diretamente com faculdades particulares parceiras (Anhanguera, Estácio, Unopar, Pitágoras, Unime e outras). Funciona como alternativa ou complemento aos programas federais — não substitui o ProUni, FIES ou SISU. Vantagem: sem critério de renda, sem nota de corte, inscrição grátis o ano inteiro, descontos de 25% a 85% dependendo de curso e modalidade. Indicado especialmente para quem não fecha critério dos programas federais ou quer começar fora dos meses de inscrição oficial.',
  },
]

export default function ProgramasHubPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Programas de Estudo', item: PAGE_URL },
    ],
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Programas de Estudo no Brasil',
    numberOfItems: PROGRAMAS.length,
    itemListElement: PROGRAMAS.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.nome,
      url: `${SITE_URL}${p.href}`,
    })),
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Programas de Estudo no Brasil: ProUni, FIES, SISU, ENEM, ENCCEJA',
    description:
      'Guia central dos programas federais de bolsa, financiamento e ingresso no ensino superior no Brasil em 2026.',
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    author: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Equipe Editorial Bolsa Click',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Bolsa Click',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/assets/logo-bolsa-click-rosa.png`,
      },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': PAGE_URL },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['[data-speakable]'],
    },
  }

  const jsonLd = [breadcrumbSchema, itemListSchema, faqSchema, articleSchema]

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
            <span className="text-ink-700">Programas de Estudo</span>
          </nav>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-ink-900 mb-6 max-w-3xl">
            Programas de Estudo no Brasil
          </h1>
          <p className="text-lg md:text-xl text-ink-700 max-w-3xl">
            Guia central dos programas federais de bolsa, financiamento e ingresso no ensino
            superior brasileiro em 2026. Compare ProUni, FIES, SISU, ENEM, ENCCEJA e faculdade
            sem ENEM lado a lado e descubra qual caminho rende mais para o seu perfil.
          </p>
          <p className="mt-6 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500">
            Por <span className="text-ink-700">Equipe Editorial Bolsa Click</span>
            <span className="mx-2">·</span>
            Atualizado em{' '}
            <time dateTime={DATE_MODIFIED} className="text-ink-700">
              {DATE_MODIFIED_LABEL}
            </time>
          </p>
        </div>
      </header>

      {/* GEO direct-answer — responde a query principal nos primeiros 40-60 palavras */}
      <section className="bg-white py-10 md:py-12 border-b border-hairline" data-speakable="answer">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="text-lg md:text-xl text-ink-900 font-medium leading-relaxed">
            Os principais <strong>programas de estudo</strong> no Brasil são o{' '}
            <Link href="/prouni" className="underline decoration-1 underline-offset-4 hover:text-ink-700">ProUni</Link>{' '}
            (bolsa integral ou parcial em faculdade particular),{' '}
            <Link href="/fies" className="underline decoration-1 underline-offset-4 hover:text-ink-700">FIES</Link>{' '}
            (financiamento estudantil),{' '}
            <Link href="/sisu" className="underline decoration-1 underline-offset-4 hover:text-ink-700">SISU</Link>{' '}
            (vagas em universidade pública), além do{' '}
            <Link href="/enem" className="underline decoration-1 underline-offset-4 hover:text-ink-700">ENEM</Link>{' '}
            (exame de acesso) e do{' '}
            <Link href="/sem-enem" className="underline decoration-1 underline-offset-4 hover:text-ink-700">ingresso sem ENEM</Link>{' '}
            via vestibular agendado. Veja abaixo cada um, requisitos e qual rende mais para o seu perfil.
          </p>
        </div>
      </section>

      <section
        id="programas-cards"
        className="bg-paper py-12 md:py-16 border-b border-hairline"
        data-speakable="programas"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900">
              Os 6 caminhos para a faculdade no Brasil
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              ({String(PROGRAMAS.length).padStart(2, '0')})
            </span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline">
            {PROGRAMAS.map(p => (
              <li key={p.slug} className="bg-paper p-6">
                <span className="block font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-3">
                  {p.tipo}
                </span>
                <h3 className="font-display text-2xl text-ink-900 mb-3">
                  <Link href={p.href} className="hover:underline decoration-1 underline-offset-4">
                    {p.nome}
                  </Link>
                </h3>
                <p className="text-ink-700 leading-relaxed text-sm mb-4">{p.resumo}</p>
                <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-ink-500 mb-4">
                  Quando: <span className="text-ink-700">{p.quando}</span>
                </p>
                <Link
                  href={p.href}
                  className="inline-block font-mono text-[12px] tracking-[0.16em] uppercase text-ink-900 underline decoration-1 underline-offset-4 hover:text-ink-700"
                >
                  Guia completo do {p.nome} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            Programa federal ou bolsa particular: qual escolher
          </h2>
          <p className="text-ink-700 leading-relaxed">
            Os <strong>programas federais</strong> (ProUni, FIES, SISU) são gratuitos para se
            inscrever e oferecem condições imbatíveis para quem fecha os critérios — bolsa
            integral, financiamento subsidiado ou vaga em universidade pública. A contrapartida
            é a rigidez: nota mínima no ENEM, critério estrito de renda, janelas de inscrição
            limitadas a duas vezes por ano e disputa por vagas concorridas.
          </p>
          <p className="text-ink-700 leading-relaxed mt-3">
            As <strong>bolsas próprias de faculdades particulares</strong>, negociadas
            diretamente via Bolsa Click, funcionam como alternativa ou complemento: sem critério
            de renda, sem nota de corte do ENEM, inscrição aberta o ano inteiro e descontos de
            25% a 85% dependendo do curso e da modalidade. Indicadas especialmente para quem
            não passou no ProUni, não tem ENEM válido, ou quer começar a estudar fora dos meses
            oficiais.
          </p>
          <p className="text-ink-700 leading-relaxed mt-3">
            Em geral, vale a regra: <strong>se você fecha critério de ProUni integral, faça a
            inscrição</strong> — é o caminho mais vantajoso. Se a renda está acima do corte ou
            você quer mais flexibilidade de curso, cidade e modalidade, a bolsa própria pelo
            Bolsa Click costuma ter o melhor custo-benefício real.
          </p>
          <p className="text-ink-700 leading-relaxed mt-4">
            <Link href="/bolsas-de-estudo" className="underline decoration-1 underline-offset-4">
              Ver todas as bolsas de estudo disponíveis →
            </Link>
          </p>
        </div>
      </section>

      <VisibleFaq
        items={FAQ_ITEMS}
        heading="Perguntas frequentes sobre programas de estudo"
      />

      <section
        id="fontes"
        aria-label="Fontes consultadas"
        className="bg-paper py-10 md:py-12 border-t border-hairline"
      >
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              Fontes consultadas
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">(04)</span>
          </div>
          <p className="text-ink-700 leading-relaxed mb-6 text-sm">
            Este guia se baseia em fontes oficiais do Governo Federal. Última revisão editorial
            em{' '}
            <time dateTime={DATE_MODIFIED} className="text-ink-900 font-medium">
              {DATE_MODIFIED_LABEL}
            </time>
            .
          </p>
          <ul className="space-y-3 text-sm text-ink-700">
            <li>
              <strong className="text-ink-900">Acesso Único MEC</strong> — portal oficial de
              inscrição ProUni, FIES e SISU.{' '}
              <a href="https://acessounico.mec.gov.br" rel="nofollow noopener" target="_blank" className="underline decoration-1 underline-offset-4">
                acessounico.mec.gov.br
              </a>
            </li>
            <li>
              <strong className="text-ink-900">INEP</strong> — Instituto Nacional de Estudos e
              Pesquisas Educacionais. ENEM, ENCCEJA e indicadores.{' '}
              <a href="https://www.gov.br/inep" rel="nofollow noopener" target="_blank" className="underline decoration-1 underline-offset-4">
                gov.br/inep
              </a>
            </li>
            <li>
              <strong className="text-ink-900">FNDE</strong> — Fundo Nacional de Desenvolvimento
              da Educação. Operação financeira do FIES.{' '}
              <a href="https://www.gov.br/fnde" rel="nofollow noopener" target="_blank" className="underline decoration-1 underline-offset-4">
                gov.br/fnde
              </a>
            </li>
            <li>
              <strong className="text-ink-900">e-MEC</strong> — cadastro nacional de instituições
              e cursos reconhecidos.{' '}
              <a href="https://emec.mec.gov.br" rel="nofollow noopener" target="_blank" className="underline decoration-1 underline-offset-4">
                emec.mec.gov.br
              </a>
            </li>
          </ul>
        </div>
      </section>
    </>
  )
}
