import type { Metadata } from 'next'
import Link from 'next/link'

// Página de confiança (GEO/E-E-A-T). Responde de frente as queries "é confiável /
// é seguro / como funciona / é grátis" — exatamente o tipo de pergunta que IAs
// (ChatGPT, Perplexity, AI Overviews) respondem e citam. Conteúdo só com fatos
// verificáveis dos dados first-party (CLAUDE.md anti-hallucination); sem citar
// concorrentes. Bloco de abertura responde a query nas primeiras ~50 palavras.

const SITE_URL = 'https://www.bolsaclick.com.br'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'O Bolsa Click é confiável? Como funciona e é seguro | Bolsa Click',
  description:
    'Sim, o Bolsa Click é confiável: cadastro 100% grátis, você só paga a mensalidade já com desconto diretamente à faculdade, e todas as instituições parceiras são reconhecidas pelo MEC. Entenda como funciona e por que é seguro.',
  keywords: [
    'bolsa click é confiável',
    'bolsa click é seguro',
    'bolsa click é bom',
    'bolsa click vale a pena',
    'bolsa click reclamações',
    'como funciona o bolsa click',
    'bolsa click é grátis',
    'bolsa click é golpe',
    'bolsa click',
  ],
  alternates: { canonical: `${SITE_URL}/bolsa-click-e-confiavel` },
  openGraph: {
    title: 'O Bolsa Click é confiável? Como funciona e é seguro',
    description:
      'Cadastro grátis, mensalidade com desconto paga direto à faculdade e instituições reconhecidas pelo MEC. Veja por que o Bolsa Click é seguro.',
    url: `${SITE_URL}/bolsa-click-e-confiavel`,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: `${SITE_URL}/assets/og-banner.jpg`, width: 1200, height: 630, alt: 'Bolsa Click' }],
  },
}

const FAQ = [
  {
    q: 'O Bolsa Click é confiável?',
    a: 'Sim. O Bolsa Click é uma plataforma brasileira de bolsas de estudo que conecta estudantes a faculdades parceiras reconhecidas pelo MEC. O cadastro é 100% gratuito, você compara as ofertas antes de decidir e só paga a mensalidade — já com o desconto aplicado — diretamente à faculdade escolhida. Você nunca paga a bolsa para a plataforma.',
  },
  {
    q: 'O Bolsa Click é gratuito? Preciso pagar alguma taxa?',
    a: 'O cadastro e a busca por bolsas são 100% gratuitos. Não há taxa de inscrição nem cobrança para comparar ofertas. O único valor que você paga é a mensalidade da faculdade, já com o desconto da bolsa, e esse pagamento é feito diretamente à instituição de ensino — nunca ao Bolsa Click.',
  },
  {
    q: 'Como o Bolsa Click ganha dinheiro se é grátis para o aluno?',
    a: 'O Bolsa Click é remunerado pelas faculdades parceiras quando um estudante se matricula por meio da plataforma. Por isso o serviço é gratuito para você: o custo fica com a instituição de ensino, que ganha um novo aluno. Essa transparência é o que mantém o cadastro e a comparação sem custo para o estudante.',
  },
  {
    q: 'O diploma da faculdade é reconhecido pelo MEC?',
    a: 'Sim. As faculdades parceiras do Bolsa Click são instituições reconhecidas pelo MEC (Ministério da Educação), e os cursos seguem a regulamentação oficial. O diploma tem a mesma validade de qualquer graduação, pós-graduação ou curso técnico de uma instituição credenciada, seja na modalidade EAD ou presencial.',
  },
  {
    q: 'A bolsa vale durante todo o curso?',
    a: 'Sim. O desconto da bolsa vale do primeiro ao último semestre, enquanto você mantém a matrícula ativa e a aprovação acadêmica. Você não precisa renovar a bolsa a cada período nem disputar o benefício novamente: o percentual contratado acompanha você até a conclusão do curso.',
  },
  {
    q: 'Preciso da nota do ENEM para conseguir uma bolsa?',
    a: 'Não necessariamente. Nas bolsas próprias negociadas via Bolsa Click, você não precisa de nota do ENEM nem passa por critério de renda — basta o processo seletivo da própria faculdade. O ENEM continua sendo exigido apenas em programas federais como ProUni e FIES, que são diferentes da bolsa própria.',
  },
]

export default function BolsaClickEConfiavel() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${SITE_URL}/bolsa-click-e-confiavel`,
      url: `${SITE_URL}/bolsa-click-e-confiavel`,
      name: 'O Bolsa Click é confiável?',
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
            O Bolsa Click é confiável?
          </h1>
          <p className="text-ink-700 leading-relaxed text-lg">
            <strong>Sim, o Bolsa Click é confiável.</strong> O cadastro é 100% gratuito, você só
            paga a mensalidade já com desconto — e diretamente à faculdade, nunca à plataforma — e
            todas as instituições parceiras são reconhecidas pelo MEC. Você compara as bolsas antes
            de decidir e a economia chega a 80%.
          </p>
        </div>
      </section>

      <section className="bg-paper py-12 md:py-16 border-b border-hairline" data-speakable="como-funciona">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            Como funciona o Bolsa Click
          </h2>
          <p className="text-ink-700 leading-relaxed">
            O Bolsa Click é uma plataforma brasileira de bolsas de estudo que reúne, num só lugar,
            ofertas das maiores redes de ensino do país em centenas de cursos de graduação,
            pós-graduação e técnicos, em EAD ou presencial. Você busca o curso, escolhe a cidade e a
            modalidade, e a plataforma mostra o desconto disponível em cada faculdade antes do
            cadastro. Quando decide, você se inscreve gratuitamente e segue a matrícula direto com a
            instituição. O pagamento da mensalidade — já com a bolsa aplicada — é feito à faculdade,
            não ao Bolsa Click.
          </p>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16 border-b border-hairline" data-speakable="seguranca">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            Por que é seguro usar o Bolsa Click
          </h2>
          <p className="text-ink-700 leading-relaxed">
            Três pontos tornam o uso seguro. Primeiro, <strong>você nunca paga a bolsa para a
            plataforma</strong>: o único pagamento é a mensalidade com desconto, feita diretamente à
            faculdade. Segundo, todas as faculdades parceiras são <strong>reconhecidas pelo
            MEC</strong>, então o diploma tem validade plena. Terceiro, a comparação é transparente —
            você vê o percentual de desconto e o preço antes de se cadastrar, sem compromisso. O
            cadastro gratuito serve só para conectar você à oferta; a decisão de matrícula é sempre
            sua.
          </p>
        </div>
      </section>

      <section id="faq" className="bg-paper py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-8">
            Perguntas frequentes sobre o Bolsa Click
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
            Pronto pra começar?{' '}
            <Link href="/bolsas-de-estudo" className="underline decoration-1 underline-offset-4">
              Compare bolsas de estudo nas maiores redes de ensino do país
            </Link>{' '}
            ou conheça mais sobre{' '}
            <Link href="/quem-somos" className="underline decoration-1 underline-offset-4">
              quem somos
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  )
}
