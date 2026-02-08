import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/app/lib/prisma'
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import { FeaturedCourseData } from '../../_data/types'
import { BRAZILIAN_CITIES, getCityBySlug } from '@/app/lib/constants/brazilian-cities'
import CursoCidadeClient from './CursoCidadeClient'

type Props = {
  params: Promise<{ slug: string; city: string }>
}

// ISR: Revalidar a cada 1 hora
export const revalidate = 3600

// Helper para buscar curso do banco de dados
async function getCourseBySlug(slug: string): Promise<FeaturedCourseData | null> {
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
}

// Gerar static params: cursos ativos × cidades
export async function generateStaticParams() {
  try {
    const courses = await prisma.featuredCourse.findMany({
      where: { isActive: true },
      select: { slug: true },
    })

    const params: { slug: string; city: string }[] = []
    for (const course of courses) {
      for (const city of BRAZILIAN_CITIES) {
        params.push({ slug: course.slug, city: city.slug })
      }
    }
    return params
  } catch (error) {
    console.error('Erro ao gerar static params:', error)
    return []
  }
}

// Helper para buscar preços das ofertas filtradas por cidade
async function getCityPriceRange(apiCourseName: string, cityName: string, stateUF: string, nivel: string) {
  try {
    const apiResponse = await getShowFiltersCourses(
      apiCourseName,
      cityName,
      stateUF,
      undefined,
      nivel,
      1,
      20
    )
    const offers = apiResponse?.data || []
    if (offers.length === 0) return { lowPrice: 0, highPrice: 0, offerCount: 0 }

    const prices = offers
      .map((o: { minPrice?: number; prices?: { withDiscount?: number } }) =>
        o.minPrice || o.prices?.withDiscount || 0
      )
      .filter((p: number) => p > 0)
    const maxPrices = offers
      .map((o: { maxPrice?: number; prices?: { withoutDiscount?: number } }) =>
        o.maxPrice || o.prices?.withoutDiscount || 0
      )
      .filter((p: number) => p > 0)

    return {
      lowPrice: prices.length > 0 ? Math.min(...prices) : 0,
      highPrice: maxPrices.length > 0 ? Math.max(...maxPrices) : 0,
      offerCount: offers.length,
    }
  } catch {
    return { lowPrice: 0, highPrice: 0, offerCount: 0 }
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

  const { lowPrice, highPrice, offerCount } = await getCityPriceRange(
    curso.apiCourseName, cityData.name, cityData.state, curso.nivel
  )

  const priceText = lowPrice > 0 ? ` a partir de R$ ${lowPrice.toFixed(0)}/mês` : ''
  const title = `${curso.name} em ${cityData.name} com Bolsa de até 80% - Faculdades e Preços`
  const description = `Bolsas de estudo para ${curso.fullName} em ${cityData.name}-${cityData.state}${priceText}. Até 80% de desconto. ${curso.duration} de duração. Salário médio: ${curso.averageSalary}. Inscrição grátis!`
  const pageUrl = `https://www.bolsaclick.com.br/cursos/${slug}/${citySlug}`

  const imageUrl = curso.imageUrl.startsWith('http')
    ? curso.imageUrl
    : `https://www.bolsaclick.com.br${curso.imageUrl}`

  // FAQPage schema com contexto de cidade
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Quanto custa ${curso.name} em ${cityData.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: lowPrice > 0
            ? `Em ${cityData.name}-${cityData.state}, o curso de ${curso.name} pode ser encontrado a partir de R$ ${lowPrice.toFixed(2)} por mês com bolsa de estudo pelo Bolsa Click, com descontos de até 80%.`
            : `O Bolsa Click oferece bolsas de até 80% de desconto para ${curso.name} em ${cityData.name}. Cadastre-se grátis para ver as ofertas disponíveis.`,
        },
      },
      {
        '@type': 'Question',
        name: `Quais faculdades oferecem ${curso.name} em ${cityData.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: offerCount > 0
            ? `Encontramos ${offerCount} ofertas para ${curso.name} em ${cityData.name}-${cityData.state} nas modalidades presencial, semipresencial e EAD. Compare preços e encontre a melhor bolsa de estudo.`
            : `Temos diversas faculdades parceiras que oferecem ${curso.name} em ${cityData.name} e região. Cadastre-se grátis para ver todas as opções disponíveis.`,
        },
      },
      {
        '@type': 'Question',
        name: `Quanto tempo dura o curso de ${curso.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `O curso de ${curso.fullName} tem duração de ${curso.duration}. Está disponível nas modalidades presencial, semipresencial e EAD (ensino a distância).`,
        },
      },
      {
        '@type': 'Question',
        name: `Qual o salário de quem faz ${curso.name} em ${cityData.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `O salário médio para profissionais formados em ${curso.name} é de ${curso.averageSalary}. Em ${cityData.name}-${cityData.state}, o valor pode variar conforme a experiência e área de atuação.`,
        },
      },
      {
        '@type': 'Question',
        name: `Como conseguir bolsa de estudo para ${curso.name} em ${cityData.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Para conseguir bolsa de estudo para ${curso.name} em ${cityData.name}, cadastre-se gratuitamente no Bolsa Click. Compare ofertas de diversas faculdades com descontos de até 80% e garanta sua vaga.`,
        },
      },
    ],
  }

  // Product schema
  const productSchema = lowPrice > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Bolsa de Estudo - ${curso.fullName} em ${cityData.name}`,
    description: `Bolsa de estudo para ${curso.fullName} em ${cityData.name}-${cityData.state} com até 80% de desconto.`,
    image: imageUrl,
    brand: {
      '@type': 'Brand',
      name: 'Bolsa Click',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'BRL',
      lowPrice: lowPrice.toFixed(2),
      highPrice: highPrice.toFixed(2),
      offerCount: String(offerCount),
      availability: 'https://schema.org/InStock',
      url: pageUrl,
    },
  } : null

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: curso.fullName,
      description: `${curso.longDescription} Disponível em ${cityData.name}-${cityData.state} com bolsa de estudo.`,
      provider: {
        '@type': 'Organization',
        name: 'Bolsa Click',
        url: 'https://www.bolsaclick.com.br',
        logo: 'https://www.bolsaclick.com.br/assets/logo-bolsa-click-rosa.png',
        sameAs: [
          'https://www.instagram.com/bolsaclick',
          'https://www.facebook.com/bolsaclickbrasil',
          'https://www.linkedin.com/company/bolsaclick',
        ],
      },
      educationalLevel: curso.nivel === 'GRADUACAO' ? 'Graduação' : 'Pós-graduação',
      educationalCredentialAwarded: curso.type,
      courseMode: ['Presencial', 'EAD', 'Semipresencial'],
      timeToComplete: curso.duration,
      occupationalCategory: curso.areas[0],
      url: pageUrl,
      image: imageUrl,
      locationCreated: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: cityData.name,
          addressRegion: cityData.state,
          addressCountry: 'BR',
        },
      },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'BRL',
        lowPrice: lowPrice > 0 ? lowPrice.toFixed(2) : '0',
        highPrice: highPrice > 0 ? highPrice.toFixed(2) : '0',
        offerCount: String(offerCount || 1000),
        availability: 'https://schema.org/InStock',
      },
    },
    faqSchema,
    ...(productSchema ? [productSchema] : []),
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://www.bolsaclick.com.br',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: curso.nivel === 'GRADUACAO' ? 'Graduação' : 'Pós-graduação',
          item: `https://www.bolsaclick.com.br/${curso.nivel === 'GRADUACAO' ? 'graduacao' : 'pos-graduacao'}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: curso.name,
          item: `https://www.bolsaclick.com.br/cursos/${slug}`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: cityData.name,
          item: pageUrl,
        },
      ],
    },
  ]

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
    robots: 'index, follow',
    alternates: {
      canonical: pageUrl,
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
    other: {
      'application/ld+json': JSON.stringify(schemas),
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

  // Buscar ofertas filtradas pela cidade
  let courseOffers = []
  try {
    const apiResponse = await getShowFiltersCourses(
      cursoMetadata.apiCourseName,
      cityData.name,
      cityData.state,
      undefined,
      cursoMetadata.nivel,
      1,
      20
    )
    courseOffers = apiResponse || []
  } catch (error) {
    console.error(`Erro ao buscar ofertas para ${cursoMetadata.name} em ${cityData.name}:`, error)
  }

  // Outras cidades para internal linking (exclui a cidade atual)
  const otherCities = BRAZILIAN_CITIES
    .filter(c => c.slug !== citySlug)
    .slice(0, 12)

  return (
    <CursoCidadeClient
      cursoMetadata={cursoMetadata}
      courseOffers={courseOffers}
      cityName={cityData.name}
      cityState={cityData.state}
      courseSlug={slug}
      otherCities={otherCities}
    />
  )
}
