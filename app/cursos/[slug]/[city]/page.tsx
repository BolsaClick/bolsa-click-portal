import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/app/lib/prisma'
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import { FeaturedCourseData } from '../../_data/types'
import { BRAZILIAN_CITIES, getCityBySlug } from '@/app/lib/constants/brazilian-cities'
import CursoCidadeClient from './CursoCidadeClient'
import Breadcrumb from '@/app/components/atoms/Breadcrumb'

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

// Não gerar páginas no build para evitar sobrecarregar o banco/API
// Todas as city pages são geradas on-demand na primeira visita e cacheadas via ISR (1h)
export async function generateStaticParams() {
  return []
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

  const { lowPrice } = await getCityPriceRange(
    curso.apiCourseName, cityData.name, cityData.state, curso.nivel
  )

  const priceText = lowPrice > 0 ? ` a partir de R$ ${lowPrice.toFixed(0)}/mês` : ''
  const title = `${curso.name} em ${cityData.name} com Bolsa de até 80% - Faculdades e Preços`
  const description = `Bolsas de estudo para ${curso.fullName} em ${cityData.name}-${cityData.state}${priceText}. Até 80% de desconto. ${curso.duration} de duração. Salário médio: ${curso.averageSalary}. Inscrição grátis!`
  const pageUrl = `https://www.bolsaclick.com.br/cursos/${slug}/${citySlug}`

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

  // Buscar ofertas: primeiro com filtro de cidade, se vazio busca sem cidade
  let courseOffers = []
  try {
    // Tentar com filtro de cidade
    const cityResponse = await getShowFiltersCourses(
      cursoMetadata.apiCourseName,
      cityData.name,
      cityData.state,
      undefined,
      cursoMetadata.nivel,
      1,
      20
    )
    courseOffers = cityResponse?.data || []

    // Se não encontrou na cidade, buscar sem filtro de cidade (ofertas gerais do curso)
    if (courseOffers.length === 0) {
      const generalResponse = await getShowFiltersCourses(
        cursoMetadata.apiCourseName,
        undefined,
        undefined,
        undefined,
        cursoMetadata.nivel,
        1,
        20
      )
      courseOffers = generalResponse?.data || []
    }
  } catch (error) {
    console.error(`Erro ao buscar ofertas para ${cursoMetadata.name} em ${cityData.name}:`, error)
    // Fallback: buscar sem cidade
    try {
      const fallbackResponse = await getShowFiltersCourses(
        cursoMetadata.apiCourseName,
        undefined,
        undefined,
        undefined,
        cursoMetadata.nivel,
        1,
        20
      )
      courseOffers = fallbackResponse?.data || []
    } catch {
      // Se tudo falhar, page renderiza sem ofertas
    }
  }

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

  const jsonLdSchemas = [
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
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bolsaclick.com.br' },
        { '@type': 'ListItem', position: 2, name: nivelLabel, item: `https://www.bolsaclick.com.br${nivelHref}` },
        { '@type': 'ListItem', position: 3, name: cursoMetadata.name, item: `https://www.bolsaclick.com.br/cursos/${slug}` },
        { '@type': 'ListItem', position: 4, name: cityData.name, item: pageUrl },
      ],
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas) }}
      />
      <div className="container mx-auto px-4 pt-4 pb-2">
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: nivelLabel, href: nivelHref },
          { label: cursoMetadata.name, href: `/cursos/${slug}` },
          { label: cityData.name },
        ]} />
      </div>
      <CursoCidadeClient
        cursoMetadata={cursoMetadata}
        courseOffers={courseOffers}
        cityName={cityData.name}
        cityState={cityData.state}
        courseSlug={slug}
        otherCities={otherCities}
      />
    </>
  )
}
