import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Sparkles, ArrowRight, Award } from 'lucide-react'
import { TOP_CURSOS } from '@/app/cursos/_data/cursos'
import {
  COURSE_PROFILES,
  RIASEC_DESCRIPTIONS,
  type RiasecType,
} from '@/app/lib/teste-vocacional/methodology-profiles'
import { VisibleFaq } from '@/app/cursos/[slug]/_seo/CourseSeoSections'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bolsaclick.com.br'

type Props = { params: Promise<{ tipo: string }> }

export const revalidate = 86400

const SLUG_TO_TIPO: Record<string, RiasecType> = {
  realista: 'R',
  investigativo: 'I',
  artistico: 'A',
  social: 'S',
  empreendedor: 'E',
  convencional: 'C',
}

export async function generateStaticParams() {
  return Object.keys(SLUG_TO_TIPO).map(tipo => ({ tipo }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tipo } = await params
  const tipoCode = SLUG_TO_TIPO[tipo]
  if (!tipoCode) return { title: 'Perfil não encontrado' }

  const desc = RIASEC_DESCRIPTIONS[tipoCode]
  const url = `${SITE_URL}/teste-vocacional/perfil/${tipo}`

  return {
    title: `Perfil ${desc.name} (Holland Code ${tipoCode}) - Carreiras e Cursos`,
    description: `Tudo sobre o perfil vocacional ${desc.name} de Holland (RIASEC): comportamento, carreiras, cursos compatíveis e como descobrir se esse é o seu tipo dominante.`,
    keywords: [
      `perfil ${desc.name.toLowerCase()}`,
      `holland code ${tipoCode.toLowerCase()}`,
      `tipo vocacional ${desc.name.toLowerCase()}`,
      `RIASEC ${desc.name.toLowerCase()}`,
      `carreiras pra perfil ${desc.name.toLowerCase()}`,
      `${desc.name.toLowerCase()} vocação`,
    ],
    alternates: { canonical: url },
    openGraph: {
      title: `Perfil ${desc.name} — Holland Code ${tipoCode}`,
      description: `${desc.description} Veja carreiras e cursos compatíveis.`,
      url,
      siteName: 'Bolsa Click',
      locale: 'pt_BR',
      type: 'article',
    },
  }
}

export default async function PerfilHollandPage({ params }: Props) {
  const { tipo } = await params
  const tipoCode = SLUG_TO_TIPO[tipo]
  if (!tipoCode) notFound()

  const desc = RIASEC_DESCRIPTIONS[tipoCode]

  // Cursos onde esse tipo é primary
  const cursosCompativeis = Object.entries(COURSE_PROFILES)
    .filter(([, p]) => p.riasec.primary === tipoCode)
    .map(([slug]) => {
      const data = TOP_CURSOS.find(c => c.slug === slug)
      return data ? { slug, name: data.apiCourseName, description: data.description } : null
    })
    .filter((x): x is { slug: string; name: string; description: string } => x !== null)

  // Combinações famosas: outros tipos que costumam acompanhar esse como secondary/tertiary
  const combosFamosos = buildCombos(tipoCode)

  const url = `${SITE_URL}/teste-vocacional/perfil/${tipo}`

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Teste Vocacional', item: `${SITE_URL}/teste-vocacional` },
      { '@type': 'ListItem', position: 3, name: `Perfil ${desc.name}`, item: url },
    ],
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Perfil ${desc.name} (Holland Code ${tipoCode})`,
    description: desc.description,
    author: { '@type': 'Organization', name: 'Bolsa Click', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Bolsa Click',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/logo-bolsa-click-rosa.png` },
    },
    datePublished: '2024-01-15',
    dateModified: new Date().toISOString().slice(0, 10),
    mainEntityOfPage: url,
  }

  const faqItems = [
    {
      question: `O que define o perfil ${desc.name}?`,
      answer: desc.description,
    },
    {
      question: `Como saber se eu sou perfil ${desc.name}?`,
      answer: `O jeito mais confiável é fazendo um teste vocacional baseado em RIASEC. Nosso teste com IA descobre seu Holland Code em 5 minutos e indica se ${desc.name} é seu tipo dominante, secundário ou terciário.`,
    },
    {
      question: `Posso ser ${desc.name} sem combinar com nenhum dos cursos listados?`,
      answer: `Sim. O Holland Code de 3 letras (ex: ${tipoCode}IA, ${tipoCode}SE) é mais preciso que apenas a letra dominante. Pode ser que ${desc.name} seja seu primário mas o curso ideal apareça quando consideramos seu Holland Code completo + inteligências múltiplas Gardner.`,
    },
    {
      question: `${desc.name} é melhor ou pior que outros perfis?`,
      answer: `Nenhum perfil RIASEC é melhor que outro — são apenas diferentes. O que importa é o match entre seu perfil e o ambiente profissional escolhido. Holland chamou isso de "princípio da congruência": quanto mais alinhado, maior a satisfação e o desempenho.`,
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, articleSchema, {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map(f => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          })),
        }]) }}
      />

      <header className="bg-paper border-b border-hairline py-10 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <nav
            className="font-mono text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-ink-500 mb-3 md:mb-4"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-ink-900">Início</Link>
            <span className="mx-2">/</span>
            <Link href="/teste-vocacional" className="hover:text-ink-900">Teste Vocacional</Link>
            <span className="mx-2">/</span>
            <span className="text-ink-700">Perfil {desc.name}</span>
          </nav>
          <div className="flex items-baseline gap-3 mb-3">
            <span className="font-display text-5xl md:text-6xl font-semibold text-bolsa-secondary">
              {tipoCode}
            </span>
            <span className="font-mono text-xs text-ink-500 tracking-wider">Holland Code</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-ink-900 leading-tight mb-3">
            Perfil {desc.name}
          </h1>
          <p className="text-base md:text-lg text-ink-700 max-w-2xl">
            {desc.description}
          </p>
        </div>
      </header>

      <section className="bg-white py-10 md:py-14 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral prose-headings:font-display">
          <h2>Como é alguém do perfil {desc.name}</h2>
          {buildExtendedDescription(tipoCode).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {cursosCompativeis.length > 0 && (
        <section className="bg-paper py-10 md:py-14 border-b border-hairline">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-neutral prose-headings:font-display mb-6">
              <h2>Cursos compatíveis com perfil {desc.name}</h2>
              <p>
                Esses cursos têm <strong>{desc.name} como tipo Holland primário</strong> —
                ou seja, são os que mais combinam com quem tem esse perfil dominante.
              </p>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cursosCompativeis.map(c => (
                <li key={c.slug}>
                  <Link
                    href={`/teste-vocacional/${c.slug}`}
                    className="group block bg-white border border-hairline rounded-lg p-4 hover:border-bolsa-secondary transition-colors h-full"
                  >
                    <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500 mb-1">
                      Curso compatível
                    </p>
                    <h3 className="font-display text-lg text-ink-900 group-hover:text-bolsa-secondary leading-tight mb-1">
                      {c.name}
                    </h3>
                    {c.description && (
                      <p className="text-ink-500 text-xs leading-relaxed line-clamp-2">{c.description}</p>
                    )}
                    <span className="inline-flex items-center gap-1 text-bolsa-secondary text-xs font-medium mt-2">
                      Ver teste vocacional <ArrowRight size={12} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="bg-white py-10 md:py-14 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral prose-headings:font-display">
          <h2>Combinações famosas com {desc.name}</h2>
          <p>
            Holland Codes de 3 letras revelam combinações típicas no mundo real.
            Os mais comuns que começam com <strong>{tipoCode}</strong>:
          </p>
          <ul className="not-prose space-y-3">
            {combosFamosos.map(combo => (
              <li key={combo.code} className="bg-paper border border-hairline rounded-md p-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-display text-xl text-bolsa-secondary font-semibold">
                    {combo.code}
                  </span>
                  <span className="font-mono text-xs text-ink-500">
                    {combo.fullName}
                  </span>
                </div>
                <p className="text-ink-700 text-sm">{combo.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <VisibleFaq items={faqItems} heading={`Perguntas frequentes sobre perfil ${desc.name}`} />

      <section className="bg-paper py-12 md:py-16 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Award className="mx-auto text-bolsa-secondary mb-3" size={28} />
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-3">
            Descubra seu Holland Code completo
          </h2>
          <p className="text-ink-700 mb-6 text-sm md:text-base">
            Saber se você é {desc.name} é só o começo — o teste descobre seu código completo
            de 3 letras + inteligências Gardner dominantes + 3 cursos com maior afinidade.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/teste-vocacional"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-bolsa-secondary text-white text-sm font-medium rounded-md hover:opacity-90"
            >
              <Sparkles size={14} /> Fazer o teste
            </Link>
            <Link
              href="/teste-vocacional/metodologia"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-bolsa-secondary text-bolsa-secondary text-sm font-medium rounded-md hover:bg-paper"
            >
              Entender a metodologia
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 md:py-12 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-5xl">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-4 text-center">
            Outros perfis Holland
          </p>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {(Object.keys(SLUG_TO_TIPO) as Array<keyof typeof SLUG_TO_TIPO>).map(slug => {
              const code = SLUG_TO_TIPO[slug]
              const d = RIASEC_DESCRIPTIONS[code]
              const isCurrent = slug === tipo
              return (
                <li key={slug}>
                  <Link
                    href={`/teste-vocacional/perfil/${slug}`}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`block text-center border rounded-md px-3 py-3 transition-colors ${
                      isCurrent
                        ? 'bg-bolsa-secondary border-bolsa-secondary text-white'
                        : 'bg-white border-hairline text-ink-700 hover:border-bolsa-secondary hover:text-ink-900'
                    }`}
                  >
                    <span className="block font-display text-lg font-semibold">{code}</span>
                    <span className="block text-xs">{d.short}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    </>
  )
}

function buildExtendedDescription(tipo: RiasecType): string[] {
  const map: Record<RiasecType, string[]> = {
    R: [
      'Pessoas do perfil Realista (R) preferem trabalhar com coisas tangíveis: máquinas, ferramentas, materiais, animais, equipamentos. Sentem mais satisfação em ver o resultado concreto do que em discutir conceitos abstratos.',
      'Geralmente são práticas, diretas, valorizam habilidade manual e raciocínio espacial. Tendem a evitar trabalhos puramente sociais ou que envolvem muita persuasão. Preferem competência técnica a hierarquia política.',
      'No ambiente profissional, dão o melhor quando podem operar com autonomia, usar conhecimento técnico aplicado e ver progresso físico do trabalho. Ambientes com regras claras e foco em fazer (não só planejar) costumam fluir.',
      'Profissões típicas: engenheiros de campo, técnicos, mecânicos, agrônomos, fisioterapeutas, profissões da construção civil, esportes, agricultura, segurança.',
    ],
    I: [
      'Pessoas do perfil Investigativo (I) gostam de entender como as coisas funcionam. Curiosidade analítica é a marca registrada — querem investigar, pesquisar, formular hipóteses e testar. Preferem ideias a pessoas.',
      'Costumam ser independentes, introspectivas, valorizam precisão e lógica. Não gostam muito de hierarquia rígida nem de tarefas repetitivas. Frequentemente são céticas com afirmações sem evidência.',
      'Ambientes que funcionam: pesquisa, ciência, tecnologia, áreas que valorizam profundidade técnica e raciocínio crítico. Funcionam bem em culturas que toleram (ou celebram) divergência intelectual.',
      'Profissões típicas: cientistas, médicos, programadores, engenheiros de pesquisa, biomédicos, farmacêuticos, analistas, professores universitários.',
    ],
    A: [
      'Pessoas do perfil Artístico (A) se expressam por criação. Valorizam originalidade, estética, intuição. Tendem a evitar ambientes muito estruturados e regras rígidas — sentem que sufocam a criatividade.',
      'Costumam ser não-conformistas, emocionais, sensíveis a estímulos visuais e sonoros. Aprendem por imersão e experimentação. Dão o melhor quando podem inventar do zero, não só seguir templates.',
      'Ambientes que funcionam: agências criativas, mídia, design, artes, arquitetura, publicidade. Trabalho freelancer ou autoral também combina, desde que tenha estabilidade financeira mínima.',
      'Profissões típicas: arquitetos, designers, escritores, jornalistas, publicitários, artistas plásticos, músicos, atores, produtores de conteúdo.',
    ],
    S: [
      'Pessoas do perfil Social (S) se realizam em interações humanas significativas. Empatia, comunicação e desejo de ajudar são as marcas. Gostam de ensinar, cuidar, mediar, inspirar.',
      'Costumam ser calorosas, pacientes, boas ouvintes. Tendem a evitar trabalhos isolados ou puramente técnicos. Dão muito valor a relações de longo prazo e a impacto direto na vida dos outros.',
      'Ambientes que funcionam: educação, saúde, recursos humanos, terapia, serviço público, organizações sem fins lucrativos, hospitalidade. Culturas que valorizam cooperação acima de competição.',
      'Profissões típicas: psicólogos, professores, enfermeiros, fisioterapeutas, fonoaudiólogos, assistentes sociais, terapeutas, treinadores, gestores de RH.',
    ],
    E: [
      'Pessoas do perfil Empreendedor (E) sentem prazer em liderar, persuadir, vender e tomar decisões com impacto. Gostam de risco calculado, de competir e de ver resultado mensurável (faturamento, conquista, growth).',
      'Costumam ser autoconfiantes, energéticas, sociáveis em situações de negócio. Tendem a evitar ambientes muito técnicos ou contemplativos. Não têm paciência pra processos lentos ou hierarquia engessada.',
      'Ambientes que funcionam: vendas, negócios, startups, política, direito empresarial, marketing, gestão executiva, mídia. Culturas que recompensam iniciativa e tolerância a risco.',
      'Profissões típicas: gestores, empreendedores, advogados, profissionais de vendas, marketing executivo, consultores, políticos, traders, agentes financeiros.',
    ],
    C: [
      'Pessoas do perfil Convencional (C) se dão bem com estrutura, ordem, precisão e processos. Valorizam regras claras, dados organizados e sistemas que funcionam. Atenção a detalhes é a marca.',
      'Costumam ser confiáveis, metódicas, conservadoras na abordagem. Tendem a evitar ambientes caóticos ou trabalhos que exigem improvisação constante. Preferem rotina previsível a surpresas diárias.',
      'Ambientes que funcionam: contabilidade, finanças, auditoria, administração, jurídico, compliance, logística, dados. Culturas que valorizam exatidão e processos bem documentados.',
      'Profissões típicas: contadores, auditores, administradores, analistas financeiros, bibliotecários, profissionais de TI focados em dados, advogados de compliance, secretários executivos.',
    ],
  }
  return map[tipo]
}

interface Combo {
  code: string
  fullName: string
  description: string
}

function buildCombos(primary: RiasecType): Combo[] {
  const allOthers: RiasecType[] = (['R', 'I', 'A', 'S', 'E', 'C'] as RiasecType[]).filter(t => t !== primary)
  const combos: Combo[] = []
  for (let i = 0; i < allOthers.length; i++) {
    for (let j = i + 1; j < allOthers.length; j++) {
      if (combos.length >= 4) break
      const sec = allOthers[i]
      const ter = allOthers[j]
      combos.push({
        code: `${primary}${sec}${ter}`,
        fullName: `${RIASEC_DESCRIPTIONS[primary].name} + ${RIASEC_DESCRIPTIONS[sec].name} + ${RIASEC_DESCRIPTIONS[ter].name}`,
        description: buildComboDescription(primary, sec, ter),
      })
    }
    if (combos.length >= 4) break
  }
  return combos.slice(0, 4)
}

function buildComboDescription(primary: RiasecType, sec: RiasecType, ter: RiasecType): string {
  const examples: Record<string, string> = {
    SIA: 'Comum em psicólogos clínicos, terapeutas, professores universitários de humanidades.',
    SIR: 'Comum em enfermeiros, fisioterapeutas, profissionais de saúde com perfil pesquisador.',
    SEA: 'Comum em professores de artes, pedagogos, gestores de equipe criativa.',
    SEC: 'Comum em gestores de RH, coaches, consultores organizacionais.',
    SIE: 'Comum em líderes de ONGs, gestores de programas sociais.',
    SAR: 'Comum em educação física, treinadores esportivos, terapeutas corporais.',
    IRC: 'Comum em pesquisadores aplicados, engenheiros de pesquisa, biomédicos.',
    IRA: 'Comum em arquitetos, designers de produto, pesquisadores em design.',
    IRE: 'Comum em engenheiros gestores, líderes técnicos de startups.',
    ISC: 'Comum em médicos analistas, profissionais de saúde pública, biólogos.',
    ISA: 'Comum em pesquisadores em humanas, antropólogos, historiadores.',
    EAC: 'Comum em diretores de marketing, gestores de agência criativa.',
    ESC: 'Comum em executivos de negócios, gestores comerciais.',
    ESR: 'Comum em empreendedores em construção/indústria, gestores de operações.',
    ESI: 'Comum em consultores estratégicos, líderes de planejamento.',
    EAS: 'Comum em produtores executivos, empreendedores de mídia/eventos.',
    CIE: 'Comum em auditores, controllers, profissionais de compliance.',
    CIR: 'Comum em analistas de dados, atuários, profissionais de risco.',
    CIS: 'Comum em advogados de contratos, profissionais de governança.',
    ARS: 'Comum em arquitetos sociais, designers de produto humano-centrado.',
    ARI: 'Comum em arquitetos, designers de games, motion designers técnicos.',
    AIE: 'Comum em diretores criativos, empreendedores de marca/design.',
    RIE: 'Comum em líderes técnicos em indústria, gestores de obra.',
    RIS: 'Comum em fisioterapeutas, técnicos de reabilitação, agrônomos sociais.',
    RIA: 'Comum em arquitetos, designers de produto físico, escultores aplicados.',
  }
  const key = `${primary}${sec}${ter}`
  return examples[key] ?? `Combinação ${RIASEC_DESCRIPTIONS[primary].name} + ${RIASEC_DESCRIPTIONS[sec].name} + ${RIASEC_DESCRIPTIONS[ter].name} é típica em profissionais que misturam essas três dimensões em seu dia a dia.`
}
