import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/app/lib/prisma'
import CursoPageClient from './CursoPageClient'
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import { FeaturedCourseData } from '../_data/types'
import Breadcrumb from '@/app/components/atoms/Breadcrumb'

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
  const { lowPrice } = await getCoursePriceRange(curso.apiCourseName, curso.nivel)

  const priceText = lowPrice > 0 ? ` a partir de R$ ${lowPrice.toFixed(0)}/mês` : ''
  const title = `${curso.name} com Bolsa de até 80% - Duração, Salários e Faculdades`
  const description = `Bolsas de estudo para ${curso.fullName}${priceText}. Até 80% de desconto em mais de 30.000 faculdades. ${curso.duration} de duração. Salário médio: ${curso.averageSalary}. Inscrição grátis!`

  // Construir URL da imagem
  const imageUrl = curso.imageUrl.startsWith('http')
    ? curso.imageUrl
    : `https://www.bolsaclick.com.br${curso.imageUrl}`

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
  }
}

// Buscar cursos relacionados (mesmo nível, excluindo o atual)
async function getRelatedCourses(currentSlug: string, nivel: string): Promise<FeaturedCourseData[]> {
  try {
    const courses = await prisma.featuredCourse.findMany({
      where: {
        isActive: true,
        nivel: nivel as 'GRADUACAO' | 'POS_GRADUACAO',
        slug: { not: currentSlug },
      },
      take: 8,
    })
    return courses as FeaturedCourseData[]
  } catch {
    return []
  }
}

// Server Component: busca dados da API e renderiza
export default async function CursoPage({ params }: Props) {
  const { slug } = await params
  const cursoMetadata = await getCourseBySlug(slug)

  if (!cursoMetadata) {
    notFound()
  }

  // Buscar ofertas reais da API e cursos relacionados em paralelo
  let courseOffers: Awaited<ReturnType<typeof getShowFiltersCourses>>['data'] = []
  let relatedCourses: FeaturedCourseData[] = []

  const [offersResult, relatedResult] = await Promise.allSettled([
    getShowFiltersCourses(
      cursoMetadata.apiCourseName,
      undefined,
      undefined,
      undefined,
      cursoMetadata.nivel,
      1,
      20
    ),
    getRelatedCourses(slug, cursoMetadata.nivel),
  ])

  if (offersResult.status === 'fulfilled') {
    courseOffers = offersResult.value?.data || []
  }
  if (relatedResult.status === 'fulfilled') {
    relatedCourses = relatedResult.value
  }

  const nivelLabel = cursoMetadata.nivel === 'GRADUACAO' ? 'Graduação' : 'Pós-graduação'
  const nivelHref = cursoMetadata.nivel === 'GRADUACAO' ? '/graduacao' : '/pos-graduacao'

  // Build JSON-LD schemas for SEO
  const imageUrl = cursoMetadata.imageUrl.startsWith('http')
    ? cursoMetadata.imageUrl
    : `https://www.bolsaclick.com.br${cursoMetadata.imageUrl}`

  const prices = (courseOffers || [])
    .map((o: { minPrice?: number; prices?: { withDiscount?: number } }) => o.minPrice || o.prices?.withDiscount || 0)
    .filter((p: number) => p > 0)
  const maxPrices = (courseOffers || [])
    .map((o: { maxPrice?: number; prices?: { withoutDiscount?: number } }) => o.maxPrice || o.prices?.withoutDiscount || 0)
    .filter((p: number) => p > 0)
  const lowPrice = prices.length > 0 ? Math.min(...prices) : 0
  const highPrice = maxPrices.length > 0 ? Math.max(...maxPrices) : 0

  const jsonLdSchemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: cursoMetadata.fullName,
      description: cursoMetadata.longDescription,
      provider: {
        '@type': 'Organization',
        name: 'Bolsa Click',
        url: 'https://www.bolsaclick.com.br',
        logo: 'https://www.bolsaclick.com.br/assets/logo-bolsa-click-rosa.png',
      },
      educationalLevel: nivelLabel,
      educationalCredentialAwarded: cursoMetadata.type,
      courseMode: ['Presencial', 'EAD', 'Semipresencial'],
      timeToComplete: cursoMetadata.duration,
      url: `https://www.bolsaclick.com.br/cursos/${slug}`,
      image: imageUrl,
      ...(lowPrice > 0 ? {
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'BRL',
          lowPrice: lowPrice.toFixed(2),
          highPrice: highPrice.toFixed(2),
          offerCount: String(courseOffers?.length || 0),
          availability: 'https://schema.org/InStock',
        },
      } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `O que é o curso de ${cursoMetadata.name}?`,
          acceptedAnswer: { '@type': 'Answer', text: cursoMetadata.longDescription },
        },
        {
          '@type': 'Question',
          name: `Quanto tempo dura o curso de ${cursoMetadata.name}?`,
          acceptedAnswer: { '@type': 'Answer', text: `O curso de ${cursoMetadata.fullName} tem duração de ${cursoMetadata.duration}.` },
        },
        {
          '@type': 'Question',
          name: `Quanto custa o curso de ${cursoMetadata.name} com bolsa?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: lowPrice > 0
              ? `Com bolsa pelo Bolsa Click, o curso de ${cursoMetadata.name} pode ser encontrado a partir de R$ ${lowPrice.toFixed(2)} por mês, com descontos de até 80%.`
              : `O Bolsa Click oferece bolsas de até 80% de desconto para o curso de ${cursoMetadata.name}. Cadastre-se grátis para ver as ofertas.`,
          },
        },
        {
          '@type': 'Question',
          name: `Qual o salário médio de quem faz ${cursoMetadata.name}?`,
          acceptedAnswer: { '@type': 'Answer', text: `O salário médio para profissionais formados em ${cursoMetadata.name} é de ${cursoMetadata.averageSalary}.` },
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
          { label: cursoMetadata.name },
        ]} />
      </div>
      <CursoPageClient
        cursoMetadata={cursoMetadata}
        courseOffers={courseOffers}
      />
      {relatedCourses.length > 0 && (
        <section className="bg-slate-50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-blue-950 mb-6">
              Cursos Relacionados com Bolsa de Estudo
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {relatedCourses.map((curso) => (
                <Link
                  key={curso.slug}
                  href={`/cursos/${curso.slug}`}
                  className="group rounded-lg border border-neutral-200 bg-white p-4 hover:border-pink-400 hover:shadow-md transition-all"
                >
                  <span className="text-sm font-medium text-blue-950 group-hover:text-bolsa-primary transition-colors">
                    Bolsa para {curso.name}
                  </span>
                  <span className="block text-xs text-neutral-500 mt-1">
                    {curso.type === 'BACHARELADO' ? 'Bacharelado' : curso.type === 'LICENCIATURA' ? 'Licenciatura' : 'Tecnólogo'} &middot; {curso.duration}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
