import { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Check, Star } from 'lucide-react'
import { prisma } from '@/app/lib/prisma'
import { getCurrentTheme } from '@/app/lib/themes'
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import { Course } from '@/app/interface/course'
import { TOP_CURSOS } from '@/app/cursos/_data/cursos'
import { VisibleFaq } from '@/app/cursos/[slug]/_seo/CourseSeoSections'

const theme = getCurrentTheme()

type Props = {
  params: Promise<{ pair: string }>
}

export const revalidate = 86400

const modalityLabel = (m: string) =>
  m === 'EAD' ? 'EAD' : m === 'PRESENCIAL' ? 'Presencial' : m === 'SEMIPRESENCIAL' ? 'Semipresencial' : m
const levelLabel = (l: string) =>
  l === 'GRADUACAO' ? 'Graduação' : l === 'POS_GRADUACAO' ? 'Pós-graduação' : l
const typeLabel = (t: string) =>
  t === 'PRIVADA' ? 'Privada' : t === 'PUBLICA_FEDERAL' ? 'Pública Federal' : t === 'PUBLICA_ESTADUAL' ? 'Pública Estadual' : t

function parsePair(pair: string): { slugA: string; slugB: string } | null {
  const parts = pair.split('-vs-')
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null
  return { slugA: parts[0], slugB: parts[1] }
}

function canonicalOrder(a: string, b: string): [string, string] {
  return [a, b].sort() as [string, string]
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

// Fetcha offers dos TOP_CURSOS inteiros (22 cursos × 50 offers = pool de ~1100).
// Usa `unstable_cache` (não `react.cache`) pra dedupar entre os 15 builds das
// páginas comparativas — caso contrário seriam 22×15 = 330 calls na Cogna.
// Revalidate 24h alinha com o ISR da página.
const fetchOffersSample = unstable_cache(
  async (): Promise<Course[]> => {
    const results = await Promise.all(
      TOP_CURSOS.map(curso =>
        getShowFiltersCourses(
          curso.apiCourseName,
          undefined,
          undefined,
          undefined,
          'GRADUACAO',
          1,
          50
        )
          .then(r => (r?.data || []) as Course[])
          .catch(error => {
            console.error(
              `⚠️ Falha ao buscar ofertas de ${curso.apiCourseName} pra comparação:`,
              error
            )
            return [] as Course[]
          })
      )
    )
    return results.flat()
  },
  ['compare-offers-sample-v1'],
  { revalidate: 86400, tags: ['compare-offers'] }
)

interface BrandStats {
  offerCount: number
  courseCount: number
  cityCount: number
  avgPrice: number
  minPrice: number
}

function computeBrandStats(offers: Course[], brandName: string): BrandStats {
  const brandKey = normalize(brandName)
  const brandOffers = offers.filter(o => normalize(o.brand || '') === brandKey)
  const prices = brandOffers.map(o => o.minPrice || 0).filter(p => p > 0)
  const courses = new Set(brandOffers.map(o => normalize(o.name || '')).filter(Boolean))
  const cities = new Set(
    brandOffers.map(o => normalize(o.unitCity || o.city || '')).filter(Boolean)
  )
  return {
    offerCount: brandOffers.length,
    courseCount: courses.size,
    cityCount: cities.size,
    avgPrice: prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
    minPrice: prices.length ? Math.min(...prices) : 0,
  }
}

export async function generateStaticParams() {
  const institutions = await prisma.institution.findMany({
    where: { isActive: true },
    select: { slug: true },
    orderBy: { slug: 'asc' },
  })
  const pairs: { pair: string }[] = []
  for (let i = 0; i < institutions.length; i++) {
    for (let j = i + 1; j < institutions.length; j++) {
      pairs.push({ pair: `${institutions[i].slug}-vs-${institutions[j].slug}` })
    }
  }
  return pairs
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params
  const parsed = parsePair(pair)
  if (!parsed) return { title: 'Comparação não encontrada' }

  const [a, b] = canonicalOrder(parsed.slugA, parsed.slugB)

  const institutions = await prisma.institution.findMany({
    where: { slug: { in: [a, b] }, isActive: true },
    select: { name: true, fullName: true, slug: true },
  })

  if (institutions.length !== 2) return { title: 'Comparação não encontrada' }

  const instA = institutions.find(i => i.slug === a)!
  const instB = institutions.find(i => i.slug === b)!

  const canonicalUrl = `${theme.siteUrl}/comparar/${a}-vs-${b}`

  const title = `${instA.name} vs ${instB.name}: Qual a Melhor Faculdade?`
  const description = `Compare ${instA.fullName} e ${instB.fullName}: nota MEC, modalidades, polos, cursos e bolsas. Veja qual faculdade combina mais com seu perfil e estude com até 80% de desconto.`

  return {
    title,
    description,
    keywords: [
      `${instA.name} vs ${instB.name}`,
      `${instA.name} ou ${instB.name}`,
      `qual melhor ${instA.name} ou ${instB.name}`,
      `comparar ${instA.name} ${instB.name}`,
      `diferença entre ${instA.name} e ${instB.name}`,
      'comparar faculdades',
      'bolsa click',
    ],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${instA.name} vs ${instB.name} — Comparativo Completo`,
      description,
      url: canonicalUrl,
      siteName: 'Bolsa Click',
      locale: 'pt_BR',
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function CompareInstitutionsPage({ params }: Props) {
  const { pair } = await params
  const parsed = parsePair(pair)
  if (!parsed) notFound()

  const [a, b] = canonicalOrder(parsed.slugA, parsed.slugB)
  const canonicalPair = `${a}-vs-${b}`

  // Mesma faculdade dos dois lados não faz sentido
  if (a === b) notFound()

  // Ordem não-canônica → redireciona pra alfabética (evita duplicate content)
  if (pair !== canonicalPair) {
    redirect(`/comparar/${canonicalPair}`)
  }

  const institutions = await prisma.institution.findMany({
    where: { slug: { in: [a, b] }, isActive: true },
  })

  if (institutions.length !== 2) notFound()

  const instA = institutions.find(i => i.slug === a)!
  const instB = institutions.find(i => i.slug === b)!

  // Dados vivos da Cogna (amostra dos 5 cursos mais populares)
  const offersSample = await fetchOffersSample()
  const statsA = computeBrandStats(offersSample, instA.name)
  const statsB = computeBrandStats(offersSample, instB.name)
  const hasLiveData = statsA.offerCount > 0 || statsB.offerCount > 0

  const canonicalUrl = `${theme.siteUrl}/comparar/${canonicalPair}`

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: theme.siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Faculdades', item: `${theme.siteUrl}/faculdades` },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${instA.name} vs ${instB.name}`,
        item: canonicalUrl,
      },
    ],
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${instA.name} vs ${instB.name}: Qual a Melhor Faculdade?`,
    description: `Comparativo completo entre ${instA.fullName} e ${instB.fullName}.`,
    author: { '@type': 'Organization', name: 'Bolsa Click', url: theme.siteUrl },
    publisher: {
      '@type': 'Organization',
      name: 'Bolsa Click',
      logo: { '@type': 'ImageObject', url: `${theme.siteUrl}/assets/logo-bolsa-click-rosa.png` },
    },
    datePublished: '2024-01-15',
    dateModified: new Date().toISOString().slice(0, 10),
    mainEntityOfPage: canonicalUrl,
  }

  // Linhas da tabela comparativa
  const rows: Array<{ label: string; a: React.ReactNode; b: React.ReactNode }> = [
    {
      label: 'Tipo',
      a: typeLabel(instA.type),
      b: typeLabel(instB.type),
    },
    {
      label: 'Nota MEC',
      a: instA.mecRating ? `${instA.mecRating}/5` : '—',
      b: instB.mecRating ? `${instB.mecRating}/5` : '—',
    },
    {
      label: 'Fundação',
      a: instA.founded ? String(instA.founded) : '—',
      b: instB.founded ? String(instB.founded) : '—',
    },
    {
      label: 'Polos / Unidades',
      a: instA.campusCount ? String(instA.campusCount) : '—',
      b: instB.campusCount ? String(instB.campusCount) : '—',
    },
    {
      label: 'Estudantes',
      a: instA.studentCount || '—',
      b: instB.studentCount || '—',
    },
    {
      label: 'Cursos ofertados',
      a: instA.coursesOffered ? `${instA.coursesOffered}+` : '—',
      b: instB.coursesOffered ? `${instB.coursesOffered}+` : '—',
    },
    {
      label: 'Modalidades',
      a: instA.modalities.map(modalityLabel).join(' · ') || '—',
      b: instB.modalities.map(modalityLabel).join(' · ') || '—',
    },
    {
      label: 'Níveis',
      a: instA.academicLevels.map(levelLabel).join(' · ') || '—',
      b: instB.academicLevels.map(levelLabel).join(' · ') || '—',
    },
    {
      label: 'Sede',
      a: instA.headquartersCity ? `${instA.headquartersCity}/${instA.headquartersState}` : '—',
      b: instB.headquartersCity ? `${instB.headquartersCity}/${instB.headquartersState}` : '—',
    },
  ]

  // Linhas com dados vivos da API (só renderiza se ao menos uma brand tiver dados)
  const liveRows: typeof rows = hasLiveData
    ? [
        {
          label: 'Mensalidade a partir de',
          a: statsA.minPrice > 0 ? `R$ ${statsA.minPrice.toFixed(0)}/mês` : '—',
          b: statsB.minPrice > 0 ? `R$ ${statsB.minPrice.toFixed(0)}/mês` : '—',
        },
        {
          label: 'Mensalidade média',
          a: statsA.avgPrice > 0 ? `R$ ${statsA.avgPrice.toFixed(0)}/mês` : '—',
          b: statsB.avgPrice > 0 ? `R$ ${statsB.avgPrice.toFixed(0)}/mês` : '—',
        },
        {
          label: 'Cursos no Bolsa Click*',
          a: statsA.courseCount > 0 ? String(statsA.courseCount) : '—',
          b: statsB.courseCount > 0 ? String(statsB.courseCount) : '—',
        },
        {
          label: 'Cidades cobertas*',
          a: statsA.cityCount > 0 ? String(statsA.cityCount) : '—',
          b: statsB.cityCount > 0 ? String(statsB.cityCount) : '—',
        },
      ]
    : []

  const allRows = [...rows, ...liveRows]

  const faqItems = [
    {
      question: `${instA.name} ou ${instB.name}: qual é a melhor?`,
      answer: `Não existe melhor universal — depende do que você prioriza. A ${instA.name} ${instA.mecRating ? `tem nota MEC ${instA.mecRating}` : 'é reconhecida pelo MEC'} e ${instA.campusCount ? `${instA.campusCount} polos` : 'cobertura nacional'}. A ${instB.name} ${instB.mecRating ? `tem nota MEC ${instB.mecRating}` : 'é reconhecida pelo MEC'} e ${instB.campusCount ? `${instB.campusCount} polos` : 'também atende todo Brasil'}. Compare nota MEC, polos próximos da sua cidade e mensalidade do curso desejado.`,
    },
    {
      question: `Qual a diferença na nota MEC entre ${instA.name} e ${instB.name}?`,
      answer:
        instA.mecRating && instB.mecRating
          ? `${instA.name} tem nota ${instA.mecRating} e ${instB.name} tem nota ${instB.mecRating} (escala de 1 a 5). A nota MEC reflete a avaliação institucional, considerando ensino, pesquisa, extensão e infraestrutura.`
          : `Pelo menos uma das instituições não tem nota institucional MEC pública. Consulte o portal e-MEC pra dados oficiais atualizados.`,
    },
    {
      question: `${instA.name} vs ${instB.name}: qual tem mais cursos EAD?`,
      answer: `Ambas oferecem EAD. ${instA.modalities.includes('EAD') ? `A ${instA.name} tem EAD ativa` : `A ${instA.name} atualmente oferece ${instA.modalities.map(modalityLabel).join(', ').toLowerCase()}`}. ${instB.modalities.includes('EAD') ? `A ${instB.name} também tem EAD` : `A ${instB.name} oferece ${instB.modalities.map(modalityLabel).join(', ').toLowerCase()}`}. Pelo Bolsa Click, o desconto se aplica em qualquer modalidade disponível.`,
    },
    {
      question: `Como conseguir bolsa de estudo na ${instA.name} ou na ${instB.name}?`,
      answer: `O Bolsa Click oferece bolsas de até 80% nas duas faculdades. Escolha o curso desejado, compare as ofertas das duas instituições lado a lado e finalize a inscrição grátis. O desconto vale durante todo o curso enquanto você mantém a matrícula ativa.`,
    },
  ]

  // Outras comparações pra cross-link
  const allOthers = await prisma.institution.findMany({
    where: { isActive: true, slug: { notIn: [a, b] } },
    select: { slug: true, name: true },
    take: 4,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, articleSchema]) }}
      />

      <header className="bg-paper border-b border-hairline py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <nav
            className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500 mb-4"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-ink-900">Início</Link>
            <span className="mx-2">/</span>
            <Link href="/faculdades" className="hover:text-ink-900">Faculdades</Link>
            <span className="mx-2">/</span>
            <span className="text-ink-700">{instA.name} vs {instB.name}</span>
          </nav>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 mb-4">
            {instA.name} vs {instB.name}
          </h1>
          <p className="text-lg text-ink-700 max-w-3xl">
            Comparativo lado a lado entre {instA.fullName} e {instB.fullName}: nota MEC,
            modalidades, polos, cursos e tudo o que importa pra decidir. Ambas com bolsa
            de até 80% pelo Bolsa Click.
          </p>
        </div>
      </header>

      <section className="bg-white py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-2 gap-6 mb-8">
            {[instA, instB].map(inst => (
              <Link
                key={inst.slug}
                href={`/faculdades/${inst.slug}`}
                className="group flex flex-col items-center text-center p-6 bg-paper border border-hairline rounded-lg hover:border-bolsa-secondary transition-colors"
              >
                {inst.logoUrl && (
                  <div className="w-20 h-20 md:w-24 md:h-24 relative bg-white border border-hairline rounded-lg p-2 mb-3">
                    <Image
                      src={inst.logoUrl}
                      alt={`${inst.fullName} - Logo`}
                      fill
                      sizes="96px"
                      className="object-contain p-2"
                    />
                  </div>
                )}
                <h2 className="font-display text-2xl font-semibold text-ink-900 mb-1 group-hover:text-bolsa-secondary">
                  {inst.name}
                </h2>
                <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-ink-500">
                  {typeLabel(inst.type)}
                </p>
                {inst.mecRating && (
                  <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < (inst.mecRating ?? 0) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}
                      />
                    ))}
                    <span className="font-mono text-[11px] text-ink-500 ml-1">MEC {inst.mecRating}/5</span>
                  </div>
                )}
              </Link>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <caption className="sr-only">
                Comparativo entre {instA.name} e {instB.name}: tipo, nota MEC, fundação,
                polos, modalidades e mais.
              </caption>
              <tbody>
                {allRows.map((row, i) => (
                  <tr
                    key={row.label}
                    className={`border-b border-hairline ${i % 2 === 0 ? 'bg-paper/40' : 'bg-white'}`}
                  >
                    <th
                      scope="row"
                      className="text-left py-3 px-3 font-mono text-[11px] tracking-[0.16em] uppercase text-ink-500 w-1/4"
                    >
                      {row.label}
                    </th>
                    <td className="py-3 px-3 text-ink-900">{row.a}</td>
                    <td className="py-3 px-3 text-ink-900">{row.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hasLiveData && (
            <p className="mt-4 font-mono text-[11px] text-ink-500">
              * Baseado nos {TOP_CURSOS.length} cursos de graduação ativos no Bolsa Click.
              Atualizado a cada 24h.
            </p>
          )}
        </div>
      </section>

      <section className="bg-paper py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[instA, instB].map(inst => (
              <article
                key={inst.slug}
                className="bg-white border border-hairline rounded-lg p-6"
              >
                <h2 className="font-display text-2xl font-semibold text-ink-900 mb-3">
                  Sobre a {inst.name}
                </h2>
                <p className="text-ink-700 leading-relaxed mb-4">{inst.description}</p>
                {inst.highlights.length > 0 && (
                  <ul className="space-y-2 mb-4">
                    {inst.highlights.slice(0, 5).map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink-700">
                        <Check size={14} className="text-bolsa-secondary mt-0.5 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  href={`/faculdades/${inst.slug}`}
                  className="inline-block mt-2 px-4 py-2 bg-bolsa-secondary text-white font-medium text-sm rounded-md hover:opacity-90"
                >
                  Ver cursos da {inst.name} →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-4">
            Qual escolher: {instA.name} ou {instB.name}?
          </h2>
          <p className="text-ink-700 leading-relaxed">
            Não há uma resposta única — a melhor escolha depende do curso desejado, da
            modalidade, da proximidade de polos da sua cidade e do orçamento. Em geral,
            quem prioriza <strong>{instA.mecRating && instB.mecRating ? (instA.mecRating >= instB.mecRating ? 'nota institucional MEC' : 'cobertura presencial')  : 'cobertura nacional'}</strong> tende a se identificar mais com a {instA.mecRating && instB.mecRating && instA.mecRating >= instB.mecRating ? instA.name : instA.campusCount && instB.campusCount && instA.campusCount >= instB.campusCount ? instA.name : instB.name}.
          </p>
          <p className="text-ink-700 leading-relaxed mt-3">
            Pelo Bolsa Click, as duas faculdades oferecem bolsas de até 80% — então o
            custo costuma se equilibrar. Recomendamos comparar as ofertas do curso
            específico que você quer fazer, na cidade onde planeja estudar (ou no formato
            EAD se preferir flexibilidade).
          </p>
        </div>
      </section>

      <VisibleFaq
        items={faqItems}
        heading={`Perguntas frequentes — ${instA.name} vs ${instB.name}`}
      />

      {allOthers.length > 0 && (
        <section className="bg-paper py-12 md:py-16 border-t border-hairline">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
              <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
                Outras comparações
              </h2>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-hairline">
              {allOthers.flatMap(other => [
                {
                  key: `${a}-${other.slug}`,
                  pair: canonicalOrder(a, other.slug).join('-vs-'),
                  label: `${instA.name} vs ${other.name}`,
                },
                {
                  key: `${b}-${other.slug}`,
                  pair: canonicalOrder(b, other.slug).join('-vs-'),
                  label: `${instB.name} vs ${other.name}`,
                },
              ]).slice(0, 8).map(item => (
                <li key={item.key} className="bg-white">
                  <Link
                    href={`/comparar/${item.pair}`}
                    className="block px-5 py-4 transition-colors hover:bg-paper font-display text-base text-ink-900"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="bg-white py-12 md:py-16 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-3">
            Pronto pra começar?
          </h2>
          <p className="text-ink-700 mb-6">
            Compare os cursos das duas faculdades e finalize a inscrição grátis.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href={`/faculdades/${instA.slug}`}
              className="px-5 py-2.5 bg-bolsa-secondary text-white font-medium rounded-md hover:opacity-90"
            >
              Ver {instA.name}
            </Link>
            <Link
              href={`/faculdades/${instB.slug}`}
              className="px-5 py-2.5 bg-white border border-bolsa-secondary text-bolsa-secondary font-medium rounded-md hover:bg-paper"
            >
              Ver {instB.name}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
