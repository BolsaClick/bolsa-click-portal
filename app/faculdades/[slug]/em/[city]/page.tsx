import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
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
  params: Promise<{ slug: string; city: string }>
}

export const revalidate = 3600

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

const getInstitution = cache(async (slug: string) => {
  return prisma.institution.findUnique({ where: { slug } })
})

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

function filterByInstitution(offers: Course[], institutionName: string, institutionShortName: string): Course[] {
  const candidates = [normalize(institutionName), normalize(institutionShortName)].filter(Boolean)
  return offers.filter(o => {
    const brand = normalize(o.brand || '')
    return candidates.some(c => brand === c || brand.includes(c))
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, city: citySlug } = await params
  const [institution, cityData] = await Promise.all([
    getInstitution(slug),
    Promise.resolve(getCityBySlug(citySlug)),
  ])

  if (!institution || !institution.isActive || !cityData) {
    return { title: 'Página não encontrada' }
  }

  const allOffers = await getCityOffers(cityData.name, cityData.state)
  const offers = filterByInstitution(allOffers, institution.name, institution.shortName)
  const hasOffers = offers.length > 0

  const pageUrl = `${SITE_URL}/faculdades/${slug}/em/${citySlug}`
  const fallbackUrl = `${SITE_URL}/faculdades/${slug}`

  const title = `${institution.name} em ${cityData.name}/${cityData.state} - Cursos, Bolsas e Polos`
  const description = hasOffers
    ? `${offers.length} cursos da ${institution.fullName} em ${cityData.name}/${cityData.state} com bolsa de até 80%. Compare mensalidades e inscreva-se grátis pelo Bolsa Click.`
    : `Bolsas de estudo na ${institution.fullName} com até 80% de desconto. Veja unidades e cursos disponíveis pelo Bolsa Click.`

  return {
    title,
    description,
    keywords: [
      `${institution.name} ${cityData.name}`,
      `${institution.name} em ${cityData.name}`,
      `faculdade ${institution.name} ${cityData.name}`,
      `polo ${institution.name} ${cityData.name}`,
      `bolsa ${institution.name} ${cityData.name}`,
      `mensalidade ${institution.name} ${cityData.name}`,
      `${institution.shortName} ${cityData.name}`,
      'bolsa click',
    ],
    robots: hasOffers ? 'index, follow' : 'noindex, follow',
    alternates: {
      canonical: hasOffers ? pageUrl : fallbackUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'Bolsa Click',
      locale: 'pt_BR',
      type: 'website',
      images: institution.logoUrl
        ? [
            {
              url: institution.logoUrl.startsWith('http')
                ? institution.logoUrl
                : `${SITE_URL}${institution.logoUrl}`,
              alt: `${institution.fullName} - Logo`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary',
      site: '@bolsaclick',
      title,
      description,
    },
  }
}

export default async function InstitutionCityPage({ params }: Props) {
  const { slug, city: citySlug } = await params
  const [institution, cityData] = await Promise.all([
    getInstitution(slug),
    Promise.resolve(getCityBySlug(citySlug)),
  ])

  if (!institution || !institution.isActive || !cityData) {
    notFound()
  }

  const allOffers = await getCityOffers(cityData.name, cityData.state)
  const offers = filterByInstitution(allOffers, institution.name, institution.shortName)

  // Agrupar cursos da instituição na cidade (deduplica por nome)
  type CourseEntry = { name: string; slug: string | null; offerCount: number; minPrice: number }
  const coursesByKey = new Map<string, CourseEntry>()
  for (const o of offers) {
    const name = o.name || ''
    const key = normalize(name)
    if (!key) continue
    const courseSlug = findCourseSlug(name)
    const price = o.minPrice || 0
    const existing = coursesByKey.get(key)
    if (existing) {
      existing.offerCount += 1
      if (price > 0 && (existing.minPrice === 0 || price < existing.minPrice)) {
        existing.minPrice = price
      }
    } else {
      coursesByKey.set(key, { name, slug: courseSlug, offerCount: 1, minPrice: price })
    }
  }
  const courses = Array.from(coursesByKey.values()).sort(
    (a, b) => b.offerCount - a.offerCount
  )

  const otherCities = BRAZILIAN_CITIES.filter(c => c.slug !== citySlug).slice(0, 15)

  const pageUrl = `${SITE_URL}/faculdades/${slug}/em/${citySlug}`
  const fallbackUrl = `${SITE_URL}/faculdades/${slug}`
  const hasOffers = offers.length > 0

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Faculdades', item: `${SITE_URL}/faculdades` },
      { '@type': 'ListItem', position: 3, name: institution.name, item: fallbackUrl },
      { '@type': 'ListItem', position: 4, name: `${cityData.name}/${cityData.state}`, item: pageUrl },
    ],
  }

  // Só emitir EducationalOrganization + ItemList quando há ofertas reais —
  // caso contrário seria informação enganosa.
  const jsonLd = hasOffers
    ? [
        {
          '@context': 'https://schema.org',
          '@type': 'EducationalOrganization',
          name: institution.fullName,
          alternateName: [institution.name, institution.shortName],
          description: institution.description,
          url: pageUrl,
          logo: institution.logoUrl.startsWith('http')
            ? institution.logoUrl
            : `${SITE_URL}${institution.logoUrl}`,
          address: {
            '@type': 'PostalAddress',
            addressLocality: cityData.name,
            addressRegion: cityData.state,
            addressCountry: 'BR',
          },
          ...(institution.mecRating && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: String(institution.mecRating),
              bestRating: '5',
              worstRating: '1',
              ratingCount: '1',
              reviewCount: '1',
            },
          }),
        },
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `Cursos da ${institution.name} em ${cityData.name}`,
          itemListElement: courses.slice(0, 20).map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: `${c.name} — ${institution.name} ${cityData.name}`,
            url: c.slug ? `${SITE_URL}/cursos/${c.slug}/${citySlug}` : pageUrl,
          })),
        },
        breadcrumbSchema,
      ]
    : [breadcrumbSchema]

  const faqItems = [
    {
      question: `A ${institution.name} tem unidade em ${cityData.name}?`,
      answer: hasOffers
        ? `Sim, a ${institution.fullName} oferece ${courses.length} cursos em ${cityData.name}/${cityData.state} com bolsa pelo Bolsa Click. Veja a lista acima e compare preços.`
        : `No momento não temos ofertas ativas da ${institution.name} em ${cityData.name} pelo Bolsa Click. Cadastre-se para ser notificado quando novas bolsas forem liberadas.`,
    },
    {
      question: `Quanto custa estudar na ${institution.name} em ${cityData.name}?`,
      answer: hasOffers && courses[0]?.minPrice > 0
        ? `Na ${institution.name} em ${cityData.name}, as mensalidades com bolsa começam a partir de R$ ${courses[0].minPrice.toFixed(0)}/mês, dependendo do curso e modalidade.`
        : `Os valores variam por curso. Pelo Bolsa Click, as bolsas da ${institution.name} podem chegar a até 80% de desconto.`,
    },
    {
      question: `A ${institution.name} tem cursos EAD em ${cityData.name}?`,
      answer: institution.modalities.includes('EAD')
        ? `Sim, a ${institution.name} oferece cursos EAD que atendem ${cityData.name} via polos de apoio presencial e plataforma online.`
        : `Atualmente a ${institution.name} oferece cursos nas modalidades ${institution.modalities.map(m => m === 'PRESENCIAL' ? 'presencial' : 'semipresencial').join(' e ')} em ${cityData.name}.`,
    },
    {
      question: `Como conseguir bolsa na ${institution.name} em ${cityData.name}?`,
      answer: `Escolha um curso acima, confirme a oferta da unidade em ${cityData.name}, e finalize a inscrição grátis pelo Bolsa Click — bolsas de até 80% no ato.`,
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
            <Link href="/faculdades" className="hover:text-ink-900">Faculdades</Link>
            <span className="mx-2">/</span>
            <Link href={`/faculdades/${slug}`} className="hover:text-ink-900">{institution.name}</Link>
            <span className="mx-2">/</span>
            <span className="text-ink-700">{cityData.name}/{cityData.state}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {institution.logoUrl && (
              <div className="w-24 h-24 md:w-28 md:h-28 relative bg-white border border-hairline rounded-lg p-3 shrink-0">
                <Image
                  src={institution.logoUrl}
                  alt={`${institution.fullName} - Logo`}
                  fill
                  sizes="(max-width: 768px) 96px, 112px"
                  className="object-contain p-2"
                />
              </div>
            )}
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 mb-3">
                {institution.name} em {cityData.name}/{cityData.state}
              </h1>
              <p className="text-lg text-ink-700 max-w-3xl">
                {hasOffers
                  ? `${courses.length} cursos da ${institution.fullName} disponíveis com bolsa de até 80% em ${cityData.name}.`
                  : `Estamos atualizando as ofertas da ${institution.name} para ${cityData.name}. Cadastre-se e seja notificado.`}
              </p>
              {institution.mecRating && (
                <p className="mt-3 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500">
                  Nota MEC {institution.mecRating}/5 ·{' '}
                  {institution.modalities.map(m => m === 'EAD' ? 'EAD' : m === 'PRESENCIAL' ? 'Presencial' : 'Semipresencial').join(' · ')}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {courses.length > 0 && (
        <section className="bg-white py-12 md:py-16 border-b border-hairline">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
              <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
                Cursos da {institution.name} em {cityData.name}
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

      <VisibleFaq
        items={faqItems}
        heading={`Perguntas frequentes sobre ${institution.name} em ${cityData.name}`}
      />

      <section className="bg-paper py-12 md:py-16 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              {institution.name} em outras cidades
            </h2>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-hairline">
            {otherCities.map(c => (
              <li key={c.slug} className="bg-white">
                <Link
                  href={`/faculdades/${slug}/em/${c.slug}`}
                  className="block px-4 py-3 transition-colors hover:bg-white/80"
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
