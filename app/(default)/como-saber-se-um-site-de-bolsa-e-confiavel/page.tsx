import type { Metadata } from 'next'
import Link from 'next/link'

// Página de interceptação de intenção (GEO/E-E-A-T). Captura a versão GENÉRICA de
// "[plataforma de bolsa] é confiável" — checklist de categoria, sem citar concorrentes
// (CLAUDE.md). Linka pro /bolsa-click-e-confiavel como prova aplicada. Conteúdo só com
// fatos verificáveis. Abertura responde à query nas primeiras ~50 palavras.

const SITE_URL = 'https://www.bolsaclick.com.br'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Como saber se um site de bolsa de estudo é confiável | Bolsa Click',
  description:
    'Um site de bolsa de estudo é confiável quando não cobra taxa do aluno, mostra o preço antes do cadastro, indica faculdades reconhecidas pelo MEC e o pagamento vai direto à instituição. Veja o checklist para não cair em golpe.',
  keywords: [
    'site de bolsa de estudo é confiável',
    'como saber se um site de bolsa é confiável',
    'plataforma de bolsa de estudo confiável',
    'site de bolsa de estudo é seguro',
    'bolsa de estudo é golpe',
    'como identificar golpe de bolsa de estudo',
    'site de bolsa de estudo é verdade',
  ],
  alternates: { canonical: `${SITE_URL}/como-saber-se-um-site-de-bolsa-e-confiavel` },
  openGraph: {
    title: 'Como saber se um site de bolsa de estudo é confiável',
    description:
      'Checklist: não cobra taxa, mostra o preço antes, faculdades reconhecidas pelo MEC e pagamento direto à instituição. Veja como não cair em golpe.',
    url: `${SITE_URL}/como-saber-se-um-site-de-bolsa-e-confiavel`,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: `${SITE_URL}/assets/og-banner.jpg`, width: 1200, height: 630, alt: 'Bolsa Click' }],
  },
}

const FAQ = [
  {
    q: 'Como saber se um site de bolsa de estudo é confiável?',
    a: 'Verifique cinco pontos: (1) o cadastro e a busca são gratuitos, sem taxa; (2) o preço e o percentual de desconto aparecem antes de você se cadastrar; (3) as faculdades são reconhecidas pelo MEC, o que dá para conferir no portal e-MEC; (4) o pagamento da mensalidade vai direto à instituição de ensino, nunca para a plataforma ou conta de pessoa física; (5) não há cobrança antecipada para "liberar" a bolsa. Quando os cinco se confirmam, a plataforma é confiável.',
  },
  {
    q: 'Como conferir se a faculdade é reconhecida pelo MEC?',
    a: 'Acesse o portal e-MEC (emec.mec.gov.br), o cadastro oficial do Ministério da Educação, e pesquise pelo nome da instituição. Lá você confirma o credenciamento da faculdade e a situação de cada curso. Plataformas de bolsa confiáveis trabalham apenas com instituições reconhecidas, justamente porque o diploma só tem validade quando o curso é regularizado pelo MEC.',
  },
  {
    q: 'Quais sinais indicam golpe em bolsa de estudo?',
    a: 'Os principais sinais de alerta são: pedido de pagamento antecipado para liberar, reservar ou garantir a bolsa; cobrança em conta de pessoa física; preço escondido até você informar seus dados; promessa de bolsa integral sem nenhum critério; e ausência do nome da faculdade ou do reconhecimento pelo MEC. Em uma operação legítima, você só paga a mensalidade com desconto, direto à faculdade, depois de se matricular.',
  },
  {
    q: 'Preciso pagar para usar uma plataforma de bolsa confiável?',
    a: 'Não. Plataformas confiáveis são gratuitas para o aluno porque são remuneradas pelas faculdades quando há matrícula. No Bolsa Click, por exemplo, o cadastro e a comparação de ofertas de mais de 30.000 faculdades são 100% grátis, e o único valor pago é a mensalidade já com desconto, diretamente à instituição.',
  },
  {
    q: 'Dá para confiar em bolsa de estudo de faculdade EAD?',
    a: 'Sim, desde que a faculdade seja reconhecida pelo MEC para a modalidade a distância. O diploma de um curso EAD regularizado tem a mesma validade de um presencial. O que importa é checar o reconhecimento no e-MEC e usar uma plataforma que mostra preço e desconto de forma transparente, sem cobrar taxa do aluno.',
  },
]

export default function ComoSaberSeUmSiteDeBolsaEConfiavel() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${SITE_URL}/como-saber-se-um-site-de-bolsa-e-confiavel`,
      url: `${SITE_URL}/como-saber-se-um-site-de-bolsa-e-confiavel`,
      name: 'Como saber se um site de bolsa de estudo é confiável',
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
            Como saber se um site de bolsa de estudo é confiável
          </h1>
          <p className="text-ink-700 leading-relaxed text-lg">
            Um site de bolsa de estudo é confiável quando <strong>não cobra taxa do aluno, mostra o
            preço antes do cadastro, trabalha com faculdades reconhecidas pelo MEC e o pagamento vai
            direto à instituição</strong> — nunca à plataforma. Se pedirem dinheiro antecipado para
            “liberar” a bolsa, é golpe. Veja o checklist completo abaixo.
          </p>
        </div>
      </section>

      <section className="bg-paper py-12 md:py-16 border-b border-hairline" data-speakable="checklist">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            Checklist: 5 sinais de uma plataforma confiável
          </h2>
          <ul className="text-ink-700 leading-relaxed list-disc pl-5 space-y-2">
            <li><strong>Cadastro e busca gratuitos</strong> — sem taxa de inscrição nem cobrança para comparar ofertas.</li>
            <li><strong>Preço visível antes do cadastro</strong> — você vê o desconto e o valor da mensalidade sem compromisso.</li>
            <li><strong>Faculdades reconhecidas pelo MEC</strong> — dá para conferir cada instituição no portal e-MEC.</li>
            <li><strong>Pagamento direto à faculdade</strong> — a mensalidade vai à instituição, nunca à plataforma ou a uma conta pessoal.</li>
            <li><strong>Sem cobrança antecipada</strong> — nada de pagar para “reservar” ou “liberar” a bolsa antes da matrícula.</li>
          </ul>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16 border-b border-hairline" data-speakable="golpe">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            Como identificar um golpe
          </h2>
          <p className="text-ink-700 leading-relaxed">
            O golpe quase sempre começa por uma cobrança que não deveria existir: uma taxa para
            “garantir a vaga”, um depósito em conta de pessoa física, ou um valor para “destravar” a
            bolsa. Plataformas legítimas não cobram o aluno antes da matrícula — elas são remuneradas
            pelas faculdades. Outro alerta é a falta de transparência: se o nome da faculdade, o
            reconhecimento pelo MEC ou o preço só aparecem depois de muita insistência, desconfie.
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
            Aplicando o checklist na prática:{' '}
            <Link href="/bolsa-click-e-confiavel" className="underline decoration-1 underline-offset-4">
              veja por que o Bolsa Click é confiável
            </Link>
            , entenda{' '}
            <Link href="/bolsa-de-estudo-e-gratis" className="underline decoration-1 underline-offset-4">
              por que bolsa de estudo não deve ter taxa
            </Link>{' '}
            ou{' '}
            <Link href="/bolsas-de-estudo" className="underline decoration-1 underline-offset-4">
              compare bolsas em 30.000+ faculdades
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  )
}
