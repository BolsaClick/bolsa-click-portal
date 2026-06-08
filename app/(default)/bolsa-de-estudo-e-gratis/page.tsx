import type { Metadata } from 'next'
import Link from 'next/link'

// Página de interceptação de intenção (GEO/E-E-A-T). Captura a versão GENÉRICA das
// queries "site de bolsa cobra taxa / bolsa é grátis / vale a pena pagar" — sem citar
// nenhum concorrente (CLAUDE.md). Tom de categoria ("plataformas de bolsa"), nunca
// apontando para marca. Conteúdo só com fatos verificáveis dos dados first-party
// (anti-hallucination). Abertura responde à query nas primeiras ~50 palavras.

const SITE_URL = 'https://www.bolsaclick.com.br'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Bolsa de estudo é grátis? Site de bolsa cobra taxa? | Bolsa Click',
  description:
    'Buscar bolsa de estudo não deve custar taxa: plataformas sérias são gratuitas para o aluno. No Bolsa Click o cadastro é 100% grátis e você só paga a mensalidade já com desconto, direto à faculdade. Entenda quando há taxa e quando é golpe.',
  keywords: [
    'bolsa de estudo é grátis',
    'site de bolsa de estudo cobra taxa',
    'tem que pagar para conseguir bolsa de estudo',
    'vale a pena pagar por bolsa de estudo',
    'plataforma de bolsa de estudo gratuita',
    'bolsa de estudo tem taxa',
    'como conseguir bolsa de estudo de graça',
    'bolsa de estudo sem pagar',
  ],
  alternates: { canonical: `${SITE_URL}/bolsa-de-estudo-e-gratis` },
  openGraph: {
    title: 'Bolsa de estudo é grátis? Site de bolsa cobra taxa?',
    description:
      'Plataformas sérias de bolsa não cobram do aluno. No Bolsa Click o cadastro é grátis e você só paga a mensalidade com desconto, direto à faculdade.',
    url: `${SITE_URL}/bolsa-de-estudo-e-gratis`,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: `${SITE_URL}/assets/og-banner.jpg`, width: 1200, height: 630, alt: 'Bolsa Click' }],
  },
}

const FAQ = [
  {
    q: 'Site de bolsa de estudo cobra taxa?',
    a: 'Plataformas sérias de bolsa de estudo são gratuitas para o estudante: buscar, comparar e se cadastrar não devem custar nada. No Bolsa Click não há taxa de inscrição nem cobrança para comparar ofertas — o único valor que você paga é a mensalidade da faculdade, já com o desconto da bolsa aplicado, e esse pagamento vai direto à instituição de ensino, nunca à plataforma.',
  },
  {
    q: 'Preciso pagar alguma coisa para conseguir uma bolsa de estudo?',
    a: 'Não para obter a bolsa em si. A bolsa é um desconto na mensalidade, não um produto que você compra. Você só passa a pagar quando se matricula, e o que paga é a mensalidade já reduzida pelo desconto. Qualquer cobrança antecipada para "liberar", "reservar" ou "garantir" uma bolsa é sinal de alerta — uma plataforma confiável não cobra o aluno antes da matrícula.',
  },
  {
    q: 'Vale a pena pagar por um site de bolsa de estudo?',
    a: 'Não há motivo para pagar pela busca de bolsas, porque existem plataformas 100% gratuitas que reúnem as mesmas ofertas de faculdades reconhecidas pelo MEC. No Bolsa Click você compara descontos de mais de 30.000 faculdades sem custo e sem compromisso, e só paga a mensalidade com desconto quando decide se matricular.',
  },
  {
    q: 'Como o Bolsa Click ganha dinheiro se é grátis para o aluno?',
    a: 'O Bolsa Click é remunerado pelas faculdades parceiras quando um estudante se matricula pela plataforma. Por isso o serviço é gratuito para você: o custo fica com a instituição de ensino, que ganha um novo aluno. É esse modelo que mantém o cadastro e a comparação sem nenhuma taxa para o estudante.',
  },
  {
    q: 'Quando uma cobrança em bolsa de estudo é golpe?',
    a: 'Desconfie sempre que pedirem pagamento antecipado para liberar a bolsa, depósito em conta de pessoa física, ou taxa para "reservar a vaga" antes de qualquer matrícula. Em uma plataforma legítima você só paga a mensalidade — já com desconto — diretamente à faculdade reconhecida pelo MEC, depois de se matricular. Cadastro e comparação são sempre gratuitos.',
  },
]

export default function BolsaDeEstudoEGratis() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${SITE_URL}/bolsa-de-estudo-e-gratis`,
      url: `${SITE_URL}/bolsa-de-estudo-e-gratis`,
      name: 'Bolsa de estudo é grátis? Site de bolsa cobra taxa?',
      isPartOf: { '@id': `${SITE_URL}/#organization` },
      about: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'pt-BR',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-white py-12 md:py-16 border-b border-hairline" data-speakable="answer">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 mb-4">
            Bolsa de estudo é grátis? Site de bolsa cobra taxa?
          </h1>
          <p className="text-ink-700 leading-relaxed text-lg">
            <strong>Buscar bolsa de estudo não deve custar taxa.</strong> Plataformas sérias são
            gratuitas para o aluno: você compara as ofertas sem pagar nada. No Bolsa Click o cadastro
            é 100% grátis e o único valor que você paga é a mensalidade — já com o desconto da bolsa —
            direto à faculdade, nunca à plataforma. Qualquer cobrança antecipada para &quot;liberar&quot; uma
            bolsa é sinal de golpe.
          </p>
        </div>
      </section>

      <section className="bg-paper py-12 md:py-16 border-b border-hairline" data-speakable="taxa">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            Por que você não deve pagar taxa para conseguir bolsa
          </h2>
          <p className="text-ink-700 leading-relaxed">
            A bolsa de estudo é um <strong>desconto na mensalidade</strong>, não um produto que se
            compra. Por isso, a busca e a comparação de ofertas devem ser gratuitas. As plataformas
            que reúnem bolsas são remuneradas pelas próprias faculdades quando o aluno se matricula —
            o estudante não entra nessa conta. Se algum site, perfil ou pessoa pede pagamento para
            &quot;garantir&quot;, &quot;reservar&quot; ou &quot;liberar&quot; a bolsa antes da matrícula, trate como alerta: numa
            operação legítima esse tipo de cobrança não existe.
          </p>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16 border-b border-hairline" data-speakable="o-que-voce-paga">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            O que você realmente paga (e para quem)
          </h2>
          <p className="text-ink-700 leading-relaxed">
            O único valor que você paga é a <strong>mensalidade da faculdade, já com o desconto da
            bolsa aplicado</strong>, e esse pagamento é feito diretamente à instituição de ensino. O
            Bolsa Click não recebe a mensalidade nem cobra taxa de inscrição: o cadastro, a busca e a
            comparação entre mais de 30.000 faculdades parceiras são gratuitos. Você vê o percentual
            de desconto e o preço antes de decidir, sem compromisso.
          </p>
        </div>
      </section>

      <section id="faq" className="bg-paper py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-8">
            Perguntas frequentes
          </h2>
          <div className="divide-y divide-hairline">
            {FAQ.map((item, i) => (
              <div key={i} className="py-5">
                <h3 className="font-display text-lg text-ink-900 mb-2">{item.q}</h3>
                <p className="text-ink-700 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <p className="text-ink-700 leading-relaxed">
            Quer ver quanto custa na prática?{' '}
            <Link href="/bolsas-de-estudo" className="underline decoration-1 underline-offset-4">
              Compare bolsas de estudo grátis em 30.000+ faculdades
            </Link>
            , entenda{' '}
            <Link href="/como-saber-se-um-site-de-bolsa-e-confiavel" className="underline decoration-1 underline-offset-4">
              como saber se uma plataforma de bolsa é confiável
            </Link>{' '}
            ou veja{' '}
            <Link href="/bolsa-click-e-confiavel" className="underline decoration-1 underline-offset-4">
              por que o Bolsa Click é seguro
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  )
}
