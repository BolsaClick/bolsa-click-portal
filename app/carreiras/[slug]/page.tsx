import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/app/lib/prisma'
import CarreiraPageClient from './CarreiraPageClient'
import { FeaturedCourseData } from '@/app/cursos/_data/types'
import { courseTypeLabel } from '@/app/lib/courseTypeLabel'
import { resolveCanonicalCourseSlug } from '@/app/lib/seo/slug-resolver'

export const revalidate = 86400

type Props = {
  params: Promise<{ slug: string }>
}

async function getProfessionBySlug(slug: string): Promise<FeaturedCourseData | null> {
  try {
    const course = await prisma.featuredCourse.findUnique({
      where: { slug, isActive: true },
    })
    return course as FeaturedCourseData | null
  } catch (error) {
    console.error('Erro ao buscar profissão:', error)
    return null
  }
}

async function getRelatedProfessions(currentSlug: string): Promise<FeaturedCourseData[]> {
  try {
    const courses = await prisma.featuredCourse.findMany({
      where: { isActive: true, slug: { not: currentSlug } },
      orderBy: { order: 'asc' },
      take: 8,
    })
    return courses as FeaturedCourseData[]
  } catch {
    return []
  }
}

export async function generateStaticParams() {
  try {
    const courses = await prisma.featuredCourse.findMany({
      where: { isActive: true },
      select: { slug: true },
    })
    return courses.map((c) => ({ slug: c.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const profissao = await getProfessionBySlug(slug)

  if (!profissao) {
    return { title: 'Profissão não encontrada' }
  }

  // Title ≤ 60 chars (layout cola "%s | Bolsa Click", 14 chars). Degrada conforme
  // o tamanho do nome da profissão; prioriza o ano de freshness (2026) quando cabe.
  const brandSuffixLen = ' | Bolsa Click'.length
  const titleBase = profissao.name
  const titleSuffix =
    [': Salário e Mercado de Trabalho 2026', ': Salário e Mercado 2026', ': Salário 2026', ': Salário', ''].find(
      (s) => titleBase.length + s.length + brandSuffixLen <= 60
    ) ?? ''
  const title = `${titleBase}${titleSuffix}`
  const description = `Carreira em ${profissao.name}: salário médio de ${profissao.averageSalary}, demanda ${profissao.marketDemand.toLowerCase()}, formação em ${profissao.duration}. Veja o que faz, áreas de atuação e qual faculdade fazer com bolsa de até 80%.`
  const pageUrl = `https://www.bolsaclick.com.br/carreiras/${slug}`

  const imageUrl = profissao.imageUrl.startsWith('http')
    ? profissao.imageUrl
    : `https://www.bolsaclick.com.br${profissao.imageUrl}`

  return {
    title,
    description,
    keywords: [
      `salário ${profissao.name}`,
      `quanto ganha ${profissao.name}`,
      `profissão de ${profissao.name}`,
      `carreira em ${profissao.name}`,
      `mercado de trabalho ${profissao.name}`,
      `o que faz um ${profissao.name}`,
      `como ser ${profissao.name}`,
      `${profissao.name} faculdade`,
      ...profissao.keywords,
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
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Carreira em ${profissao.name} — Bolsa Click`,
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

const DEMAND_TEXT = {
  ALTA: 'alta demanda',
  MEDIA: 'demanda moderada',
  BAIXA: 'demanda baixa',
} as const

export default async function CarreiraPage({ params }: Props) {
  const { slug } = await params
  const profissao = await getProfessionBySlug(slug)

  if (!profissao) {
    // Tenta resolver slug curto (ex: "medicina-veterinaria") pra canônico
    // ("medicina-veterinaria-bacharelado") — redirect 301 se achar.
    const canonical = await resolveCanonicalCourseSlug(slug)
    if (canonical) redirect(`/carreiras/${canonical}`)
    notFound()
  }

  const related = await getRelatedProfessions(slug)

  const pageUrl = `https://www.bolsaclick.com.br/carreiras/${slug}`
  const imageUrl = profissao.imageUrl.startsWith('http')
    ? profissao.imageUrl
    : `https://www.bolsaclick.com.br${profissao.imageUrl}`
  const demandText = DEMAND_TEXT[profissao.marketDemand]

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Occupation',
      name: profissao.name,
      description: profissao.longDescription,
      occupationLocation: {
        '@type': 'Country',
        name: 'Brasil',
      },
      // estimatedSalary removido: o rich result de salário estimado do Google
      // foi descontinuado (jun/2025). O dado salarial segue no conteúdo visível.
      educationRequirements: {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: courseTypeLabel(profissao.type),
        educationalLevel: profissao.nivel === 'GRADUACAO' ? 'Graduação' : 'Pós-graduação',
      },
      skills: profissao.skills,
      responsibilities: profissao.careerPaths,
      url: pageUrl,
      image: imageUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `Quanto ganha um profissional de ${profissao.name}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `O salário médio de um profissional formado em ${profissao.name} no Brasil é de ${profissao.averageSalary}. O valor varia conforme experiência, região e empresa.`,
          },
        },
        {
          '@type': 'Question',
          name: `O que faz um profissional de ${profissao.name}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: profissao.longDescription,
          },
        },
        {
          '@type': 'Question',
          name: `Como se tornar um profissional de ${profissao.name}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Para atuar como ${profissao.name}, é necessário cursar ${profissao.fullName}, com duração de ${profissao.duration}. Pelo Bolsa Click, você pode encontrar bolsas de até 80% de desconto em faculdades parceiras.`,
          },
        },
        {
          '@type': 'Question',
          name: `Como está o mercado de trabalho para ${profissao.name}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `O mercado de trabalho para ${profissao.name} está com ${demandText} no Brasil. Áreas de atuação incluem: ${profissao.areas.join(', ')}.`,
          },
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bolsaclick.com.br' },
        { '@type': 'ListItem', position: 2, name: 'Carreiras', item: 'https://www.bolsaclick.com.br/carreiras' },
        { '@type': 'ListItem', position: 3, name: profissao.name, item: pageUrl },
      ],
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CarreiraPageClient profissao={profissao} related={related} />
    </>
  )
}
