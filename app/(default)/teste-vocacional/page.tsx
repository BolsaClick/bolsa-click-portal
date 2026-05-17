import { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, Clock, Lock, Zap } from 'lucide-react'
import { VisibleFaq } from '@/app/cursos/[slug]/_seo/CourseSeoSections'
import { AIChat } from './_components/AIChat'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bolsaclick.com.br'

export const metadata: Metadata = {
  title: 'Teste Vocacional Online Grátis com IA — Descubra Seu Curso Ideal | Bolsa Click',
  description:
    'Não sabe qual faculdade fazer? Faça nosso teste vocacional com IA em 3 minutos: uma conversa adaptativa que descobre os 3 cursos que mais combinam com seu perfil. Grátis e sem CPF.',
  keywords: [
    'teste vocacional',
    'teste vocacional grátis',
    'teste vocacional online',
    'qual curso fazer',
    'qual faculdade escolher',
    'descobrir profissão',
    'orientação vocacional',
    'bolsa click',
  ],
  alternates: { canonical: `${SITE_URL}/teste-vocacional` },
  openGraph: {
    title: 'Teste Vocacional Online Grátis com IA — Bolsa Click',
    description: 'Conversa adaptativa de 3 minutos que descobre os 3 cursos ideais pro seu perfil.',
    url: `${SITE_URL}/teste-vocacional`,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bolsaclick',
    title: 'Teste Vocacional Online Grátis com IA',
    description: '3 minutos pra descobrir seu curso ideal. Conversa adaptativa com IA.',
  },
}

const faqItems = [
  {
    question: 'Como funciona o teste vocacional do Bolsa Click?',
    answer: 'É uma conversa de uns 3 minutos com uma IA treinada pra entender seus interesses, motivações e estilo. Ela faz entre 7 e 9 perguntas adaptativas — ou seja, cada pergunta se baseia na sua resposta anterior, sem questionário engessado. No final, você recebe os 3 cursos de graduação que mais combinam com seu perfil.',
  },
  {
    question: 'O teste é grátis?',
    answer: 'Sim, 100% grátis. Não pedimos CPF nem cartão. Só nome, email e WhatsApp pra te enviar a trilha personalizada.',
  },
  {
    question: 'Quanto tempo leva?',
    answer: 'Em torno de 3 minutos. A conversa é curta e direta — sem dezenas de perguntas como em testes vocacionais tradicionais.',
  },
  {
    question: 'O resultado é confiável?',
    answer: 'O teste é uma orientação inicial baseada nos seus interesses. Não substitui acompanhamento profissional, mas ajuda a estreitar o leque de opções e descobrir áreas que você talvez não tinha considerado.',
  },
  {
    question: 'Posso refazer o teste?',
    answer: 'Sim, quantas vezes quiser. Cada conversa é independente — você pode explorar respostas diferentes pra ver outras recomendações.',
  },
  {
    question: 'Vou receber spam depois?',
    answer: 'Não. Usamos seu contato pra enviar sua trilha personalizada e avisar quando rolar bolsa nos cursos recomendados. Você pode descadastrar a qualquer momento.',
  },
]

const pageUrl = `${SITE_URL}/teste-vocacional`

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Teste Vocacional Bolsa Click',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  url: pageUrl,
  description:
    'Teste vocacional online gratuito com IA. Conversa adaptativa de 3 minutos que recomenda 3 cursos de graduação com base no seu perfil.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
  inLanguage: 'pt-BR',
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Teste Vocacional', item: pageUrl },
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

export default function TesteVocacionalPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([webAppSchema, breadcrumbSchema, faqSchema]),
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
            <span className="text-ink-700">Teste Vocacional</span>
          </nav>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-ink-900 mb-4">
            Teste Vocacional com IA
          </h1>
          <p className="text-lg md:text-xl text-ink-700 max-w-2xl mb-6">
            Não sabe qual faculdade fazer? Uma conversa curta com nossa IA descobre os{' '}
            <strong>3 cursos que mais combinam com você</strong>. Grátis, em 3 minutos.
          </p>
          <div className="flex flex-wrap gap-4 font-mono text-[12px] tracking-[0.16em] uppercase text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} /> 3 minutos
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles size={14} /> Conversa adaptativa
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap size={14} /> Grátis
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock size={14} /> Sem CPF
            </span>
          </div>
        </div>
      </header>

      <section className="bg-white py-10 md:py-12 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <AIChat />
        </div>
      </section>

      <section className="bg-paper py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral prose-headings:font-display">
          <h2>Como funciona o teste vocacional do Bolsa Click</h2>
          <p>
            Testes vocacionais tradicionais costumam ter dezenas de perguntas fixas e
            resultados genéricos. Aqui é diferente: nossa IA conduz uma conversa adaptativa
            — cada pergunta se baseia na sua resposta anterior, igual um conselheiro
            vocacional faria pessoalmente.
          </p>
          <p>
            Em 7 a 9 perguntas a IA captura o que importa: seus interesses, sua rotina
            ideal, o tipo de problema que te motiva a resolver, o que você definitivamente
            não quer fazer profissionalmente. No final, ela cruza essas pistas com nosso
            catálogo de cursos de graduação e devolve os 3 que mais fazem sentido pra você,
            com uma justificativa pessoal pra cada um.
          </p>
          <p>
            O teste é gratuito e leva uns 3 minutos. Você só precisa preencher nome, email
            e WhatsApp ao final pra ver o resultado — usamos esses dados pra enviar sua
            trilha personalizada e te avisar quando aparecer bolsa exclusiva nos cursos
            recomendados.
          </p>
        </div>
      </section>

      <VisibleFaq items={faqItems} heading="Perguntas frequentes sobre o teste" />
    </>
  )
}
