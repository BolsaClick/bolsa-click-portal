import { Metadata } from 'next'
import { prisma } from '@/app/lib/prisma'
import CursosPageClient from './CursosPageClient'

export const metadata: Metadata = {
  title: 'Cursos com Bolsa de até 80% - Graduação, Licenciatura e Tecnólogo',
  description: 'Compare bolsas de estudo com até 80% de desconto nos cursos mais procurados. Graduação, Licenciatura e Tecnólogo em mais de 30.000 faculdades. Veja salários, duração e inscreva-se grátis!',
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

const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Cursos com Bolsa de Estudo',
  description: 'Descubra os cursos mais procurados com bolsas de estudo de até 80% de desconto em diversas áreas do conhecimento.',
  url: 'https://www.bolsaclick.com.br/cursos',
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
  breadcrumb: {
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
        name: 'Cursos',
        item: 'https://www.bolsaclick.com.br/cursos',
      },
    ],
  },
}

export default async function CursosPage() {
  const courses = await getCourses()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />
      <CursosPageClient courses={courses} />
    </>
  )
}
