// app/pos-graduacao/page.tsx
import { Metadata } from 'next'
import PosGraduacaoClient from './PosGraduacaoClient';
import { getVitrine } from '@/app/lib/api/get-vitrine'
import { DISCOUNT_CEILING_PCT } from '@/app/lib/copy/claims'
import { ogImageObject } from '@/app/lib/seo/schema-image'

export const revalidate = 3600

// Card gerado por código (opengraph-image.tsx nesta pasta) — precedência
// sobre `openGraph.images` abaixo pro og:image; alimenta também
// twitter:image e o ImageObject do schema.
const OG_CARD_URL = 'https://www.bolsaclick.com.br/pos-graduacao/opengraph-image'

const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Cursos de Pós-graduação com Bolsa de Estudo',
  description: `Descubra cursos de pós-graduação presenciais, EAD e semipresenciais com bolsas de estudo de até ${DISCOUNT_CEILING_PCT}% em diversas áreas do conhecimento. Especialização, MBA e Mestrado.`,
  url: 'https://www.bolsaclick.com.br/pos-graduacao',
  image: ogImageObject(OG_CARD_URL, `Cursos de pós-graduação com bolsa de estudo de até ${DISCOUNT_CEILING_PCT}% — Especialização e MBA — Bolsa Click`),
  provider: {
    '@type': 'Organization',
    name: 'Bolsa Click',
    url: 'https://www.bolsaclick.com.br',
    logo: 'https://www.bolsaclick.com.br/assets/logo-bolsa-click-rosa.png',
    sameAs: [
      'https://www.instagram.com/bolsaclick',
      'https://www.facebook.com/bolsaclickbrasil',
      'https://www.linkedin.com/company/bolsa-click',
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
        name: 'Pós-graduação',
        item: 'https://www.bolsaclick.com.br/pos-graduacao',
      },
    ],
  },
}

export const metadata: Metadata = {
  title: `Bolsa de Estudo em Faculdades - Pós-graduação com até ${DISCOUNT_CEILING_PCT}% de Desconto`,
  description: `Encontre bolsa de estudo em faculdades para pós-graduação com até ${DISCOUNT_CEILING_PCT}% de desconto. Desconto em faculdade para especialização, MBA e mestrado. Cadastre-se grátis!`,
  keywords: [
    'bolsa de estudo pós-graduação',
    'bolsa de estudos pós-graduação',
    'desconto em faculdade pós-graduação',
    'bolsa faculdade pós-graduação',
    'faculdade com bolsa pós-graduação',
    'bolsa de estudo especialização',
    'bolsa de estudo mba',
    'bolsa de estudo mestrado',
    'pós-graduação com bolsa',
    'pós-graduação com desconto',
    'faculdade pós-graduação',
    'especialização',
    'mba',
    'cursos de pós',
    'pós-graduação EAD',
    'pós-graduação presencial',
    'especialização profissional',
    'mestrado',
    'doutorado',
    'faculdades com desconto',
    'bolsas de estudo',
    'bolsa para pós-graduação',
    'educação superior',
    'bolsa click',
    'bolsa click faculdade',
    'bolsa click pós-graduação',
  ],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/pos-graduacao',
  },
  openGraph: {
    title: `Bolsa de Estudo em Faculdades - Pós-graduação com até ${DISCOUNT_CEILING_PCT}% de Desconto`,
    description: `Encontre bolsa de estudo em faculdades para pós-graduação. Desconto em faculdade de até ${DISCOUNT_CEILING_PCT}% para especialização, MBA e mestrado. Cadastre-se grátis!`,
    url: 'https://www.bolsaclick.com.br/pos-graduacao',
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: OG_CARD_URL,
        width: 1200,
        height: 630,
        alt: 'Bolsas de Estudo para Pós-Graduação - Bolsa Click',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bolsaclick',
    title: `Bolsa de Estudo em Faculdades - Pós-graduação com até ${DISCOUNT_CEILING_PCT}% de Desconto`,
    description: `Pós-graduação com bolsa de estudo? Encontre a sua na Bolsa Click. Desconto em faculdade de até ${DISCOUNT_CEILING_PCT}%. Cadastre-se grátis!`,
    images: [OG_CARD_URL],
  },
};

export default async function Page() {
  const offers = await getVitrine({
    levels: ['POS_GRADUACAO'],
    perLevel: 6,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />
      <PosGraduacaoClient offers={offers} />
    </>
  )
}
