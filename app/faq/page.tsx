import { Metadata } from 'next'
import Link from 'next/link'

const SITE_URL = 'https://www.bolsaclick.com.br'
const PAGE_URL = `${SITE_URL}/faq`

const DATE_PUBLISHED = '2026-05-25'
const DATE_MODIFIED = '2026-05-25'
const DATE_MODIFIED_LABEL = '25 de maio de 2026'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'FAQ — Perguntas Frequentes sobre Bolsas de Estudo | Bolsa Click',
  description:
    'Respostas diretas sobre como funciona o Bolsa Click, ProUni, FIES, FIES, faculdade EAD, sem ENEM, segurança, valor e matrícula. Tire suas dúvidas em 2 minutos.',
  keywords: [
    'faq bolsa click',
    'perguntas frequentes bolsa de estudo',
    'como funciona bolsa de estudo',
    'bolsa de estudo é seguro',
    'prouni dúvidas',
    'fies como funciona',
    'faculdade ead vale a pena',
    'faculdade sem enem',
    'bolsa click reclame aqui',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'FAQ — Perguntas Frequentes sobre Bolsas de Estudo',
    description: 'Respostas diretas sobre Bolsa Click, ProUni, FIES, EAD, segurança e matrícula.',
    url: PAGE_URL,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
  },
}

type FaqGroup = {
  id: string
  title: string
  items: { question: string; answer: string }[]
}

const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'bolsa-click',
    title: 'Sobre o Bolsa Click',
    items: [
      {
        question: 'O que é o Bolsa Click?',
        answer:
          'Bolsa Click é um marketplace de bolsas de estudo em faculdades particulares brasileiras. Reúne ofertas de bolsa direta (sem ENEM, sem nota de corte) negociadas com instituições parceiras como Anhanguera, Estácio, Unopar, Pitágoras e Unime. Descontos de 25% a 85% em graduação, pós-graduação e cursos técnicos, com inscrição grátis o ano inteiro.',
      },
      {
        question: 'O Bolsa Click é confiável e seguro?',
        answer:
          'Sim. O Bolsa Click é uma empresa brasileira regularizada (CNPJ ativo), trabalha com faculdades parceiras reconhecidas pelo MEC e nunca cobra taxa de inscrição, taxa de cadastro ou valor antecipado para liberar bolsa. A matrícula é feita diretamente no portal da faculdade escolhida, com pagamento da mensalidade (já com desconto) na própria instituição.',
      },
      {
        question: 'O Bolsa Click cobra alguma taxa?',
        answer:
          'Não. Buscar bolsa, comparar ofertas e se inscrever no Bolsa Click é 100% grátis. Você só paga a mensalidade da faculdade depois de matriculado, e essa mensalidade já vem com o desconto da bolsa aplicado. Nunca pagamos para "destravar bolsa", "agilizar matrícula" ou "garantir vaga" — qualquer cobrança nesse formato é golpe.',
      },
      {
        question: 'Como faço para conseguir bolsa pelo Bolsa Click?',
        answer:
          'Em 3 passos: (1) busca o curso ou faculdade que te interessa no site, (2) compara as ofertas de bolsa disponíveis para a sua cidade e modalidade, (3) clica em "Quero essa bolsa" e finaliza a matrícula direto com a faculdade. Em geral leva 10 a 30 minutos do clique até receber o contrato de matrícula por e-mail.',
      },
      {
        question: 'Em quais faculdades o Bolsa Click tem bolsa?',
        answer:
          'Trabalhamos com as maiores redes de ensino do país — Anhanguera, Unopar, Pitágoras, Unime e Estácio —, com cobertura nacional em modalidade EAD e polos presenciais em mais de 280 cidades. Veja a lista completa em /faculdades.',
      },
    ],
  },
  {
    id: 'tipos-de-bolsa',
    title: 'Tipos de bolsa e descontos',
    items: [
      {
        question: 'Quanto custa uma faculdade com bolsa do Bolsa Click?',
        answer:
          'Depende do curso, modalidade e faculdade. Em EAD, mensalidades pós-bolsa começam em R$ 79–R$ 149 para licenciaturas e tecnólogos, R$ 149–R$ 349 para bacharelados, e R$ 99–R$ 249 para pós-graduação. Presencial varia mais por cidade e instituição. O simulador no site mostra o preço final pós-bolsa antes de você se matricular.',
      },
      {
        question: 'Qual o desconto máximo que consigo no Bolsa Click?',
        answer:
          'Até 85% em cursos EAD selecionados de instituições parceiras. Bolsas de 50%+ são comuns em pós-graduação e cursos EAD; bolsas de 25-40% predominam em graduação presencial. O desconto depende da faculdade, do curso, da sua data de matrícula (mais cedo = bolsa maior) e de promoções pontuais.',
      },
      {
        question: 'A bolsa do Bolsa Click vale para o curso inteiro?',
        answer:
          'Sim, desde que você mantenha o vínculo ativo e cumpra as regras da faculdade (frequência mínima, pagamento em dia). O percentual de desconto contratado na matrícula é mantido durante toda a duração do curso (4 a 5 anos para bacharelado, 2 a 3 para tecnólogo, 1,5 a 2 para pós).',
      },
      {
        question: 'Posso usar a bolsa do Bolsa Click junto com ProUni ou FIES?',
        answer:
          'Em geral não. Bolsa própria de faculdade parceira não acumula com programas federais (ProUni, FIES). Você escolhe o caminho com maior desconto efetivo: ProUni integral cobre 100% e é imbatível para quem fecha critério de renda; FIES é financiamento que paga depois de formado; bolsa direta do Bolsa Click é a opção para quem não tem ENEM, não fecha critério de renda ou quer iniciar fora dos meses de inscrição oficial.',
      },
    ],
  },
  {
    id: 'programas-federais',
    title: 'ProUni, FIES e SISU',
    items: [
      {
        question: 'Como funciona o ProUni em 2026?',
        answer:
          'O ProUni é o programa federal que dá bolsa integral (100%) ou parcial (50%) em faculdades particulares para estudantes com renda familiar até 1,5 ou 3 salários mínimos por pessoa e nota do ENEM de 450+ (com redação acima de zero). Tem 2 edições por ano (janeiro/fevereiro e junho/julho). Inscrição grátis em acessounico.mec.gov.br.',
      },
      {
        question: 'O que é o FIES e quem pode usar?',
        answer:
          'FIES (Fundo de Financiamento Estudantil) é o programa federal que financia parte ou totalidade da mensalidade durante o curso. Pagamento começa depois de formado, com juros baixos. Exige ENEM 450+ e renda familiar de até 3 salários mínimos por pessoa. Inscrições 2 vezes ao ano via acessounico.mec.gov.br.',
      },
      {
        question: 'SISU e ProUni são a mesma coisa?',
        answer:
          'Não. SISU seleciona estudantes para vagas gratuitas em universidades públicas (federais e estaduais), usando nota do ENEM — não há mensalidade. ProUni dá bolsa em faculdades particulares. Os dois usam ENEM como critério mas funcionam para tipos diferentes de instituição.',
      },
      {
        question: 'O que acontece se eu não conseguir ProUni nem FIES?',
        answer:
          'Há 3 caminhos: (1) bolsa direta via Bolsa Click em faculdade particular parceira — sem ENEM, sem nota de corte, descontos de até 85% (sobretudo EAD); (2) bolsa permanência ou desconto de pontualidade da própria faculdade; (3) vestibular agendado para entrar sem ENEM. Veja todas as alternativas em /sem-enem.',
      },
    ],
  },
  {
    id: 'modalidades-e-curso',
    title: 'Modalidades e tipos de curso',
    items: [
      {
        question: 'Faculdade EAD tem o mesmo valor de diploma que a presencial?',
        answer:
          'Sim. O diploma de uma graduação EAD reconhecida pelo MEC tem exatamente o mesmo valor jurídico do diploma presencial, vale para concursos públicos, pós-graduação e exercício profissional. A única diferença é a metodologia de aula. Confirme sempre que o curso tem autorização vigente no portal e-MEC (emec.mec.gov.br).',
      },
      {
        question: 'Posso fazer faculdade sem ter feito o ENEM?',
        answer:
          'Sim. Existem 4 caminhos: (1) vestibular agendado online (faz em casa, recebe nota no mesmo dia), (2) vestibular tradicional da faculdade, (3) ingresso pelo histórico do ensino médio, ou (4) transferência de outra faculdade. Veja como funciona cada um em /sem-enem.',
      },
      {
        question: 'Qual a diferença entre bacharelado, licenciatura e tecnólogo?',
        answer:
          'Bacharelado forma profissional generalista (4-5 anos), licenciatura forma professor (3-4 anos), tecnólogo forma especialista de mercado em duração curta (2-3 anos). Todos têm diploma de ensino superior reconhecido pelo MEC. Tecnólogos têm a maior empregabilidade imediata; bacharelados e licenciaturas são pré-requisito para algumas profissões reguladas.',
      },
      {
        question: 'Como sei se uma faculdade é reconhecida pelo MEC?',
        answer:
          'Consulte o portal e-MEC oficial (emec.mec.gov.br) — basta digitar o nome da instituição ou do curso e verificar se o status é "autorização" ou "reconhecimento" vigente. Toda faculdade parceira do Bolsa Click é checada antes de entrar no marketplace; mostramos a nota do MEC (CI/IGC) na própria página da instituição.',
      },
    ],
  },
  {
    id: 'matricula',
    title: 'Matrícula e documentação',
    items: [
      {
        question: 'Quais documentos preciso para me matricular com bolsa?',
        answer:
          'Padrão para graduação: RG, CPF, comprovante de residência, histórico e certificado de conclusão do ensino médio. Para EAD a maior parte das faculdades aceita upload digital direto no portal. Pós-graduação exige diploma de graduação reconhecido pelo MEC (cópia autenticada ou digital). A faculdade pode pedir documentos extras dependendo do curso.',
      },
      {
        question: 'Quanto tempo leva entre se inscrever e começar a estudar?',
        answer:
          'Em geral de 5 a 15 dias úteis. Após a inscrição via Bolsa Click, a faculdade entra em contato em até 48h com o contrato de matrícula. Após assinatura digital e envio dos documentos, o acesso ao ambiente virtual de aprendizagem (AVA) é liberado em 3-5 dias úteis. Cursos com início imediato podem começar no mesmo dia.',
      },
      {
        question: 'Posso trancar ou trocar de curso depois de matriculado?',
        answer:
          'Sim. Trancamento é direito do estudante e segue regras da própria faculdade — em geral pode trancar a partir do 2º semestre. Troca de curso (transferência interna) depende de aprovação da coordenação e pode envolver aproveitamento de disciplinas já cursadas. A bolsa contratada não migra automaticamente: vale renegociar valores ao trocar.',
      },
      {
        question: 'Tem direito de arrependimento se eu desistir depois de matriculado?',
        answer:
          'Sim, garantido pelo Código de Defesa do Consumidor (CDC). Você tem 7 dias corridos após a assinatura do contrato para desistir e receber estorno integral do que pagou, sem justificar. Após esse prazo, valem as regras de cancelamento da faculdade — em geral cobram proporcional ao curso já cursado.',
      },
    ],
  },
  {
    id: 'suporte',
    title: 'Suporte e contato',
    items: [
      {
        question: 'Como falo com o suporte do Bolsa Click?',
        answer:
          'Via WhatsApp pelo widget no canto inferior direito do site (mais rápido), e-mail em contato@bolsaclick.com.br, ou pela central de ajuda em /central-de-ajuda com artigos passo a passo. Atendimento humano de segunda a sexta, 9h às 18h. Bot de WhatsApp atende 24/7 para perguntas frequentes.',
      },
      {
        question: 'O que faço se a faculdade não respondeu minha matrícula?',
        answer:
          'Fale com o Bolsa Click no WhatsApp informando o número de protocolo da sua inscrição — fazemos a interlocução direta com o time comercial da faculdade. Em geral resolvemos em 24-48h úteis. Se a faculdade insistir em não responder, oferecemos transferência da sua inscrição para outra parceira sem perda da bolsa contratada.',
      },
    ],
  },
]

export default function FaqHubPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'FAQ — Perguntas Frequentes', item: PAGE_URL },
    ],
  }

  const allItems = FAQ_GROUPS.flatMap((g) => g.items)

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'FAQ — Perguntas Frequentes sobre Bolsas de Estudo no Bolsa Click',
    description:
      'Respostas diretas sobre como funciona o Bolsa Click, programas federais (ProUni, FIES, SISU), modalidades EAD e presencial, matrícula e suporte.',
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

  const jsonLd = [breadcrumbSchema, faqSchema, articleSchema]

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
            <span className="text-ink-700">FAQ</span>
          </nav>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-ink-900 mb-6 max-w-3xl">
            Perguntas frequentes sobre bolsas de estudo
          </h1>
          <p className="text-lg md:text-xl text-ink-700 max-w-3xl">
            Respostas diretas para as dúvidas mais comuns sobre o Bolsa Click, programas federais
            (ProUni, FIES, SISU), modalidades EAD e presencial, matrícula e suporte. Atualizado em{' '}
            <time dateTime={DATE_MODIFIED} className="text-ink-900">{DATE_MODIFIED_LABEL}</time>.
          </p>
        </div>
      </header>

      <section
        className="bg-white py-10 md:py-12 border-b border-hairline"
        data-speakable="answer"
      >
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="text-lg md:text-xl text-ink-900 font-medium leading-relaxed">
            O <strong>Bolsa Click</strong> é um marketplace de bolsas de estudo em faculdades
            particulares brasileiras — descontos de 25% a 85% sem ENEM e sem nota de corte, com
            inscrição grátis e matrícula online. Trabalhamos com as maiores redes de ensino do
            país, todas reconhecidas pelo MEC.
          </p>
        </div>
      </section>

      <section className="bg-paper py-10 md:py-12 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-4xl">
          <nav aria-label="Índice de tópicos" className="hairline-b pb-4">
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500 mb-3">
              Tópicos
            </p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm md:text-base">
              {FAQ_GROUPS.map((g) => (
                <li key={g.id}>
                  <a
                    href={`#${g.id}`}
                    className="text-ink-900 underline decoration-1 underline-offset-4 hover:text-ink-700"
                  >
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <main className="bg-white">
        {FAQ_GROUPS.map((group) => (
          <section
            key={group.id}
            id={group.id}
            className="py-10 md:py-14 border-b border-hairline scroll-mt-24"
          >
            <div className="container mx-auto px-4 max-w-3xl">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-8 hairline-b pb-3">
                {group.title}
              </h2>
              <div className="space-y-8">
                {group.items.map((item) => (
                  <article key={item.question} data-speakable="faq-item">
                    <h3 className="font-display text-xl text-ink-900 mb-3 leading-snug">
                      {item.question}
                    </h3>
                    <p className="text-ink-700 leading-relaxed">{item.answer}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ))}
      </main>

      <section className="bg-paper py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            Não achou sua dúvida aqui?
          </h2>
          <p className="text-ink-700 mb-6">
            Vai na central de ajuda para artigos passo a passo ou fala direto com a gente no
            WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/central-de-ajuda"
              className="px-6 py-3 bg-ink-900 text-paper rounded-md hover:bg-ink-700 transition"
            >
              Central de ajuda
            </Link>
            <Link
              href="/bolsas-de-estudo"
              className="px-6 py-3 border border-ink-900 text-ink-900 rounded-md hover:bg-ink-900 hover:text-paper transition"
            >
              Ver bolsas disponíveis
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
