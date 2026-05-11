import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { prisma } from '@/app/lib/prisma'
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import { FeaturedCourseData } from '../../_data/types'
import { BRAZILIAN_CITIES, getCityBySlug } from '@/app/lib/constants/brazilian-cities'
import {
  OffersComparisonTable,
  VisibleFaq,
  CitiesGrid,
  buildCityFaqItems,
} from '../_seo/CourseSeoSections'
import CursoCidadeClient from './CursoCidadeClient'

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
  const curso = await getCourseBySlug(slug)
  const cityData = getCityBySlug(citySlug)

  if (!curso || !cityData) {
    return { title: 'Página não encontrada' }
  }

  const { offers, fromFallback } = await getCityCourseOffers(
    curso.apiCourseName, cityData.name, cityData.state, curso.nivel
  )
  const { lowPrice } = priceRangeFromOffers(offers)

  const priceText = lowPrice > 0 ? ` a partir de R$ ${lowPrice.toFixed(0)}/mês` : ''
  const title = `${curso.name} em ${cityData.name} com Bolsa de até 80% - Faculdades e Preços`
  const description = `Bolsas de estudo para ${curso.fullName} em ${cityData.name}-${cityData.state}${priceText}. Até 80% de desconto. ${curso.duration} de duração. Salário médio: ${curso.averageSalary}. Inscrição grátis!`
  const pageUrl = `https://www.bolsaclick.com.br/cursos/${slug}/${citySlug}`
  const nationalUrl = `https://www.bolsaclick.com.br/cursos/${slug}`

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
    // Quando não há estoque local e caímos no fallback nacional, marcar
    // noindex + canonical pra página nacional pra evitar thin/duplicate content.
    robots: fromFallback ? 'noindex, follow' : 'index, follow',
    alternates: {
      canonical: fromFallback ? nationalUrl : pageUrl,
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
  const cursoMetadata = await getCourseBySlug(slug)
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

  // Quando caímos no fallback nacional, não emitir Course/FAQPage com claims
  // específicos da cidade (seria informação enganosa). Mantemos só o breadcrumb.
  const jsonLdSchemas = fromFallback
    ? [breadcrumbSchema]
    : [
        {
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: cursoMetadata.fullName,
          description: `${cursoMetadata.longDescription} Disponível em ${cityData.name}-${cityData.state} com bolsa de estudo.`,
          provider: {
            '@type': 'Organization',
            name: 'Bolsa Click',
            url: 'https://www.bolsaclick.com.br',
          },
          educationalLevel: nivelLabel,
          courseMode: ['Presencial', 'EAD', 'Semipresencial'],
          url: pageUrl,
          image: imageUrl,
          locationCreated: {
            '@type': 'Place',
            address: { '@type': 'PostalAddress', addressLocality: cityData.name, addressRegion: cityData.state, addressCountry: 'BR' },
          },
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
          ],
        },
        breadcrumbSchema,
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
