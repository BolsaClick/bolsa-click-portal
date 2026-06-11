import { Metadata } from 'next'
import Link from 'next/link'
import { GraduationCap, Clock, Wallet, Sparkles, ArrowRight } from 'lucide-react'
import { TOP_CURSOS } from '@/app/cursos/_data/cursos'

export const revalidate = 3600

const SITE_URL = 'https://www.bolsaclick.com.br'

// Cursos com modalidade EAD reconhecida pelo MEC (a partir de 2024)
const CURSOS_EAD_DISPONIVEIS = [
  'administracao',
  'pedagogia',
  'analise-e-desenvolvimento-de-sistemas',
  'gestao-de-recursos-humanos',
  'marketing',
  'gestao-comercial',
  'ciencias-contabeis',
  'engenharia-de-producao',
  'engenharia-civil',
  'educacao-fisica',
]

// Cursos com modalidade semipresencial (parte EAD, parte presencial)
const CURSOS_SEMIPRESENCIAIS = ['psicologia', 'enfermagem', 'nutricao', 'biomedicina']

// Cursos que NÃO podem ser EAD (proibição MEC/conselho)
const CURSOS_NAO_EAD = [
  { name: 'Direito', motivo: 'proibição OAB/MEC' },
  { name: 'Medicina', motivo: 'proibição CFM/MEC' },
  { name: 'Odontologia', motivo: 'proibição CFO/MEC' },
  { name: 'Psicologia (100%)', motivo: 'apenas semipresencial' },
]

const FAQ_ITEMS = [
  {
    question: 'Qual a faculdade EAD mais barata do Brasil?',
    answer:
      'As faculdades EAD mais baratas com bolsa pelo Bolsa Click têm mensalidade a partir de R$ 99/mês, em cursos tecnólogos como Análise e Desenvolvimento de Sistemas, Gestão de RH e Pedagogia. O valor exato depende do curso, da unidade e do turno — bacharelados (4-5 anos) custam um pouco mais que tecnólogos (2-2,5 anos). Em todos os casos, a bolsa chega a 80% sobre o valor cheio e a inscrição é gratuita, sem ENEM.',
  },
  {
    question: 'Faculdade EAD é reconhecida pelo MEC?',
    answer:
      'Sim. Desde 2005, o MEC autoriza graduações em modalidade EAD com o mesmo valor legal e profissional do diploma presencial. O reconhecimento é por curso e por instituição — sempre verifique a Portaria do MEC antes de matricular. Cursos como Administração, Pedagogia, ADS e Engenharia Civil (autorizada em 2023) têm reconhecimento pleno em modalidade EAD.',
  },
  {
    question: 'Quais cursos não podem ser feitos EAD?',
    answer:
      'Direito, Medicina e Odontologia são proibidos pelos respectivos conselhos (OAB, CFM, CFO) em modalidade 100% EAD. Psicologia, Enfermagem, Fisioterapia e Nutrição só são permitidas em formato semipresencial — com parte das aulas online e estágios/disciplinas práticas presenciais.',
  },
  {
    question: 'O diploma EAD vale o mesmo que o presencial?',
    answer:
      'Sim. O diploma EAD tem o mesmo valor legal do presencial pra fins de concurso público, pós-graduação, registros profissionais (CRA, CRP, CREF, CREA, etc) e empregos privados. Empresas não distinguem modalidade na contratação — avaliam a faculdade e o conhecimento do candidato.',
  },
  {
    question: 'Quanto custa uma faculdade EAD com bolsa?',
    answer:
      'Mensalidades de faculdade EAD com bolsa pelo Bolsa Click começam a partir de R$ 99/mês em parceiras como Anhanguera, Unopar, Ampli e Pitágoras. Descontos chegam a 80% sobre o valor cheio. Cursos tecnólogos (2-2,5 anos) tendem a ser mais baratos que bacharelados (4-5 anos).',
  },
  {
    question: 'Como funciona a graduação EAD na prática?',
    answer:
      'Você assiste às aulas em vídeo na plataforma online da faculdade no horário que quiser, faz atividades semanais, participa de fóruns e tutoriais com professores. Provas e algumas atividades práticas são presenciais no polo da faculdade mais próximo da sua cidade (geralmente uma vez por bimestre).',
  },
  {
    question: 'Preciso fazer ENEM pra entrar em faculdade EAD?',
    answer:
      'Não. Faculdades particulares parceiras do Bolsa Click têm processo seletivo próprio (geralmente uma redação online) ou aceitam a nota do ENEM como ingresso facultativo. Pelo Bolsa Click, você se cadastra grátis, escolhe a unidade e garante a bolsa sem precisar de nota mínima.',
  },
  {
    question: 'Quanto tempo dura uma graduação EAD?',
    answer:
      'A duração é a mesma do presencial e definida pelo MEC: tecnólogos têm 2 a 2,5 anos, licenciaturas e bacharelados têm 4 anos, e cursos da área de saúde ou engenharias têm 5 anos. Alguns cursos permitem aproveitamento de créditos pra acelerar a formação.',
  },
  {
    question: 'Posso fazer estágio em EAD?',
    answer:
      'Sim. O estágio supervisionado é obrigatório na maioria das graduações (EAD ou presencial) e é regulamentado pela mesma Lei do Estágio (11.788/2008). A faculdade EAD oferece convênios em empresas ou aceita estágios firmados por você, com supervisão remota.',
  },
]

const jsonLdSchemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Faculdade EAD com Bolsa de Estudo',
    description:
      'Faculdades EAD parceiras com bolsa de até 80%, das maiores redes de ensino do país. Graduação a distância reconhecida pelo MEC. Inscrição grátis, sem ENEM.',
    url: `${SITE_URL}/faculdade-ead`,
    provider: {
      '@type': 'EducationalOrganization',
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
      { '@type': 'ListItem', position: 2, name: 'Faculdade EAD', item: `${SITE_URL}/faculdade-ead` },
    ],
  },
]

export const metadata: Metadata = {
  title: 'Faculdade EAD Mais Barata: Bolsa de até 80%',
  description:
    'A faculdade EAD mais barata começa a partir de R$ 99/mês com bolsa de até 80% pelo Bolsa Click — em graduações reconhecidas pelo MEC como Administração, Pedagogia e ADS. Inscrição grátis, sem ENEM.',
  keywords: [
    'faculdade ead',
    'faculdade ead mais barata',
    'faculdade ead mais barata do brasil',
    'faculdade ead barata',
    'faculdade ead com bolsa',
    'graduação a distância',
    'curso ead com bolsa',
    'ead reconhecido mec',
    'faculdade online com desconto',
  ],
  alternates: { canonical: `${SITE_URL}/faculdade-ead` },
  openGraph: {
    title: 'Faculdade EAD Mais Barata: Bolsa de até 80% | Bolsa Click',
    description:
      'A faculdade EAD mais barata parte de R$ 99/mês com bolsa de até 80%, reconhecida pelo MEC, nas maiores redes de ensino do país. Inscrição grátis, sem ENEM.',
    url: `${SITE_URL}/faculdade-ead`,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function FaculdadeEadPage() {
  const cursosEad = TOP_CURSOS.filter((c) => CURSOS_EAD_DISPONIVEIS.includes(c.slug))
  const cursosSemi = TOP_CURSOS.filter((c) => CURSOS_SEMIPRESENCIAIS.includes(c.slug))

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
              <Sparkles size={12} className="text-bolsa-secondary" />
              Graduação a distância reconhecida MEC
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-[64px] font-semibold text-white leading-[1.05] mb-5">
              Faculdade EAD mais barata{' '}
              <span className="italic text-white/85">com bolsa de até 80% de desconto</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              Compare as faculdades EAD das maiores redes do país (Anhanguera, Estácio, Unopar, Ampli, Pitágoras)
              e garanta sua bolsa em graduações reconhecidas pelo MEC. Sem ENEM, sem fila, inscrição
              100% gratuita.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/cursos?modalidade=EAD"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-bolsa-secondary text-white font-semibold rounded-full hover:bg-bolsa-secondary/90 transition-colors text-[15px] shadow-lg shadow-bolsa-secondary/30"
              >
                Ver bolsas EAD <ArrowRight size={16} />
              </Link>
              <Link
                href="#cursos"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 text-white border border-white/20 font-semibold rounded-full hover:bg-white/15 transition-colors text-[15px]"
              >
                Explorar cursos disponíveis
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mt-12 text-white/85">
              <div className="text-center">
                <Wallet className="mx-auto mb-2 text-bolsa-secondary" size={20} />
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/60">
                  A partir de
                </p>
                <p className="font-display text-2xl font-semibold">R$ 99/mês</p>
              </div>
              <div className="text-center">
                <Clock className="mx-auto mb-2 text-bolsa-secondary" size={20} />
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/60">
                  Duração
                </p>
                <p className="font-display text-2xl font-semibold">2 a 5 anos</p>
              </div>
              <div className="text-center">
                <GraduationCap className="mx-auto mb-2 text-bolsa-secondary" size={20} />
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/60">
                  Reconhecimento
                </p>
                <p className="font-display text-2xl font-semibold">MEC</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POR QUE EAD */}
      <section className="bg-paper py-16 md:py-20 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-500 mb-3">
            Por que estudar EAD
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 mb-6 leading-tight">
            Diploma com o mesmo valor do presencial.
          </h2>
          <div className="prose prose-lg text-ink-700 leading-relaxed space-y-4">
            <p>
              A graduação EAD (Educação a Distância) é uma modalidade de ensino superior
              reconhecida pelo MEC desde 2005, regulamentada pela Portaria 1.428/2018. O diploma
              tem exatamente o mesmo valor legal e profissional do presencial — empresas,
              concursos públicos, conselhos profissionais (CRA, CREA, CRP, CREF) e programas de
              pós-graduação não distinguem entre as duas modalidades.
            </p>
            <p>
              A diferença está no formato: você assiste às videoaulas no horário que quiser, faz
              atividades online semanais e participa de tutorias com professores remotos. Provas
              e algumas atividades práticas acontecem no polo presencial mais próximo da sua
              cidade (geralmente uma a duas vezes por bimestre). Estágios obrigatórios seguem a
              mesma regra do presencial — você cumpre em empresas conveniadas com a faculdade.
            </p>
            <p>
              Pra quem trabalha, estuda fora do horário comercial ou mora longe de capitais, EAD
              democratiza o acesso ao ensino superior. E os custos são significativamente menores:
              em faculdades particulares parceiras do Bolsa Click, mensalidades EAD partem de R$ 99,
              contra R$ 400-800 do presencial equivalente.
            </p>
          </div>
        </div>
      </section>

      {/* CURSOS DISPONÍVEIS EAD */}
      <section id="cursos" className="bg-white py-16 md:py-20 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="hairline-b pb-3 mb-8 flex items-baseline justify-between">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              Cursos EAD 100% reconhecidos
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              ({String(cursosEad.length).padStart(2, '0')})
            </span>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline mb-12">
            {cursosEad.map((curso) => (
              <li key={curso.slug} className="bg-white">
                <Link
                  href={`/cursos/${curso.slug}`}
                  className="group flex flex-col px-5 py-6 transition-colors duration-200 hover:bg-paper h-full"
                >
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-1">
                    EAD · {curso.duration}
                  </span>
                  <span className="font-display text-lg text-ink-900 group-hover:italic transition-all duration-200 mb-1">
                    {curso.name}
                  </span>
                  <span className="font-mono text-[11px] text-ink-500">
                    Ver bolsa →
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {cursosSemi.length > 0 && (
            <>
              <div className="hairline-b pb-3 mb-8 flex items-baseline justify-between">
                <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
                  Cursos semipresenciais (parte EAD)
                </h2>
                <span className="font-mono num-tabular text-[11px] text-ink-500">
                  ({String(cursosSemi.length).padStart(2, '0')})
                </span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-hairline">
                {cursosSemi.map((curso) => (
                  <li key={curso.slug} className="bg-white">
                    <Link
                      href={`/cursos/${curso.slug}`}
                      className="group flex flex-col px-5 py-5 hover:bg-paper"
                    >
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-1">
                        Semipresencial
                      </span>
                      <span className="font-display text-base text-ink-900 group-hover:italic">
                        {curso.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      {/* CURSOS QUE NÃO PODEM SER EAD */}
      <section className="bg-paper py-12 md:py-16 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-500 mb-3">
            Atenção
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4 leading-tight">
            Cursos que não podem ser feitos 100% EAD
          </h2>
          <p className="text-ink-700 leading-relaxed mb-5">
            Por regulamentação dos conselhos profissionais e do MEC, alguns cursos não têm
            autorização pra modalidade EAD integral:
          </p>
          <ul className="space-y-2.5 text-ink-800">
            {CURSOS_NAO_EAD.map((c) => (
              <li key={c.name} className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] tracking-wider text-bolsa-secondary uppercase shrink-0">
                  ✕
                </span>
                <span>
                  <strong className="font-medium">{c.name}</strong>{' '}
                  <span className="text-ink-500 text-sm">— {c.motivo}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-ink-500 text-sm mt-5 leading-relaxed">
            Se alguma faculdade oferecer Direito, Medicina ou Odontologia em modalidade EAD,
            verifique no e-MEC se o curso tem reconhecimento — ofertas irregulares são comuns e
            o diploma pode não ter validade.
          </p>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="bg-white py-16 md:py-20 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-500 mb-3">
            Como funciona
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 mb-8 leading-tight">
            Da inscrição à matrícula em 4 passos.
          </h2>
          <ol className="space-y-6">
            {[
              {
                title: 'Escolha o curso e a unidade',
                text: 'Compare cursos EAD nas faculdades parceiras. Veja preço com bolsa, percentual de desconto e polo presencial mais próximo da sua cidade.',
              },
              {
                title: 'Cadastre-se grátis no Bolsa Click',
                text: 'Sem CPF do parente, sem cartão, sem ENEM. Você preenche seus dados básicos e garante a bolsa antes da matrícula.',
              },
              {
                title: 'Faça o processo seletivo (online)',
                text: 'A maioria das faculdades particulares aceita uma redação online ou nota do ENEM como ingresso facultativo. Sem prova presencial inicial.',
              },
              {
                title: 'Conclua a matrícula direto com a faculdade',
                text: 'Após aprovado, você assina o contrato com a faculdade já com a bolsa aplicada. Paga só a mensalidade com desconto.',
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
      <section className="bg-paper py-16 md:py-20 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-500 mb-3">
            Perguntas frequentes
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 mb-8 leading-tight">
            Tudo sobre faculdade EAD.
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

      {/* CTA FINAL */}
      <section className="bg-bolsa-primary text-white py-16 md:py-20 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4 leading-tight">
            Comece sua graduação EAD com bolsa hoje
          </h2>
          <p className="text-white/80 mb-7 leading-relaxed">
            As maiores redes de ensino do país. Cadastro gratuito. Sem ENEM, sem CPF do parente,
            sem fila.
          </p>
          <Link
            href="/cursos?modalidade=EAD"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-bolsa-secondary text-white font-semibold rounded-full hover:bg-bolsa-secondary/90 transition-colors text-[15px] shadow-lg"
          >
            Ver bolsas EAD disponíveis <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  )
}
