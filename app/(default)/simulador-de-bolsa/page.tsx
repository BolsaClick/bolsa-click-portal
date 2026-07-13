import { Metadata } from 'next'
import Link from 'next/link'
import { Clock, Lock, Zap, Sparkles } from 'lucide-react'
import { VisibleFaq } from '@/app/cursos/[slug]/_seo/CourseSeoSections'
import { SimuladorFlow } from './_components/SimuladorFlow'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bolsaclick.com.br'
const pageUrl = `${SITE_URL}/simulador-de-bolsa`

export const metadata: Metadata = {
  title: 'Simulador de Bolsa de Estudo Grátis — Calcule ProUni, FIES e Descontos',
  description:
    'Simule sua bolsa de estudo em 1 minuto: informe curso, cidade, nota do ENEM e renda e descubra se você se qualifica pra ProUni, FIES ou SISU — além de bolsas próprias de até 80% sem nota de corte. Grátis e sem CPF.',
  keywords: [
    'simulador de bolsa',
    'simulador de bolsa de estudo',
    'calcular bolsa faculdade',
    'simulador prouni',
    'simulador fies',
    'quanto de bolsa eu consigo',
    'bolsa de estudo',
    'bolsa click',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'Simulador de Bolsa de Estudo Grátis — Bolsa Click',
    description:
      'Calcule sua bolsa em 1 minuto: ProUni, FIES, SISU e bolsas próprias de até 80% de desconto, sem nota de corte.',
    url: pageUrl,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bolsaclick',
    title: 'Simulador de Bolsa de Estudo Grátis',
    description: '1 minuto pra descobrir sua bolsa: ProUni, FIES e descontos de até 80%.',
  },
}

const faqItems = [
  {
    question: 'Como funciona o simulador de bolsa de estudo?',
    answer:
      'Você informa o curso, a cidade, a nota do ENEM e a renda da família. O simulador cruza esses dados com os critérios oficiais do ProUni e do FIES (renda por pessoa e nota mínima) e estima em quais programas você tende a se qualificar. Em seguida mostra as ofertas reais de bolsa própria pro seu curso, com a mensalidade e o desconto de cada faculdade parceira.',
  },
  {
    question: 'O simulador é grátis?',
    answer:
      'Sim, 100% grátis e sem CPF. Pedimos só nome, email e WhatsApp pra liberar a lista de ofertas com bolsa e te avisar quando aparecer desconto novo no seu curso.',
  },
  {
    question: 'O resultado da simulação é uma aprovação garantida?',
    answer:
      'Não. É uma estimativa baseada nos critérios públicos de ProUni e FIES. A aprovação real depende do edital vigente, da nota de corte de cada curso e da conferência de documentos. Use como orientação inicial pra saber quais caminhos valem a pena.',
  },
  {
    question: 'Qual a nota mínima do ENEM pra conseguir bolsa?',
    answer:
      'Pra ProUni e FIES, a regra é média de pelo menos 450 pontos nas cinco áreas do ENEM e nota de redação acima de zero. Para bolsas próprias de faculdades parceiras não há nota de corte — o desconto depende só da oferta ativa e pode chegar a 80%.',
  },
  {
    question: 'Preciso ter feito o ENEM pra usar o simulador?',
    answer:
      'Não. Se você não fez o ENEM, o simulador te direciona direto pras bolsas próprias das faculdades parceiras, que não exigem nota de corte nem comprovação de renda. Muitas chegam a 80% de desconto na mensalidade, principalmente no EAD.',
  },
  {
    question: 'Como o simulador calcula a renda pra ProUni e FIES?',
    answer:
      'O critério oficial é a renda por pessoa: soma-se a renda bruta mensal de todos que moram na mesma casa e divide-se pelo número de pessoas. Bolsa integral do ProUni exige até 1,5 salário mínimo por pessoa; parcial e FIES, até 3 salários mínimos por pessoa.',
  },
  {
    question: 'As mensalidades mostradas são reais?',
    answer:
      'Sim. As ofertas vêm direto do catálogo de faculdades parceiras, com a mensalidade original, a mensalidade com bolsa e o desconto correspondente. Os valores podem variar conforme a unidade, o turno e a disponibilidade de vagas.',
  },
  {
    question: 'Vou receber spam depois de simular?',
    answer:
      'Não. Usamos seu contato pra enviar as ofertas simuladas e avisar quando surgir bolsa nova no seu curso. Você pode se descadastrar a qualquer momento.',
  },
]

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Simulador de Bolsa de Estudo Bolsa Click',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  url: pageUrl,
  description:
    'Simulador gratuito de bolsa de estudo. Estima elegibilidade a ProUni, FIES e SISU com base em nota do ENEM e renda, e mostra ofertas reais de bolsa própria de até 80% de desconto.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
  inLanguage: 'pt-BR',
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Simulador de Bolsa', item: pageUrl },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
}

export default function SimuladorDeBolsaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([webAppSchema, breadcrumbSchema, faqSchema]),
        }}
      />

      <header className="bg-paper border-b border-hairline py-8 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <nav
            className="font-mono text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-ink-500 mb-3 md:mb-4"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-ink-900">Início</Link>
            <span className="mx-2">/</span>
            <span className="text-ink-700">Simulador de Bolsa</span>
          </nav>
          <h1 className="font-display text-[2rem] sm:text-4xl md:text-6xl font-semibold text-ink-900 leading-[1.05] mb-3 md:mb-4">
            Simulador de Bolsa de Estudo
          </h1>
          {/* Abertura editorial: resposta direta à query nos primeiros 40-60 palavras */}
          <p className="text-base md:text-xl text-ink-700 max-w-2xl mb-5 md:mb-6 leading-relaxed">
            Pra simular sua bolsa de estudo, informe o curso, a cidade, a nota do
            ENEM e a renda da família: em segundos o simulador estima se você se
            qualifica pra <strong>ProUni, FIES ou SISU</strong> e mostra bolsas
            próprias de faculdades parceiras com <strong>até 80% de desconto</strong>,
            sem nota de corte.
          </p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1.5 font-mono text-[10px] md:text-[12px] tracking-[0.14em] uppercase text-ink-500">
            <li className="inline-flex items-center gap-1.5">
              <Clock size={12} className="md:w-3.5 md:h-3.5" /> 1 minuto
            </li>
            <li aria-hidden="true" className="text-ink-300">·</li>
            <li className="inline-flex items-center gap-1.5">
              <Sparkles size={12} className="md:w-3.5 md:h-3.5" /> Ofertas reais
            </li>
            <li aria-hidden="true" className="text-ink-300">·</li>
            <li className="inline-flex items-center gap-1.5">
              <Zap size={12} className="md:w-3.5 md:h-3.5" /> Grátis
            </li>
            <li aria-hidden="true" className="text-ink-300">·</li>
            <li className="inline-flex items-center gap-1.5">
              <Lock size={12} className="md:w-3.5 md:h-3.5" /> Sem CPF
            </li>
          </ul>
        </div>
      </header>

      {/* Simulador */}
      <section className="bg-white py-8 md:py-12 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <SimuladorFlow />
        </div>
      </section>

      {/* Conteúdo editorial de apoio (SEO/GEO) */}
      <section className="bg-paper py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral prose-headings:font-display">
          <h2>Como simular sua bolsa de estudo passo a passo</h2>
          <p>
            O simulador segue quatro passos rápidos. Primeiro, você escolhe o
            curso e a modalidade (EAD, presencial ou semipresencial). Depois,
            informa onde quer estudar — a cidade ajuda a encontrar o polo mais
            perto no EAD e as unidades presenciais na sua região.
          </p>
          <p>
            Nos dois últimos passos entram os dados que definem elegibilidade a
            programas do governo: a <strong>nota do ENEM</strong> (a média das
            cinco áreas) e a <strong>renda da família</strong>. Com isso, o
            simulador calcula sua renda por pessoa e compara com os tetos oficiais
            de cada programa.
          </p>

          <h2>O que o simulador estima</h2>
          <p>
            A partir dos seus dados, você recebe uma leitura de cada caminho
            possível:
          </p>
          <ul>
            <li>
              <Link href="/prouni">ProUni</Link>: bolsa integral (100%) pra renda
              de até 1,5 salário mínimo por pessoa, ou parcial (50%) até 3 salários
              mínimos por pessoa — em ambos os casos com média mínima de 450 no ENEM
              e redação acima de zero.
            </li>
            <li>
              <Link href="/fies">FIES</Link>: financiamento estudantil pra renda de
              até 3 salários mínimos por pessoa, com os mesmos critérios de nota do
              ENEM.
            </li>
            <li>
              <Link href="/sisu">SISU</Link>: vagas em universidades públicas usando
              só a nota do ENEM, sem critério de renda — a aprovação depende da nota
              de corte de cada curso.
            </li>
            <li>
              <strong>Bolsa própria</strong>: descontos das faculdades parceiras,
              que chegam a até 80% e não exigem nota de corte nem comprovação de
              renda. É o caminho mais rápido pra quem não fez o ENEM.
            </li>
          </ul>

          <h2>Simulador de bolsa não substitui o edital</h2>
          <p>
            É importante entender o alcance da ferramenta: a simulação é uma{' '}
            <strong>estimativa baseada nos critérios públicos</strong> de cada
            programa, não uma aprovação. O resultado final depende do edital
            vigente, da nota de corte do curso escolhido e da conferência de
            documentos feita pela instituição. Use o simulador pra descobrir quais
            caminhos valem a pena antes de se inscrever.
          </p>

          <h2>Depois de simular: como garantir a bolsa</h2>
          <p>
            Com o resultado em mãos, você já vê as ofertas reais de bolsa própria
            pro seu curso — com a mensalidade original, a mensalidade com desconto e
            a faculdade parceira. Dá pra comparar valores e seguir direto pra
            matrícula. Se preferir, explore também o{' '}
            <Link href="/bolsas-de-estudo">catálogo completo de bolsas</Link> ou faça
            o <Link href="/teste-vocacional">teste vocacional</Link> pra confirmar
            qual curso combina com você antes de decidir.
          </p>
        </div>
      </section>

      <VisibleFaq items={faqItems} heading="Perguntas frequentes sobre o simulador de bolsa" />
    </>
  )
}
