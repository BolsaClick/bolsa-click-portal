import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CursoPageClient from './CursoPageClient'
import { getCursoMetadataBySlug, getAllCursoSlugs } from '../_data/cursos'
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'

type Props = {
  params: Promise<{ slug: string }>
}

// ISR: Revalidar a cada 1 hora (3600 segundos)
export const revalidate = 3600

// Gerar static params para SSG
export async function generateStaticParams() {
  const slugs = getAllCursoSlugs()
  return slugs.map((slug) => ({
    slug: slug,
  }))
}

// Gerar metadata dinâmica (SEO)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const curso = getCursoMetadataBySlug(slug)

  if (!curso) {
    return {
      title: 'Curso não encontrado',
    }
  }

  const title = `${curso.fullName} - Bolsa de Estudo com até 80% de Desconto`
  const description = `${curso.description} Encontre bolsas de estudo para ${curso.name} com até 80% de desconto em mais de 30.000 faculdades. Compare preços e garanta sua vaga. Inscrição grátis!`

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
          url: `https://www.bolsaclick.com.br${curso.image}`,
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
      images: [`https://www.bolsaclick.com.br${curso.image}`],
    },
    other: {
      'application/ld+json': JSON.stringify([
        {
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: curso.fullName,
          description: curso.longDescription,
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
          educationalLevel: curso.nivel === 'GRADUACAO' ? 'Graduação' : 'Pós-graduação',
          educationalCredentialAwarded: curso.type,
          courseMode: ['Presencial', 'EAD', 'Semipresencial'],
          timeToComplete: curso.duration,
          occupationalCategory: curso.areas[0],
          url: `https://www.bolsaclick.com.br/cursos/${slug}`,
          image: `https://www.bolsaclick.com.br${curso.image}`,
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'BRL',
            lowPrice: '0',
            highPrice: '0',
            offerCount: '1000',
            availability: 'https://schema.org/InStock',
          },
        },
        {
          '@context': 'https://schema.org',
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
              name: curso.nivel === 'GRADUACAO' ? 'Graduação' : 'Pós-graduação',
              item: `https://www.bolsaclick.com.br/${curso.nivel === 'GRADUACAO' ? 'graduacao' : 'pos-graduacao'}`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: curso.name,
              item: `https://www.bolsaclick.com.br/cursos/${slug}`,
            },
          ],
        },
      ]),
    },
  }
}

// Server Component: busca dados da API e renderiza
export default async function CursoPage({ params }: Props) {
  const { slug } = await params
  const cursoMetadata = getCursoMetadataBySlug(slug)

  if (!cursoMetadata) {
    notFound()
  }

  // Buscar ofertas reais da API usando o nome exato do curso
  let courseOffers = []
  try {
    const apiResponse = await getShowFiltersCourses(
      cursoMetadata.apiCourseName,  // Ex: "Administração"
      undefined,                     // city (opcional)
      undefined,                     // state (opcional)
      undefined,                     // modalidade (opcional - todas)
      cursoMetadata.nivel,          // 'GRADUACAO' ou 'POS_GRADUACAO'
      1,                            // página
      20                            // quantidade de ofertas
    )

    courseOffers = apiResponse || []
  } catch (error) {
    console.error(`Erro ao buscar ofertas para ${cursoMetadata.name}:`, error)
    // Se API falhar, componente ainda renderiza com dados estáticos
  }

  return (
    <CursoPageClient
      cursoMetadata={cursoMetadata}
      courseOffers={courseOffers}
    />
  )
}
