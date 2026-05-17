import { Metadata } from 'next'
import { prisma } from '@/app/lib/prisma'
import CarreirasPageClient from './CarreirasPageClient'
import { FeaturedCourseData } from '../cursos/_data/types'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Carreiras e Profissões: Salário, Mercado e Como se Tornar',
  description: 'Conheça profissões em alta, salários médios, mercado de trabalho e qual graduação fazer. Guia completo das principais carreiras no Brasil — com bolsa de estudo de até 80%.',
  keywords: [
    'profissões',
    'carreiras',
    'salário profissões',
    'mercado de trabalho',
    'que profissão seguir',
    'quanto ganha',
    'guia de carreiras',
    'profissão em alta',
    'qual faculdade fazer',
    'bolsa click',
  ],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/carreiras',
  },
  openGraph: {
    title: 'Carreiras e Profissões | Bolsa Click',
    description: 'Guia de profissões com salário médio, mercado e qual faculdade fazer. Bolsas de estudo de até 80% para cada carreira.',
    url: 'https://www.bolsaclick.com.br/carreiras',
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: 'https://www.bolsaclick.com.br/assets/og-image-bolsaclick.png',
        width: 1200,
        height: 630,
        alt: 'Carreiras e Profissões — Bolsa Click',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bolsaclick',
    title: 'Carreiras e Profissões | Bolsa Click',
    description: 'Guia de profissões com salário médio, mercado e qual faculdade fazer.',
    images: ['https://www.bolsaclick.com.br/assets/og-image-bolsaclick.png'],
  },
}

async function getCareers(): Promise<FeaturedCourseData[]> {
  try {
    const courses = await prisma.featuredCourse.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })
    return courses as FeaturedCourseData[]
  } catch (error) {
    console.error('Erro ao buscar carreiras do banco de dados:', error)
    return []
  }
}

export default async function CarreirasPage() {
  const careers = await getCareers()

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Carreiras e Profissões',
      description: 'Guia de profissões com salário médio, mercado de trabalho e qual graduação fazer.',
      url: 'https://www.bolsaclick.com.br/carreiras',
      provider: {
        '@type': 'Organization',
        name: 'Bolsa Click',
        url: 'https://www.bolsaclick.com.br',
      },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: careers.length,
        itemListElement: careers.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.name,
          url: `https://www.bolsaclick.com.br/carreiras/${c.slug}`,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bolsaclick.com.br' },
        { '@type': 'ListItem', position: 2, name: 'Carreiras', item: 'https://www.bolsaclick.com.br/carreiras' },
      ],
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CarreirasPageClient careers={careers} />
    </>
  )
}
