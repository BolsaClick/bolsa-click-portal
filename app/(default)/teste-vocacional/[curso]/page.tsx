import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Sparkles, ArrowRight, Check } from 'lucide-react'
import { TOP_CURSOS } from '@/app/cursos/_data/cursos'
import {
  COURSE_PROFILES,
  RIASEC_DESCRIPTIONS,
  type RiasecType,
} from '@/app/lib/teste-vocacional/methodology-profiles'
import { VisibleFaq } from '@/app/cursos/[slug]/_seo/CourseSeoSections'
import { CourseProfileBlock } from '../_components/CourseProfileBlock'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bolsaclick.com.br'

type Props = { params: Promise<{ curso: string }> }

export const revalidate = 86400 // 24h — conteúdo estático

export async function generateStaticParams() {
  return Object.keys(COURSE_PROFILES).map(curso => ({ curso }))
}

// Mapeia tipo RIASEC pro slug da página de perfil
const TIPO_TO_SLUG: Record<RiasecType, string> = {
  R: 'realista',
  I: 'investigativo',
  A: 'artistico',
  S: 'social',
  E: 'empreendedor',
  C: 'convencional',
}

// Score de similaridade entre 2 cursos (mais peso pra primary)
function similarity(a: typeof COURSE_PROFILES[string], b: typeof COURSE_PROFILES[string]): number {
  let score = 0
  if (a.riasec.primary === b.riasec.primary) score += 4
  else if ([b.riasec.secondary, b.riasec.tertiary].includes(a.riasec.primary)) score += 2
  if (a.riasec.secondary === b.riasec.secondary) score += 2
  else if ([b.riasec.primary, b.riasec.tertiary].includes(a.riasec.secondary)) score += 1
  if (a.riasec.tertiary === b.riasec.tertiary) score += 1
  // Bonus por inteligências em comum
  const gardnerOverlap = a.gardner.filter(i => b.gardner.includes(i)).length
  score += gardnerOverlap
  return score
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { curso } = await params
  const cursoData = TOP_CURSOS.find(c => c.slug === curso)
  const profile = COURSE_PROFILES[curso]
  if (!cursoData || !profile) {
    return { title: 'Curso não encontrado' }
  }

  const name = cursoData.apiCourseName
  const primary = RIASEC_DESCRIPTIONS[profile.riasec.primary]
  const url = `${SITE_URL}/teste-vocacional/${curso}`

  return {
    title: `Teste Vocacional ${name} - Descubra se Combina com Você`,
    description: `${name} combina com seu perfil? Descubra em 5 minutos com nosso teste vocacional baseado em RIASEC (Holland) + Inteligências Múltiplas (Gardner). Perfil ${primary.name} predomina.`,
    keywords: [
      `teste vocacional ${name.toLowerCase()}`,
      `${name.toLowerCase()} vocação`,
      `${name.toLowerCase()} combina comigo`,
      `quem deve fazer ${name.toLowerCase()}`,
      `perfil pra ${name.toLowerCase()}`,
      `holland code ${name.toLowerCase()}`,
      'teste vocacional gratis',
      'teste vocacional ia',
    ],
    alternates: { canonical: url },
    openGraph: {
      title: `Teste Vocacional: ${name} é pra você?`,
      description: `Descubra em 5 min se ${name} combina com seu perfil. Teste com IA + metodologia RIASEC.`,
      url,
      siteName: 'Bolsa Click',
      locale: 'pt_BR',
      type: 'article',
    },
  }
}

export default async function TesteVocacionalCursoPage({ params }: Props) {
  const { curso } = await params
  const cursoData = TOP_CURSOS.find(c => c.slug === curso)
  const profile = COURSE_PROFILES[curso]
  if (!cursoData || !profile) notFound()

  const name = cursoData.apiCourseName
  const description = cursoData.description ?? ''
  const primary = RIASEC_DESCRIPTIONS[profile.riasec.primary]
  const secondary = RIASEC_DESCRIPTIONS[profile.riasec.secondary]
  const primaryTipoSlug = TIPO_TO_SLUG[profile.riasec.primary]

  // Top 3 alternativas com perfil parecido
  const alternatives = Object.entries(COURSE_PROFILES)
    .filter(([s]) => s !== curso)
    .map(([s, p]) => ({ slug: s, score: similarity(profile, p) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ slug }) => {
      const altData = TOP_CURSOS.find(c => c.slug === slug)
      return altData ? { slug, name: altData.apiCourseName, description: altData.description } : null
    })
    .filter((x): x is { slug: string; name: string; description: string } => x !== null)

  // 5 sinais derivados do perfil primary
  const signals = buildSignals(profile.riasec.primary, profile.riasec.secondary, name)

  const url = `${SITE_URL}/teste-vocacional/${curso}`

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Teste Vocacional', item: `${SITE_URL}/teste-vocacional` },
      { '@type': 'ListItem', position: 3, name: `Teste Vocacional ${name}`, item: url },
    ],
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Teste Vocacional ${name}`,
    description: `Descubra se ${name} é o curso ideal pra você com nosso teste vocacional baseado em RIASEC + Gardner.`,
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
      question: `Quem se dá bem em ${name}?`,
      answer: `${name} combina especialmente com pessoas de perfil ${primary.name} (${primary.short}) — ${primary.description.toLowerCase()} Perfis ${secondary.name} também costumam ter afinidade.`,
    },
    {
      question: `Preciso ter feito o ENEM pra descobrir se ${name} é pra mim?`,
      answer: `Não. Nosso teste vocacional é independente de qualquer prova. Em 5 minutos a IA descobre seu perfil e indica se ${name} faz sentido pra você — ou sugere alternativas mais alinhadas.`,
    },
    {
      question: `Quais cursos são parecidos com ${name}?`,
      answer: `Cursos com perfil RIASEC similar incluem ${alternatives.slice(0, 3).map(a => a.name).join(', ')}. Compartilham o mesmo tipo dominante (${primary.name}) ou complementam bem.`,
    },
    {
      question: `${name} é EAD ou presencial no Bolsa Click?`,
      answer: `Depende da faculdade parceira e da cidade. Veja as ofertas reais com modalidade e preço na página do curso.`,
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
            <span className="text-ink-700">{name}</span>
          </nav>
          <h1 className="font-display text-[1.85rem] sm:text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] mb-3 md:mb-4">
            Teste Vocacional: {name} é o curso ideal pra você?
          </h1>
          <p className="text-base md:text-lg text-ink-700 max-w-2xl">
            {description ? `${description} ` : ''}Faça nosso teste com IA em 5 minutos e descubra se {name} combina com seu perfil — ou veja alternativas baseadas no mesmo Holland Code.
          </p>
          <div className="mt-5">
            <Link
              href="/teste-vocacional"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-bolsa-secondary text-white text-sm font-medium rounded-md hover:opacity-90"
            >
              <Sparkles size={14} /> Fazer o teste agora
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-white py-10 md:py-14 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral prose-headings:font-display">
          <h2>O perfil que combina com {name}</h2>
          <p>
            Cada curso superior tem um <em>Holland Code</em> dominante que indica o tipo de
            pessoa que costuma se realizar nele. Pra {name}, o perfil mais comum é{' '}
            <strong>{primary.name}</strong> (com traços fortes de {secondary.name}). Pessoas
            com esse perfil tendem a se identificar com {primary.description.toLowerCase()}
          </p>
          <CourseProfileBlock slug={curso} courseName={name} />
          <p>
            Isso não significa que você precisa ser 100% do perfil dominante pra fazer {name}.
            Mas se as características descritas batem pouco com você, vale considerar
            outras opções — exploramos algumas mais adiante.
          </p>
        </div>
      </section>

      <section className="bg-paper py-10 md:py-14 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral prose-headings:font-display">
          <h2>5 sinais de que {name} pode ser seu caminho</h2>
          <ul className="not-prose space-y-3">
            {signals.map((s, i) => (
              <li key={i} className="flex items-start gap-3 bg-white border border-hairline rounded-md p-4">
                <Check className="text-bolsa-secondary shrink-0 mt-0.5" size={16} />
                <span className="text-ink-900 text-sm leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-ink-700 text-sm">
            Se você se identificou com 3 ou mais sinais, {name} provavelmente é uma boa
            aposta — vale fazer o teste completo pra ter certeza e descobrir 2 cursos
            alternativos que combinam com você.
          </p>
        </div>
      </section>

      {alternatives.length > 0 && (
        <section className="bg-white py-10 md:py-14 border-b border-hairline">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-neutral prose-headings:font-display mb-6">
              <h2>Não combina? Cursos alternativos pro mesmo perfil</h2>
              <p>
                Se {name} não te empolgou nos sinais acima, esses cursos têm perfil RIASEC
                similar — exploram dimensões parecidas de quem você é, mas em áreas
                diferentes.
              </p>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {alternatives.map(alt => (
                <li key={alt.slug}>
                  <Link
                    href={`/teste-vocacional/${alt.slug}`}
                    className="group block bg-paper border border-hairline rounded-lg p-4 hover:border-bolsa-secondary transition-colors h-full"
                  >
                    <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500 mb-1">
                      Alternativa
                    </p>
                    <h3 className="font-display text-lg text-ink-900 group-hover:text-bolsa-secondary leading-tight mb-1">
                      {alt.name}
                    </h3>
                    {alt.description && (
                      <p className="text-ink-500 text-xs leading-relaxed">{alt.description}</p>
                    )}
                    <span className="inline-flex items-center gap-1 text-bolsa-secondary text-xs font-medium mt-2">
                      Ver teste deste curso <ArrowRight size={12} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="bg-paper py-10 md:py-14 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral prose-headings:font-display">
          <h2>Como saber pra valer se {name} é pra você</h2>
          <p>
            A descrição do perfil ajuda, mas o teste real é mais preciso. Em 5 minutos
            nossa IA conduz uma conversa adaptativa que captura o que importa: seus
            interesses concretos, valores, áreas que você gosta e não gosta. No final,
            recebe os 3 cursos com maior afinidade com base no seu Holland Code real —
            pode ser {name}, pode ser algo que você nunca tinha considerado.
          </p>
          <p>
            <Link href={`/teste-vocacional/perfil/${primaryTipoSlug}`}>
              Saiba mais sobre o perfil {primary.name}
            </Link>{' '}
            ou{' '}
            <Link href="/teste-vocacional/metodologia">conheça a metodologia (RIASEC + Gardner)</Link>{' '}
            que usamos no teste.
          </p>
        </div>
      </section>

      <VisibleFaq items={faqItems} heading={`Perguntas frequentes sobre Teste Vocacional ${name}`} />

      <section className="bg-white py-12 md:py-16 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Sparkles className="mx-auto text-bolsa-secondary mb-3" size={28} />
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-3">
            Pronto pra descobrir se {name} é pra você?
          </h2>
          <p className="text-ink-700 mb-6 text-sm md:text-base">
            5 minutos, sem CPF, com metodologia validada cientificamente.
          </p>
          <Link
            href="/teste-vocacional"
            className="inline-flex items-center gap-2 px-6 py-3 bg-bolsa-secondary text-white font-medium rounded-md hover:opacity-90"
          >
            <Sparkles size={16} /> Fazer o teste vocacional
          </Link>
        </div>
      </section>
    </>
  )
}

// Gera 5 sinais customizados baseados no Holland Code primário + secundário do curso
function buildSignals(primary: RiasecType, secondary: RiasecType, courseName: string): string[] {
  const fragments: Record<RiasecType, string[]> = {
    R: [
      `Você prefere trabalhar com coisas concretas e tangíveis em vez de só ideias abstratas`,
      `Sente prazer em consertar, montar, ou resolver problemas com as próprias mãos`,
      `Gosta de ambientes onde o resultado do trabalho é visível e palpável`,
    ],
    I: [
      `Você questiona o porquê das coisas mesmo quando todo mundo já aceitou a resposta`,
      `Curte se aprofundar em um assunto e entender as raízes do problema, não só a superfície`,
      `Tem prazer em analisar dados, pesquisar, formular hipóteses e testar`,
    ],
    A: [
      `Você se expressa melhor criando algo (texto, imagem, design) do que falando direto`,
      `Tem facilidade pra pensar fora da caixa e propor soluções não-óbvias`,
      `Curte ambientes com liberdade pra experimentar e mudar de direção`,
    ],
    S: [
      `Você se sente energizado quando consegue ajudar alguém a resolver algo`,
      `Lê bem as emoções dos outros e gosta de mediar conflitos`,
      `Prioriza trabalho com impacto direto na vida das pessoas`,
    ],
    E: [
      `Você costuma tomar iniciativa em grupo e curte liderar projetos`,
      `Tem facilidade pra persuadir, negociar e vender ideias`,
      `Não tem medo de correr riscos calculados pra alcançar resultado`,
    ],
    C: [
      `Você se dá bem com estrutura, processos claros e rotinas previsíveis`,
      `Tem atenção a detalhes e gosto por trabalhar com dados organizados`,
      `Sente satisfação em criar e seguir sistemas que funcionam bem`,
    ],
  }
  const out = [
    ...fragments[primary].slice(0, 3),
    fragments[secondary][0],
    `Você consegue se imaginar trabalhando como profissional de ${courseName} no dia a dia`,
  ]
  return out
}
