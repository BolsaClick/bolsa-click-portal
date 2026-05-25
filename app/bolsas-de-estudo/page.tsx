import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/app/lib/prisma'
import { BRAZILIAN_CITIES } from '@/app/lib/constants/brazilian-cities'
import { TOP_CURSOS } from '@/app/cursos/_data/cursos'
import { VisibleFaq } from '@/app/cursos/[slug]/_seo/CourseSeoSections'
import Filter from '@/app/components/molecules/Filter'
import BestOffersSection from '@/app/components/organisms/BestOffersSection'

const SITE_URL = 'https://www.bolsaclick.com.br'

export const revalidate = 86400 // 24h — conteúdo institucional muda devagar

export const metadata: Metadata = {
  title: 'Bolsas de Estudo até 80% — Compare Faculdades e Preços | Bolsa Click',
  description: `Compare bolsas de estudo de até 80% em 100.000+ cursos de graduação, pós e tecnólogos. ${BRAZILIAN_CITIES.length} cidades, faculdades reconhecidas pelo MEC, EAD e presencial. ProUni, FIES e bolsa própria.`,
  keywords: [
    'bolsa de estudo',
    'bolsas de estudo',
    'bolsas de estudo 2026',
    'como conseguir bolsa de estudo',
    'faculdade com bolsa',
    'desconto faculdade',
    'mensalidade faculdade',
    'graduação com desconto',
    'prouni',
    'fies',
    'bolsa integral',
    'bolsa parcial',
    'bolsa enem',
    'bolsa click',
  ],
  alternates: { canonical: `${SITE_URL}/bolsas-de-estudo` },
  openGraph: {
    title: 'Bolsas de Estudo no Brasil — Bolsa Click',
    description: `Encontre cursos com até 80% de desconto em ${BRAZILIAN_CITIES.length} cidades.`,
    url: `${SITE_URL}/bolsas-de-estudo`,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bolsaclick',
    title: 'Bolsas de Estudo no Brasil — Bolsa Click',
    description: `Encontre cursos com até 80% de desconto em ${BRAZILIAN_CITIES.length} cidades.`,
  },
}

// ─────────────────────────────────────────────────────────────────────────
// CONTEÚDO EDITORIAL (data-driven pra reuso em schema HowTo, FAQ e UI)
// ─────────────────────────────────────────────────────────────────────────

const TIPOS_BOLSA = [
  {
    titulo: 'Bolsa integral (100%)',
    resumo:
      'Cobre 100% da mensalidade durante todo o curso. Oferecida pelo ProUni (programa federal) e por faculdades particulares parceiras em vagas específicas. Quem recebe não paga nada além de taxas administrativas eventuais.',
    requisito: 'ENEM 450+ e renda familiar de até 1,5 salário mínimo por pessoa (ProUni) ou negociação direta com faculdade parceira.',
  },
  {
    titulo: 'Bolsa parcial (25% a 75%)',
    resumo:
      'Cobre parte da mensalidade — geralmente 50% pelo ProUni ou de 25% a 75% por bolsas próprias de faculdades. Ideal pra quem não fecha o critério de renda da bolsa integral mas ainda quer reduzir o custo significativamente.',
    requisito: 'ENEM 450+ e renda familiar de até 3 salários mínimos por pessoa (ProUni 50%) ou inscrição direta nas faculdades parceiras.',
  },
  {
    titulo: 'Bolsa de permanência',
    resumo:
      'Auxílio mensal em dinheiro para cobrir custos além da mensalidade (transporte, alimentação, material). Concedida pelo MEC a estudantes de bolsa integral em situação de vulnerabilidade socioeconômica.',
    requisito: 'Ser bolsista integral do ProUni com renda per capita de até 1,5 salário mínimo e estar matriculado em curso com carga horária diária mínima.',
  },
]

const PROGRAMAS = [
  {
    nome: 'ProUni',
    tipo: 'Federal',
    quemOferece: 'Governo Federal (MEC)',
    desconto: '50% ou 100%',
    requisitoNota: 'ENEM 450+ (sem zerar redação)',
    requisitoRenda: 'Até 3 SM/pessoa (50%) ou 1,5 SM/pessoa (100%)',
    onde: 'Faculdades particulares aderentes ao programa',
    quando: 'Inscrições em 2 edições por ano (fev/jul)',
  },
  {
    nome: 'FIES',
    tipo: 'Federal',
    quemOferece: 'Governo Federal (MEC + FNDE)',
    desconto: 'Financiamento de 50% a 100% da mensalidade',
    requisitoNota: 'ENEM 450+ (sem zerar redação)',
    requisitoRenda: 'Até 3 SM/pessoa',
    onde: 'Faculdades particulares aderentes ao programa',
    quando: 'Inscrições em 2 edições por ano (fev/jul)',
  },
  {
    nome: 'Bolsa própria',
    tipo: 'Faculdades parceiras',
    quemOferece: 'Faculdades privadas via Bolsa Click',
    desconto: '25% a 85%',
    requisitoNota: 'Não exige ENEM (ou processo seletivo próprio)',
    requisitoRenda: 'Sem critério de renda',
    onde: 'Anhanguera, Unopar, Pitágoras, Unime e outras parceiras',
    quando: 'Inscrição aberta o ano inteiro',
  },
]

const PASSOS = [
  {
    titulo: 'Identifique seu perfil',
    detalhe:
      'Confira se você fez o ENEM (qualquer edição desde 2010) e tire dúvidas sobre sua renda familiar per capita. Esses dois pontos definem se vale priorizar ProUni/FIES (programas federais) ou bolsa própria de faculdade parceira (sem nota de corte nem critério de renda).',
  },
  {
    titulo: 'Compare programas e descontos',
    detalhe:
      'Use a tabela comparativa abaixo pra entender ProUni vs FIES vs bolsa própria. Em geral: ProUni rende bolsa integral pra quem tem ENEM bom e renda baixa; FIES financia o que sobra; bolsa própria é o caminho mais rápido pra quem não fez ENEM ou tem renda acima do corte.',
  },
  {
    titulo: 'Escolha curso e modalidade',
    detalhe:
      'Cursos EAD costumam ter os maiores descontos via bolsa própria (até 85% em faculdades parceiras), enquanto cursos presenciais têm desconto típico de 30% a 70%. Pós-graduação e cursos profissionalizantes também têm bolsas. Filtre por cidade, modalidade e área de interesse.',
  },
  {
    titulo: 'Prepare a documentação',
    detalhe:
      'Pra ProUni e FIES você precisa de RG, CPF, comprovante de renda (carteira de trabalho, holerites, declaração de IR), comprovante de residência e boletim do ENEM. Pra bolsa própria do Bolsa Click, basta RG, CPF e finalização do cadastro online — sem comprovação de renda.',
  },
  {
    titulo: 'Faça a inscrição online',
    detalhe:
      'ProUni e FIES: inscrição no portal único do MEC nas datas oficiais (geralmente fevereiro e julho). Bolsa própria: cadastro grátis pelo bolsaclick.com.br, escolha do curso, confirmação da oferta e finalização direta com a faculdade. Inscrição aberta o ano inteiro.',
  },
  {
    titulo: 'Confirme a matrícula',
    detalhe:
      'Após aprovado, vá até a faculdade (ou faça matrícula online no caso de EAD) com a documentação completa. A bolsa começa a valer a partir da primeira mensalidade e permanece durante todo o curso enquanto você mantém aprovação acadêmica e a matrícula ativa.',
  },
]

const FAQ_ITEMS = [
  {
    question: 'O que é uma bolsa de estudo?',
    answer:
      'Bolsa de estudo é um desconto na mensalidade da faculdade que pode chegar a 100% (bolsa integral). No Brasil, vem de três fontes: programas federais (ProUni e FIES), bolsas próprias de faculdades particulares (negociadas via Bolsa Click) e bolsas de permanência (auxílio mensal além do desconto). Todas reduzem o custo total do curso e valem durante toda a graduação ou pós.',
  },
  {
    question: 'Como conseguir uma bolsa de estudo de 100%?',
    answer:
      'O caminho mais comum é pelo ProUni: ter feito o ENEM com nota mínima de 450 pontos (sem zerar a redação), comprovar renda familiar per capita de até 1,5 salário mínimo, e se inscrever no portal do MEC nas duas edições anuais (fevereiro e julho). Alternativa: algumas faculdades parceiras oferecem bolsas próprias de 100% em vagas pontuais, sem critério de renda.',
  },
  {
    question: 'Qual a diferença entre ProUni e FIES?',
    answer:
      'O ProUni é uma bolsa de estudo (desconto): você não paga a mensalidade durante o curso. O FIES é um financiamento: você paga a mensalidade reduzida durante o curso e quita o restante após formado, com juros baixos. Ambos exigem ENEM 450+ e comprovação de renda, mas atendem perfis diferentes — ProUni pra quem precisa de bolsa, FIES pra quem aceita pagar depois.',
  },
  {
    question: 'Posso conseguir bolsa sem ter feito o ENEM?',
    answer:
      'Sim. Bolsas próprias de faculdades parceiras do Bolsa Click não exigem ENEM — você usa o processo seletivo da própria instituição (geralmente uma redação ou prova simples online) e garante o desconto direto. ProUni e FIES, por serem federais, exigem ENEM.',
  },
  {
    question: 'Qual a nota mínima do ENEM pra ProUni?',
    answer:
      'A nota mínima é de 450 pontos na média das provas objetivas e a redação não pode zerar (nota acima de zero). Esse é o critério de elegibilidade base — a nota de corte real para cada curso e instituição varia conforme a demanda e pode ser bem maior, especialmente em cursos concorridos como Medicina e Direito.',
  },
  {
    question: 'A bolsa do Bolsa Click é diferente do ProUni?',
    answer:
      'Sim. O Bolsa Click é um marketplace que negocia bolsas próprias diretamente com faculdades particulares parceiras — não é programa do governo. Vantagem: sem nota de corte, sem critério de renda, inscrição aberta o ano inteiro, descontos de 25% a 85% (dependendo do curso e da modalidade). O Bolsa Click não substitui o ProUni — funciona como alternativa para quem não consegue ou não quer esperar o programa federal.',
  },
  {
    question: 'Quais faculdades têm bolsa de estudo?',
    answer: `O Bolsa Click trabalha com ${BRAZILIAN_CITIES.length}+ cidades e faculdades parceiras de alcance nacional (Anhanguera, Unopar, Pitágoras, Unime e outras reconhecidas pelo MEC). Pelo ProUni e FIES, mais de 1.200 instituições particulares aderem aos programas federais. A disponibilidade da bolsa varia por curso, cidade e modalidade.`,
  },
  {
    question: 'Bolsa de estudo serve pra EAD?',
    answer:
      'Serve sim, e é onde os descontos costumam ser maiores. Cursos EAD em faculdades parceiras do Bolsa Click têm bolsas próprias de até 85% da mensalidade, e o ProUni também cobre EAD desde 2017. Vantagem do EAD: mensalidade base já é mais baixa que o presencial, então o desconto final fica ainda mais econômico.',
  },
  {
    question: 'Vale a pena ProUni ou bolsa própria de faculdade?',
    answer:
      'Depende do seu perfil. ProUni vale mais pra quem tem ENEM bom (acima de 600) e renda familiar baixa — rende 100% sem custo nenhum. Bolsa própria via Bolsa Click vale pra quem não fez ENEM, não fecha o critério de renda, ou quer começar o curso fora dos meses de inscrição do ProUni (que abrem só em fevereiro e julho).',
  },
  {
    question: 'Como calcular minha renda familiar pra ProUni?',
    answer:
      'Some toda a renda bruta mensal dos moradores do mesmo endereço (incluindo você) e divida pelo número total de pessoas. O resultado é a renda per capita. Pra bolsa integral (100%) precisa ser até 1,5 salário mínimo. Pra bolsa parcial (50%) precisa ser até 3 salários mínimos. Considere salários, aposentadorias, pensões e renda de aluguel.',
  },
  {
    question: 'O que é bolsa de permanência?',
    answer:
      'É um auxílio mensal em dinheiro que o MEC paga a estudantes bolsistas integrais do ProUni em situação de vulnerabilidade socioeconômica. Cobre custos de transporte, alimentação e material didático, complementando a bolsa de estudo. Valor mensal segue tabela do governo e exige solicitação separada após aprovação no ProUni.',
  },
  {
    question: 'Posso usar ProUni e FIES juntos?',
    answer:
      'Sim, na modalidade ProUni 50% combinado com FIES, o que cobre os outros 50% da mensalidade via financiamento. Não é possível combinar ProUni 100% com FIES, porque não sobra mensalidade a financiar. Já bolsa própria do Bolsa Click em geral não acumula com programas federais — você escolhe o caminho com maior desconto.',
  },
  {
    question: 'Bolsa de estudo serve pra pós-graduação?',
    answer:
      'Bolsa própria via Bolsa Click cobre pós-graduação lato sensu (especialização e MBA) em faculdades parceiras, com descontos de 30% a 70%. ProUni e FIES não cobrem pós-graduação privada — só graduação. Pra mestrado e doutorado, as bolsas vêm de CAPES, CNPq e da própria universidade pública.',
  },
  {
    question: 'Posso perder a bolsa durante o curso?',
    answer:
      'Pode, se reprovar duas vezes na mesma disciplina (ProUni), atrasar mensalidades por mais de 3 meses (bolsas próprias), trancar a matrícula sem justificativa formal, ou se houver mudança significativa na renda familiar comprovada (no caso do ProUni). Mantendo presença, aprovação e a matrícula ativa, a bolsa vale por todo o curso.',
  },
  {
    question: 'Bolsa integral cobre 100% da mensalidade mesmo?',
    answer:
      'Sim, 100% da mensalidade ao longo de todo o curso. O que NÃO está incluído: taxas administrativas pontuais (matrícula, certificado de conclusão), material didático impresso (cursos EAD geralmente entregam digital), uniformes (alguns cursos da área da saúde) e despesas pessoais de transporte e alimentação. Bolsa de permanência ajuda com esses extras pra perfis elegíveis.',
  },
  {
    question: 'Qual a melhor faculdade com bolsa de estudo?',
    answer: `Depende do curso, modalidade e cidade. Entre as parceiras do Bolsa Click, as maiores em alcance nacional são Anhanguera (presencial e EAD em ${BRAZILIAN_CITIES.length}+ cidades), Unopar (líder em EAD com mais de 800 polos), Pitágoras e Unime. Todas reconhecidas pelo MEC. A "melhor" pra você é a que combina curso desejado + cidade + maior bolsa disponível.`,
  },
  {
    question: 'Quanto economizo com bolsa de estudo?',
    answer:
      'Com bolsa integral (ProUni 100% ou bolsa própria de 100%), a economia é o valor total do curso — em torno de R$ 60 mil a R$ 200 mil dependendo da graduação. Com bolsa de 50% a 85%, a economia varia de R$ 30 mil a R$ 150 mil. EAD com bolsa de 85% chega a custar R$ 80 a R$ 200 mensais, dependendo do curso.',
  },
  {
    question: 'Como sei se a bolsa de estudo é confiável?',
    answer:
      'Verifique três coisas: (1) a faculdade tem cadastro válido no e-MEC (consulta no site oficial mec.gov.br), (2) a bolsa é negociada com a instituição, não com terceiros (a Bolsa Click intermedia direto com as faculdades parceiras, sem cobrar nada do aluno), e (3) o desconto é aplicado já na primeira mensalidade e refletido no contrato. Nunca pague nada antecipado por uma promessa de bolsa.',
  },
]

async function getActiveInstitutions() {
  return prisma.institution.findMany({
    where: { isActive: true },
    select: {
      slug: true,
      name: true,
      shortName: true,
      fullName: true,
      mecRating: true,
      modalities: true,
      campusCount: true,
    },
    orderBy: { order: 'asc' },
  })
}

export default async function BolsasDeEstudoHubPage() {
  const institutions = await getActiveInstitutions()

  const pageUrl = `${SITE_URL}/bolsas-de-estudo`

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Bolsas de Estudo', item: pageUrl },
    ],
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Bolsas de Estudo por Cidade no Brasil',
    numberOfItems: BRAZILIAN_CITIES.length,
    itemListElement: BRAZILIAN_CITIES.slice(0, 50).map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `Bolsas em ${c.name}/${c.state}`,
      url: `${SITE_URL}/bolsas-de-estudo/${c.slug}`,
    })),
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bolsa Click',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/cursos?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
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

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Como conseguir bolsa de estudo no Brasil',
    description:
      'Passo-a-passo pra conseguir uma bolsa de estudo de 50% a 100% em faculdade particular no Brasil — pelo ProUni, FIES ou bolsa própria de faculdade parceira.',
    totalTime: 'PT15M',
    step: PASSOS.map((p, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: p.titulo,
      text: p.detalhe,
    })),
  }

  const jsonLd = [
    breadcrumbSchema,
    itemListSchema,
    websiteSchema,
    faqSchema,
    howToSchema,
  ]

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
            <span className="text-ink-700">Bolsas de Estudo</span>
          </nav>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-ink-900 mb-6 max-w-3xl">
            Bolsas de Estudo no Brasil
          </h1>
          <p className="text-lg md:text-xl text-ink-700 max-w-3xl">
            Encontre cursos de graduação e pós com até <strong>80% de desconto</strong> em
            {' '}{institutions.length} faculdades parceiras, em {BRAZILIAN_CITIES.length}
            {' '}cidades. Compare ProUni, FIES e bolsas próprias e finalize a inscrição grátis pelo Bolsa Click.
          </p>
          <div className="mt-8 flex flex-wrap gap-6 font-mono text-[12px] tracking-[0.16em] uppercase text-ink-500">
            <span><strong className="text-ink-900 num-tabular">{TOP_CURSOS.length}+</strong> cursos</span>
            <span><strong className="text-ink-900 num-tabular">{institutions.length}</strong> faculdades</span>
            <span><strong className="text-ink-900 num-tabular">{BRAZILIAN_CITIES.length}</strong> cidades</span>
            <span><strong className="text-ink-900 num-tabular">até 80%</strong> de desconto</span>
          </div>
        </div>
      </header>

      {/* GEO direct-answer snippet — primeiros 40-60 palavras respondem a query principal */}
      <section className="bg-white py-10 md:py-12 border-b border-hairline" data-speakable="answer">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="text-lg md:text-xl text-ink-900 font-medium leading-relaxed">
            Pra conseguir uma <strong>bolsa de estudo</strong> de 50% a 100% na faculdade no Brasil, o caminho mais rápido é candidatar-se ao <Link href="/prouni" className="underline decoration-1 underline-offset-4 hover:text-ink-700">ProUni</Link> com sua nota do ENEM (bolsa integral ou parcial em faculdades particulares) ou buscar bolsa própria em faculdades EAD parceiras, onde os descontos chegam a 85% sem nota de corte. Veja abaixo cada opção, requisitos e o passo-a-passo.
          </p>
        </div>
      </section>

      {/* Camada funcional marketplace — search widget + offer cards.
          Match com intent transacional dominante na SERP de "bolsas de estudo"
          (60% dos top 10 são marketplaces com filtros e listings visíveis). */}
      <section
        aria-label="Buscar bolsa de estudo"
        className="bg-paper border-b border-hairline py-8 md:py-10"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-6 flex items-baseline justify-between hairline-b pb-3">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              Compare bolsas agora
            </h2>
            <span className="font-mono text-[11px] text-ink-500 hidden sm:inline">
              EAD · Presencial · Semipresencial
            </span>
          </div>
          <Filter />
        </div>
      </section>

      <BestOffersSection />

      <section id="como-funcionam" className="bg-paper py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            Como funcionam as bolsas pelo Bolsa Click
          </h2>
          <p className="text-ink-700 leading-relaxed">
            O Bolsa Click é um marketplace independente que negocia bolsas de estudo diretamente
            com faculdades parceiras. Você escolhe o curso, a modalidade (EAD, semipresencial ou
            presencial) e a cidade — comparamos as ofertas e mostramos o desconto disponível antes
            de você se cadastrar.
          </p>
          <p className="text-ink-700 leading-relaxed mt-3">
            Diferente do ProUni e FIES (programas federais), a bolsa própria é negociada entre
            você e a faculdade via Bolsa Click, <strong>sem prova específica e sem critério de
            renda</strong> — basta o ENEM (qualquer edição) ou o processo seletivo da própria
            instituição. A inscrição é grátis, e a bolsa vale durante todo o curso enquanto você
            mantém a matrícula ativa e a aprovação acadêmica.
          </p>
        </div>
      </section>

      <section id="tipos-de-bolsa" className="bg-white py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900">
              Tipos de bolsa de estudo
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">(03)</span>
          </div>
          <p className="text-ink-700 leading-relaxed mb-8 max-w-3xl">
            No Brasil, três tipos de bolsa cobrem a maioria dos perfis de estudantes. A diferença
            está no <strong>percentual de desconto</strong>, em quem oferece o benefício e nos
            requisitos pra conseguir. Veja abaixo qual se encaixa no seu perfil.
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-px bg-hairline">
            {TIPOS_BOLSA.map((tipo, i) => (
              <li key={i} className="bg-white p-6">
                <span className="block font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-3">
                  Tipo {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-xl text-ink-900 mb-3">{tipo.titulo}</h3>
                <p className="text-ink-700 leading-relaxed text-sm mb-4">{tipo.resumo}</p>
                <p className="text-ink-500 text-sm leading-relaxed">
                  <strong className="text-ink-700">Requisito típico:</strong> {tipo.requisito}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="comparativo-programas" className="bg-paper py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900">
              ProUni, FIES ou bolsa própria — qual vale mais a pena?
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">(03)</span>
          </div>
          <p className="text-ink-700 leading-relaxed mb-8 max-w-3xl">
            A escolha depende de três fatores: sua nota do ENEM, sua renda familiar e quando você
            quer começar a estudar. A tabela abaixo compara os três programas lado a lado.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-y border-hairline">
                  <th className="text-left py-3 px-3 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500">
                    Programa
                  </th>
                  <th className="text-left py-3 px-3 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500">
                    Quem oferece
                  </th>
                  <th className="text-left py-3 px-3 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500">
                    Desconto
                  </th>
                  <th className="text-left py-3 px-3 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500">
                    ENEM
                  </th>
                  <th className="text-left py-3 px-3 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500">
                    Renda
                  </th>
                  <th className="text-left py-3 px-3 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500">
                    Quando se inscrever
                  </th>
                </tr>
              </thead>
              <tbody>
                {PROGRAMAS.map((p, i) => (
                  <tr key={i} className="border-b border-hairline align-top">
                    <td className="py-4 px-3">
                      <strong className="font-display text-base text-ink-900 block">{p.nome}</strong>
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                        {p.tipo}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-ink-700">{p.quemOferece}</td>
                    <td className="py-4 px-3 text-ink-900 font-medium">{p.desconto}</td>
                    <td className="py-4 px-3 text-ink-700">{p.requisitoNota}</td>
                    <td className="py-4 px-3 text-ink-700">{p.requisitoRenda}</td>
                    <td className="py-4 px-3 text-ink-700">{p.quando}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="prouni" className="bg-white py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            ProUni — bolsa integral ou parcial do governo federal
          </h2>
          <p className="text-ink-700 leading-relaxed">
            O <strong>Programa Universidade para Todos (ProUni)</strong> é o maior programa de
            bolsas de estudo do Brasil. Criado pelo MEC em 2005, oferece bolsas integrais (100%) e
            parciais (50%) em faculdades particulares aderentes ao programa, em troca de isenções
            fiscais às instituições.
          </p>
          <h3 className="font-display text-xl text-ink-900 mt-6 mb-3">Quem pode se inscrever</h3>
          <p className="text-ink-700 leading-relaxed">
            Pra concorrer no ProUni você precisa: (1) ter feito o ENEM mais recente com nota
            mínima de 450 pontos na média das objetivas e redação acima de zero; (2) não ter
            diploma de graduação ainda; (3) comprovar renda familiar per capita de até 1,5 salário
            mínimo (bolsa 100%) ou até 3 salários mínimos (bolsa 50%); (4) ter cursado todo o
            ensino médio em escola pública OU em escola particular com bolsa integral OU se
            declarar pessoa com deficiência OU ser professor da rede pública em licenciatura.
          </p>
          <h3 className="font-display text-xl text-ink-900 mt-6 mb-3">Como funciona a inscrição</h3>
          <p className="text-ink-700 leading-relaxed">
            As inscrições abrem em duas edições por ano (geralmente fevereiro e julho), gratuitas
            no portal único do MEC. Você escolhe até duas opções de curso/turno/instituição e o
            sistema seleciona pela maior nota até preencher as vagas. Resultado em chamadas
            sucessivas. Aprovado, você comparece à faculdade com documentação completa pra
            comprovar renda e formação. Reprovou no critério de renda? Pode reapresentar
            documentos ou cair pra lista de espera.
          </p>
          <p className="text-ink-700 leading-relaxed mt-4">
            <Link href="/prouni" className="underline decoration-1 underline-offset-4">
              Guia completo do ProUni →
            </Link>
          </p>
        </div>
      </section>

      <section id="fies" className="bg-paper py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            FIES — financiamento estudantil federal
          </h2>
          <p className="text-ink-700 leading-relaxed">
            O <strong>Fundo de Financiamento Estudantil (FIES)</strong> não é uma bolsa de estudo
            no sentido estrito, mas funciona como uma — você paga uma mensalidade reduzida durante
            o curso e quita o restante após formado, com juros baixos. Cobre de 50% a 100% da
            mensalidade dependendo da modalidade.
          </p>
          <h3 className="font-display text-xl text-ink-900 mt-6 mb-3">Quem pode se inscrever</h3>
          <p className="text-ink-700 leading-relaxed">
            Requisitos básicos: (1) ENEM 450+ com redação acima de zero, em qualquer edição desde
            2010; (2) renda familiar per capita de até 3 salários mínimos; (3) não ter graduação
            concluída; (4) ter um fiador (em alguns casos, conforme a modalidade contratada).
            Modalidades P-FIES, com taxas mais altas, têm flexibilidade maior nos requisitos.
          </p>
          <h3 className="font-display text-xl text-ink-900 mt-6 mb-3">FIES vs ProUni</h3>
          <p className="text-ink-700 leading-relaxed">
            Se você fecha critério tanto de ProUni quanto de FIES, geralmente ProUni vale mais
            (você não paga nada). FIES faz sentido quando: (a) ProUni não tem vaga no seu curso
            desejado, (b) sua renda está acima do corte do ProUni mas dentro do FIES, ou (c) você
            já é bolsista ProUni 50% e quer financiar os outros 50% via FIES (combinação
            permitida e usada por muitos estudantes).
          </p>
          <p className="text-ink-700 leading-relaxed mt-4">
            <Link href="/fies" className="underline decoration-1 underline-offset-4">
              Guia completo do FIES →
            </Link>
          </p>
        </div>
      </section>

      <section id="bolsa-enem" className="bg-white py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            Bolsa de estudo com a nota do ENEM
          </h2>
          <p className="text-ink-700 leading-relaxed">
            A nota do ENEM destrava três caminhos pra bolsa: <strong>ProUni</strong> (descontos
            de 50% ou 100%), <strong>FIES</strong> (financiamento federal), e
            {' '}<strong>bolsa própria de faculdades parceiras</strong> via Bolsa Click, que
            aceita ENEM de qualquer edição como processo seletivo (sem precisar refazer prova).
          </p>
          <h3 className="font-display text-xl text-ink-900 mt-6 mb-3">Qual nota preciso</h3>
          <p className="text-ink-700 leading-relaxed">
            A nota mínima formal pra ProUni e FIES é <strong>450 pontos</strong> na média das
            provas objetivas e redação acima de zero. Mas isso é só o critério de elegibilidade
            base — a nota de corte de cada curso/faculdade varia conforme a demanda e a oferta de
            vagas. Em cursos concorridos (Medicina, Direito, Engenharia), nota de corte costuma
            ficar entre 700 e 850. Em cursos menos concorridos, pode baixar pra 500-600.
          </p>
          <h3 className="font-display text-xl text-ink-900 mt-6 mb-3">E pra bolsa própria via Bolsa Click</h3>
          <p className="text-ink-700 leading-relaxed">
            As faculdades parceiras do Bolsa Click aceitam ENEM como processo seletivo, mas{' '}
            <strong>não impõem nota mínima específica</strong>. Você pode usar o ENEM pra agilizar
            o ingresso (sem fazer vestibular) e ainda assim conseguir bolsa de 25% a 85%. Pra quem
            não fez o ENEM, o processo seletivo próprio da faculdade (geralmente uma redação online)
            substitui sem alterar o desconto.
          </p>
          <p className="text-ink-700 leading-relaxed mt-4">
            <Link href="/enem" className="underline decoration-1 underline-offset-4">
              Tudo sobre o ENEM 2026 →
            </Link>
          </p>
        </div>
      </section>

      <section id="bolsa-ead" className="bg-paper py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            Bolsas em faculdades EAD — até 85% de desconto
          </h2>
          <p className="text-ink-700 leading-relaxed">
            Cursos a distância (EAD) são onde as bolsas próprias chegam aos maiores percentuais —
            até <strong>85% de desconto</strong> em faculdades parceiras como Anhanguera, Unopar,
            Pitágoras e Unime. Combinada com a mensalidade base de EAD (que já é mais baixa que a
            do presencial), a economia final é a maior do mercado privado.
          </p>
          <h3 className="font-display text-xl text-ink-900 mt-6 mb-3">Por que EAD tem bolsa maior</h3>
          <p className="text-ink-700 leading-relaxed">
            Faculdades de EAD operam com custo menor por aluno (sem campus presencial, materiais
            digitais, professores compartilhados entre polos) e conseguem repassar parte dessa
            economia em desconto. O resultado: cursos como Pedagogia EAD, Administração EAD,
            Análise e Desenvolvimento de Sistemas EAD e Gestão de Recursos Humanos EAD podem
            custar entre R$ 80 e R$ 250 mensais com bolsa, vs R$ 600+ no presencial sem bolsa.
          </p>
          <h3 className="font-display text-xl text-ink-900 mt-6 mb-3">EAD vale a pena pra todos os cursos?</h3>
          <p className="text-ink-700 leading-relaxed">
            EAD funciona bem pra cursos teóricos (Administração, Direito, Pedagogia, Marketing,
            Contábeis). Pra cursos com prática intensa (Enfermagem, Educação Física, Medicina
            Veterinária), o MEC exige percentual de carga horária presencial em polos credenciados
            — o que ainda funciona, mas com menos flexibilidade. Medicina, Odontologia,
            Psicologia e cursos da área da saúde com alto componente prático continuam exclusivos
            do presencial e semipresencial.
          </p>
          <p className="text-ink-700 leading-relaxed mt-4">
            <Link href="/faculdade-ead" className="underline decoration-1 underline-offset-4">
              Guia completo de faculdade EAD →
            </Link>
          </p>
        </div>
      </section>

      <section id="bolsa-permanencia" className="bg-white py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            Bolsa de permanência — auxílio mensal além do desconto
          </h2>
          <p className="text-ink-700 leading-relaxed">
            A <strong>Bolsa Permanência do MEC</strong> é um benefício complementar à bolsa de
            estudo: enquanto a bolsa do ProUni cobre a mensalidade, a bolsa de permanência paga
            um auxílio mensal em dinheiro pra cobrir transporte, alimentação, material didático e
            outros custos do dia-a-dia. O objetivo é evitar que estudantes em vulnerabilidade
            socioeconômica abandonem o curso por falta de recursos pra se manter.
          </p>
          <h3 className="font-display text-xl text-ink-900 mt-6 mb-3">Quem tem direito</h3>
          <p className="text-ink-700 leading-relaxed">
            Pra receber a bolsa de permanência, o estudante precisa: (1) ser bolsista integral
            (100%) do ProUni, (2) ter renda familiar per capita de até 1,5 salário mínimo, (3)
            estar matriculado em curso com carga horária diária mínima de 6 horas (em geral,
            cursos da área da saúde, engenharias e licenciaturas), (4) solicitar o benefício
            diretamente no portal do MEC após aprovação no ProUni.
          </p>
          <h3 className="font-display text-xl text-ink-900 mt-6 mb-3">Valor e duração</h3>
          <p className="text-ink-700 leading-relaxed">
            O valor mensal segue tabela atualizada anualmente pelo MEC (próximo ao valor de uma
            bolsa CAPES de iniciação científica). É pago durante todo o semestre letivo enquanto
            o estudante mantém aprovação acadêmica e os critérios de renda. Existe também
            <strong> Auxílio Permanência específico pra estudantes indígenas e quilombolas</strong>,
            com valor diferenciado e critérios próprios.
          </p>
        </div>
      </section>

      <section id="cuidados" className="bg-paper py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            Cuidados ao buscar bolsa de estudo
          </h2>
          <p className="text-ink-700 leading-relaxed">
            O mercado de bolsas no Brasil tem ofertas legítimas e também atalhos perigosos. Antes
            de fechar qualquer matrícula com promessa de desconto, valide três pontos pra evitar
            cair em golpe ou perder dinheiro com curso de qualidade duvidosa.
          </p>
          <h3 className="font-display text-xl text-ink-900 mt-6 mb-3">1. Verifique o reconhecimento da faculdade no e-MEC</h3>
          <p className="text-ink-700 leading-relaxed">
            Toda faculdade reconhecida pelo MEC tem cadastro consultável publicamente no portal{' '}
            <strong>e-mec.mec.gov.br</strong>. Confira o nome da instituição, a nota MEC (de 1 a
            5 — abaixo de 3 indica problemas estruturais), se o curso específico que você quer
            tem autorização vigente. Curso não reconhecido = diploma sem validade pra concursos
            públicos e mestrado.
          </p>
          <h3 className="font-display text-xl text-ink-900 mt-6 mb-3">2. Bolsa não cobra antecipado</h3>
          <p className="text-ink-700 leading-relaxed">
            Bolsa de estudo legítima — seja ProUni, FIES ou bolsa própria via Bolsa Click — nunca
            cobra do aluno valor antecipado pra "garantir a vaga", "agilizar a inscrição" ou
            "destravar o desconto". O ProUni e FIES são 100% gratuitos no portal do MEC. A bolsa
            própria via Bolsa Click é grátis — você só paga a mensalidade já com desconto direto
            pra faculdade, depois de matriculado. Cobrança antecipada de "taxa de bolsa" é golpe.
          </p>
          <h3 className="font-display text-xl text-ink-900 mt-6 mb-3">3. Compare antes de fechar</h3>
          <p className="text-ink-700 leading-relaxed">
            O mesmo curso pode ter ofertas muito diferentes entre faculdades parceiras. Antes de
            confirmar matrícula, simule o custo total considerando: (a) mensalidade com bolsa, (b)
            taxa de matrícula (se houver), (c) material didático (digital incluso em EAD,
            comprado a parte em alguns presenciais), (d) atividades complementares obrigatórias.
            Bolsa de 50% numa faculdade pode sair mais cara que bolsa de 30% em outra dependendo
            dessas variáveis.
          </p>
          <h3 className="font-display text-xl text-ink-900 mt-6 mb-3">4. Mantenha a bolsa válida durante o curso</h3>
          <p className="text-ink-700 leading-relaxed">
            Bolsa não é vitalícia — depende de você manter requisitos durante toda a graduação.
            Os principais motivos de perda: (a) reprovação em duas ou mais disciplinas no mesmo
            semestre (no ProUni), (b) trancamento de matrícula sem justificativa formal, (c)
            atraso superior a 90 dias no pagamento da parte que cabe a você (em bolsas parciais),
            (d) mudança expressiva na renda familiar comprovada no caso do ProUni. Acompanhe seu
            histórico acadêmico todo semestre.
          </p>
        </div>
      </section>

      <section id="passo-a-passo" className="bg-white py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900">
              Passo-a-passo: como conseguir sua bolsa
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              ({String(PASSOS.length).padStart(2, '0')})
            </span>
          </div>
          <p className="text-ink-700 leading-relaxed mb-8 max-w-3xl">
            Seis passos pra sair do interesse e chegar à matrícula com bolsa válida. Vale pra
            ProUni, FIES ou bolsa própria — os dois primeiros passos definem qual caminho seguir.
          </p>
          <ol className="space-y-px bg-hairline">
            {PASSOS.map((p, i) => (
              <li key={i} className="bg-white p-6 flex gap-6">
                <span className="font-mono num-tabular text-2xl text-ink-500 shrink-0 min-w-[3rem]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-display text-xl text-ink-900 mb-2">{p.titulo}</h3>
                  <p className="text-ink-700 leading-relaxed">{p.detalhe}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="bolsas-por-cidade" className="bg-paper py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              Bolsas por cidade
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              ({String(BRAZILIAN_CITIES.length).padStart(3, '0')})
            </span>
          </div>
          <p className="text-ink-700 leading-relaxed mb-6 max-w-3xl">
            Bolsas de estudo em todas as 27 capitais e nos principais municípios brasileiros.
            Clique na sua cidade pra ver ofertas de faculdades parceiras com bolsa disponível.
          </p>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-hairline">
            {BRAZILIAN_CITIES.map(c => (
              <li key={c.slug} className="bg-paper">
                <Link
                  href={`/bolsas-de-estudo/${c.slug}`}
                  className="block px-4 py-3 transition-colors hover:bg-white"
                >
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">
                    {c.state}
                  </span>
                  <span className="block font-display text-base text-ink-900">
                    {c.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="faculdades-parceiras" className="bg-white py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              Faculdades parceiras com bolsa
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              ({String(institutions.length).padStart(2, '0')})
            </span>
          </div>
          <p className="text-ink-700 leading-relaxed mb-6 max-w-3xl">
            Todas as faculdades parceiras do Bolsa Click são reconhecidas pelo MEC e oferecem
            bolsas próprias de estudo via marketplace. Clique pra ver cursos e descontos
            disponíveis em cada uma.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-hairline">
            {institutions.map(inst => (
              <li key={inst.slug} className="bg-white">
                <Link
                  href={`/faculdades/${inst.slug}`}
                  className="block px-5 py-4 transition-colors hover:bg-paper"
                >
                  <span className="block font-display text-lg text-ink-900">
                    {inst.fullName}
                  </span>
                  <span className="block font-mono text-[11px] text-ink-500 mt-1">
                    {inst.mecRating ? `Nota MEC ${inst.mecRating}` : 'Reconhecida pelo MEC'}
                    {inst.campusCount ? ` · ${inst.campusCount} polos` : ''}
                    {inst.modalities.length ? ` · ${inst.modalities.map(m => m === 'EAD' ? 'EAD' : m === 'PRESENCIAL' ? 'Presencial' : 'Semipresencial').join(', ')}` : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="cursos-em-destaque" className="bg-paper py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              Cursos em destaque
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              ({String(TOP_CURSOS.length).padStart(2, '0')})
            </span>
          </div>
          <p className="text-ink-700 leading-relaxed mb-6 max-w-3xl">
            Cursos mais procurados com bolsa de estudo disponível. Inclui graduação (bacharelado e
            licenciatura), cursos tecnólogos e pós-graduação lato sensu.
          </p>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-hairline">
            {TOP_CURSOS.map(c => (
              <li key={c.slug} className="bg-paper">
                <Link
                  href={`/cursos/${c.slug}`}
                  className="block px-4 py-3 transition-colors hover:bg-white"
                >
                  <span className="block font-display text-base text-ink-900">
                    {c.apiCourseName}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <VisibleFaq
        items={FAQ_ITEMS}
        heading="Perguntas frequentes sobre bolsas de estudo"
      />
    </>
  )
}
