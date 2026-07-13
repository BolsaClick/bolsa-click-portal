import { Metadata } from 'next'
import Link from 'next/link'
import {
  Sparkles,
  GraduationCap,
  ScrollText,
  Building2,
  Wallet,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

export const revalidate = 3600

const SITE_URL = 'https://www.bolsaclick.com.br'

const PROGRAMAS = [
  {
    nome: 'ProUni (governo federal)',
    desconto: '50% ou 100%',
    requisito: 'Renda familiar até 1,5 salário mínimo per capita (100%) ou 3 (50%) + ENEM ≥ 450',
    quando: 'Editais 2x por ano (janeiro e julho)',
    onde: 'Apenas faculdades particulares parceiras (verificar lista por edital)',
  },
  {
    nome: 'FIES (governo federal)',
    desconto: 'Financiamento integral',
    requisito: 'ENEM ≥ 450 + renda familiar até 3 salários mínimos per capita + sem reprovação',
    quando: 'Editais 2x por ano',
    onde: 'Faculdades particulares conveniadas (lista no portal FIES)',
  },
  {
    nome: 'Bolsa Click (parceiros Cogna)',
    desconto: 'Até 80%',
    requisito: 'Nenhum — sem ENEM, sem CPF do parente, sem comprovação de renda',
    quando: 'Disponível o ano inteiro',
    onde: 'Anhanguera, Unopar, Pitágoras, Unime (rede Cogna) e Estácio (YDUQS)',
  },
  {
    nome: 'Bolsa Filantrópica (faculdades confessionais)',
    desconto: '25%-100%',
    requisito: 'Renda baixa comprovada + processo seletivo próprio da instituição',
    quando: 'Editais anuais por faculdade',
    onde: 'PUC, Mackenzie, Metodista e outras instituições religiosas',
  },
  {
    nome: 'Outros marketplaces de bolsa',
    desconto: 'Até 70%',
    requisito: 'Sem ENEM obrigatório; cadastro gratuito',
    quando: 'Ano inteiro',
    onde: 'Faculdades particulares conveniadas (catálogo varia por plataforma)',
  },
  {
    nome: 'Bolsa Atleta / Bolsa Cultura',
    desconto: '50%-100%',
    requisito: 'Atleta federado em modalidade reconhecida ou artista com portfólio',
    quando: 'Editais específicos da faculdade',
    onde: 'Faculdades particulares com programa próprio',
  },
]

const FAQ_ITEMS = [
  {
    question: 'Como conseguir bolsa de estudo sem ENEM?',
    answer:
      'Sim, é possível. Pelo Bolsa Click você consegue bolsa de até 80% em faculdades particulares parceiras (Anhanguera, Estácio, Unopar, Pitágoras, Unime) sem precisar de nota do ENEM. Outros marketplaces de bolsa também oferecem opções sem ENEM. ProUni e FIES exigem ENEM ≥ 450, mas são gratuitos e cobrem até 100% da mensalidade pra famílias de baixa renda.',
  },
  {
    question: 'Quem tem direito a bolsa de estudo integral 100%?',
    answer:
      'Pelo ProUni, famílias com renda per capita até 1,5 salário mínimo e nota do ENEM ≥ 450 (sem zerar redação) têm direito à bolsa integral. Bolsas filantrópicas (PUC, Metodista, Mackenzie) também oferecem 100% para baixa renda comprovada — verificar editais específicos. Pelo Bolsa Click, o desconto máximo é 80%, mas sem exigência de renda.',
  },
  {
    question: 'Como conseguir bolsa de estudo sem ProUni?',
    answer:
      'O Bolsa Click é a alternativa mais direta: descontos de até 80% em faculdades particulares sem precisar do ENEM ou comprovar renda. Outras opções: FIES (financiamento), bolsas filantrópicas de confessionais, programas próprios de faculdades (Anhanguera tem bolsa direta), outros marketplaces de bolsa, e bolsas-atleta/cultura pra quem se enquadra.',
  },
  {
    question: 'É possível conseguir bolsa estando matriculado?',
    answer:
      'Sim. Muitas faculdades têm programa de bolsa para alunos veteranos com bom desempenho acadêmico (CR alto) ou que indicam novos alunos. Você pode também migrar entre programas: começou pagando integral e descobriu o Bolsa Click? Cadastre-se pra próxima rematrícula. Algumas faculdades aceitam transferir bolsa entre semestres se o programa permite.',
  },
  {
    question: 'A bolsa de estudo cobre matrícula e material didático?',
    answer:
      'Geralmente, a bolsa cobre apenas a mensalidade (com o percentual de desconto contratado). Matrícula, taxas, material didático, atividades extras e estágios costumam ser à parte. Sempre confirme com a faculdade quais itens estão inclusos no desconto antes de assinar contrato.',
  },
  {
    question: 'Posso usar duas bolsas ao mesmo tempo?',
    answer:
      'Não, em regra. ProUni e FIES não podem ser acumulados com outras bolsas particulares na mesma matrícula. Bolsas privadas de marketplaces também não combinam entre si — você escolhe uma. Mas pode trocar de programa em rematrículas anuais se outra opção for melhor.',
  },
  {
    question: 'O que acontece se eu perder a bolsa?',
    answer:
      'Depende do programa. ProUni e FIES exigem manter desempenho (CR mínimo, frequência) — perdeu, perdeu. Bolsa Click e similares são contratos com a faculdade — se você descumprir o contrato (atrasar mensalidade muitas vezes, trancar curso sem aviso), pode perder o desconto. Sempre leia o regulamento antes de assinar.',
  },
  {
    question: 'Como funciona a bolsa de estudo do Bolsa Click?',
    answer:
      'É simples: você se cadastra grátis no site, escolhe o curso e a faculdade entre os parceiros (Anhanguera, Estácio, Unopar, Pitágoras, Unime), garante o desconto de até 80% antes de matricular, e segue direto pra matrícula com a faculdade — já pagando só a mensalidade com bolsa aplicada. Sem ENEM, sem CPF do parente, sem prova presencial.',
  },
]

const jsonLdSchemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Como conseguir bolsa de estudo em faculdade particular — guia completo 2026',
    description:
      'Guia atualizado de como conseguir bolsa de estudo em faculdades particulares: ProUni, FIES, Bolsa Click, programas próprios e filantrópicos. Comparativo, requisitos e dicas práticas.',
    author: {
      '@type': 'Organization',
      name: 'Bolsa Click',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'EducationalOrganization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Bolsa Click',
    },
    datePublished: '2026-05-18',
    dateModified: '2026-05-18',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/como-conseguir-bolsa-de-estudo`,
    },
    inLanguage: 'pt-BR',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Como conseguir bolsa de estudo',
        item: `${SITE_URL}/como-conseguir-bolsa-de-estudo`,
      },
    ],
  },
]

export const metadata: Metadata = {
  title: 'Como Conseguir Bolsa de Estudo em Faculdade Particular | Guia 2026',
  description:
    'Guia completo de como conseguir bolsa de estudo em faculdade particular: ProUni, FIES, Bolsa Click e mais. Sem ENEM, sem ProUni, sem complicação — descontos de até 80%.',
  keywords: [
    'como conseguir bolsa de estudo',
    'bolsa de estudo faculdade particular',
    'bolsa sem prouni',
    'bolsa sem enem',
    'como conseguir bolsa integral',
    'desconto em faculdade',
    'bolsa de estudo 2026',
  ],
  alternates: { canonical: `${SITE_URL}/como-conseguir-bolsa-de-estudo` },
  openGraph: {
    title: 'Como Conseguir Bolsa de Estudo em Faculdade | Bolsa Click',
    description:
      'Guia completo: ProUni, FIES, Bolsa Click e mais. Descontos de até 80%, sem ENEM, sem ProUni.',
    url: `${SITE_URL}/como-conseguir-bolsa-de-estudo`,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'article',
  },
}

export default function ComoConseguirBolsaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas) }}
      />

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-bolsa-primary via-bolsa-primary to-blue-900 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-bolsa-secondary/20 blur-3xl"
        />
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <div className="max-w-4xl mx-auto text-center">
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-white/70 mb-4 inline-flex items-center gap-2">
              <ScrollText size={12} className="text-bolsa-secondary" />
              Guia editorial · Atualizado 2026
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-[64px] font-semibold text-white leading-[1.05] mb-5">
              Como conseguir bolsa de estudo{' '}
              <span className="italic text-white/85">em faculdade particular</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              Tudo que existe hoje pra reduzir o valor da sua faculdade: ProUni, FIES, Bolsa
              Click, bolsas filantrópicas e programas próprios. Comparativo direto, sem floreio.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/cursos"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-bolsa-secondary text-white font-semibold rounded-full hover:bg-bolsa-secondary/90 transition-colors text-[15px] shadow-lg shadow-bolsa-secondary/30"
              >
                Ver bolsas disponíveis <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TL;DR / RESPOSTA DIRETA */}
      <aside className="bg-white border-b border-hairline py-10 md:py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-paper border border-hairline rounded-lg p-6 md:p-8">
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-bolsa-secondary mb-3 inline-flex items-center gap-2">
              <Sparkles size={11} />
              Resposta rápida
            </p>
            <p className="text-ink-900 leading-relaxed text-lg">
              <strong>Pra conseguir bolsa de estudo em faculdade particular hoje, você tem 6 caminhos:</strong>{' '}
              ProUni (gratuito, exige ENEM e renda baixa), FIES (financiamento estudantil), Bolsa
              Click e marketplaces similares (sem ENEM, até 80%), bolsas filantrópicas de
              confessionais, programas próprios da faculdade, e bolsas-atleta/cultura. A escolha
              certa depende da sua renda, da sua nota do ENEM (se tiver) e da urgência.
            </p>
          </div>
        </div>
      </aside>

      {/* COMPARATIVO DE PROGRAMAS */}
      <section className="bg-paper py-16 md:py-20 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-5xl">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-500 mb-3">
            Os 6 caminhos
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 mb-8 leading-tight">
            Comparativo direto de cada programa.
          </h2>

          <ul className="space-y-px bg-hairline">
            {PROGRAMAS.map((p) => (
              <li key={p.nome} className="bg-white p-5 md:p-6">
                <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
                  <h3 className="font-display text-xl text-ink-900">{p.nome}</h3>
                  <span className="font-mono text-[12px] tracking-wider text-bolsa-secondary uppercase">
                    {p.desconto}
                  </span>
                </div>
                <dl className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <dt className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500 mb-1">
                      Requisito
                    </dt>
                    <dd className="text-ink-800">{p.requisito}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500 mb-1">
                      Quando
                    </dt>
                    <dd className="text-ink-800">{p.quando}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500 mb-1">
                      Onde
                    </dt>
                    <dd className="text-ink-800">{p.onde}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* COMO ESCOLHER */}
      <section className="bg-white py-16 md:py-20 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-500 mb-3">
            Como escolher
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 mb-8 leading-tight">
            Qual programa serve pra você.
          </h2>

          <div className="space-y-6 text-ink-800 leading-relaxed">
            <div className="border-l-2 border-bolsa-secondary pl-5">
              <h3 className="font-display text-xl text-ink-900 mb-2">
                Renda familiar até 1,5 salário mínimo per capita + ENEM ≥ 450
              </h3>
              <p>
                Vá direto pro <strong>ProUni</strong>. É o programa mais vantajoso — bolsa
                integral (100%) sem precisar pagar nada de mensalidade. Inscrições 2x por ano
                no SISU/ProUni Portal. Se não conseguiu, considere <strong>FIES</strong>
                (financiamento que você paga após formado) ou <strong>bolsa filantrópica</strong>{' '}
                em PUC/Metodista.
              </p>
            </div>

            <div className="border-l-2 border-bolsa-secondary pl-5">
              <h3 className="font-display text-xl text-ink-900 mb-2">
                Sem ENEM, sem tempo de esperar edital, quer matricular já
              </h3>
              <p>
                <strong>Bolsa Click</strong> é o caminho. Desconto de até 80% em faculdades
                particulares parceiras (Anhanguera, Estácio, Unopar, Pitágoras, Unime) sem
                exigência de nota, sem prova presencial, sem comprovação de renda. Cadastro
                gratuito, garantia da bolsa antes da matrícula.
              </p>
            </div>

            <div className="border-l-2 border-bolsa-secondary pl-5">
              <h3 className="font-display text-xl text-ink-900 mb-2">
                Quer estudar EAD pelo menor preço possível
              </h3>
              <p>
                Combine Bolsa Click (até 80% off) com cursos em modalidade EAD reconhecida pelo
                MEC. Mensalidades partem de R$ 99/mês. Cursos como Administração, Pedagogia, ADS
                e Engenharia Civil têm oferta EAD ampla. Veja o{' '}
                <Link href="/faculdade-ead" className="text-bolsa-secondary underline">
                  hub de Faculdade EAD
                </Link>{' '}
                pra explorar.
              </p>
            </div>

            <div className="border-l-2 border-bolsa-secondary pl-5">
              <h3 className="font-display text-xl text-ink-900 mb-2">
                Faz parte da rede de atletas ou tem produção artística
              </h3>
              <p>
                Algumas faculdades oferecem <strong>bolsa-atleta</strong> e{' '}
                <strong>bolsa-cultura</strong> (50%-100% off) pra estudantes federados em
                modalidades esportivas reconhecidas ou com portfólio artístico. Pergunte
                diretamente à faculdade no processo de matrícula — não há catálogo público
                unificado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MITOS E VERDADES */}
      <section className="bg-paper py-16 md:py-20 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-500 mb-3">
            Mitos e verdades
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 mb-8 leading-tight">
            O que muita gente erra.
          </h2>

          <ul className="space-y-5">
            {[
              {
                ok: false,
                claim: 'Bolsa de estudo é só pra quem é pobre.',
                truth:
                  'Falso. ProUni e bolsas filantrópicas exigem renda baixa, mas Bolsa Click e outros marketplaces de bolsa não pedem comprovação de renda — qualquer pessoa pode se cadastrar.',
              },
              {
                ok: false,
                claim: 'Bolsa cobre matrícula, material e tudo mais.',
                truth:
                  'Falso. Quase todas as bolsas cobrem APENAS a mensalidade. Matrícula inicial, material, taxas extras e atividades não estão inclusos. Sempre confirme com a faculdade antes.',
              },
              {
                ok: false,
                claim: 'Preciso fazer ENEM pra entrar em faculdade particular.',
                truth:
                  'Falso. Faculdades particulares têm processo seletivo próprio (geralmente uma redação online) que pode substituir o ENEM. Bolsa Click facilita o ingresso sem precisar de nota mínima.',
              },
              {
                ok: true,
                claim: 'Diploma EAD vale o mesmo que presencial.',
                truth:
                  'Verdade. EAD reconhecido pelo MEC tem exatamente o mesmo valor legal e profissional do presencial — pra concurso, registro profissional (CRA, CRP, CREA, etc) e mercado privado.',
              },
              {
                ok: false,
                claim: 'Não dá pra trocar de bolsa depois de matriculado.',
                truth:
                  'Falso. Você pode migrar entre programas na rematrícula anual. Começou pagando integral? Cadastre-se no Bolsa Click pra próximo semestre. Saiu do ProUni? Pode usar FIES ou bolsa particular.',
              },
              {
                ok: false,
                claim: 'Bolsa de até 80% é golpe.',
                truth:
                  'Falso. Faculdades particulares têm margens altas em mensalidades cheias — descontos agressivos são parte da estratégia comercial pra preencher vagas ociosas. Bolsa Click e similares são intermediadores legítimos dessa oferta.',
              },
            ].map((item, i) => (
              <li key={i} className="flex gap-4">
                {item.ok ? (
                  <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={20} />
                ) : (
                  <XCircle className="text-bolsa-secondary shrink-0 mt-0.5" size={20} />
                )}
                <div>
                  <p className="font-display text-lg text-ink-900 mb-1">{item.claim}</p>
                  <p className="text-ink-700 leading-relaxed text-sm">{item.truth}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PASSO A PASSO BOLSA CLICK */}
      <section className="bg-white py-16 md:py-20 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-500 mb-3">
            Pelo Bolsa Click
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 mb-8 leading-tight">
            4 passos da inscrição à matrícula.
          </h2>
          <ol className="space-y-6">
            {[
              {
                title: 'Escolha curso e faculdade',
                text: 'Use os filtros do site pra comparar cursos por modalidade (presencial/EAD), cidade e preço. Veja desconto exato e parcela final mensal.',
                icon: GraduationCap,
              },
              {
                title: 'Cadastre-se grátis',
                text: 'Sem CPF do parente, sem cartão, sem ENEM. Você preenche dados básicos e garante a bolsa antes de matricular.',
                icon: Sparkles,
              },
              {
                title: 'Faça o processo seletivo',
                text: 'A maioria das faculdades particulares aceita redação online ou nota do ENEM como ingresso facultativo. Sem prova presencial.',
                icon: ScrollText,
              },
              {
                title: 'Matricule-se direto com a faculdade',
                text: 'Após aprovado, você assina contrato com a faculdade já com o desconto aplicado. Paga só a mensalidade com bolsa.',
                icon: Building2,
              },
            ].map((step, i) => {
              const Icon = step.icon
              return (
                <li key={i} className="flex gap-5">
                  <span className="font-mono text-[28px] text-bolsa-secondary leading-none shrink-0 w-10">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-display text-xl text-ink-900 mb-1 inline-flex items-center gap-2">
                      <Icon size={18} className="text-bolsa-secondary" />
                      {step.title}
                    </h3>
                    <p className="text-ink-700 leading-relaxed">{step.text}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-paper py-16 md:py-20 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-500 mb-3">
            Perguntas frequentes
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 mb-8 leading-tight">
            Tudo sobre bolsa de estudo.
          </h2>
          <ul className="divide-y divide-hairline">
            {FAQ_ITEMS.map((item, i) => (
              <li key={i} className="py-5">
                <h3 className="font-display text-lg text-ink-900 mb-2 leading-snug">
                  {item.question}
                </h3>
                <p className="text-ink-700 leading-relaxed">{item.answer}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* HUBS RELACIONADOS — internal linking matrix */}
      <section className="bg-white py-12 md:py-16 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="hairline-b pb-3 mb-6">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              Continue explorando
            </h2>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-hairline">
            <li className="bg-white">
              <Link
                href="/faculdade-ead"
                className="group flex flex-col px-5 py-5 h-full hover:bg-paper"
              >
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-1">
                  Pillar EAD
                </span>
                <span className="font-display text-base text-ink-900 group-hover:italic">
                  Faculdade EAD com bolsa
                </span>
              </Link>
            </li>
            <li className="bg-white">
              <Link
                href="/bolsas/saude"
                className="group flex flex-col px-5 py-5 h-full hover:bg-paper"
              >
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-1">
                  Pillar Saúde
                </span>
                <span className="font-display text-base text-ink-900 group-hover:italic">
                  Bolsa em faculdade de saúde
                </span>
              </Link>
            </li>
            <li className="bg-white">
              <Link
                href="/cursos"
                className="group flex flex-col px-5 py-5 h-full hover:bg-paper"
              >
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-1">
                  Catálogo
                </span>
                <span className="font-display text-base text-ink-900 group-hover:italic">
                  Todos os cursos disponíveis
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-bolsa-primary text-white py-16 md:py-20 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Wallet className="mx-auto mb-4 text-bolsa-secondary" size={32} />
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4 leading-tight">
            Pronto pra garantir sua bolsa?
          </h2>
          <p className="text-white/80 mb-7 leading-relaxed">
            As maiores redes de ensino do país. Cadastro grátis. Sem ENEM, sem fila.
          </p>
          <Link
            href="/cursos"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-bolsa-secondary text-white font-semibold rounded-full hover:bg-bolsa-secondary/90 transition-colors text-[15px] shadow-lg"
          >
            Ver bolsas disponíveis <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  )
}
