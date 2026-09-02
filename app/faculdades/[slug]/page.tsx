import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/app/lib/prisma'
import { getCurrentTheme } from '@/app/lib/themes'
import { BRAZILIAN_CITIES } from '@/app/lib/constants/brazilian-cities'
import {
  getInstitutionReviewSummary,
  buildAggregateRatingSchema,
} from '@/app/lib/reviews'
import { getInstitutionCourses } from '@/app/lib/api/get-institution-courses'
import { getFeaturedCourseSlugMap } from '@/app/lib/api/featured-course-slugs'
import FaculdadePageClient from './FaculdadePageClient'
import { ReviewList } from './_components/ReviewList'
import { ReviewForm } from './_components/ReviewForm'
import { BRAND_CONTENT } from './_data/brand-content'
import { getInstitutionMaxDiscountPct } from '@/app/lib/utils/institution-discount'

const theme = getCurrentTheme()

export const revalidate = 86400

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

  // Desconto REAL da marca (não o teto global) — mesmas ofertas que a página
  // carrega para o corpo/schema. Decide se título/descrição podem prometer
  // bolsa (anti-hallucination: claim de % nunca pode vir descolado do dado).
  const institutionCoursesForMeta = await getInstitutionCourses(institution.name)
  const maxDiscountPct = getInstitutionMaxDiscountPct(institutionCoursesForMeta)

  // Título/descrição só citam bolsa/desconto quando o desconto real é > 0, e
  // sempre com o número da própria marca — nunca o metaTitle/metaDescription
  // fixos do seed (que podem citar um % genérico) nem o teto do catálogo.
  const rawTitle =
    maxDiscountPct > 0
      ? `Faculdade ${institution.name} - Bolsas de Estudo com até ${maxDiscountPct}% de Desconto`
      : `Faculdade ${institution.name}${institution.mecRating ? ` - Nota ${institution.mecRating} no MEC` : ''} - Cursos e Mensalidades`
  const cleanTitle = rawTitle.replace(/\s*\|\s*Bolsa Click\s*$/i, '').trim()
  const title = `${cleanTitle} | ${theme.shortTitle}`
  const description =
    maxDiscountPct > 0
      ? `Encontre bolsas de estudo na faculdade ${institution.name} com até ${maxDiscountPct}% de desconto. ${institution.description}`
      : `Veja os cursos, mensalidades reais e nota MEC da faculdade ${institution.name}. ${institution.description}`

  return {
    title: { absolute: title },
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
  const otherInstitutions = institution
    ? await prisma.institution.findMany({
        where: { isActive: true, slug: { not: slug } },
        select: { slug: true, name: true },
        orderBy: { order: 'asc' },
        take: 5,
      })
    : []

  if (!institution || !institution.isActive) {
    notFound()
  }

  // Mapa nome→slug dos cursos enriquecidos (/cursos/[slug]), pro link "Ver
  // detalhes do curso" no card — mesmo padrão de SearchResultsData.tsx. Busca
  // em paralelo com as ofertas da instituição; falha aqui não pode derrubar
  // a página da faculdade: cai pra {} e os cards simplesmente não mostram o
  // link secundário.
  const courseSlugMapPromise = getFeaturedCourseSlugMap().catch((error) => {
    console.error('Erro ao buscar mapa de slugs de cursos (faculdade):', error)
    return {} as Record<string, string>
  })

  const reviewSummary = await getInstitutionReviewSummary(institution.id)
  const aggregateRating = buildAggregateRatingSchema(reviewSummary)
  const institutionCourses = await getInstitutionCourses(institution.name)
  const courseSlugMap = await courseSlugMapPromise

  // Desconto REAL da marca, derivado das ofertas que a própria página carrega
  // — nunca o teto global do catálogo. Guia toda a copy de bolsa abaixo
  // (schema, header, corpo), incluindo o conteúdo único por marca (Fase 3).
  const maxDiscountPct = getInstitutionMaxDiscountPct(institutionCourses)

  // Conteúdo editorial único da marca (Fase 3). Null se a marca ainda não tem
  // conteúdo dedicado, OU se ela não tem desconto real hoje — o passo a passo
  // "como conseguir bolsa" fica sem sentido pra quem não tem bolsa pra
  // oferecer; nesse caso cai no fallback templado (que já é honesto sobre
  // desconto zero).
  const brandContent =
    maxDiscountPct > 0 ? BRAND_CONTENT[institution.slug]?.(maxDiscountPct) ?? null : null

  // Faixa de preço REAL das ofertas (anti-hallucination: só preços vindos da API,
  // nunca inventado). Alimenta AggregateOffer pra rich result + citabilidade em IA.
  const offerPrices = institutionCourses
    .map((c) => c.minPrice ?? 0)
    .filter((p) => p > 0)
  const lowPrice = offerPrices.length ? Math.min(...offerPrices) : null
  const highPrice = offerPrices.length ? Math.max(...offerPrices) : null

  const educationalOrgSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${theme.siteUrl}/faculdades/${institution.slug}#institution`,
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
    ...(aggregateRating && { aggregateRating }),
    ...(lowPrice && {
      makesOffer: {
        '@type': 'AggregateOffer',
        priceCurrency: 'BRL',
        lowPrice,
        ...(highPrice && highPrice !== lowPrice && { highPrice }),
        offerCount: institutionCourses.length,
        category: 'Bolsa de estudo',
        availability: 'https://schema.org/InStock',
        description: `Mensalidades com bolsa de estudo na ${institution.name} a partir de R$ ${lowPrice.toFixed(0)}/mês.`,
      },
    }),
  }

  // FAQ da marca: usa o conteúdo único (Fase 3) quando existe; senão, fallback
  // templado a partir dos campos da instituição.
  const fallbackFaq: { q: string; a: string }[] = [
    {
      q: `Qual a nota da Faculdade ${institution.name} no MEC?`,
      a: institution.mecRating
        ? `A Faculdade ${institution.name} possui nota ${institution.mecRating} no MEC (em uma escala de 1 a 5), demonstrando a qualidade do ensino oferecido pela instituição.`
        : `A nota da Faculdade ${institution.name} no MEC pode ser consultada diretamente no portal e-MEC.`,
    },
    {
      q: `Como conseguir bolsa de estudo na Faculdade ${institution.name}?`,
      a:
        maxDiscountPct > 0
          ? `Para conseguir bolsa de estudo na Faculdade ${institution.name}, basta acessar o Bolsa Click, buscar pelo curso desejado, escolher a melhor oferta e se inscrever gratuitamente. As bolsas podem chegar a até ${maxDiscountPct}% de desconto.`
          : `Hoje as ofertas de graduação da Faculdade ${institution.name} listadas no Bolsa Click não têm desconto — a mensalidade exibida é o valor cheio da instituição. Você pode comparar com outras faculdades parceiras que têm bolsa própria ativa.`,
    },
    {
      q: `Quais cursos a Faculdade ${institution.name} oferece?`,
      a: `A Faculdade ${institution.name} oferece cursos de ${institution.academicLevels.map(l => l === 'GRADUACAO' ? 'graduação' : 'pós-graduação').join(' e ')} nas modalidades ${institution.modalities.map(m => m === 'EAD' ? 'EAD' : m === 'PRESENCIAL' ? 'presencial' : 'semipresencial').join(', ')}.${institution.coursesOffered ? ` São mais de ${institution.coursesOffered} cursos disponíveis.` : ''}`,
    },
    {
      q: `A Faculdade ${institution.name} é reconhecida pelo MEC?`,
      a: `Sim, a Faculdade ${institution.name} é uma instituição de ensino superior reconhecida pelo Ministério da Educação (MEC).${institution.mecRating ? ` Sua nota institucional é ${institution.mecRating} em uma escala de 1 a 5.` : ''}`,
    },
    {
      q: `Quanto custa estudar na Faculdade ${institution.name}?`,
      a:
        maxDiscountPct > 0
          ? `Os valores das mensalidades na Faculdade ${institution.name} variam de acordo com o curso e a modalidade escolhida. Pelo Bolsa Click, você encontra bolsas de estudo com descontos de até ${maxDiscountPct}% nas mensalidades, tornando o ensino superior muito mais acessível.`
          : `Os valores das mensalidades na Faculdade ${institution.name} variam de acordo com o curso e a modalidade escolhida. Hoje essas mensalidades são o valor cheio da instituição, sem desconto — confira os preços reais de cada curso na seção de ofertas acima.`,
    },
    {
      q: `A Faculdade ${institution.name} tem cursos EAD?`,
      a: institution.modalities.includes('EAD')
        ? `Sim, a Faculdade ${institution.name} oferece cursos na modalidade EAD (Ensino a Distância), permitindo que você estude de qualquer lugar do Brasil com flexibilidade de horários.`
        : `Atualmente, a Faculdade ${institution.name} oferece cursos nas modalidades ${institution.modalities.map(m => m === 'PRESENCIAL' ? 'presencial' : 'semipresencial').join(' e ')}.`,
    },
  ]

  const faqItems = brandContent?.faq ?? fallbackFaq

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
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
      <FaculdadePageClient
        institution={institution}
        initialCourses={institutionCourses}
        brandContent={brandContent}
        courseSlugMap={courseSlugMap}
        maxDiscountPct={maxDiscountPct}
      />

      {/* id="avaliacoes": âncora dos CTAs pós-matrícula (success pages) que
          alimentam o funil de coleta de reviews → AggregateRating. */}
      <section id="avaliacoes" className="bg-white py-12 md:py-16 border-t border-hairline scroll-mt-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              Avaliações de alunos sobre a {institution.name}
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              ({String(reviewSummary.count).padStart(2, '0')})
            </span>
          </div>
          <ReviewList institutionName={institution.name} summary={reviewSummary} />
        </div>
      </section>

      <section className="bg-paper py-12 md:py-16 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <ReviewForm
            institutionSlug={institution.slug}
            institutionName={institution.name}
          />
        </div>
      </section>

      {institution.hasCityPages && (
        <section className="bg-white py-12 md:py-16 border-t border-hairline">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
                <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
                  {institution.name} em outras cidades
                </h2>
                <span className="font-mono num-tabular text-[11px] text-ink-500">
                  ({String(Math.min(BRAZILIAN_CITIES.length, 30)).padStart(2, '0')})
                </span>
              </div>
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-hairline">
                {BRAZILIAN_CITIES.slice(0, 30).map(city => (
                  <li key={city.slug} className="bg-white">
                    <Link
                      href={`/faculdades/${institution.slug}/em/${city.slug}`}
                      className="block px-4 py-3 transition-colors hover:bg-paper"
                    >
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">
                        {city.state}
                      </span>
                      <span className="block font-display text-base text-ink-900">
                        {city.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {otherInstitutions.length > 0 && (
        <section className="bg-white py-12 md:py-16 border-t border-hairline">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
                <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
                  Compare {institution.name} com outras faculdades
                </h2>
                <span className="font-mono num-tabular text-[11px] text-ink-500">
                  ({String(otherInstitutions.length).padStart(2, '0')})
                </span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline">
                {otherInstitutions.map(other => {
                  const [a, b] = [institution.slug, other.slug].sort()
                  return (
                    <li key={other.slug} className="bg-white">
                      <Link
                        href={`/comparar/${a}-vs-${b}`}
                        className="block px-5 py-4 transition-colors hover:bg-paper"
                      >
                        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">
                          Comparar
                        </span>
                        <span className="block font-display text-base text-ink-900">
                          {institution.name} vs {other.name}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
