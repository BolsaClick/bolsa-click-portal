import { Metadata } from 'next'
import Link from 'next/link'
import { Calculator, Compass, ShieldCheck, Clock, Lock, ArrowRight, CheckCircle2 } from 'lucide-react'
import { BRAZILIAN_CITIES } from '@/app/lib/constants/brazilian-cities'
import { VisibleFaq } from '@/app/cursos/[slug]/_seo/CourseSeoSections'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bolsaclick.com.br'
const pageUrl = `${SITE_URL}/descubra-sua-bolsa`
const CITY_COUNT = BRAZILIAN_CITIES.length

export const metadata: Metadata = {
  title: 'Descubra Sua Bolsa Ideal — Simulador e Teste Vocacional Grátis',
  description:
    'Dois caminhos grátis pra descobrir sua bolsa: o simulador calcula seu desconto no ProUni, FIES e bolsas próprias de até 80%; o teste vocacional aponta o curso que combina com você. 2 minutos cada, sem CPF.',
  keywords: [
    'descubra sua bolsa',
    'qual bolsa de estudo eu consigo',
    'simulador de bolsa',
    'teste vocacional',
    'qual curso fazer',
    'bolsa de estudo',
    'quanto de desconto na faculdade',
    'bolsa click',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'Descubra Sua Bolsa Ideal — Bolsa Click',
    description:
      'Simule seu desconto ou descubra seu curso em 2 minutos. ProUni, FIES e bolsas próprias de até 80% de desconto, sem nota de corte.',
    url: pageUrl,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bolsaclick',
    title: 'Descubra Sua Bolsa Ideal — Bolsa Click',
    description: 'Simule seu desconto ou descubra seu curso em 2 minutos. Grátis e sem CPF.',
  },
}

const faqItems = [
  {
    question: 'Qual a diferença entre o simulador e o teste vocacional?',
    answer:
      'O simulador de bolsa é pra quem já sabe o que quer estudar: você informa curso, cidade, nota do ENEM e renda, e ele estima em quais programas (ProUni, FIES, SISU) você se qualifica, além de mostrar bolsas próprias reais de até 80% no seu curso. O teste vocacional é pra quem ainda está em dúvida sobre qual curso fazer: por meio de perguntas sobre seus interesses, ele aponta as áreas e os cursos que mais combinam com o seu perfil.',
  },
  {
    question: 'Preciso pagar alguma coisa?',
    answer:
      'Não. Os dois são 100% gratuitos e sem CPF. Pedimos só nome, email e WhatsApp pra liberar o resultado com as ofertas de bolsa e te avisar quando aparecer desconto novo no seu curso. Nenhuma cobrança pra usar as ferramentas ou pra se inscrever numa bolsa.',
  },
  {
    question: 'Quanto tempo leva cada um?',
    answer:
      'Cerca de 2 minutos cada. São poucas perguntas objetivas e o resultado aparece na hora, com ofertas reais de faculdades parceiras reconhecidas pelo MEC.',
  },
  {
    question: 'O resultado é uma bolsa garantida?',
    answer:
      'O simulador é uma estimativa baseada nos critérios oficiais dos programas — não é aprovação automática, que depende da inscrição no portal do MEC e da nota de corte de cada curso. Já as bolsas próprias das faculdades parceiras aparecem com o desconto real e não têm nota de corte: a vaga depende de disponibilidade no curso, cidade e modalidade escolhidos.',
  },
]

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': pageUrl,
    name: 'Descubra Sua Bolsa Ideal',
    url: pageUrl,
    description:
      'Simulador de bolsa e teste vocacional gratuitos pra descobrir seu desconto e o curso ideal.',
    isPartOf: { '@type': 'WebSite', name: 'Bolsa Click', url: SITE_URL },
    inLanguage: 'pt-BR',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Descubra sua bolsa', item: pageUrl },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  },
]

const PATHS = [
  {
    href: '/simulador-de-bolsa',
    icon: Calculator,
    tag: 'Já sei o que quero estudar',
    title: 'Simular minha bolsa',
    desc: 'Informe curso, cidade, nota do ENEM e renda. Descubra em quais programas você se qualifica (ProUni, FIES, SISU) e veja bolsas próprias reais de até 80% no seu curso.',
    cta: 'Simular meu desconto',
    accent: 'bg-bolsa-primary',
    accentText: 'text-bolsa-primary',
  },
  {
    href: '/teste-vocacional',
    icon: Compass,
    tag: 'Ainda não sei qual curso',
    title: 'Descobrir meu curso',
    desc: 'Responda perguntas sobre seus interesses e o teste aponta as áreas e os cursos que mais combinam com o seu perfil — com opções de bolsa pra cada um.',
    cta: 'Fazer o teste vocacional',
    accent: 'bg-bolsa-secondary',
    accentText: 'text-bolsa-secondary',
  },
]

const STEPS = [
  { n: 1, title: 'Escolha seu caminho', desc: 'Simulador se já sabe o curso; teste vocacional se ainda está em dúvida.' },
  { n: 2, title: 'Responda em 2 minutos', desc: 'Poucas perguntas objetivas, sem CPF e sem compromisso.' },
  { n: 3, title: 'Veja ofertas reais', desc: 'O resultado mostra bolsas de faculdades parceiras reconhecidas pelo MEC, com o desconto de cada uma.' },
]

const TRUST = [
  { icon: ShieldCheck, label: 'Faculdades reconhecidas pelo MEC' },
  { icon: Lock, label: 'Grátis e sem CPF' },
  { icon: Clock, label: 'Resultado em 2 minutos' },
]

export default function DescubraSuaBolsaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO */}
      <section id="top" className="relative overflow-hidden bg-bolsa-primary">
        <div aria-hidden className="absolute -top-24 -right-32 w-[30rem] h-[30rem] rounded-full bg-bolsa-secondary/20 blur-3xl" />
        <div aria-hidden className="absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-blue-400/10 blur-3xl" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-white/60 mb-5">
              Grátis · 2 minutos · sem CPF
            </p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-[1.06] mb-5">
              Descubra sua bolsa ideal
            </h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-2xl">
              Pra descobrir sua bolsa ideal você tem dois caminhos grátis: o <strong className="text-white">simulador</strong> calcula
              seu desconto no ProUni, FIES e em bolsas próprias de até 80%; o <strong className="text-white">teste vocacional</strong> aponta
              o curso que combina com você. Cada um leva 2 minutos e termina com ofertas reais de faculdades parceiras.
            </p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 mt-7 text-white/85 text-sm">
              {TRUST.map(({ icon: Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-2">
                  <Icon size={16} className="text-white/70" /> {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* DOIS CAMINHOS */}
      <section className="bg-paper py-14 md:py-20 -mt-8 md:-mt-10 relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            {PATHS.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="group flex flex-col bg-white border border-hairline rounded-2xl p-7 md:p-8 shadow-[0_30px_60px_-40px_rgba(11,31,60,0.35)] hover:shadow-[0_36px_70px_-36px_rgba(11,31,60,0.45)] hover:-translate-y-0.5 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${p.accent} flex items-center justify-center mb-5`}>
                  <p.icon size={24} className="text-white" />
                </div>
                <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-ink-500 mb-2">
                  {p.tag}
                </span>
                <h2 className="font-display text-2xl font-semibold text-ink-900 mb-3">{p.title}</h2>
                <p className="text-ink-700 leading-relaxed mb-6 flex-1">{p.desc}</p>
                <span className={`inline-flex items-center gap-2 font-semibold ${p.accentText}`}>
                  {p.cta}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="bg-white py-14 md:py-18 border-y border-hairline">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-8">Como funciona</h2>
          <ol className="grid sm:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <li key={s.n}>
                <div className="font-display text-3xl text-bolsa-secondary font-semibold mb-2 num-tabular">0{s.n}</div>
                <h3 className="font-display text-lg text-ink-900 mb-1.5">{s.title}</h3>
                <p className="text-ink-700 text-sm leading-relaxed">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* PROVA / CONFIANÇA */}
      <section className="bg-paper py-14 md:py-18">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-4">
            {[
              'Bolsas próprias de até 80% sem nota de corte',
              `Faculdades parceiras em ${CITY_COUNT}+ cidades`,
              'ProUni, FIES e SISU explicados com critérios oficiais',
              'Inscrição gratuita e sem comprovação de renda nas bolsas próprias',
            ].map((t) => (
              <div key={t} className="flex gap-2.5 text-ink-700 leading-relaxed">
                <CheckCircle2 size={20} className="shrink-0 mt-0.5 text-bolsa-secondary" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-14 md:py-18 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <VisibleFaq items={faqItems} heading="Perguntas frequentes" />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-bolsa-primary py-14 md:py-18 text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-white mb-3">
            Comece pelo caminho que faz sentido pra você
          </h2>
          <p className="text-white/80 mb-8">
            Dois minutos, grátis, com ofertas reais no fim. Sem CPF, sem compromisso.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/simulador-de-bolsa"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-bolsa-primary font-semibold rounded-full hover:opacity-90"
            >
              <Calculator size={18} /> Simular minha bolsa
            </Link>
            <Link
              href="/teste-vocacional"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-bolsa-secondary text-white font-semibold rounded-full hover:opacity-90"
            >
              <Compass size={18} /> Descobrir meu curso
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
