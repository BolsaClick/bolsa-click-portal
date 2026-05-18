import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/app/lib/prisma'
import CursoPageClient from './CursoPageClient'
import { courseTypeLabel } from '@/app/lib/courseTypeLabel'
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import { FeaturedCourseData } from '../_data/types'
import {
  OffersComparisonTable,
  VisibleFaq,
  CitiesGrid,
  buildCourseFaqItems,
} from './_seo/CourseSeoSections'
import CourseReviewsBlock from './_components/CourseReviewsBlock'
import CoreSubjectsBlock from './_components/CoreSubjectsBlock'

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
  const title = lowPrice > 0
    ? `Bolsa de ${curso.name}${priceText} | Até 80% de desconto`
    : `Bolsa de ${curso.name} | Até 80% de desconto em faculdades`
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

  const faqItems = buildCourseFaqItems(cursoMetadata, lowPrice)

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
      timeToComplete: cursoMetadata.duration,
      url: `https://www.bolsaclick.com.br/cursos/${slug}`,
      image: imageUrl,
      hasCourseInstance: [
        {
          '@type': 'CourseInstance',
          courseMode: 'Online',
          courseWorkload: cursoMetadata.duration,
          ...(lowPrice > 0 ? {
            offers: {
              '@type': 'Offer',
              priceCurrency: 'BRL',
              price: lowPrice.toFixed(2),
              availability: 'https://schema.org/InStock',
              url: `https://www.bolsaclick.com.br/cursos/${slug}`,
            },
          } : {}),
        },
        {
          '@type': 'CourseInstance',
          courseMode: 'Onsite',
          courseWorkload: cursoMetadata.duration,
          ...(lowPrice > 0 ? {
            offers: {
              '@type': 'Offer',
              priceCurrency: 'BRL',
              price: lowPrice.toFixed(2),
              availability: 'https://schema.org/InStock',
              url: `https://www.bolsaclick.com.br/cursos/${slug}`,
            },
          } : {}),
        },
      ],
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
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
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
      <CursoPageClient
        cursoMetadata={cursoMetadata}
        courseOffers={courseOffers}
      />
      <CoreSubjectsBlock curso={cursoMetadata} />
      <CourseReviewsBlock
        courseName={cursoMetadata.name}
        brands={Array.from(new Set((courseOffers || []).map((o: { brand?: string }) => o.brand || '').filter(Boolean)))}
      />
      <VisibleFaq
        items={faqItems}
        heading={`Perguntas frequentes sobre ${cursoMetadata.name}`}
      />
      <OffersComparisonTable offers={courseOffers || []} courseName={cursoMetadata.name} />
      <CitiesGrid courseSlug={slug} courseName={cursoMetadata.name} />
      <section className="bg-paper py-12 md:py-16 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="hairline-b pb-3 mb-6 flex items-baseline justify-between">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              Quer saber sobre a carreira?
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              {cursoMetadata.averageSalary}
            </span>
          </div>
          <p className="text-ink-900 text-lg leading-relaxed">
            Salário médio, mercado de trabalho, áreas de atuação e o que faz um profissional de{' '}
            <strong>{cursoMetadata.name}</strong>. Veja o guia completo da profissão.
          </p>
          <Link
            href={`/carreiras/${slug}`}
            className="mt-6 inline-flex items-center gap-2 border border-ink-900 bg-white px-6 py-3 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-900 hover:bg-ink-900 hover:text-white transition-colors"
          >
            Ver carreira de {cursoMetadata.name} →
          </Link>
        </div>
      </section>
      <section className="bg-paper py-6 border-t border-hairline">
        <div className="container mx-auto px-4">
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500 text-center">
            Atualizado em{' '}
            <time dateTime={cursoMetadata.updatedAt.toISOString()}>
              {cursoMetadata.updatedAt.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          </p>
        </div>
      </section>
      {relatedCourses.length > 0 && (
        <section className="bg-white py-16 md:py-20 border-t border-hairline">
          <div className="container mx-auto px-4">
            <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
              <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
                Cursos relacionados
              </h2>
              <span className="font-mono num-tabular text-[11px] text-ink-500">
                ({String(relatedCourses.length).padStart(2, '0')})
              </span>
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-hairline">
              {relatedCourses.map((curso) => (
                <li key={curso.slug} className="bg-white">
                  <Link
                    href={`/cursos/${curso.slug}`}
                    className="group flex flex-col px-5 py-5 transition-colors duration-200 hover:bg-paper"
                  >
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-1">
                      {courseTypeLabel(curso.type)} · {curso.duration}
                    </span>
                    <span className="font-display text-lg text-ink-900 group-hover:italic transition-all duration-200">
                      {curso.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
