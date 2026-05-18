import { Metadata } from 'next'
import Link from 'next/link'
import { Heart, Stethoscope, GraduationCap, Sparkles, ArrowRight } from 'lucide-react'
import { TOP_CURSOS } from '@/app/cursos/_data/cursos'

export const revalidate = 3600

const SITE_URL = 'https://www.bolsaclick.com.br'

// Cursos cobertos por esse pillar — área da saúde
const CURSOS_SAUDE = [
  'psicologia',
  'enfermagem',
  'fisioterapia',
  'nutricao',
  'biomedicina',
  'farmacia',
  'odontologia',
  'educacao-fisica',
]

const FAQ_ITEMS = [
  {
    question: 'Quais cursos de saúde podem ser feitos com bolsa de estudo?',
    answer:
      'A maioria dos cursos da área da saúde tem oferta de bolsa em faculdades particulares parceiras do Bolsa Click. Psicologia, Enfermagem, Fisioterapia, Nutrição, Biomedicina, Farmácia e Odontologia têm bolsas em modalidade presencial; Educação Física tem em presencial e semipresencial. Medicina é a exceção — não há programas de bolsa significativos por se tratar de curso de altíssima demanda.',
  },
  {
    question: 'Cursos de saúde podem ser feitos EAD?',
    answer:
      'Não totalmente. Por regulamentação dos conselhos profissionais (CFP, COFEN, COFFITO, CFN, CFF) e do MEC, cursos de saúde precisam ter parte presencial — laboratórios práticos, estágios em hospitais/clínicas e disciplinas práticas. A maioria oferece modalidade semipresencial (com até 40% online).',
  },
  {
    question: 'Quanto tempo dura um curso da área da saúde?',
    answer:
      'A maioria é bacharelado de 4 a 5 anos: Psicologia (5 anos), Enfermagem (5), Fisioterapia (5), Nutrição (4), Biomedicina (4), Farmácia (5), Odontologia (4). Educação Física tem variação: Licenciatura (4) ou Bacharelado (4). Carga horária mínima é de 3.200-4.000 horas, com estágios obrigatórios.',
  },
  {
    question: 'Qual o salário médio dos profissionais da saúde?',
    answer:
      'Varia bastante por área e localização. Salários iniciais CLT em 2024: Enfermeiro R$ 4.750 (piso nacional), Psicólogo R$ 2.500-3.800, Fisioterapeuta R$ 2.500-4.500, Nutricionista R$ 2.500-4.000, Biomédico R$ 3.000-5.000. Profissionais autônomos em consultório próprio podem ultrapassar R$ 10.000-15.000 mensais com carteira de clientes.',
  },
  {
    question: 'Preciso de ENEM pra entrar em faculdade de saúde particular?',
    answer:
      'Não. Em faculdades particulares parceiras do Bolsa Click, o ingresso é por processo seletivo próprio (geralmente uma redação online) ou aceitação opcional da nota do ENEM. Você se cadastra grátis, escolhe a unidade e garante a bolsa antes da matrícula.',
  },
  {
    question: 'Quanto custa faculdade de saúde com bolsa?',
    answer:
      'Mensalidades variam por curso e unidade. Em parceiras do Bolsa Click (Anhanguera, Unopar, Pitágoras, Unime), valores começam: Psicologia a partir de R$ 199/mês, Enfermagem R$ 299, Fisioterapia R$ 399, Nutrição R$ 299. Descontos chegam a 80% sobre o valor cheio.',
  },
]

const jsonLdSchemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Bolsa de Estudo em Faculdades de Saúde',
    description:
      'Bolsas de estudo em cursos da área da saúde com até 80% de desconto. Psicologia, Enfermagem, Fisioterapia, Nutrição, Biomedicina, Farmácia e mais. Inscrição grátis, sem ENEM.',
    url: `${SITE_URL}/bolsas/saude`,
    provider: {
      '@type': 'EducationalOrganization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Bolsa Click',
      url: SITE_URL,
    },
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
      { '@type': 'ListItem', position: 2, name: 'Bolsas por área', item: `${SITE_URL}/bolsas` },
      { '@type': 'ListItem', position: 3, name: 'Saúde', item: `${SITE_URL}/bolsas/saude` },
    ],
  },
]

export const metadata: Metadata = {
  title: 'Bolsa de Estudo em Faculdade de Saúde | Até 80% de Desconto',
  description:
    'Bolsas em faculdades de saúde com até 80% de desconto: Psicologia, Enfermagem, Fisioterapia, Nutrição, Biomedicina, Farmácia e mais. Mais de 30 mil faculdades parceiras. Inscrição grátis, sem ENEM.',
  keywords: [
    'bolsa faculdade de saúde',
    'bolsa de estudo psicologia',
    'bolsa de estudo enfermagem',
    'bolsa de estudo fisioterapia',
    'bolsa de estudo nutrição',
    'faculdade de saúde com desconto',
    'curso de saúde com bolsa',
  ],
  alternates: { canonical: `${SITE_URL}/bolsas/saude` },
  openGraph: {
    title: 'Bolsa de Estudo em Faculdade de Saúde | Bolsa Click',
    description:
      'Bolsas em cursos de saúde com até 80% de desconto. Psicologia, Enfermagem, Fisioterapia, Nutrição e mais.',
    url: `${SITE_URL}/bolsas/saude`,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function BolsasSaudePage() {
  const cursos = TOP_CURSOS.filter((c) => CURSOS_SAUDE.includes(c.slug))

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
              <Stethoscope size={12} className="text-bolsa-secondary" />
              Área da Saúde
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-[64px] font-semibold text-white leading-[1.05] mb-5">
              Bolsa de estudo em{' '}
              <span className="italic text-white/85">faculdades de saúde</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              Compare bolsas em mais de 30 mil faculdades parceiras pra Psicologia, Enfermagem,
              Fisioterapia, Nutrição e mais cursos da área da saúde. Descontos de até 80%.
              Inscrição 100% gratuita, sem ENEM.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="#cursos"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-bolsa-secondary text-white font-semibold rounded-full hover:bg-bolsa-secondary/90 transition-colors text-[15px] shadow-lg shadow-bolsa-secondary/30"
              >
                Ver cursos disponíveis <ArrowRight size={16} />
              </Link>
              <Link
                href="/cursos"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 text-white border border-white/20 font-semibold rounded-full hover:bg-white/15 transition-colors text-[15px]"
              >
                Todas as áreas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="bg-paper py-16 md:py-20 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-500 mb-3">
            A área da saúde no Brasil
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 mb-6 leading-tight">
            Carreiras com demanda contínua e impacto social direto.
          </h2>
          <div className="text-ink-700 leading-relaxed space-y-4">
            <p>
              A área da saúde é uma das mais procuradas no ensino superior brasileiro e uma das
              que oferecem mais estabilidade profissional. Segundo dados do CAGED (Ministério do
              Trabalho), enfermagem, fisioterapia e nutrição estão entre as 20 profissões com
              maior crescimento de vagas formais nos últimos 5 anos no Brasil.
            </p>
            <p>
              Diferente de áreas mais voláteis ao mercado, profissões da saúde têm demanda
              contínua: o SUS é o maior empregador público do país, e a rede privada (hospitais,
              clínicas, consultórios) absorve a maior parte dos formados. A regulamentação rígida
              por conselhos profissionais (CFP, COFEN, COFFITO, CFN, CFF) garante exclusividade
              de função e estabilidade salarial.
            </p>
            <p>
              No Bolsa Click, você encontra bolsas em cursos de saúde nas principais redes de
              ensino particular do Brasil — Anhanguera, Unopar, Pitágoras, Unime, Ampli — com
              descontos que chegam a 80% sobre o valor cheio da mensalidade.
            </p>
          </div>
        </div>
      </section>

      {/* CURSOS */}
      <section id="cursos" className="bg-white py-16 md:py-20 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="hairline-b pb-3 mb-8 flex items-baseline justify-between">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              Cursos da área da saúde com bolsa
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              ({String(cursos.length).padStart(2, '0')})
            </span>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline">
            {cursos.map((curso) => (
              <li key={curso.slug} className="bg-white">
                <Link
                  href={`/cursos/${curso.slug}`}
                  className="group flex flex-col px-5 py-6 transition-colors duration-200 hover:bg-paper h-full"
                >
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-1">
                    {curso.duration}
                  </span>
                  <span className="font-display text-lg text-ink-900 group-hover:italic transition-all duration-200 mb-1">
                    {curso.name}
                  </span>
                  <span className="font-mono text-[11px] text-ink-500 mt-auto pt-2">
                    Ver bolsa →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* COMO ESCOLHER */}
      <section className="bg-paper py-16 md:py-20 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-500 mb-3">
            Como escolher
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 mb-8 leading-tight">
            3 perguntas antes de decidir.
          </h2>
          <ol className="space-y-6">
            {[
              {
                title: 'Você prefere atendimento clínico, gestão ou pesquisa?',
                text: 'Psicologia, Fisioterapia, Nutrição e Odontologia têm forte componente clínico (consultório, atendimento individual). Enfermagem combina clínica + gestão. Biomedicina e Farmácia têm pesquisa, análises laboratoriais e indústria.',
              },
              {
                title: 'Quer trabalhar no SUS (público) ou rede privada?',
                text: 'Pra SUS, foque em concursos públicos após a graduação (provas com bom volume de vagas em Enfermagem, Psicologia, Fisioterapia). Pra clínica privada / consultório, considere construir cliente próprio aos poucos.',
              },
              {
                title: 'Aceita estudar presencial ou só online?',
                text: 'Cursos de saúde exigem componente presencial obrigatório por regulamento. Se você está em cidade pequena, verifique se há polo presencial da faculdade (geralmente uma vez por semana ou quinzena) — Anhanguera e Unopar têm a maior rede de polos no Brasil.',
              },
            ].map((step, i) => (
              <li key={i} className="flex gap-5">
                <span className="font-mono text-[28px] text-bolsa-secondary leading-none shrink-0 w-10">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-display text-xl text-ink-900 mb-1">{step.title}</h3>
                  <p className="text-ink-700 leading-relaxed">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 md:py-20 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-500 mb-3">
            Perguntas frequentes
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 mb-8 leading-tight">
            Tudo sobre bolsa em faculdade de saúde.
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

      {/* CTA */}
      <section className="bg-bolsa-primary text-white py-16 md:py-20 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Heart className="mx-auto mb-4 text-bolsa-secondary" size={32} />
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4 leading-tight">
            Sua carreira na saúde começa aqui
          </h2>
          <p className="text-white/80 mb-7 leading-relaxed">
            Mais de 30 mil faculdades parceiras. Cadastro gratuito. Sem ENEM, sem CPF do parente.
          </p>
          <Link
            href="#cursos"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-bolsa-secondary text-white font-semibold rounded-full hover:bg-bolsa-secondary/90 transition-colors text-[15px] shadow-lg"
          >
            <Sparkles size={16} /> Ver bolsas disponíveis
          </Link>
        </div>
      </section>
    </>
  )
}
