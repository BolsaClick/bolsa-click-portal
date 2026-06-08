import { Metadata } from 'next'
import { prisma } from '@/app/lib/prisma'
import CursosPageClient from './CursosPageClient'

export const metadata: Metadata = {
  title: 'Cursos com bolsa de até 80% de desconto',
  description: 'Bolsas de estudo de até 80% nos cursos mais procurados de graduação, tecnólogo e licenciatura, no EAD ou presencial. Inscrição grátis.',
  keywords: [
    'cursos com bolsa',
    'cursos graduação',
    'cursos tecnólogo',
    'faculdade com desconto',
    'bolsa de estudos',
    'cursos ead',
    'cursos presenciais',
    'administração',
    'direito',
    'enfermagem',
    'psicologia',
  ],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/cursos',
  },
  openGraph: {
    title: 'Cursos com Bolsa de Estudo de até 80% | Bolsa Click',
    description: 'Descubra os cursos mais procurados com bolsas de estudo de até 80% de desconto. Graduação, Tecnólogo e Licenciatura.',
    url: 'https://www.bolsaclick.com.br/cursos',
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: 'https://www.bolsaclick.com.br/assets/og-image-bolsaclick.png',
        width: 1200,
        height: 630,
        alt: 'Cursos com Bolsa de Estudo - Bolsa Click',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bolsaclick',
    title: 'Cursos com Bolsa de Estudo de até 80% | Bolsa Click',
    description: 'Descubra os cursos mais procurados com bolsas de estudo de até 80% de desconto.',
    images: ['https://www.bolsaclick.com.br/assets/og-image-bolsaclick.png'],
  },
}

// ISR: Revalidar a cada 1 hora
export const revalidate = 3600

async function getCourses() {
  try {
    const courses = await prisma.featuredCourse.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        fullName: true,
        apiCourseName: true,
        type: true,
        nivel: true,
        description: true,
        duration: true,
        averageSalary: true,
        marketDemand: true,
        imageUrl: true,
        areas: true,
      },
    })
    return courses
  } catch (error) {
    console.error('Erro ao buscar cursos do banco de dados:', error)
    return []
  }
}

const SITE_URL = 'https://www.bolsaclick.com.br'

const collectionPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Cursos com Bolsa de Estudo',
  description: 'Descubra os cursos mais procurados com bolsas de estudo de até 80% de desconto em diversas áreas do conhecimento.',
  url: `${SITE_URL}/cursos`,
  provider: {
    '@type': 'Organization',
    name: 'Bolsa Click',
    url: SITE_URL,
    logo: `${SITE_URL}/assets/logo-bolsa-click-rosa.png`,
    sameAs: [
      'https://www.instagram.com/bolsaclick',
      'https://www.facebook.com/bolsaclickbrasil',
      'https://www.linkedin.com/company/bolsa-click',
    ],
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Cursos', item: `${SITE_URL}/cursos` },
    ],
  },
}

export default async function CursosPage() {
  const courses = await getCourses()

  // ItemList habilita o rich result de carrossel de cursos no Google.
  // Estrutura "summary list": cada ListItem só com name + url, indicando
  // que detalhes (preço, oferta, instituição) estão na página própria do
  // curso. Limita a 100 itens — limite recomendado pra carrossel.
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Cursos com bolsa de estudo',
    description: 'Catálogo de cursos disponíveis com bolsa no Bolsa Click.',
    numberOfItems: courses.length,
    itemListElement: courses.slice(0, 100).map((course, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${SITE_URL}/cursos/${course.slug}`,
      name: course.fullName || course.name,
    })),
  }

  const jsonLdSchemas = [collectionPageSchema, itemListSchema]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas) }}
      />
      <CursosPageClient courses={courses} />
    </>
  )
}
