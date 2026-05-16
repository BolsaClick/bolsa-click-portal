import { Metadata } from 'next'
import Link from 'next/link'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/app/lib/prisma'
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import { BRAZILIAN_CITIES, getCityBySlug } from '@/app/lib/constants/brazilian-cities'
import { TOP_CURSOS } from '@/app/cursos/_data/cursos'
import { Course } from '@/app/interface/course'
import { VisibleFaq } from '@/app/cursos/[slug]/_seo/CourseSeoSections'

const SITE_URL = 'https://www.bolsaclick.com.br'

type Props = {
  params: Promise<{ city: string }>
}

export const revalidate = 3600

// On-demand ISR — não pré-gera as 100 cidades no build pra não martelar a API.
export async function generateStaticParams() {
  return []
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

function findCourseSlug(offerName: string): string | null {
  const n = normalize(offerName)
  if (!n) return null
  for (const c of TOP_CURSOS) {
    const apiN = normalize(c.apiCourseName)
    if (n === apiN || n.startsWith(`${apiN} `) || n.startsWith(`${apiN}-`)) {
      return c.slug
    }
  }
  return null
}

const getCityOffers = cache(async (cityName: string, stateUF: string) => {
  try {
    const res = await getShowFiltersCourses(
      undefined, cityName, stateUF, undefined, 'GRADUACAO', 1, 60
    )
    return (res?.data || []) as Course[]
  } catch (error) {
    console.error(`Erro ao buscar ofertas da cidade ${cityName}:`, error)
    return []
  }
})

const getActiveInstitutions = cache(async () => {
  return prisma.institution.findMany({
    where: { isActive: true },
    select: {
      slug: true,
      name: true,
      shortName: true,
      fullName: true,
      mecRating: true,
    },
  })
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params
  const cityData = getCityBySlug(citySlug)

  if (!cityData) {
    return { title: 'Cidade não encontrada' }
  }

  const offers = await getCityOffers(cityData.name, cityData.state)
  const hasOffers = offers.length > 0
  const pageUrl = `${SITE_URL}/bolsas-de-estudo/${citySlug}`

  const title = `Bolsas de Estudo em ${cityData.name}/${cityData.state} - Faculdades, Cursos e Descontos`
  const description = hasOffers
    ? `Encontre bolsas de estudo em ${cityData.name}/${cityData.state} com até 80% de desconto. ${offers.length} ofertas em faculdades parceiras. Compare cursos e mensalidades. Inscrição grátis!`
    : `Bolsas de estudo em ${cityData.name}/${cityData.state} com até 80% de desconto. Faculdades parceiras Bolsa Click. Cadastre-se e veja as ofertas disponíveis.`

  return {
    title,
    description,
    keywords: [
      `bolsas de estudo em ${cityData.name}`,
      `faculdade em ${cityData.name}`,
      `bolsa ${cityData.name}`,
      `faculdade ${cityData.name} ${cityData.state}`,
      `mensalidade faculdade ${cityData.name}`,
      `cursos de graduação em ${cityData.name}`,
      'bolsa click',
    ],
    robots: hasOffers ? 'index, follow' : 'noindex, follow',
    alternates: {
      canonical: hasOffers ? pageUrl : SITE_URL,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'Bolsa Click',
      locale: 'pt_BR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@bolsaclick',
      title,
      description,
    },
  }
}

export default async function CityHubPage({ params }: Props) {
  const { city: citySlug } = await params
  const cityData = getCityBySlug(citySlug)

  if (!cityData) {
    notFound()
  }

  const [offers, institutions] = await Promise.all([
    getCityOffers(cityData.name, cityData.state),
    getActiveInstitutions(),
  ])

  // Agrupar ofertas por curso (para o grid de cursos disponíveis)
  type CourseEntry = { name: string; slug: string | null; offerCount: number; minPrice: number }
  const coursesByKey = new Map<string, CourseEntry>()
  for (const o of offers) {
    const name = o.name || ''
    const key = normalize(name)
    if (!key) continue
    const slug = findCourseSlug(name)
    const price = o.minPrice || 0
    const existing = coursesByKey.get(key)
    if (existing) {
      existing.offerCount += 1
      if (price > 0 && (existing.minPrice === 0 || price < existing.minPrice)) {
        existing.minPrice = price
      }
    } else {
      coursesByKey.set(key, { name, slug, offerCount: 1, minPrice: price })
    }
  }
  const courses = Array.from(coursesByKey.values())
    .sort((a, b) => b.offerCount - a.offerCount)
    .slice(0, 30)

  // Casar brand das ofertas com as faculdades cadastradas
  const offerBrands = new Set(
    offers.map(o => normalize(o.brand || '')).filter(Boolean)
  )
  const cityInstitutions = institutions.filter(i =>
    offerBrands.has(normalize(i.name)) || offerBrands.has(normalize(i.shortName))
  )

  // Stats para o bloco editorial — derivados das ofertas reais
  const prices = offers.map(o => o.minPrice || 0).filter(p => p > 0)
  const minPrice = prices.length ? Math.min(...prices) : 0
  const maxPrice = prices.length ? Math.max(...prices) : 0
  const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0

  const modalityCounts = offers.reduce<Record<string, number>>((acc, o) => {
    const m = (o.modality || '').toUpperCase()
    if (m) acc[m] = (acc[m] || 0) + 1
    return acc
  }, {})
  const topModality = Object.entries(modalityCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
  const modalityLabel = (m: string) =>
    m === 'EAD' ? 'EAD' : m === 'PRESENCIAL' ? 'presencial' : m === 'SEMIPRESENCIAL' ? 'semipresencial' : m

  // Cidades do mesmo estado (mais relevantes que slice top 30)
  const sameStateCities = BRAZILIAN_CITIES
    .filter(c => c.state === cityData.state && c.slug !== citySlug)
  const otherCities = BRAZILIAN_CITIES
    .filter(c => c.state !== cityData.state)
    .slice(0, Math.max(0, 30 - sameStateCities.length))
  const linkedCities = [...sameStateCities, ...otherCities]

  const pageUrl = `${SITE_URL}/bolsas-de-estudo/${citySlug}`

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Bolsas de Estudo', item: `${SITE_URL}/bolsas-de-estudo` },
      { '@type': 'ListItem', position: 3, name: `${cityData.name}/${cityData.state}`, item: pageUrl },
    ],
  }

  const itemListSchema = courses.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Cursos com bolsa em ${cityData.name}/${cityData.state}`,
        itemListElement: courses.slice(0, 20).map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${c.name} em ${cityData.name}`,
          url: c.slug ? `${SITE_URL}/cursos/${c.slug}/${citySlug}` : pageUrl,
        })),
      }
    : null

  const jsonLd = itemListSchema ? [breadcrumbSchema, itemListSchema] : [breadcrumbSchema]

  const faqItems = [
    {
      question: `Quanto custa bolsa de estudo em ${cityData.name}?`,
      answer: `Em ${cityData.name}/${cityData.state}, as bolsas pelo Bolsa Click podem chegar a até 80% de desconto na mensalidade. Os valores variam conforme curso e faculdade — compare as ofertas acima.`,
    },
    {
      question: `Quantas faculdades oferecem bolsas em ${cityData.name}?`,
      answer: offers.length > 0
        ? `Encontramos ${cityInstitutions.length || 'diversas'} faculdades parceiras com ofertas ativas em ${cityData.name} no momento, totalizando ${offers.length} cursos com desconto.`
        : `O Bolsa Click trabalha com as principais faculdades do país. Cadastre-se e seja notificado quando novas ofertas em ${cityData.name} forem liberadas.`,
    },
    {
      question: `Quais cursos têm bolsa em ${cityData.name}?`,
      answer: courses.length > 0
        ? `Cursos como ${courses.slice(0, 6).map(c => c.name).join(', ')} estão entre os mais procurados em ${cityData.name}, todos com bolsa de até 80%.`
        : `Oferecemos bolsas para mais de 100 cursos de graduação e pós em todo o Brasil. Cadastre-se gratuitamente para ver as opções em ${cityData.name}.`,
    },
    {
      question: `Como conseguir bolsa em ${cityData.name}?`,
      answer: `É grátis: escolha um curso acima, compare as ofertas das faculdades em ${cityData.name}, preencha o cadastro e finalize a inscrição direto pelo Bolsa Click.`,
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="bg-paper border-b border-hairline py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <nav
            className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500 mb-4"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-ink-900">Início</Link>
            <span className="mx-2">/</span>
            <Link href="/bolsas-de-estudo" className="hover:text-ink-900">Bolsas de Estudo</Link>
            <span className="mx-2">/</span>
            <span className="text-ink-700">{cityData.name}/{cityData.state}</span>
          </nav>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 mb-4">
            Bolsas de Estudo em {cityData.name}/{cityData.state}
          </h1>
          <p className="text-lg text-ink-700 max-w-3xl">
            {offers.length > 0
              ? `${offers.length} ofertas ativas em ${cityInstitutions.length || 'várias'} faculdades parceiras na cidade. Bolsas de até 80% em cursos de graduação. Compare e se inscreva grátis.`
              : `Estamos atualizando as ofertas para ${cityData.name}. Enquanto isso, cadastre-se e seja avisado assim que novas bolsas forem liberadas na cidade.`}
          </p>
        </div>
      </header>

      {offers.length > 0 && (
        <section className="bg-white py-12 md:py-16 border-b border-hairline">
          <div className="container mx-auto px-4 max-w-3xl prose prose-neutral prose-headings:font-display prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-4 prose-p:text-ink-700 prose-p:leading-relaxed">
            <h2>Sobre estudar em {cityData.name}</h2>
            <p>
              {cityData.name}/{cityData.state} é uma das cidades atendidas pela rede de
              faculdades parceiras do Bolsa Click. No momento há{' '}
              <strong>{offers.length} cursos de graduação</strong> com bolsa disponível em{' '}
              <strong>{cityInstitutions.length || 'diversas'} instituições</strong> presentes
              na cidade ou que oferecem polo EAD com atendimento local.
            </p>
            {avgPrice > 0 && (
              <p>
                As mensalidades das ofertas ativas em {cityData.name} vão de{' '}
                <strong>R$ {minPrice.toFixed(0)}</strong> a{' '}
                <strong>R$ {maxPrice.toFixed(0)}</strong> por mês com bolsa, com média de{' '}
                R$ {avgPrice.toFixed(0)}. Os valores variam conforme curso, modalidade e
                duração — graduações tecnólogas costumam ter mensalidade menor que
                bacharelados, e cursos EAD geralmente custam metade do presencial.
              </p>
            )}
            {topModality && (
              <p>
                A modalidade mais ofertada na cidade é a{' '}
                <strong>{modalityLabel(topModality)}</strong>
                {modalityCounts.EAD > 0 && topModality !== 'EAD' && (
                  <>, mas você também encontra opções EAD com flexibilidade total de horário</>
                )}
                {modalityCounts.PRESENCIAL > 0 && topModality !== 'PRESENCIAL' && (
                  <>. Para presencial, confira as unidades de cada faculdade nas ofertas acima</>
                )}
                . Você escolhe o formato que melhor se encaixa na sua rotina.
              </p>
            )}
            {courses.length > 0 && (
              <p>
                Os cursos mais procurados em {cityData.name} pelo Bolsa Click são{' '}
                {courses.slice(0, 3).map((c, i) => (
                  <span key={c.name}>
                    <strong>{c.name}</strong>
                    {i < Math.min(2, courses.length - 1) - 1 ? ', ' : i === Math.min(2, courses.length - 1) - 1 ? ' e ' : ''}
                  </span>
                ))}
                . Veja a lista completa abaixo, compare os valores e finalize a inscrição
                gratuitamente — a bolsa vale durante todo o curso.
              </p>
            )}
          </div>
        </section>
      )}

      {courses.length > 0 && (
        <section className="bg-white py-12 md:py-16 border-b border-hairline">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
              <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
                Cursos com bolsa em {cityData.name}
              </h2>
              <span className="font-mono num-tabular text-[11px] text-ink-500">
                ({String(courses.length).padStart(2, '0')})
              </span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-hairline">
              {courses.map(c => {
                const href = c.slug ? `/cursos/${c.slug}/${citySlug}` : null
                const inner = (
                  <>
                    <span className="block font-display text-lg text-ink-900">{c.name}</span>
                    <span className="block font-mono text-[11px] text-ink-500 mt-1">
                      {c.offerCount} {c.offerCount === 1 ? 'oferta' : 'ofertas'}
                      {c.minPrice > 0 && ` · a partir de R$ ${c.minPrice.toFixed(0)}/mês`}
                    </span>
                  </>
                )
                return (
                  <li key={c.name} className="bg-white">
                    {href ? (
                      <Link href={href} className="block px-5 py-4 transition-colors hover:bg-paper">
                        {inner}
                      </Link>
                    ) : (
                      <div className="px-5 py-4">{inner}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      )}

      {cityInstitutions.length > 0 && (
        <section className="bg-paper py-12 md:py-16 border-b border-hairline">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
              <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
                Faculdades em {cityData.name}
              </h2>
              <span className="font-mono num-tabular text-[11px] text-ink-500">
                ({String(cityInstitutions.length).padStart(2, '0')})
              </span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-hairline">
              {cityInstitutions.map(inst => (
                <li key={inst.slug} className="bg-white">
                  <Link
                    href={`/faculdades/${inst.slug}/em/${citySlug}`}
                    className="block px-5 py-4 transition-colors hover:bg-paper"
                  >
                    <span className="block font-display text-lg text-ink-900">{inst.fullName}</span>
                    <span className="block font-mono text-[11px] text-ink-500 mt-1">
                      {inst.mecRating ? `Nota MEC ${inst.mecRating}` : 'Bolsas de até 80%'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <VisibleFaq
        items={faqItems}
        heading={`Perguntas frequentes sobre bolsas em ${cityData.name}`}
      />

      <section className="bg-white py-12 md:py-16 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              {sameStateCities.length > 0
                ? `Bolsas em outras cidades de ${cityData.state}${otherCities.length > 0 ? ' e Brasil' : ''}`
                : 'Bolsas em outras cidades'}
            </h2>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-hairline">
            {linkedCities.map(c => (
              <li key={c.slug} className="bg-white">
                <Link
                  href={`/bolsas-de-estudo/${c.slug}`}
                  className="block px-4 py-3 transition-colors hover:bg-paper"
                >
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">
                    {c.state}
                  </span>
                  <span className="block font-display text-base text-ink-900">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
