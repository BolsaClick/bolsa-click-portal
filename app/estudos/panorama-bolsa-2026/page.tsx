import { Metadata } from 'next'
import { getPanoramaData } from '@/app/lib/seo/study-data'
import PanoramaClient from './PanoramaClient'

const SITE_URL = 'https://www.bolsaclick.com.br'
const PAGE_URL = `${SITE_URL}/estudos/panorama-bolsa-2026`

const DATA_PUBLISHED = '2026-05-19'
const DATA_MODIFIED = '2026-05-19'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Panorama da Bolsa de Estudo no Brasil 2026 — Estudo Bolsa Click',
  description:
    'Relatório com dados originais sobre o mercado de bolsas de estudo no Brasil em 2026: 117 cursos cobertos, 283 cidades, salários por área, distribuição por instituição e modalidade. Catálogo Bolsa Click cruzado com CAGED 2025 e IBGE 2022.',
  keywords: [
    'panorama bolsa de estudo brasil',
    'estudo educação superior brasil',
    'mercado bolsa estudo 2026',
    'dados educação brasil',
    'pesquisa bolsa de estudo',
    'panorama 2026',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Panorama da Bolsa de Estudo no Brasil 2026',
    description:
      'Dados originais sobre cursos, cidades, instituições e salários no mercado brasileiro de bolsas de estudo.',
    url: PAGE_URL,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'article',
  },
}

export default async function PanoramaPage() {
  const data = await getPanoramaData()

  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${PAGE_URL}#dataset`,
    name: 'Panorama da Bolsa de Estudo no Brasil 2026',
    description:
      'Conjunto de dados agregados sobre cursos de graduação e pós-graduação com bolsa de estudo no Brasil em 2026: cobertura por modalidade, distribuição geográfica de polos, faixas salariais por área de atuação, instituições parceiras. Fonte primária: Catálogo Bolsa Click; cruzamentos com CAGED 2025 (Ministério do Trabalho) e IBGE 2022.',
    url: PAGE_URL,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    creator: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Bolsa Click',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bolsa Click',
      url: SITE_URL,
    },
    datePublished: DATA_PUBLISHED,
    dateModified: DATA_MODIFIED,
    spatialCoverage: {
      '@type': 'Country',
      name: 'Brasil',
    },
    temporalCoverage: '2026',
    keywords: [
      'bolsa de estudo',
      'educação superior',
      'graduação',
      'pós-graduação',
      'mercado de trabalho',
      'salário',
    ],
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    variableMeasured: [
      'Total de cursos com bolsa',
      'Distribuição por modalidade',
      'Cobertura geográfica (cidades e estados)',
      'Faixa salarial por área',
      'Instituições parceiras',
    ],
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Panorama da Bolsa de Estudo no Brasil 2026',
    description:
      'Estudo com dados originais sobre o mercado de bolsas de estudo no Brasil em 2026.',
    image: `${SITE_URL}/assets/og-image-bolsaclick.png`,
    datePublished: DATA_PUBLISHED,
    dateModified: DATA_MODIFIED,
    author: {
      '@type': 'Organization',
      name: 'Equipe Editorial Bolsa Click',
      url: `${SITE_URL}/sobre/equipe-editorial`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bolsa Click',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/assets/logo-bolsa-click-rosa.png`,
      },
    },
    mainEntityOfPage: PAGE_URL,
    url: PAGE_URL,
    inLanguage: 'pt-BR',
    citation: [
      {
        '@type': 'CreativeWork',
        name: 'CAGED — Cadastro Geral de Empregados e Desempregados',
        url: 'https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/estatisticas-trabalho/caged',
        author: 'Ministério do Trabalho e Emprego',
      },
      {
        '@type': 'CreativeWork',
        name: 'Censo Demográfico 2022',
        url: 'https://censo2022.ibge.gov.br/',
        author: 'IBGE',
      },
    ],
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Estudos', item: `${SITE_URL}/estudos` },
      { '@type': 'ListItem', position: 3, name: 'Panorama Bolsa 2026', item: PAGE_URL },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([datasetSchema, articleSchema, breadcrumbSchema]) }}
      />
      <PanoramaClient data={data} datePublished={DATA_PUBLISHED} dateModified={DATA_MODIFIED} />
    </>
  )
}
