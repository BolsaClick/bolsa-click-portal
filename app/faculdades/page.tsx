import type { Metadata } from 'next'
import { prisma } from '@/app/lib/prisma'
import { getCurrentTheme } from '@/app/lib/themes'
import FaculdadesPageClient from './FaculdadesPageClient'

const theme = getCurrentTheme()

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Faculdades Parceiras com Bolsa de Estudo | Bolsa Click',
  description: 'Conheça as faculdades parceiras do Bolsa Click. Encontre bolsas de estudo com até 95% de desconto em universidades reconhecidas pelo MEC em todo o Brasil.',
  keywords: [
    'faculdades parceiras',
    'faculdades com bolsa de estudo',
    'universidades parceiras',
    'faculdades com desconto',
    'bolsa de estudo faculdade',
    'anhanguera bolsa',
    'unopar bolsa',
    'unime bolsa',
    'melhores faculdades com bolsa',
    'faculdades reconhecidas mec',
  ],
  alternates: {
    canonical: `${theme.siteUrl}/faculdades`,
  },
  openGraph: {
    title: 'Faculdades Parceiras com Bolsa de Estudo | Bolsa Click',
    description: 'Conheça as faculdades parceiras do Bolsa Click. Bolsas de estudo com até 95% de desconto em universidades reconhecidas pelo MEC.',
    url: `${theme.siteUrl}/faculdades`,
    siteName: theme.name,
    locale: 'pt_BR',
    type: 'website',
  },
}

async function getActiveInstitutions() {
  return prisma.institution.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      shortName: true,
      fullName: true,
      description: true,
      logoUrl: true,
      headquartersCity: true,
      headquartersState: true,
      mecRating: true,
      modalities: true,
      campusCount: true,
      studentCount: true,
    },
  })
}

export default async function FaculdadesPage() {
  const institutions = await getActiveInstitutions()

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Faculdades Parceiras com Bolsa de Estudo',
    description: 'Conheça as faculdades parceiras do Bolsa Click com bolsas de estudo de até 95% de desconto.',
    url: `${theme.siteUrl}/faculdades`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: institutions.map((inst, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: inst.fullName,
        url: `${theme.siteUrl}/faculdades/${inst.slug}`,
      })),
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Início',
        item: theme.siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Faculdades Parceiras',
        item: `${theme.siteUrl}/faculdades`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <FaculdadesPageClient institutions={institutions} />
    </>
  )
}
