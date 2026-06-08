import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { cache } from 'react'
import { prisma } from '@/app/lib/prisma'
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import { resolveCanonicalCourseSlug } from '@/app/lib/seo/slug-resolver'
import { shouldIndexCityPage } from '@/app/lib/seo/city-page-gate'
import { durationToIso8601 } from '@/app/lib/seo/schema-helpers'
import { FeaturedCourseData } from '../../_data/types'
import { BRAZILIAN_CITIES, getCityBySlug } from '@/app/lib/constants/brazilian-cities'
import {
  OffersComparisonTable,
  VisibleFaq,
  CitiesGrid,
  buildCityFaqItems,
} from '../_seo/CourseSeoSections'
import CursoCidadeClient from './CursoCidadeClient'
import CityContextBlock from './_seo/CityContextBlock'
import LocalDemandBlock from './_seo/LocalDemandBlock'
import NearbyInstitutionsBlock from './_seo/NearbyInstitutionsBlock'
import RegionalSalaryBlock from './_seo/RegionalSalaryBlock'
import { getCurrentTheme } from '@/app/lib/themes'

type Props = {
  params: Promise<{ slug: string; city: string }>
}

// ISR: Revalidar a cada 1 hora
export const revalidate = 3600

// Helper para buscar curso do banco de dados
const getCourseBySlug = cache(async (slug: string): Promise<FeaturedCourseData | null> => {
  try {
    const course = await prisma.featuredCourse.findUnique({
      where: {
        slug,
        isActive: true,
      },
    })
    return course as FeaturedCourseData | null
  } catch (error) {
    console.error('Erro ao buscar curso do banco de dados:', error)
    return null
  }
})

// Não gerar páginas no build para evitar sobrecarregar o banco/API
// Todas as city pages são geradas on-demand na primeira visita e cacheadas via ISR (1h)
export async function generateStaticParams() {
  return []
}

// Busca ofertas de cidade. Retorna offers + flag fromFallback indicando se
// caímos na busca nacional por falta de estoque local. Cached pra dedupe entre
// generateMetadata e o componente da página.
const getCityCourseOffers = cache(async (
  apiCourseName: string,
  cityName: string,
  stateUF: string,
  nivel: string,
) => {
  try {
    const cityResponse = await getShowFiltersCourses(
      apiCourseName, cityName, stateUF, undefined, nivel, 1, 20
    )
    const cityOffers = cityResponse?.data || []
    if (cityOffers.length > 0) {
      return { offers: cityOffers, fromFallback: false }
    }

    const generalResponse = await getShowFiltersCourses(
      apiCourseName, undefined, undefined, undefined, nivel, 1, 20
    )
    return { offers: generalResponse?.data || [], fromFallback: true }
  } catch (error) {
    console.error(`Erro ao buscar ofertas para ${apiCourseName} em ${cityName}:`, error)
    try {
      const fallbackResponse = await getShowFiltersCourses(
        apiCourseName, undefined, undefined, undefined, nivel, 1, 20
      )
      return { offers: fallbackResponse?.data || [], fromFallback: true }
    } catch {
      return { offers: [], fromFallback: true }
    }
  }
})

// Lê a contagem de ofertas PRECOMPUTADA (CityCourseOfferCache) — mesma fonte que
// o sitemap usa pra decidir quais URLs emitir. A página passa a decidir
// index/noindex por essa fonte ESTÁVEL, em vez de depender da API ao vivo a cada
// revalidação. Antes, um fallback transitório da API (lentidão/vazio/erro) zerava
// a contagem e jogava páginas boas pra noindex — causando oscilação e conflito
// com o sitemap (URL no sitemap mas página noindex → "Excluída pela tag noindex").
// Cache miss → retorna null e o caller cai no comportamento legado (sem regressão).
const getCachedOfferCount = cache(async (
  featuredCourseId: string,
  citySlug: string,
): Promise<number | null> => {
  try {
    const row = await prisma.cityCourseOfferCache.findUnique({
      where: { featuredCourseId_citySlug: { featuredCourseId, citySlug } },
      select: { offerCount: true },
    })
    return row?.offerCount ?? null
  } catch {
    return null
  }
})

function priceRangeFromOffers(offers: unknown[]) {
  const prices = (offers as { minPrice?: number; prices?: { withDiscount?: number } }[])
    .map(o => o.minPrice || o.prices?.withDiscount || 0)
    .filter(p => p > 0)
  const maxPrices = (offers as { maxPrice?: number; prices?: { withoutDiscount?: number } }[])
    .map(o => o.maxPrice || o.prices?.withoutDiscount || 0)
    .filter(p => p > 0)
  return {
    lowPrice: prices.length > 0 ? Math.min(...prices) : 0,
    highPrice: maxPrices.length > 0 ? Math.max(...maxPrices) : 0,
    offerCount: offers.length,
  }
}

// Gerar metadata dinâmica (SEO) com cidade
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, city: citySlug } = await params
  let curso = await getCourseBySlug(slug)
  // Mesmo resolver da page principal — não emite redirect aqui, só usa o
  // canonical para preencher metadata correta antes do redirect propagar.
  if (!curso) {
    const canonicalSlug = await resolveCanonicalCourseSlug(slug)
    if (canonicalSlug) curso = await getCourseBySlug(canonicalSlug)
  }
  const cityData = getCityBySlug(citySlug)

  if (!curso || !cityData) {
    return { title: 'Página não encontrada' }
  }

  const { offers, fromFallback } = await getCityCourseOffers(
    curso.apiCourseName, cityData.name, cityData.state, curso.nivel
  )
  const { lowPrice } = priceRangeFromOffers(offers)

  // Title ≤ 60 chars (o layout pai ainda cola "%s | <marca>"). Lidera com o
  // keyword "<curso> em <cidade>" e degrada o complemento de bolsa conforme o
  // tamanho. Combos extremos (nome de curso + cidade muito longos) truncam só a
  // marca no fim — o keyword principal fica sempre front-loaded.
  const brandSuffixLen = ` | ${getCurrentTheme().shortTitle}`.length
  const titleBase = `${curso.name} em ${cityData.name}`
  const titleSuffix =
    [' com bolsa de até 80%', ' com bolsa', ''].find(
      (s) => titleBase.length + s.length + brandSuffixLen <= 60
    ) ?? ''
  const title = `${titleBase}${titleSuffix}`

  // Description ≤ 155 chars, resposta direta primeiro (padrão GEO). Preço quando
  // couber; nomes/cidades longos caem pras versões compactas. Duração e salário
  // saíram (estouravam o limite e não são a intenção de "bolsa <curso> <cidade>").
  const priceText = lowPrice > 0 ? ` a partir de R$ ${lowPrice.toFixed(0)}/mês` : ''
  const cityUf = `${cityData.name}-${cityData.state}`
  const description =
    [
      lowPrice > 0 &&
        `Bolsa de estudo para ${curso.name} em ${cityUf}${priceText}, com até 80% de desconto. Faculdades com nota MEC, no EAD ou presencial. Inscrição grátis.`,
      `Bolsa de estudo para ${curso.name} em ${cityUf} com até 80% de desconto. Faculdades com nota MEC, no EAD ou presencial. Inscrição grátis.`,
      `Bolsa de até 80% para ${curso.name} em ${cityUf}, no EAD ou presencial, em faculdades com nota MEC. Inscrição grátis.`,
      `Bolsa de até 80% para ${curso.name} em ${cityData.name}, no EAD ou presencial. Inscrição grátis.`,
    ]
      .filter((d): d is string => Boolean(d))
      .find((d) => d.length <= 155) ??
    `Bolsa de até 80% para ${curso.name} em ${cityData.name}, no EAD ou presencial. Inscrição grátis.`
  const pageUrl = `https://www.bolsaclick.com.br/cursos/${slug}/${citySlug}`
  const nationalUrl = `https://www.bolsaclick.com.br/cursos/${slug}`

  // Indexação inteligente via gate compartilhado (app/lib/seo/city-page-gate.ts):
  // exige MIN_OFFERS_TO_INDEX=2 ofertas locais, ou trendScore ≥ 60 pra páginas
  // sem oferta suficiente. Páginas com 0 ou 1 oferta são thin content em escala
  // e viram noindex,follow + canonical pra versão nacional.
  const trendScore = curso.trendScore ?? 0
  // Prioriza o cache precomputado (estável, mesma fonte do sitemap). Só usa a
  // contagem ao vivo quando não há linha no cache ainda (sem regressão).
  const liveOfferCount = fromFallback ? 0 : offers.length
  const cachedOfferCount = await getCachedOfferCount(curso.id, citySlug)
  const offerCountForGate = cachedOfferCount ?? liveOfferCount
  const shouldIndex = shouldIndexCityPage(offerCountForGate, trendScore)
  const canonical = shouldIndex ? pageUrl : nationalUrl

  const imageUrl = curso.imageUrl.startsWith('http')
    ? curso.imageUrl
    : `https://www.bolsaclick.com.br${curso.imageUrl}`

  return {
    title,
    description,
    keywords: [
      ...curso.keywords,
      `${curso.name} em ${cityData.name}`,
      `bolsa de estudo ${curso.name} ${cityData.name}`,
      `faculdade de ${curso.name} em ${cityData.name}`,
      `${curso.name} ${cityData.name} ${cityData.state}`,
      `${curso.name} ead ${cityData.name}`,
      `${curso.name} presencial ${cityData.name}`,
      `quanto custa ${curso.name} em ${cityData.name}`,
      `faculdade em ${cityData.name}`,
      `bolsa de estudo ${cityData.name}`,
      'bolsa click',
    ],
    // Indexação inteligente:
    //  - tem oferta local → index sempre
    //  - sem oferta local + curso com alta demanda (trendScore ≥ 50) → index
    //    (vale rankear pela busca; canonical próprio)
    //  - sem oferta local + baixa demanda → noindex,follow + canonical para nacional
    robots: shouldIndex ? 'index, follow' : 'noindex, follow',
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'Bolsa Click',
      locale: 'pt_BR',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${curso.name} em ${cityData.name} - Bolsa Click`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@bolsaclick',
      title,
      description,
      images: [imageUrl],
    },
  }
}

// Server Component
export default async function CursoCidadePage({ params }: Props) {
  const { slug, city: citySlug } = await params

  // Slug curto (ex: "direito") sem sufixo: tenta resolver pra canonical
  // ("direito-bacharelado") e faz redirect 301 pra preservar URL canônica.
  // Mantém retrocompatibilidade com sitemap antigo + links indexados.
  const cursoMetadata = await getCourseBySlug(slug)
  if (!cursoMetadata) {
    const canonicalSlug = await resolveCanonicalCourseSlug(slug)
    if (canonicalSlug) {
      redirect(`/cursos/${canonicalSlug}/${citySlug}`)
    }
  }

  const cityData = getCityBySlug(citySlug)

  if (!cursoMetadata || !cityData) {
    notFound()
  }

  const { offers: courseOffers, fromFallback } = await getCityCourseOffers(
    cursoMetadata.apiCourseName,
    cityData.name,
    cityData.state,
    cursoMetadata.nivel,
  )

  // Mesma lógica de indexação inteligente do generateMetadata (via gate
  // compartilhado). Repete aqui porque Schema Course/FAQ não deve ser emitido
  // em URLs noindex.
  const trendScore = cursoMetadata.trendScore ?? 0
  // Mesma fonte de verdade do generateMetadata e do sitemap: cache precomputado,
  // com fallback à contagem ao vivo só em cache miss.
  const liveOfferCount = fromFallback ? 0 : (courseOffers?.length ?? 0)
  const cachedOfferCount = await getCachedOfferCount(cursoMetadata.id, citySlug)
  const shouldIndex = shouldIndexCityPage(cachedOfferCount ?? liveOfferCount, trendScore)

  // Outras cidades para internal linking (exclui a cidade atual)
  const otherCities = BRAZILIAN_CITIES
    .filter(c => c.slug !== citySlug)
    .slice(0, 12)

  const nivelLabel = cursoMetadata.nivel === 'GRADUACAO' ? 'Graduação' : 'Pós-graduação'
  const nivelHref = cursoMetadata.nivel === 'GRADUACAO' ? '/graduacao' : '/pos-graduacao'
  const pageUrl = `https://www.bolsaclick.com.br/cursos/${slug}/${citySlug}`
  const imageUrl = cursoMetadata.imageUrl.startsWith('http')
    ? cursoMetadata.imageUrl
    : `https://www.bolsaclick.com.br${cursoMetadata.imageUrl}`

  const prices = (courseOffers || [])
    .map((o: { minPrice?: number; prices?: { withDiscount?: number } }) => o.minPrice || o.prices?.withDiscount || 0)
    .filter((p: number) => p > 0)
  const lowPrice = prices.length > 0 ? Math.min(...prices) : 0
  const maxPrices = (courseOffers || [])
    .map((o: { maxPrice?: number; prices?: { withoutDiscount?: number } }) => o.maxPrice || o.prices?.withoutDiscount || 0)
    .filter((p: number) => p > 0)
  const highPrice = maxPrices.length > 0 ? Math.max(...maxPrices) : 0

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bolsaclick.com.br' },
      { '@type': 'ListItem', position: 2, name: nivelLabel, item: `https://www.bolsaclick.com.br${nivelHref}` },
      { '@type': 'ListItem', position: 3, name: cursoMetadata.name, item: `https://www.bolsaclick.com.br/cursos/${slug}` },
      { '@type': 'ListItem', position: 4, name: cityData.name, item: pageUrl },
    ],
  }

  // Schema base — sempre emitido quando indexável.
  // Quando caímos no fallback nacional E não vale indexar (shouldIndex=false),
  // só emite Breadcrumb. Caso shouldIndex=true (trendScore alto), emite
  // Course evergreen sem claims específicas de preço local.
  const placeSchema = {
    '@context': 'https://schema.org',
    '@type': 'City',
    name: cityData.name,
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: cityData.state,
      containedInPlace: { '@type': 'Country', name: 'Brasil' },
    },
  }

  // Course-level: omit `provider` since multiple institutions offer this course.
  // Per Google's Course rich result spec, `provider` must be the educational
  // institution. Bolsa Click is the aggregator and is captured via
  // `offers.offeredBy` on the AggregateOffer below.
  const baseCourseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: cursoMetadata.fullName,
    description: `${cursoMetadata.longDescription} Disponível em ${cityData.name}-${cityData.state} com bolsa de estudo.`,
    educationalLevel: nivelLabel,
    // Schema.org aceita "online" | "onsite" | "blended" (não pt-BR).
    courseMode: ['onsite', 'online', 'blended'],
    timeRequired: durationToIso8601(cursoMetadata.duration),
    teaches: cursoMetadata.skills?.slice(0, 8) ?? [],
    about: cursoMetadata.areas ?? [],
    occupationalCategory: cursoMetadata.careerPaths?.slice(0, 5) ?? [],
    datePublished: cursoMetadata.createdAt instanceof Date
      ? cursoMetadata.createdAt.toISOString()
      : new Date(cursoMetadata.createdAt as string | number).toISOString(),
    dateModified: cursoMetadata.updatedAt instanceof Date
      ? cursoMetadata.updatedAt.toISOString()
      : new Date(cursoMetadata.updatedAt as string | number).toISOString(),
    inLanguage: 'pt-BR',
    url: pageUrl,
    image: imageUrl,
    locationCreated: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: cityData.name, addressRegion: cityData.state, addressCountry: 'BR' },
    },
    // Direciona AI crawlers (Google AIO especialmente) para os blocos com
    // dados quantitativos auto-contidos e FAQ — eleva chance de citação.
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="city-context"]', '[data-speakable="faq"]'],
    },
  }

  // Article schema envelope — dá citation-readiness pra cada city page
  // (~5-10k URLs). datePublished do curso enriquecido + dateModified ao
  // ser atualizado. author = Equipe Editorial (mesmo pattern do pillar);
  // citation aponta pra MEC/INEP/e-MEC pra reforçar autoridade em queries
  // long-tail tipo "bolsa [curso] em [cidade]".
  const dateModifiedIso =
    cursoMetadata.updatedAt instanceof Date
      ? cursoMetadata.updatedAt.toISOString()
      : new Date(cursoMetadata.updatedAt as string | number).toISOString()
  const datePublishedIso =
    cursoMetadata.createdAt instanceof Date
      ? cursoMetadata.createdAt.toISOString()
      : new Date(cursoMetadata.createdAt as string | number).toISOString()

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${cursoMetadata.name} em ${cityData.name}-${cityData.state}: bolsa, faculdades parceiras e mensalidade`,
    description: `Como conseguir bolsa de estudo em ${cursoMetadata.name} na cidade de ${cityData.name}-${cityData.state}: ofertas, faculdades parceiras, faixa de mensalidade e salário regional estimado.`,
    datePublished: datePublishedIso,
    dateModified: dateModifiedIso,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    author: {
      '@type': 'Organization',
      '@id': 'https://www.bolsaclick.com.br/sobre/equipe-editorial#editorial-team',
      name: 'Equipe Editorial Bolsa Click',
      url: 'https://www.bolsaclick.com.br/sobre/equipe-editorial',
    },
    reviewedBy: {
      '@type': 'Organization',
      '@id': 'https://www.bolsaclick.com.br/sobre/equipe-editorial#editorial-team',
      name: 'Equipe Editorial Bolsa Click',
      url: 'https://www.bolsaclick.com.br/sobre/equipe-editorial',
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://www.bolsaclick.com.br/#organization',
      name: 'Bolsa Click',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.bolsaclick.com.br/assets/logo-bolsa-click-rosa.png',
      },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    about: [
      { '@type': 'Thing', name: cursoMetadata.name },
      { '@type': 'Thing', name: `Bolsa de estudo em ${cityData.name}` },
      { '@type': 'Thing', name: 'ProUni' },
      { '@type': 'Thing', name: 'FIES' },
      { '@type': 'Thing', name: 'Educação superior no Brasil' },
    ],
    spatialCoverage: {
      '@type': 'City',
      name: cityData.name,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: cityData.state,
        containedInPlace: { '@type': 'Country', name: 'Brasil' },
      },
    },
    citation: [
      {
        '@type': 'CreativeWork',
        name: 'e-MEC — Cadastro de Instituições e Cursos',
        publisher: { '@type': 'GovernmentOrganization', name: 'MEC' },
        url: 'https://emec.mec.gov.br',
      },
      {
        '@type': 'CreativeWork',
        name: 'CAGED — Cadastro Geral de Empregados e Desempregados',
        publisher: { '@type': 'GovernmentOrganization', name: 'Ministério do Trabalho' },
        url: 'https://www.gov.br/trabalho-e-emprego',
      },
    ],
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable]'],
    },
  }

  const jsonLdSchemas = !shouldIndex
    ? [breadcrumbSchema]
    : [
        articleSchema,
        {
          ...baseCourseSchema,
          ...(lowPrice > 0 && !fromFallback && {
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'BRL',
              lowPrice: lowPrice.toFixed(2),
              highPrice: highPrice > 0 ? highPrice.toFixed(2) : lowPrice.toFixed(2),
              offerCount: String(courseOffers?.length || 0),
              availability: 'https://schema.org/InStock',
              areaServed: {
                '@type': 'City',
                name: cityData.name,
                containedInPlace: { '@type': 'AdministrativeArea', name: cityData.state },
              },
              offeredBy: {
                '@type': 'Organization',
                '@id': 'https://www.bolsaclick.com.br/#organization',
              },
            },
          }),
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: `Quanto custa ${cursoMetadata.name} em ${cityData.name}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: lowPrice > 0
                  ? `Em ${cityData.name}-${cityData.state}, o curso de ${cursoMetadata.name} pode ser encontrado a partir de R$ ${lowPrice.toFixed(2)} por mês com bolsa pelo Bolsa Click, com descontos de até 80%.`
                  : `O Bolsa Click oferece bolsas de até 80% de desconto para ${cursoMetadata.name} em ${cityData.name}. Cadastre-se grátis para ver as ofertas.`,
              },
            },
            {
              '@type': 'Question',
              name: `Quais faculdades oferecem ${cursoMetadata.name} em ${cityData.name}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `Temos diversas faculdades parceiras que oferecem ${cursoMetadata.name} em ${cityData.name} e região. Compare preços e encontre a melhor bolsa.`,
              },
            },
            {
              '@type': 'Question',
              name: `${cursoMetadata.name} em ${cityData.name} tem opção EAD?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `Sim. As faculdades parceiras do Bolsa Click oferecem ${cursoMetadata.name} em ${cityData.name} nas modalidades presencial, semipresencial e EAD (a distância), com diploma reconhecido pelo MEC.`,
              },
            },
            {
              '@type': 'Question',
              name: `Quanto tempo dura ${cursoMetadata.name}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${cursoMetadata.fullName} tem duração de ${cursoMetadata.duration}, conforme as Diretrizes Curriculares Nacionais do MEC.`,
              },
            },
          ],
        },
        breadcrumbSchema,
        placeSchema,
      ]

  const faqItems = buildCityFaqItems(cursoMetadata, cityData.name, cityData.state, lowPrice)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas) }}
      />
      <CursoCidadeClient
        cursoMetadata={cursoMetadata}
        courseOffers={courseOffers}
        cityName={cityData.name}
        cityState={cityData.state}
        courseSlug={slug}
        otherCities={otherCities}
      />
      {!fromFallback && (
        <OffersComparisonTable
          offers={courseOffers || []}
          courseName={`${cursoMetadata.name} em ${cityData.name}`}
        />
      )}
      <CityContextBlock
        curso={cursoMetadata}
        cityName={cityData.name}
        cityState={cityData.state}
        offerCount={fromFallback ? 0 : (courseOffers?.length || 0)}
      />
      <LocalDemandBlock
        featuredCourseId={cursoMetadata.id}
        courseName={cursoMetadata.name}
        cityName={cityData.name}
        cityState={cityData.state}
        localOfferCount={fromFallback ? 0 : (courseOffers?.length || 0)}
        localMinPrice={lowPrice > 0 ? lowPrice : null}
      />
      <NearbyInstitutionsBlock
        cityName={cityData.name}
        cityState={cityData.state}
        courseName={cursoMetadata.name}
        offers={courseOffers || []}
        fromFallback={fromFallback}
      />
      <RegionalSalaryBlock
        curso={cursoMetadata}
        cityName={cityData.name}
        cityState={cityData.state}
      />
      <VisibleFaq
        items={faqItems}
        heading={`Perguntas frequentes sobre ${cursoMetadata.name} em ${cityData.name}`}
      />
      <CitiesGrid
        courseSlug={slug}
        courseName={cursoMetadata.name}
        currentCitySlug={citySlug}
      />
    </>
  )
}
