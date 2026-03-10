import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/app/lib/prisma'
import { getCurrentTheme } from '@/app/lib/themes'
import FaculdadePageClient from './FaculdadePageClient'

const theme = getCurrentTheme()

export const revalidate = 3600

async function getInstitution(slug: string) {
  return prisma.institution.findUnique({
    where: { slug },
  })
}

export async function generateStaticParams() {
  const institutions = await prisma.institution.findMany({
    where: { isActive: true },
    select: { slug: true },
  })
  return institutions.map((inst) => ({ slug: inst.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const institution = await getInstitution(slug)

  if (!institution || !institution.isActive) {
    return {
      title: 'Faculdade não encontrada',
    }
  }

  const title = institution.metaTitle || `Faculdade ${institution.name} - Bolsas de Estudo com até 80% de Desconto | Bolsa Click`
  const description =
    institution.metaDescription ||
    `Encontre bolsas de estudo na faculdade ${institution.name} com até 95% de desconto. ${institution.description}`

  return {
    title,
    description,
    keywords: institution.keywords,
    alternates: {
      canonical: `${theme.siteUrl}/faculdades/${institution.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${theme.siteUrl}/faculdades/${institution.slug}`,
      siteName: theme.name,
      locale: 'pt_BR',
      type: 'website',
    },
  }
}

export default async function FaculdadeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const institution = await getInstitution(slug)

  if (!institution || !institution.isActive) {
    notFound()
  }

  const educationalOrgSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: institution.fullName,
    alternateName: [institution.name, institution.shortName],
    description: institution.description,
    url: `${theme.siteUrl}/faculdades/${institution.slug}`,
    logo: institution.logoUrl.startsWith('http')
      ? institution.logoUrl
      : `${theme.siteUrl}${institution.logoUrl}`,
    ...(institution.founded && { foundingDate: String(institution.founded) }),
    ...(institution.headquartersCity && institution.headquartersState && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: institution.headquartersCity,
        addressRegion: institution.headquartersState,
        addressCountry: 'BR',
      },
    }),
    ...(institution.mecRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: String(institution.mecRating),
        bestRating: '5',
        worstRating: '1',
        ratingCount: '1',
        reviewCount: '1',
      },
    }),
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Qual a nota da Faculdade ${institution.name} no MEC?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: institution.mecRating
            ? `A Faculdade ${institution.name} possui nota ${institution.mecRating} no MEC (em uma escala de 1 a 5), demonstrando a qualidade do ensino oferecido pela instituição.`
            : `A nota da Faculdade ${institution.name} no MEC pode ser consultada diretamente no portal e-MEC.`,
        },
      },
      {
        '@type': 'Question',
        name: `Como conseguir bolsa de estudo na Faculdade ${institution.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Para conseguir bolsa de estudo na Faculdade ${institution.name}, basta acessar o Bolsa Click, buscar pelo curso desejado, escolher a melhor oferta e se inscrever gratuitamente. As bolsas podem chegar a até 95% de desconto.`,
        },
      },
      {
        '@type': 'Question',
        name: `Quais cursos a Faculdade ${institution.name} oferece?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `A Faculdade ${institution.name} oferece cursos de ${institution.academicLevels.map(l => l === 'GRADUACAO' ? 'graduação' : 'pós-graduação').join(' e ')} nas modalidades ${institution.modalities.map(m => m === 'EAD' ? 'EAD' : m === 'PRESENCIAL' ? 'presencial' : 'semipresencial').join(', ')}.${institution.coursesOffered ? ` São mais de ${institution.coursesOffered} cursos disponíveis.` : ''}`,
        },
      },
      {
        '@type': 'Question',
        name: `A Faculdade ${institution.name} é reconhecida pelo MEC?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Sim, a Faculdade ${institution.name} é uma instituição de ensino superior reconhecida pelo Ministério da Educação (MEC).${institution.mecRating ? ` Sua nota institucional é ${institution.mecRating} em uma escala de 1 a 5.` : ''}`,
        },
      },
      {
        '@type': 'Question',
        name: `Quanto custa estudar na Faculdade ${institution.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Os valores das mensalidades na Faculdade ${institution.name} variam de acordo com o curso e a modalidade escolhida. Pelo Bolsa Click, você encontra bolsas de estudo com descontos de até 80% nas mensalidades, tornando o ensino superior muito mais acessível.`,
        },
      },
      {
        '@type': 'Question',
        name: `A Faculdade ${institution.name} tem cursos EAD?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: institution.modalities.includes('EAD')
            ? `Sim, a Faculdade ${institution.name} oferece cursos na modalidade EAD (Ensino a Distância), permitindo que você estude de qualquer lugar do Brasil com flexibilidade de horários.`
            : `Atualmente, a Faculdade ${institution.name} oferece cursos nas modalidades ${institution.modalities.map(m => m === 'PRESENCIAL' ? 'presencial' : 'semipresencial').join(' e ')}.`,
        },
      },
    ],
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
      {
        '@type': 'ListItem',
        position: 3,
        name: institution.name,
        item: `${theme.siteUrl}/faculdades/${institution.slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(educationalOrgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <FaculdadePageClient institution={institution} />
    </>
  )
}
