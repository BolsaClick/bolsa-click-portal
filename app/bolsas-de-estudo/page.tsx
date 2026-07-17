import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/app/lib/prisma'
import { BRAZILIAN_CITIES } from '@/app/lib/constants/brazilian-cities'
import { TOP_CURSOS } from '@/app/cursos/_data/cursos'
import { VisibleFaq } from '@/app/cursos/[slug]/_seo/CourseSeoSections'
import Filter from '@/app/components/molecules/Filter'
import BestOffersSection from '@/app/components/organisms/BestOffersSection'
import { FontesConsultadas } from '@/app/components/seo/FontesConsultadas'
import CalendarioBolsas2026 from './_components/CalendarioBolsas2026'
import ComparadorCursos from './_components/ComparadorCursos'
import DepoimentosSection from './_components/DepoimentosSection'
import ProUniAlternativasSection from './_components/ProUniAlternativasSection'
import TrustBadges from './_components/TrustBadges'
import { CALENDARIO_2026, classifyEvents } from './_data/calendario-2026'
import { OFF_TOPIC_NOINDEX_SLUGS } from '@/app/lib/blog/noindex-slugs'

const SITE_URL = 'https://www.bolsaclick.com.br'

// Datas de freshness pra Article schema + UI. Atualizar manualmente quando
// fizer revisão editorial significativa do pillar (regra do roadmap M3/M5).
const DATE_PUBLISHED = '2025-08-12'
const DATE_MODIFIED = '2026-06-11'
const DATE_MODIFIED_LABEL = '11 de junho de 2026'

// Autor real nomeado (E-E-A-T): Person verificável > Organization genérica.
// sameAs: adicionar URL do LinkedIn pessoal quando disponível (1 linha).
const AUTHOR = {
  name: 'Rodrigo Silvério',
  jobTitle: 'Fundador do Bolsa Click',
  url: `${SITE_URL}/sobre/equipe-editorial`,
  sameAs: [] as string[],
}

export const revalidate = 86400 // 24h — conteúdo institucional muda devagar

export const metadata: Metadata = {
  // Sem "| Bolsa Click" aqui: o template do layout raiz (`%s | Bolsa Click`) já
  // anexa a marca uma vez. Repetir gerava "... | Bolsa Click | Bolsa Click" (92
  // chars, truncado no SERP). Título enxuto e front-loaded no head term.
  title: 'Bolsas de Estudo até 80%: Compare Faculdades e Preços',
  description: `Compare bolsas de estudo de até 80% em cursos de graduação, pós e tecnólogos. ${BRAZILIAN_CITIES.length} cidades, faculdades reconhecidas pelo MEC, EAD e presencial. ProUni, FIES e bolsa própria.`,
  keywords: [
    'bolsa de estudo',
    'bolsas de estudo',
    `bolsas de estudo ${new Date().getFullYear()}`,
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
// CONTEÚDO EDITORIAL (data-driven pra reuso em schema FAQ e UI)
// ─────────────────────────────────────────────────────────────────────────

const TIPOS_BOLSA = [
  {
    titulo: 'Bolsa integral (100%)',
    resumo:
      'Bolsa integral é o tipo de bolsa de estudo que cobre 100% da mensalidade da faculdade durante todo o curso. É oferecida pelo ProUni (programa do Governo Federal) e por faculdades particulares parceiras em vagas específicas. Quem recebe não paga nada além de taxas administrativas eventuais.',
    requisito: 'ENEM 450+ e renda familiar de até 1,5 salário mínimo por pessoa (ProUni) ou negociação direta com faculdade parceira.',
  },
  {
    titulo: 'Bolsa parcial (25% a 75%)',
    resumo:
      'Bolsa parcial é a bolsa de estudo que cobre parte da mensalidade — geralmente 50% pelo ProUni ou de 25% a 75% por bolsas próprias de faculdades particulares. Ideal pra quem não fecha o critério de renda da bolsa integral mas ainda quer reduzir o custo da faculdade significativamente.',
    requisito: 'ENEM 450+ e renda familiar de até 3 salários mínimos por pessoa (ProUni 50%) ou inscrição direta nas faculdades parceiras.',
  },
  {
    titulo: 'Bolsa de permanência',
    resumo:
      'Bolsa de permanência é um auxílio mensal em dinheiro pago pelo MEC pra cobrir custos do dia-a-dia além da mensalidade (transporte, alimentação, material didático). É concedida a estudantes de bolsa integral do ProUni em situação de vulnerabilidade socioeconômica, complementando a bolsa de estudo.',
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
    onde: 'Anhanguera, Estácio, Unopar, Pitágoras, Unime e outras parceiras',
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
      'O caminho mais comum é pelo ProUni: ter feito o ENEM com nota mínima de 450 pontos (sem zerar a redação), comprovar renda familiar per capita de até 1,5 salário mínimo e se inscrever no portal do MEC nas duas edições anuais (fevereiro e julho). A bolsa integral cobre 100% da mensalidade durante todo o curso, e a seleção é pela nota — quanto maior, mais chance em cursos concorridos. Quem cursou todo o ensino médio em escola pública (ou particular com bolsa integral) já cumpre o critério de formação exigido. Alternativas: o SISU dá vaga gratuita em universidade pública pra notas competitivas, e algumas faculdades parceiras oferecem bolsas próprias de 100% em vagas pontuais, sem critério de renda — elas aparecem no catálogo do Bolsa Click quando disponíveis, com inscrição gratuita. Vale acompanhar as duas frentes: a federal nas janelas de fevereiro e julho, e a privada o ano inteiro.',
  },
  {
    question: 'Como concorrer a uma bolsa de estudo?',
    answer:
      'Pra concorrer a uma bolsa de estudo há dois caminhos. Pelos programas federais (ProUni e FIES): inscreva-se no portal do MEC nas edições de fevereiro e julho usando a nota do ENEM (mínimo 450, sem zerar a redação) e comprove a renda familiar. Por bolsa própria de faculdade parceira via Bolsa Click: escolha curso, modalidade e cidade, compare as ofertas e finalize a inscrição online o ano inteiro — sem nota de corte e sem critério de renda.',
  },
  {
    question: 'Qual a diferença entre ProUni e FIES?',
    answer:
      'O ProUni é uma bolsa de estudo (desconto): você não paga a mensalidade durante o curso — o governo compensa a faculdade com isenção fiscal. O FIES é um financiamento: você paga uma mensalidade reduzida durante o curso e quita o restante depois de formado, com juros subsidiados. Ambos exigem ENEM com 450 pontos ou mais e redação acima de zero, mas os limites de renda diferem: até 1,5 salário mínimo per capita pra bolsa integral do ProUni (até 3 pra parcial de 50%) e até 3 salários mínimos pro FIES. Na prática, o ProUni atende quem precisa estudar sem custo nenhum; o FIES atende quem aceita pagar depois pra não depender de bolsa. Os dois podem ser combinados num caso específico: bolsa parcial ProUni de 50% + FIES financiando os outros 50% — combinação permitida pelo MEC e usada por muitos estudantes.',
  },
  {
    question: 'Posso conseguir bolsa sem ter feito o ENEM?',
    answer:
      'Sim. Bolsas próprias de faculdades parceiras do Bolsa Click não exigem ENEM — você usa o processo seletivo da própria instituição, que em geral é uma redação ou prova simples feita online, com resultado em poucas horas e matrícula liberada em até 48h. O desconto não muda por causa disso: a bolsa de até 85% vale igualmente pra quem entra por vestibular online, por nota de ENEM antiga ou por aproveitamento do histórico do ensino médio. Quem tem ENEM de qualquer edição pode usá-lo só pra agilizar o ingresso, sem refazer prova. Já ProUni, FIES e SISU, por serem programas federais, exigem ENEM recente com nota mínima de 450 pontos e redação acima de zero — então, sem ENEM, o caminho realista é a bolsa própria, que fica com inscrição aberta o ano inteiro.',
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
    answer: `O Bolsa Click trabalha com ${BRAZILIAN_CITIES.length}+ cidades e faculdades parceiras de alcance nacional (Anhanguera, Estácio, Unopar, Pitágoras, Unime e outras reconhecidas pelo MEC). Pelo ProUni e FIES, mais de 1.200 instituições particulares aderem aos programas federais. A disponibilidade da bolsa varia por curso, cidade e modalidade.`,
  },
  {
    question: 'Bolsa de estudo serve pra EAD?',
    answer:
      'Serve sim, e é onde os descontos costumam ser maiores. Cursos EAD em faculdades parceiras do Bolsa Click têm bolsas próprias de até 85% da mensalidade, e o ProUni também cobre cursos a distância desde 2017 — com os mesmos critérios de nota e renda do presencial. A vantagem econômica do EAD é dupla: a mensalidade base já é mais baixa que a do presencial (o custo operacional por aluno é menor) e o percentual de bolsa aplicado costuma ser maior, então o valor final fica na faixa de R$ 99 a R$ 250 por mês na maioria dos cursos do catálogo. O diploma EAD tem a mesma validade legal do presencial quando o curso é reconhecido pelo MEC, e cursos com componente prático (como os da área da saúde) usam polos presenciais pra laboratórios e estágios obrigatórios.',
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
    answer: `Depende do curso, modalidade e cidade. Entre as parceiras do Bolsa Click, as maiores em alcance nacional são Anhanguera (presencial e EAD em ${BRAZILIAN_CITIES.length}+ cidades), Unopar (líder em EAD com mais de 800 polos), Estácio (forte presença nas capitais), Pitágoras e Unime. Todas reconhecidas pelo MEC. A "melhor" pra você é a que combina curso desejado + cidade + maior bolsa disponível.`,
  },
  {
    question: 'Quanto economizo com bolsa de estudo?',
    answer:
      'Com bolsa integral (ProUni 100% ou bolsa própria de 100%), a economia é o valor total do curso — em torno de R$ 60 mil a R$ 200 mil dependendo da graduação. Com bolsa de 50% a 85%, a economia varia de R$ 30 mil a R$ 150 mil. EAD com bolsa de 85% chega a custar R$ 80 a R$ 200 mensais, dependendo do curso.',
  },
  {
    question: 'Como sei se a bolsa de estudo é confiável?',
    answer:
      'Verifique três coisas: (1) a faculdade tem cadastro válido no e-MEC (consulta gratuita no portal oficial emec.mec.gov.br, incluindo a nota de avaliação do MEC), (2) a bolsa é negociada com a instituição, não com terceiros — a Bolsa Click intermedia direto com as faculdades parceiras, sem cobrar nada do aluno —, e (3) o desconto aparece descrito no contrato e aplicado já na primeira mensalidade. Nunca pague valor antecipado por promessa de bolsa: cobrança pra "garantir vaga", "reservar desconto" ou "liberar inscrição" é o sinal mais claro de golpe, porque bolsa legítima não tem taxa — ProUni e FIES são gratuitos no portal do MEC e a bolsa própria é gratuita na plataforma. Em caso de dúvida, ligue pra própria faculdade pelo telefone do site institucional e confirme se a oferta existe antes de enviar qualquer documento.',
  },
]

type ScholarshipGuide = { slug: string; title: string }

const FALLBACK_SCHOLARSHIP_GUIDES: ScholarshipGuide[] = [
  { slug: 'como-conseguir-bolsa-estudo-2026-guia-passo-a-passo', title: 'Como conseguir bolsa de estudo em 2026: guia passo a passo' },
  { slug: 'prouni-2026-inscricao-notas-de-corte-como-usar', title: 'ProUni 2026: inscrição, notas de corte e como usar' },
  { slug: 'fies-2026-como-funciona-quem-tem-direito-como-solicitar', title: 'FIES 2026: como funciona e quem tem direito' },
  { slug: 'bolsa-integral-100-como-conseguir-2026', title: 'Bolsa integral (100%): como conseguir em 2026' },
  { slug: 'bolsa-de-estudo-sem-enem-como-conseguir', title: 'Bolsa de estudo sem ENEM: como conseguir' },
  { slug: 'bolsa-sem-prouni', title: 'Bolsa de estudo sem ProUni: 5 alternativas' },
  { slug: 'nota-minima-enem-prouni-quanto-precisa', title: 'Nota mínima do ENEM pro ProUni: quanto precisa' },
  { slug: 'como-conseguir-bolsa-estudo-50-faculdade', title: 'Bolsa de 50% na faculdade: como conseguir' },
  { slug: 'bolsa-de-estudo-golpe-como-evitar', title: 'Bolsa de estudo é golpe? Como evitar fraudes' },
  { slug: 'mensalidade-de-psicologia-com-bolsa', title: 'Mensalidade de Psicologia com bolsa' },
  { slug: 'mensalidade-de-direito-faculdade-particular', title: 'Mensalidade de Direito em faculdade particular' },
  { slug: 'como-conseguir-bolsa-anhanguera-sem-enem', title: 'Bolsa na Anhanguera sem ENEM: passo a passo' },
  { slug: 'como-conseguir-bolsa-estacio-sem-enem', title: 'Bolsa na Estácio sem ENEM: passo a passo' },
  { slug: 'anhanguera-vale-a-pena-mec-bolsas', title: 'Anhanguera vale a pena? Nota MEC e bolsas' },
]

async function getScholarshipGuides(): Promise<ScholarshipGuide[]> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        isActive: true,
        publishedAt: { not: null, lte: new Date() },
        slug: { notIn: [...OFF_TOPIC_NOINDEX_SLUGS] },
        categories: {
          some: { slug: { in: ['bolsas-de-estudo', 'enem'] }, isActive: true },
        },
      },
      select: { slug: true, title: true },
      orderBy: { publishedAt: 'desc' },
      take: 24,
    })

    return posts.length > 0 ? posts : FALLBACK_SCHOLARSHIP_GUIDES
  } catch (error) {
    console.error('[bolsas-de-estudo] erro ao carregar guias; usando fallback:', error)
    return FALLBACK_SCHOLARSHIP_GUIDES
  }
}

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
  const [institutions, scholarshipGuides] = await Promise.all([
    getActiveInstitutions(),
    getScholarshipGuides(),
  ])

  const pageUrl = `${SITE_URL}/bolsas-de-estudo`

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Programas de Estudo', item: `${SITE_URL}/programas` },
      { '@type': 'ListItem', position: 3, name: 'Bolsas de Estudo', item: pageUrl },
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

  // Article schema pra GEO: dateModified visível + author = sinal forte de
  // freshness e autoridade pra AI Overviews / ChatGPT / Perplexity. Mesmo
  // sendo hub page, o pillar tem conteúdo editorial autêntico (12 seções).
  // author é Person real (fundador) — pessoa verificável, não fabricada
  // (penalty risk + desonesto). reviewedBy fica na Equipe Editorial, criando
  // revisão cruzada (entidade diferente do autor) em vez de auto-revisão.
  // citation[] aponta pras fontes primárias seguidas por AI crawlers.
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Bolsas de Estudo no Brasil: ProUni, FIES, bolsa própria e EAD',
    description:
      `Guia completo de bolsas de estudo no Brasil em ${new Date().getFullYear()}: tipos (integral, parcial, permanência), ProUni vs FIES vs bolsa própria, passo-a-passo e FAQ.`,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}/sobre/equipe-editorial#rodrigo-silverio`,
      name: AUTHOR.name,
      jobTitle: AUTHOR.jobTitle,
      url: AUTHOR.url,
      ...(AUTHOR.sameAs.length > 0 && { sameAs: AUTHOR.sameAs }),
      worksFor: {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Bolsa Click',
      },
    },
    reviewedBy: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/sobre/equipe-editorial#editorial-team`,
      name: 'Equipe Editorial Bolsa Click',
      url: `${SITE_URL}/sobre/equipe-editorial`,
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
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    about: [
      { '@type': 'Thing', name: 'ProUni' },
      { '@type': 'Thing', name: 'FIES' },
      { '@type': 'Thing', name: 'Bolsa de estudo' },
      { '@type': 'Thing', name: 'ENEM' },
      { '@type': 'Thing', name: 'Educação superior no Brasil' },
    ],
    citation: [
      {
        '@type': 'CreativeWork',
        name: 'ProUni — Programa Universidade para Todos',
        publisher: { '@type': 'GovernmentOrganization', name: 'MEC' },
        url: 'https://acessounico.mec.gov.br/prouni',
      },
      {
        '@type': 'CreativeWork',
        name: 'FIES — Fundo de Financiamento Estudantil',
        publisher: { '@type': 'GovernmentOrganization', name: 'FNDE/MEC' },
        url: 'https://acessounico.mec.gov.br/fies',
      },
      {
        '@type': 'CreativeWork',
        name: 'e-MEC — Cadastro de Instituições e Cursos',
        publisher: { '@type': 'GovernmentOrganization', name: 'MEC' },
        url: 'https://emec.mec.gov.br',
      },
      {
        '@type': 'CreativeWork',
        name: 'INEP — Indicadores Educacionais',
        publisher: { '@type': 'GovernmentOrganization', name: 'INEP' },
        url: 'https://www.gov.br/inep',
      },
    ],
    isBasedOn: {
      '@type': 'Dataset',
      '@id': `${pageUrl}#bolsa-catalog`,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['[data-speakable]'],
    },
  }

  // Dataset schema descrevendo o catálogo first-party — sinal forte de
  // autoridade pra AI Overviews / ChatGPT / Perplexity. Shape reusada de
  // /estudos/panorama-bolsa-2026 (já validada no Rich Results Test).
  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${pageUrl}#bolsa-catalog`,
    name: 'Catálogo Bolsa Click — Bolsas de Estudo no Brasil 2026',
    description: `Catálogo first-party de bolsas de estudo no Brasil em 2026: ${TOP_CURSOS.length}+ cursos de graduação, pós e tecnólogos cobertos em ${institutions.length} faculdades parceiras reconhecidas pelo MEC, com ofertas em ${BRAZILIAN_CITIES.length} cidades brasileiras. Dados atualizados em tempo real via API do catálogo, refletindo mensalidades, percentuais de bolsa, modalidades (EAD, presencial, semipresencial) e cobertura geográfica reais.`,
    url: pageUrl,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    creator: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Bolsa Click',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Bolsa Click',
      url: SITE_URL,
    },
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    spatialCoverage: { '@type': 'Country', name: 'Brasil' },
    temporalCoverage: '2026',
    keywords: [
      'bolsa de estudo',
      'bolsas de estudo',
      'graduação',
      'pós-graduação',
      'EAD',
      'mensalidade faculdade',
      'desconto faculdade',
    ],
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    variableMeasured: [
      'Mensalidade com bolsa',
      'Percentual de desconto',
      'Modalidade do curso',
      'Cobertura geográfica',
      'Nota MEC da instituição',
      'Disponibilidade da oferta',
    ],
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'text/html',
      contentUrl: pageUrl,
    },
  }

  // Event[] schema dos próximos eventos do calendário sazonal (próximos 90 dias +
  // janelas ativas). Sinal de freshness pro Article + entrada potencial em rich
  // results de "eventos". Filtramos só eventos futuros/ativos pra evitar marcar
  // datas passadas como Event ativo.
  const upcomingEvents = classifyEvents(CALENDARIO_2026).filter(
    ev => ev.bucket === 'ABERTAS' || ev.bucket === 'PROXIMAS_90_DIAS',
  )
  const eventSchemas = upcomingEvents.map(ev => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${pageUrl}#event-${ev.id}`,
    name: `${ev.programa} — ${ev.faseLabel}`,
    description: ev.notes ?? `Janela de ${ev.faseLabel.toLowerCase()} do programa ${ev.programa} em 2026.`,
    startDate: ev.startDate,
    endDate: ev.endDate,
    eventStatus:
      ev.status === 'CONFIRMADO'
        ? 'https://schema.org/EventScheduled'
        : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'VirtualLocation',
      url: ev.sourceUrl,
    },
    organizer: {
      '@type': 'Organization',
      name: ev.organizer,
      url: ev.sourceUrl,
    },
    isAccessibleForFree: true,
    inLanguage: 'pt-BR',
  }))

  // EducationalOrganization por parceiro — sinal de relacionamento institucional
  // pra Knowledge Graph. Pega top 6 instituições ativas; campos vêm do DB
  // (Institution.founded, studentCount, mecRating) — nunca inventados.
  const educationalOrgSchemas = institutions.slice(0, 6).map(inst => ({
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${SITE_URL}/faculdades/${inst.slug}#org`,
    name: inst.fullName ?? inst.name,
    alternateName: inst.shortName ?? undefined,
    url: `${SITE_URL}/faculdades/${inst.slug}`,
    ...(inst.mecRating && { hasCredential: `Nota MEC ${inst.mecRating}` }),
    ...(inst.campusCount && {
      department: {
        '@type': 'QuantitativeValue',
        name: 'Polos',
        value: inst.campusCount,
      },
    }),
    sameAs: [`https://emec.mec.gov.br/emec/consulta-cadastro/detalhamento/${inst.slug}`],
  }))

  const jsonLd = [
    breadcrumbSchema,
    itemListSchema,
    websiteSchema,
    faqSchema,
    articleSchema,
    datasetSchema,
    ...educationalOrgSchemas,
    ...eventSchemas,
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
            <Link href="/programas" className="hover:text-ink-900">Programas de Estudo</Link>
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
          <p className="mt-6 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500">
            Por <span className="text-ink-700">{AUTHOR.name}, {AUTHOR.jobTitle.toLowerCase()}</span>
            <span className="mx-2">·</span>
            Revisado pela <span className="text-ink-700">Equipe Editorial</span>
            <span className="mx-2">·</span>
            Atualizado em{' '}
            <time dateTime={DATE_MODIFIED} className="text-ink-700">
              {DATE_MODIFIED_LABEL}
            </time>
          </p>
          <div className="mt-8 flex flex-wrap gap-6 font-mono text-[12px] tracking-[0.16em] uppercase text-ink-500">
            <span><strong className="text-ink-900 num-tabular">{TOP_CURSOS.length}+</strong> cursos</span>
            <span><strong className="text-ink-900 num-tabular">{institutions.length}</strong> faculdades</span>
            <span><strong className="text-ink-900 num-tabular">{BRAZILIAN_CITIES.length}</strong> cidades</span>
            <span><strong className="text-ink-900 num-tabular">até 80%</strong> de desconto</span>
          </div>
        </div>
      </header>

      {/* Trust badges — alta visibilidade, suporta personas "Maria" (mãe) e
          "Tatiane" (trabalhadora) que precisam de confiança visível antes
          de prosseguir. Dados só de fontes oficiais (CLAUDE.md). */}
      <TrustBadges />

      {/* GEO direct-answer snippet — primeiros 40-60 palavras respondem a query principal */}
      <section className="bg-white py-10 md:py-12 border-b border-hairline" data-speakable="answer">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="text-lg md:text-xl text-ink-900 font-medium leading-relaxed">
            Pra conseguir uma <strong>bolsa de estudo</strong> de 50% a 100% na faculdade no Brasil, o caminho mais rápido é candidatar-se ao <Link href="/prouni" className="underline decoration-1 underline-offset-4 hover:text-ink-700">ProUni</Link> com sua nota do ENEM (bolsa integral ou parcial em faculdades particulares) ou buscar bolsa própria em faculdades EAD parceiras, onde os descontos chegam a 85% sem nota de corte. Veja abaixo cada opção, requisitos e o passo-a-passo.
          </p>
        </div>
      </section>

      {/* Split de intent — duas portas de entrada explícitas nos primeiros 600px.
          Persona "Renata" (pós-resultado ProUni, maior volume sazonal fev-mar)
          precisa ver o caminho "sem espera" sem rolar a página inteira. */}
      <section aria-label="Escolha o seu caminho pra bolsa" className="bg-white pb-10 md:pb-12 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-hairline border border-hairline">
            <div className="bg-paper p-6 md:p-8">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 block mb-3">
                Caminho 1 · Programas federais
              </span>
              <h3 className="font-display text-xl md:text-2xl text-ink-900 mb-3">
                Tenho nota do ENEM e renda dentro do limite
              </h3>
              <p className="text-ink-700 text-[15px] leading-relaxed mb-5">
                ENEM com 450+ e renda familiar de até 1,5 salário mínimo per capita (bolsa
                integral) ou até 3 (parcial)? O ProUni dá bolsa de 50% a 100% — inscrições em
                fevereiro e julho no portal do MEC, usando só a nota.
              </p>
              <Link
                href="/prouni"
                className="inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.18em] uppercase text-ink-900 border-b-2 border-ink-900 pb-1 hover:text-bolsa-secondary hover:border-bolsa-secondary transition-colors"
              >
                Ver guia do ProUni →
              </Link>
            </div>
            <div className="bg-paper p-6 md:p-8">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 block mb-3">
                Caminho 2 · Bolsa própria
              </span>
              <h3 className="font-display text-xl md:text-2xl text-ink-900 mb-3">
                Quero começar agora, sem ENEM e sem fila
              </h3>
              <p className="text-ink-700 text-[15px] leading-relaxed mb-5">
                Não fez ENEM, não fecha o critério de renda ou perdeu a janela do ProUni? A
                bolsa própria de faculdade parceira chega a 85% no EAD, sem nota de corte, com
                inscrição grátis e aberta o ano inteiro.
              </p>
              <Link
                href="#buscar"
                className="inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.18em] uppercase text-ink-900 border-b-2 border-ink-900 pb-1 hover:text-bolsa-secondary hover:border-bolsa-secondary transition-colors"
              >
                Comparar bolsas agora →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA simulador — desambigua os dois caminhos acima (ProUni vs bolsa própria)
          com uma ferramenta interativa. Cross-link pra frente P1 do roadmap. */}
      <section aria-label="Simulador de bolsa" className="bg-bolsa-secondary/5 py-8 md:py-10 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-bolsa-secondary block mb-2">
                Não sabe por onde começar?
              </span>
              <h2 className="font-display text-xl md:text-2xl text-ink-900 mb-1">
                Simule sua bolsa em 1 minuto
              </h2>
              <p className="text-ink-700 text-[15px] leading-relaxed max-w-xl">
                Informe curso, nota do ENEM e renda e descubra na hora se você se qualifica
                pra ProUni, FIES ou bolsa própria — com as ofertas reais pro seu curso.
              </p>
            </div>
            <Link
              href="/simulador-de-bolsa"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-bolsa-secondary text-white text-sm font-medium rounded-md hover:opacity-90"
            >
              Simular minha bolsa →
            </Link>
          </div>
        </div>
      </section>

      {/* "Em números" — dados scannable nos primeiros 30% do documento. Formato
          tabular = extração direta por AI Overviews/Perplexity. Só números
          verificáveis (CLAUDE.md): Portaria MEC pro ProUni, catálogo first-party
          pro resto — cada linha com fonte explícita. */}
      <section
        aria-label="Bolsas de estudo em números"
        className="bg-paper py-10 md:py-12 border-b border-hairline"
        data-speakable="numeros"
      >
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-6">
            Bolsas de estudo em números (2026)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">
                Principais números das bolsas de estudo no Brasil em 2026, com fonte de cada dado
              </caption>
              <thead>
                <tr className="border-y border-hairline">
                  <th className="text-left py-3 px-3 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500">Indicador</th>
                  <th className="text-left py-3 px-3 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500">Valor</th>
                  <th className="text-left py-3 px-3 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500">Fonte</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-hairline">
                  <td className="py-3 px-3 text-ink-700">Nota mínima do ENEM pra ProUni e FIES</td>
                  <td className="py-3 px-3 text-ink-900 font-medium num-tabular">450 pontos + redação acima de zero</td>
                  <td className="py-3 px-3 text-ink-500">Portaria Normativa MEC nº 1/2015</td>
                </tr>
                <tr className="border-b border-hairline">
                  <td className="py-3 px-3 text-ink-700">Renda máxima — bolsa integral ProUni (100%)</td>
                  <td className="py-3 px-3 text-ink-900 font-medium num-tabular">1,5 salário mínimo per capita</td>
                  <td className="py-3 px-3 text-ink-500">MEC — Acesso Único</td>
                </tr>
                <tr className="border-b border-hairline">
                  <td className="py-3 px-3 text-ink-700">Renda máxima — bolsa parcial ProUni (50%)</td>
                  <td className="py-3 px-3 text-ink-900 font-medium num-tabular">3 salários mínimos per capita</td>
                  <td className="py-3 px-3 text-ink-500">MEC — Acesso Único</td>
                </tr>
                <tr className="border-b border-hairline">
                  <td className="py-3 px-3 text-ink-700">Edições do ProUni por ano</td>
                  <td className="py-3 px-3 text-ink-900 font-medium num-tabular">2 (fevereiro e julho)</td>
                  <td className="py-3 px-3 text-ink-500">MEC — Acesso Único</td>
                </tr>
                <tr className="border-b border-hairline">
                  <td className="py-3 px-3 text-ink-700">Desconto máximo — bolsa própria de parceiras</td>
                  <td className="py-3 px-3 text-ink-900 font-medium num-tabular">85% (EAD) · 80% (presencial)</td>
                  <td className="py-3 px-3 text-ink-500">Catálogo Bolsa Click, jun/2026</td>
                </tr>
                <tr className="border-b border-hairline">
                  <td className="py-3 px-3 text-ink-700">Menor mensalidade EAD com bolsa</td>
                  <td className="py-3 px-3 text-ink-900 font-medium num-tabular">R$ 99/mês</td>
                  <td className="py-3 px-3 text-ink-500">Catálogo Bolsa Click, jun/2026</td>
                </tr>
                <tr className="border-b border-hairline">
                  <td className="py-3 px-3 text-ink-700">Cidades com polos de faculdades parceiras</td>
                  <td className="py-3 px-3 text-ink-900 font-medium num-tabular">{BRAZILIAN_CITIES.length}</td>
                  <td className="py-3 px-3 text-ink-500">Catálogo Bolsa Click, jun/2026</td>
                </tr>
                <tr className="border-b border-hairline">
                  <td className="py-3 px-3 text-ink-700">Instituições particulares aderentes a ProUni/FIES</td>
                  <td className="py-3 px-3 text-ink-900 font-medium num-tabular">1.200+</td>
                  <td className="py-3 px-3 text-ink-500">Sistema e-MEC</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Calendário sazonal — sinal de freshness pro Article + atende persona
          Renata (ProUni-Frustrada). Posicionado alto pra captura mobile-first. */}
      <CalendarioBolsas2026 />

      {/* Bloco "onde conseguir" — captura a intenção de busca "onde conseguir bolsa
          de estudo" (ATP) com resposta direta GEO + interlink pro widget de busca
          (#buscar) e pras landings ProUni/FIES. */}
      <section id="onde-conseguir" className="bg-white py-12 md:py-16 border-b border-hairline" data-speakable="onde-conseguir">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            Onde conseguir bolsa de estudo
          </h2>
          <p className="text-ink-700 leading-relaxed">
            Você consegue bolsa de estudo em três lugares: no{' '}
            <Link href="/prouni" className="underline decoration-1 underline-offset-4">ProUni</Link> e no{' '}
            <Link href="/fies" className="underline decoration-1 underline-offset-4">FIES</Link>{' '}
            (portal do MEC, usando a nota do ENEM) ou direto em faculdades particulares
            parceiras pelo Bolsa Click, onde a bolsa própria chega a <strong>85% sem nota de
            corte nem critério de renda</strong>. A inscrição é grátis e fica aberta o ano inteiro.
          </p>
          <p className="text-ink-700 leading-relaxed mt-3">
            Pela busca abaixo você compara as ofertas reais por curso, modalidade (EAD,
            semipresencial ou presencial) e cidade antes de se cadastrar — sem custo.{' '}
            <Link href="#buscar" className="underline decoration-1 underline-offset-4">
              Comparar bolsas agora →
            </Link>
          </p>
        </div>
      </section>

      {/* Camada funcional marketplace — search widget + offer cards.
          Match com intent transacional dominante na SERP de "bolsas de estudo"
          (60% dos top 10 são marketplaces com filtros e listings visíveis). */}
      <section
        id="buscar"
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

      {/* Depoimentos reais agregados (status APPROVED) — trust signal pra
          personas Maria + Tatiane. Renderiza null se DB tem 0 reviews. */}
      <DepoimentosSection limit={6} />

      {/* Alternativas pra quem não passou no ProUni — atende persona Renata
          (score 36/100, persona crítica). Sazonal: 594K candidatos ProUni 2026. */}
      <ProUniAlternativasSection />

      {/* Internal linking curso+cidade — distribui PageRank para ~48 URLs de alta
          intenção de compra e ajuda o Google a descobrir o padrão /cursos/[slug]/[city].
          Cursos e cidades ordenados por volume de busca (TOP_CURSOS + BRAZILIAN_CITIES). */}
      <section id="bolsas-por-curso" className="bg-paper py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900">
              Bolsas por curso e cidade
            </h2>
          </div>
          <p className="text-ink-700 leading-relaxed mb-8 max-w-3xl text-[15px]">
            Compare bolsas nos cursos mais procurados pelas principais cidades do Brasil.
            Descontos de até 80%, inscrição grátis e resultado em até 48h.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {TOP_CURSOS.slice(0, 6).map(curso => (
              <div key={curso.slug}>
                <h3 className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500 mb-3">
                  {curso.name}
                </h3>
                <ul className="space-y-2">
                  {BRAZILIAN_CITIES.slice(0, 8).map(city => (
                    <li key={city.slug}>
                      <Link
                        href={`/cursos/${curso.slug}/${city.slug}`}
                        className="text-[14px] text-ink-700 hover:text-ink-900 underline decoration-1 underline-offset-2 decoration-hairline transition-colors"
                      >
                        {curso.name} em {city.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/cursos/${curso.slug}`}
                  className="mt-3 inline-block font-mono text-[11px] tracking-[0.16em] uppercase text-ink-500 hover:text-ink-700 transition-colors"
                >
                  Ver {curso.name} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funcionam" className="bg-paper py-12 md:py-16 border-b border-hairline" data-speakable="como-funcionam">
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

      <section id="tipos-de-bolsa" className="bg-white py-12 md:py-16 border-b border-hairline" data-speakable="tipos">
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

      <section id="comparativo-programas" className="bg-paper py-12 md:py-16 border-b border-hairline" data-speakable="comparativo">
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
          {/* Infográfico — primeira imagem de conteúdo da pillar (gap Media 5/15
              na auditoria SXO). SVG leve, indexável no Google Images, alt rico
              com os dados-chave pra acessibilidade + extração por AI. */}
          <figure className="mt-10">
            <Image
              src="/assets/infografico-prouni-fies-bolsa-propria.svg"
              alt="Infográfico comparando ProUni, FIES e bolsa própria: ProUni dá bolsa de 50% ou 100% com ENEM 450+ e renda até 1,5 salário mínimo per capita, inscrições em fevereiro e julho; FIES financia a mensalidade pra pagar após a formatura, com ENEM 450+ e renda até 3 salários mínimos; bolsa própria via Bolsa Click dá até 85% de desconto no EAD, sem ENEM e sem critério de renda, com inscrição grátis o ano inteiro"
              width={1200}
              height={860}
              className="w-full h-auto border border-hairline"
              loading="lazy"
            />
            <figcaption className="mt-3 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500">
              Os três caminhos lado a lado — fontes: MEC e Catálogo Bolsa Click, jun/2026
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Comparador inline de cursos populares — mostra preço real do BFF
          Tartarus. Atende persona "Cláudio — Pai Comparador" (45/100).
          ISR 24h via revalidate do pillar. Degrada silenciosamente se API offline. */}
      <ComparadorCursos />

      <section id="prouni" className="bg-white py-12 md:py-16 border-b border-hairline" data-speakable="prouni">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            ProUni — bolsa integral ou parcial do governo federal
          </h2>
          <p className="text-ink-700 leading-relaxed">
            O <strong>Programa Universidade para Todos (ProUni)</strong> é o maior programa de
            bolsas de estudo do Brasil. Criado pelo MEC (Lei nº 11.096/2005), oferece bolsas
            integrais (100%) e parciais (50%) em faculdades particulares aderentes ao programa,
            em troca de isenções fiscais às instituições. Informações oficiais e edital atualizado
            em <a href="https://acessounico.mec.gov.br/prouni" rel="nofollow noopener" target="_blank" className="underline decoration-1 underline-offset-4">acessounico.mec.gov.br/prouni</a>.
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

      <section id="fies" className="bg-paper py-12 md:py-16 border-b border-hairline" data-speakable="fies">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            FIES — financiamento estudantil federal
          </h2>
          <p className="text-ink-700 leading-relaxed">
            O <strong>Fundo de Financiamento Estudantil (FIES)</strong> é um programa do MEC,
            operado pelo Fundo Nacional de Desenvolvimento da Educação (FNDE), que financia cursos
            de graduação em faculdades particulares. Diferente da bolsa de estudo, no FIES o
            estudante paga uma mensalidade reduzida durante o curso e quita o restante após
            formado, com juros subsidiados. Edital e inscrição em{' '}
            <a href="https://acessounico.mec.gov.br/fies" rel="nofollow noopener" target="_blank" className="underline decoration-1 underline-offset-4">acessounico.mec.gov.br/fies</a>.
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

      {/* SISU + ENCCEJA — gaps de cobertura apontados na auditoria de conteúdo:
          pillar "definitiva" de bolsas precisa explicar a via gratuita pública
          (SISU) e a porta de entrada pra quem não concluiu o ensino médio. */}
      <section id="sisu" className="bg-white py-12 md:py-16 border-b border-hairline" data-speakable="sisu">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            SISU — quando a vaga gratuita vale mais que a bolsa
          </h2>
          <p className="text-ink-700 leading-relaxed">
            O <strong>SISU (Sistema de Seleção Unificada)</strong> não é bolsa de estudo: é a
            porta de entrada pra <strong>vagas gratuitas em universidades públicas</strong>{' '}
            (federais e estaduais) usando a nota do ENEM. Se a sua nota é competitiva, o SISU é
            a opção mais econômica de todas — não existe mensalidade, então não há desconto a
            negociar. As inscrições abrem duas vezes por ano (janeiro e junho), logo após a
            divulgação dos resultados do ENEM, no mesmo portal único do MEC que opera ProUni e
            FIES.
          </p>
          <p className="text-ink-700 leading-relaxed mt-3">
            A comparação prática: o SISU exige as notas de corte mais altas dos três caminhos
            federais, porque a concorrência por vaga gratuita é a maior. O ProUni atende quem
            tem nota intermediária e renda dentro do limite; a bolsa própria atende quem precisa
            começar logo, não tem ENEM recente ou não fecha os critérios federais. Muita gente
            combina as tentativas: disputa o SISU na primeira chamada, o ProUni na sequência, e
            garante bolsa própria como plano ativo — já estudando — enquanto tenta a transferência
            futura.
          </p>
          <h3 className="font-display text-xl text-ink-900 mt-6 mb-3">
            ENCCEJA: a porta de entrada pra quem não concluiu o ensino médio
          </h3>
          <p className="text-ink-700 leading-relaxed">
            Quem não terminou o ensino médio na idade regular pode obter a certificação pelo{' '}
            <strong>ENCCEJA</strong> (Exame Nacional pra Certificação de Competências de Jovens
            e Adultos), aplicado pelo INEP. Com o certificado em mãos, você fica elegível a
            fazer o ENEM e, a partir dele, concorrer a ProUni, FIES e SISU — ou ir direto pra
            bolsa própria de faculdade parceira, que aceita a certificação como conclusão do
            ensino médio. É o caminho mais usado por adultos que voltam a estudar.
          </p>
          <p className="text-ink-700 leading-relaxed mt-4">
            <Link href="/sisu" className="underline decoration-1 underline-offset-4">
              Guia completo do SISU →
            </Link>
            <span className="mx-3 text-ink-300">·</span>
            <Link href="/encceja" className="underline decoration-1 underline-offset-4">
              Como funciona o ENCCEJA →
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
          {/* Faixas de corte por curso — dados quantitativos scannable (GEO).
              Faixas aproximadas observadas em edições recentes, com disclaimer
              explícito: corte real varia por instituição/campus/turno. */}
          <div className="overflow-x-auto mt-6 not-prose">
            <table className="w-full border-collapse text-sm">
              <caption className="text-left font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500 pb-3">
                Faixas de nota de corte do ProUni por curso (aproximadas)
              </caption>
              <thead>
                <tr className="border-y border-hairline">
                  <th className="text-left py-3 px-3 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500">Curso</th>
                  <th className="text-left py-3 px-3 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500">Faixa típica de corte (bolsa 100%)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-hairline">
                  <td className="py-3 px-3 text-ink-700">Medicina</td>
                  <td className="py-3 px-3 text-ink-900 font-medium num-tabular">740-800+</td>
                </tr>
                <tr className="border-b border-hairline">
                  <td className="py-3 px-3 text-ink-700">Direito</td>
                  <td className="py-3 px-3 text-ink-900 font-medium num-tabular">640-700</td>
                </tr>
                <tr className="border-b border-hairline">
                  <td className="py-3 px-3 text-ink-700">Psicologia</td>
                  <td className="py-3 px-3 text-ink-900 font-medium num-tabular">620-680</td>
                </tr>
                <tr className="border-b border-hairline">
                  <td className="py-3 px-3 text-ink-700">Enfermagem</td>
                  <td className="py-3 px-3 text-ink-900 font-medium num-tabular">580-650</td>
                </tr>
                <tr className="border-b border-hairline">
                  <td className="py-3 px-3 text-ink-700">Administração</td>
                  <td className="py-3 px-3 text-ink-900 font-medium num-tabular">550-620</td>
                </tr>
                <tr className="border-b border-hairline">
                  <td className="py-3 px-3 text-ink-700">Pedagogia</td>
                  <td className="py-3 px-3 text-ink-900 font-medium num-tabular">520-580</td>
                </tr>
              </tbody>
            </table>
            <p className="text-[13px] text-ink-500 leading-relaxed mt-3">
              Faixas aproximadas observadas em edições recentes do ProUni. O corte real muda a
              cada edição e varia por instituição, campus e turno — consulte os valores oficiais
              da edição vigente no{' '}
              <a href="https://acessounico.mec.gov.br/prouni" rel="nofollow noopener" target="_blank" className="underline decoration-1 underline-offset-4">
                portal Acesso Único do MEC
              </a>.
            </p>
          </div>
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

      {/* Link interno com âncora de marca pras landings de instituição — distribui
          autoridade da pillar (head-term) pras páginas que targetam "bolsa [marca]". */}
      {institutions.length > 0 && (
        <section id="faculdades-parceiras" className="bg-white py-12 md:py-16 border-b border-hairline" data-speakable="faculdades">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900">
                Bolsas de estudo por faculdade parceira
              </h2>
              <span className="font-mono num-tabular text-[11px] text-ink-500">
                ({String(institutions.length).padStart(2, '0')})
              </span>
            </div>
            <p className="text-ink-700 leading-relaxed mb-8 max-w-3xl">
              Veja as bolsas disponíveis em cada faculdade parceira reconhecida pelo MEC. Cada
              página mostra os cursos, as modalidades e como conseguir o desconto na instituição.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline">
              {institutions.map((inst) => (
                <li key={inst.slug} className="bg-white">
                  <Link
                    href={`/faculdades/${inst.slug}`}
                    className="block px-5 py-4 transition-colors hover:bg-paper"
                  >
                    <span className="block font-display text-base text-ink-900">
                      Bolsas de estudo na {inst.name}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">
                      {inst.mecRating ? `MEC ${inst.mecRating}/5 · ` : ''}
                      {inst.modalities
                        .map((m) => (m === 'EAD' ? 'EAD' : m === 'PRESENCIAL' ? 'Presencial' : 'Semipresencial'))
                        .join(' · ')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

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
            Como saber se uma bolsa de estudo é confiável?
          </h2>
          <p className="text-ink-700 leading-relaxed">
            Uma bolsa de estudo confiável nunca cobra valor antecipado, vem de faculdade com
            cadastro ativo no e-MEC e aparece com o desconto descrito em contrato desde a
            primeira mensalidade. Falhou em qualquer um desses três pontos, desconfie. Veja como
            validar cada um antes de fechar matrícula.
          </p>
          <h3 className="font-display text-xl text-ink-900 mt-6 mb-3">1. Bolsa não cobra antecipado</h3>
          <p className="text-ink-700 leading-relaxed">
            Bolsa de estudo legítima — seja ProUni, FIES ou bolsa própria via Bolsa Click — nunca
            cobra do aluno valor antecipado pra &quot;garantir a vaga&quot;, &quot;agilizar a inscrição&quot; ou
            &quot;destravar o desconto&quot;. O ProUni e FIES são 100% gratuitos no portal do MEC. A bolsa
            própria via Bolsa Click é grátis — você só paga a mensalidade já com desconto direto
            pra faculdade, depois de matriculado. Cobrança antecipada de &quot;taxa de bolsa&quot; é golpe.
          </p>
          <h3 className="font-display text-xl text-ink-900 mt-6 mb-3">2. Verifique o reconhecimento da faculdade no e-MEC</h3>
          <p className="text-ink-700 leading-relaxed">
            Toda faculdade reconhecida pelo MEC tem cadastro consultável publicamente no portal{' '}
            <strong>e-mec.mec.gov.br</strong>. Confira o nome da instituição, a nota MEC (de 1 a
            5 — abaixo de 3 indica problemas estruturais), se o curso específico que você quer
            tem autorização vigente. Curso não reconhecido = diploma sem validade pra concursos
            públicos e mestrado.
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
          <p className="text-ink-700 leading-relaxed mt-4">
            <Link href="/como-saber-se-um-site-de-bolsa-e-confiavel" className="underline decoration-1 underline-offset-4">
              Guia completo: como saber se um site de bolsa é confiável →
            </Link>
          </p>
        </div>
      </section>

      <section id="passo-a-passo" className="bg-white py-12 md:py-16 border-b border-hairline" data-speakable="howto">
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
                    Bolsas na {inst.fullName}
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

      {/* GUIAS — hub→spoke: liga a pillar aos melhores posts do cluster, fechando
          o hub-and-spoke (os spokes já linkam de volta pro pillar via backfill). */}
      <section id="guias" className="bg-white py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              Guias sobre bolsas de estudo
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              ({String(scholarshipGuides.length).padStart(2, '0')})
            </span>
          </div>
          <p className="text-ink-700 leading-relaxed mb-6 max-w-3xl">
            Aprofunde em cada caminho pra conseguir bolsa: programas do governo, bolsa própria
            sem ENEM, como evitar golpes e quanto custa cada curso com desconto.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline">
            {scholarshipGuides.map(g => (
              <li key={g.slug} className="bg-white">
                <Link
                  href={`/blog/${g.slug}`}
                  className="block px-5 py-4 h-full transition-colors hover:bg-paper"
                >
                  <span className="block font-display text-[15px] text-ink-900 leading-snug">
                    {g.title}
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

      <FontesConsultadas
        fontes={[
          { label: 'MEC', url: 'https://www.gov.br/mec', descricao: 'Ministério da Educação. Programas ProUni e FIES, política nacional de educação superior.' },
          { label: 'Acesso Único MEC', url: 'https://acessounico.mec.gov.br', descricao: 'portal oficial de inscrição ProUni/FIES/SISU.' },
          { label: 'e-MEC', url: 'https://emec.mec.gov.br', descricao: 'cadastro nacional de instituições e cursos reconhecidos.' },
          { label: 'INEP', url: 'https://www.gov.br/inep', descricao: 'Instituto Nacional de Estudos e Pesquisas Educacionais. ENEM e indicadores.' },
          { label: 'FNDE', url: 'https://www.gov.br/fnde', descricao: 'Fundo Nacional de Desenvolvimento da Educação. Operação financeira do FIES.' },
          { label: 'Lei nº 11.096/2005', url: 'https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2005/lei/l11096.htm', descricao: 'marco legal do ProUni.', linkLabel: 'planalto.gov.br' },
        ]}
        introducao="Este guia se baseia em fontes oficiais do Governo Federal, dados first-party do catálogo Bolsa Click e legislação vigente."
        dateTime={DATE_MODIFIED}
        dateLabel={DATE_MODIFIED_LABEL}
        observacao="Catálogo de preços, modalidades, faculdades parceiras e cidades cobertas: dados first-party do Bolsa Click, atualizados em tempo real via API do catálogo. Mensalidades exibidas refletem ofertas reais vigentes na data da consulta."
      />
    </>
  )
}
