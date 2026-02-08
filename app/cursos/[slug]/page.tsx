import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/app/lib/prisma'
import CursoPageClient from './CursoPageClient'
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import { FeaturedCourseData } from '../_data/types'

type Props = {
  params: Promise<{ slug: string }>
}

// ISR: Revalidar a cada 1 hora (3600 segundos)
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

// Helper para buscar todos os slugs para SSG
async function getAllCourseSlugs(): Promise<string[]> {
  try {
    const courses = await prisma.featuredCourse.findMany({
      where: { isActive: true },
      select: { slug: true },
    })
    return courses.map(c => c.slug)
  } catch (error) {
    console.error('Erro ao buscar slugs do banco de dados:', error)
    return []
  }
}

// Gerar static params para SSG
export async function generateStaticParams() {
  const slugs = await getAllCourseSlugs()
  return slugs.map((slug) => ({
    slug: slug,
  }))
}

// Helper para buscar preços das ofertas para SEO
async function getCoursePriceRange(apiCourseName: string, nivel: string) {
  try {
    const apiResponse = await getShowFiltersCourses(
      apiCourseName,
      undefined,
      undefined,
      undefined,
      nivel,
      1,
      20
    )
    const offers = apiResponse?.data || []
    if (offers.length === 0) return { lowPrice: 0, highPrice: 0, offerCount: 0 }

    const prices = offers
      .map((o: { minPrice?: number; prices?: { withDiscount?: number; withoutDiscount?: number } }) =>
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

// Gerar metadata dinâmica (SEO)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const curso = await getCourseBySlug(slug)

  if (!curso) {
    return {
      title: 'Curso não encontrado',
    }
  }

  // Buscar preços reais das ofertas para schema
  const { lowPrice, highPrice, offerCount } = await getCoursePriceRange(curso.apiCourseName, curso.nivel)

  const priceText = lowPrice > 0 ? ` a partir de R$ ${lowPrice.toFixed(0)}/mês` : ''
  const title = `${curso.name} com Bolsa de até 80% - Duração, Salários e Faculdades`
  const description = `Bolsas de estudo para ${curso.fullName}${priceText}. Até 80% de desconto em mais de 30.000 faculdades. ${curso.duration} de duração. Salário médio: ${curso.averageSalary}. Inscrição grátis!`

  // Construir URL da imagem
  const imageUrl = curso.imageUrl.startsWith('http')
    ? curso.imageUrl
    : `https://www.bolsaclick.com.br${curso.imageUrl}`

  // FAQPage schema dinâmico baseado no curso
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `O que é o curso de ${curso.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: curso.longDescription,
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
        name: `Quanto custa o curso de ${curso.name} com bolsa?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: lowPrice > 0
            ? `Com bolsa de estudo pelo Bolsa Click, o curso de ${curso.name} pode ser encontrado a partir de R$ ${lowPrice.toFixed(2)} por mês, com descontos de até 80%. Os valores variam conforme a faculdade, modalidade e localização.`
            : `O Bolsa Click oferece bolsas de até 80% de desconto para o curso de ${curso.name}. Os valores variam conforme a faculdade, modalidade e localização. Cadastre-se grátis para ver as ofertas disponíveis.`,
        },
      },
      {
        '@type': 'Question',
        name: `Qual o salário médio de quem faz ${curso.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `O salário médio para profissionais formados em ${curso.name} é de ${curso.averageSalary}. O valor pode variar conforme a experiência, região e área de atuação.`,
        },
      },
      {
        '@type': 'Question',
        name: `Quais as áreas de atuação de ${curso.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `O profissional formado em ${curso.name} pode atuar nas seguintes áreas: ${curso.areas.join(', ')}. A demanda do mercado para esta área é ${curso.marketDemand === 'ALTA' ? 'alta' : curso.marketDemand === 'MEDIA' ? 'média' : 'em crescimento'}.`,
        },
      },
    ],
  }

  // Product schema para exibir preço nos resultados do Google
  const productSchema = lowPrice > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Bolsa de Estudo - ${curso.fullName}`,
    description: `Bolsa de estudo para ${curso.fullName} com até 80% de desconto. ${curso.duration} de duração.`,
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
      url: `https://www.bolsaclick.com.br/cursos/${slug}`,
    },
  } : null

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: curso.fullName,
      description: curso.longDescription,
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
      url: `https://www.bolsaclick.com.br/cursos/${slug}`,
      image: imageUrl,
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
      ],
    },
  ]

  return {
    title,
    description,
    keywords: [
      ...curso.keywords,
      `bolsa de estudo ${curso.name}`,
      `${curso.name} com desconto`,
      `faculdade de ${curso.name}`,
      `${curso.name} ead`,
      `${curso.name} presencial`,
      `quanto custa ${curso.name}`,
      `salário ${curso.name}`,
      'bolsa click',
    ],
    robots: 'index, follow',
    alternates: {
      canonical: `https://www.bolsaclick.com.br/cursos/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.bolsaclick.com.br/cursos/${slug}`,
      siteName: 'Bolsa Click',
      locale: 'pt_BR',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${curso.name} - Bolsa Click`,
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

// Server Component: busca dados da API e renderiza
export default async function CursoPage({ params }: Props) {
  const { slug } = await params
  const cursoMetadata = await getCourseBySlug(slug)

  if (!cursoMetadata) {
    notFound()
  }

  // Buscar ofertas reais da API usando o nome exato do curso
  let courseOffers = []
  try {
    const apiResponse = await getShowFiltersCourses(
      cursoMetadata.apiCourseName,  // Ex: "Administração"
      undefined,                     // city (opcional)
      undefined,                     // state (opcional)
      undefined,                     // modalidade (opcional - todas)
      cursoMetadata.nivel,          // 'GRADUACAO' ou 'POS_GRADUACAO'
      1,                            // página
      20                            // quantidade de ofertas
    )

    courseOffers = apiResponse?.data || []
  } catch (error) {
    console.error(`Erro ao buscar ofertas para ${cursoMetadata.name}:`, error)
    // Se API falhar, componente ainda renderiza com dados estáticos
  }

  return (
    <CursoPageClient
      cursoMetadata={cursoMetadata}
      courseOffers={courseOffers}
    />
  )
}
