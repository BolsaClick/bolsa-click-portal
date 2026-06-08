import type { Metadata } from 'next'
import Link from 'next/link'

// Página de interceptação de intenção (GEO/E-E-A-T). Captura a versão GENÉRICA de
// "como funciona [plataforma de bolsa] / desconto em faculdade" — sem citar concorrentes
// (CLAUDE.md). Explica bolsa própria EAD/semi + programas federais e linka pros hubs e
// ao pillar. Conteúdo só com fatos verificáveis. Abertura responde nas primeiras ~50 palavras.

const SITE_URL = 'https://www.bolsaclick.com.br'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Como funciona bolsa de estudo e o desconto em faculdade | Bolsa Click',
  description:
    'Bolsa de estudo é um desconto na mensalidade da faculdade. Você busca o curso, compara o desconto de cada instituição, se cadastra grátis e paga a mensalidade já reduzida, direto à faculdade. Veja como funciona a bolsa própria e os programas federais.',
  keywords: [
    'como funciona bolsa de estudo',
    'como funciona desconto em faculdade',
    'como funciona site de bolsa de estudo',
    'o que é bolsa de estudo',
    'como funciona bolsa de estudo ead',
    'bolsa própria faculdade como funciona',
    'como conseguir desconto na faculdade',
  ],
  alternates: { canonical: `${SITE_URL}/como-funciona-bolsa-de-estudo` },
  openGraph: {
    title: 'Como funciona bolsa de estudo e o desconto em faculdade',
    description:
      'Bolsa de estudo é desconto na mensalidade. Busque o curso, compare descontos, cadastre-se grátis e pague a mensalidade já reduzida, direto à faculdade.',
    url: `${SITE_URL}/como-funciona-bolsa-de-estudo`,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: `${SITE_URL}/assets/og-banner.jpg`, width: 1200, height: 630, alt: 'Bolsa Click' }],
  },
}

const FAQ = [
  {
    q: 'Como funciona uma bolsa de estudo?',
    a: 'A bolsa de estudo é um desconto aplicado à mensalidade da faculdade. Você escolhe o curso e a modalidade, compara o percentual de desconto disponível em cada instituição, se cadastra e faz a matrícula. A partir daí, passa a pagar a mensalidade já reduzida — não existe um valor separado pela bolsa. O desconto vale enquanto você mantém a matrícula ativa e a aprovação acadêmica.',
  },
  {
    q: 'Qual a diferença entre bolsa própria e programa federal?',
    a: 'A bolsa própria é um desconto negociado entre o aluno e a faculdade (ou via plataforma parceira), normalmente sem exigir nota do ENEM nem critério de renda — basta o processo seletivo da instituição. Já os programas federais, como ProUni e FIES, são geridos pelo MEC, exigem nota do ENEM e têm regras específicas de renda e seleção. São caminhos diferentes para o mesmo objetivo: estudar pagando menos.',
  },
  {
    q: 'Como funciona um site de bolsa de estudo?',
    a: 'Uma plataforma de bolsa reúne, em um só lugar, ofertas de desconto de várias faculdades. Você pesquisa o curso, a cidade e a modalidade, e vê o desconto de cada instituição antes de decidir. O cadastro é gratuito e a matrícula segue direto com a faculdade escolhida. No Bolsa Click são mais de 30.000 faculdades parceiras, todas reconhecidas pelo MEC.',
  },
  {
    q: 'Preciso de nota do ENEM para conseguir bolsa?',
    a: 'Depende do tipo. Nas bolsas próprias negociadas via plataforma, normalmente não é preciso nota do ENEM nem comprovar renda — basta o processo seletivo da própria faculdade. O ENEM é exigido nos programas federais ProUni e FIES, que seguem regras do MEC. Por isso muitos estudantes conseguem desconto mesmo sem ter feito o ENEM.',
  },
  {
    q: 'A bolsa vale por todo o curso?',
    a: 'Sim. Nas bolsas próprias, o desconto contratado vale do primeiro ao último semestre, enquanto você mantém a matrícula ativa e a aprovação acadêmica. Você não precisa renovar o benefício a cada período nem disputá-lo de novo: o percentual acompanha você até a conclusão do curso.',
  },
]

export default function ComoFuncionaBolsaDeEstudo() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${SITE_URL}/como-funciona-bolsa-de-estudo`,
      url: `${SITE_URL}/como-funciona-bolsa-de-estudo`,
      name: 'Como funciona bolsa de estudo e o desconto em faculdade',
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
            Como funciona bolsa de estudo
          </h1>
          <p className="text-ink-700 leading-relaxed text-lg">
            <strong>Bolsa de estudo é um desconto na mensalidade da faculdade.</strong> Você busca o
            curso e a modalidade, compara o desconto de cada instituição, se cadastra grátis e passa a
            pagar a mensalidade já reduzida — direto à faculdade. Não há um valor separado pela bolsa.
            O desconto vale enquanto você mantém a matrícula ativa.
          </p>
        </div>
      </section>

      <section className="bg-paper py-12 md:py-16 border-b border-hairline" data-speakable="passos">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            O passo a passo
          </h2>
          <ol className="text-ink-700 leading-relaxed list-decimal pl-5 space-y-2">
            <li><strong>Busque o curso</strong> — escolha graduação, pós ou técnico, a cidade e a modalidade (EAD ou presencial).</li>
            <li><strong>Compare os descontos</strong> — veja o percentual e o preço da mensalidade em cada faculdade, antes de decidir.</li>
            <li><strong>Cadastre-se grátis</strong> — o cadastro e a comparação não têm taxa.</li>
            <li><strong>Faça a matrícula</strong> — direto com a faculdade reconhecida pelo MEC que você escolheu.</li>
            <li><strong>Pague a mensalidade com desconto</strong> — já reduzida pela bolsa, direto à instituição.</li>
          </ol>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16 border-b border-hairline" data-speakable="tipos">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            Bolsa própria e programas federais
          </h2>
          <p className="text-ink-700 leading-relaxed">
            Há dois grandes caminhos. A <strong>bolsa própria</strong> é o desconto negociado com a
            faculdade — normalmente sem exigir nota do ENEM nem critério de renda, com descontos que
            chegam a 80% na mensalidade. Os <strong>programas federais</strong>, como{' '}
            <Link href="/prouni" className="underline decoration-1 underline-offset-4">ProUni</Link> e{' '}
            <Link href="/fies" className="underline decoration-1 underline-offset-4">FIES</Link>, são
            geridos pelo MEC, exigem nota do ENEM e têm regras próprias de renda e seleção. São rotas
            diferentes para o mesmo objetivo: estudar pagando menos.
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
            Pronto pra começar?{' '}
            <Link href="/bolsas-de-estudo" className="underline decoration-1 underline-offset-4">
              Compare bolsas de estudo em 30.000+ faculdades
            </Link>
            , veja se{' '}
            <Link href="/bolsa-de-estudo-e-gratis" className="underline decoration-1 underline-offset-4">
              bolsa de estudo é grátis
            </Link>{' '}
            ou{' '}
            <Link href="/como-saber-se-um-site-de-bolsa-e-confiavel" className="underline decoration-1 underline-offset-4">
              como saber se uma plataforma é confiável
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  )
}
