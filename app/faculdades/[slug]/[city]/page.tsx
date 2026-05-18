import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { prisma } from '@/app/lib/prisma'
import { getCurrentTheme } from '@/app/lib/themes'
import { BRAZILIAN_CITIES, getCityBySlug } from '@/app/lib/constants/brazilian-cities'
import { getInstitutionCoursesByCity } from '@/app/lib/api/get-institution-courses-by-city'
import FaculdadeCidadeClient from './FaculdadeCidadeClient'

const theme = getCurrentTheme()
export const revalidate = 3600

type Props = {
  params: Promise<{ slug: string; city: string }>
}

const getInstitution = cache(async (slug: string) => {
  return prisma.institution.findUnique({ where: { slug } })
})

// Build leve — pages renderizadas on-demand + ISR 1h
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, city: citySlug } = await params
  const inst = await getInstitution(slug)
  const cityData = getCityBySlug(citySlug)
  if (!inst || !inst.isActive || !cityData) {
    return { title: 'Página não encontrada' }
  }

  const offers = await getInstitutionCoursesByCity(inst.name, cityData.name, cityData.state)
  const fromFallback = offers.length === 0
  const pageUrl = `${theme.siteUrl}/faculdades/${slug}/${citySlug}`
  const nationalUrl = `${theme.siteUrl}/faculdades/${slug}`

  const title = `Faculdade ${inst.name} em ${cityData.name} - Bolsas de até 80% e Cursos Disponíveis`
  const description = fromFallback
    ? `Faculdade ${inst.name} em ${cityData.name}: veja cursos, modalidades e como conseguir bolsa de estudo de até 80%.`
    : `${inst.name} em ${cityData.name}-${cityData.state}: ${offers.length} cursos disponíveis com bolsa de até 80%. Compare polos, preços, modalidades e inscreva-se grátis.`

  return {
    title,
    description,
    keywords: [
      `${inst.name} ${cityData.name}`,
      `faculdade ${inst.name} ${cityData.name}`,
      `${inst.name} em ${cityData.name}`,
      `${inst.name} ${cityData.state}`,
      `bolsa de estudo ${inst.name} ${cityData.name}`,
      `polo ${inst.name} ${cityData.name}`,
      `${inst.name} ead ${cityData.name}`,
      `${inst.name} presencial ${cityData.name}`,
      ...(inst.keywords || []),
    ],
    robots: fromFallback ? 'noindex, follow' : 'index, follow',
    alternates: {
      canonical: fromFallback ? nationalUrl : pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: theme.name,
      locale: 'pt_BR',
      type: 'website',
      images: [
        {
          url: inst.imageUrl.startsWith('http') ? inst.imageUrl : `${theme.siteUrl}${inst.imageUrl}`,
          width: 1200,
          height: 630,
          alt: `${inst.name} em ${cityData.name}`,
        },
      ],
    },
  }
}

export default async function FaculdadeCidadePage({ params }: Props) {
  const { slug, city: citySlug } = await params
  const inst = await getInstitution(slug)
  const cityData = getCityBySlug(citySlug)
  if (!inst || !inst.isActive || !cityData) {
    notFound()
  }

  const offers = await getInstitutionCoursesByCity(inst.name, cityData.name, cityData.state)
  const fromFallback = offers.length === 0

  // Unidades únicas (polos físicos) na cidade — extraídas das ofertas
  const unitMap = new Map<string, { unitName: string; unitAddress?: string; modality: string }>()
  for (const o of offers) {
    const key = `${o.unitId || o.unit || o.unitName || ''}`
    if (!key) continue
    if (!unitMap.has(key)) {
      unitMap.set(key, {
        unitName: o.unitName || o.unit || '—',
        unitAddress: o.unitAddress,
        modality: o.modality || '—',
      })
    }
  }
  const units = Array.from(unitMap.values())

  // Faixa de preço pra schema
  const prices = offers
    .map((o) => o.minPrice ?? 0)
    .filter((p) => p > 0)
  const lowPrice = prices.length > 0 ? Math.min(...prices) : 0
  const highPrice = prices.length > 0 ? Math.max(...prices) : 0

  const pageUrl = `${theme.siteUrl}/faculdades/${slug}/${citySlug}`
  const logoUrl = inst.logoUrl.startsWith('http') ? inst.logoUrl : `${theme.siteUrl}${inst.logoUrl}`
  const imageUrl = inst.imageUrl.startsWith('http') ? inst.imageUrl : `${theme.siteUrl}${inst.imageUrl}`

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: theme.siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Faculdades', item: `${theme.siteUrl}/faculdades` },
      { '@type': 'ListItem', position: 3, name: inst.name, item: `${theme.siteUrl}/faculdades/${slug}` },
      { '@type': 'ListItem', position: 4, name: cityData.name, item: pageUrl },
    ],
  }

  const jsonLdSchemas = fromFallback
    ? [breadcrumbSchema]
    : [
        {
          '@context': 'https://schema.org',
          '@type': 'EducationalOrganization',
          '@id': `${pageUrl}#institution`,
          name: `${inst.fullName} — ${cityData.name}`,
          alternateName: [inst.name, inst.shortName],
          description: `${inst.name} em ${cityData.name}-${cityData.state} com bolsa de estudo de até 80%. ${inst.description}`,
          url: pageUrl,
          logo: logoUrl,
          image: imageUrl,
          parentOrganization: {
            '@type': 'EducationalOrganization',
            '@id': `${theme.siteUrl}/faculdades/${slug}#institution`,
            name: inst.fullName,
            url: `${theme.siteUrl}/faculdades/${slug}`,
          },
          address: {
            '@type': 'PostalAddress',
            addressLocality: cityData.name,
            addressRegion: cityData.state,
            addressCountry: 'BR',
          },
          areaServed: {
            '@type': 'City',
            name: cityData.name,
            containedInPlace: { '@type': 'AdministrativeArea', name: cityData.state },
          },
          ...(lowPrice > 0 && {
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'BRL',
              lowPrice: lowPrice.toFixed(2),
              highPrice: highPrice.toFixed(2),
              offerCount: String(offers.length),
              availability: 'https://schema.org/InStock',
            },
          }),
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: `Quais cursos a ${inst.name} oferece em ${cityData.name}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `A ${inst.name} oferece ${offers.length} cursos em ${cityData.name}-${cityData.state} pelo Bolsa Click, com bolsa de até 80% de desconto. Principais cursos: ${offers.slice(0, 6).map((o) => o.name).join(', ')}.`,
              },
            },
            {
              '@type': 'Question',
              name: `Quanto custa a ${inst.name} em ${cityData.name}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: lowPrice > 0
                  ? `As mensalidades da ${inst.name} em ${cityData.name} começam em R$ ${lowPrice.toFixed(2)} com bolsa pelo Bolsa Click, com descontos de até 80%.`
                  : `As mensalidades variam por curso e modalidade. Pelo Bolsa Click, você consegue bolsa de até 80% em qualquer curso disponível.`,
              },
            },
            {
              '@type': 'Question',
              name: `A ${inst.name} em ${cityData.name} é EAD ou presencial?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `A ${inst.name} em ${cityData.name} tem cursos em diferentes modalidades — presencial em polos físicos, EAD com encontros virtuais e semipresencial. ${units.length > 0 ? `Atualmente há ${units.length} ${units.length === 1 ? 'polo' : 'polos'} físicos identificados na cidade.` : ''}`,
              },
            },
            {
              '@type': 'Question',
              name: `Como me inscrever na ${inst.name} em ${cityData.name}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `A inscrição é gratuita pelo Bolsa Click: escolha o curso, compare ofertas, garanta sua bolsa de até 80% e faça matrícula direto pelo site sem custo de processo seletivo.`,
              },
            },
          ],
        },
        breadcrumbSchema,
      ]

  // Outras cidades pra cross-link
  const otherCities = BRAZILIAN_CITIES.filter((c) => c.slug !== citySlug).slice(0, 12)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas) }}
      />
      <FaculdadeCidadeClient
        institution={inst}
        cityName={cityData.name}
        cityState={cityData.state}
        offers={offers}
        units={units}
        otherCities={otherCities}
        fromFallback={fromFallback}
      />
    </>
  )
}
