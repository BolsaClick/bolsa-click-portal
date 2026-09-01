// app/graduacao/page.tsx
import { Metadata } from 'next'
import GraduacaoClient from './GraduacaoClient';
import { getVitrine } from '@/app/lib/api/get-vitrine'
import { DISCOUNT_CEILING_PCT } from '@/app/lib/copy/claims'
import { ogImageObject } from '@/app/lib/seo/schema-image'

export const revalidate = 3600

// Card gerado por código (opengraph-image.tsx nesta pasta) — a convenção de
// arquivo tem precedência sobre `openGraph.images` abaixo pro og:image; aqui
// alimenta também o twitter:image e o ImageObject do schema, então os três
// lugares batem.
const OG_CARD_URL = 'https://www.bolsaclick.com.br/graduacao/opengraph-image'

const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Cursos de Graduação com Bolsa de Estudo',
  description: `Descubra cursos de graduação presenciais, EAD e semipresenciais com bolsas de estudo de até ${DISCOUNT_CEILING_PCT}% em diversas áreas do conhecimento. Bacharelado, Licenciatura e Tecnólogo.`,
  url: 'https://www.bolsaclick.com.br/graduacao',
  image: ogImageObject(OG_CARD_URL, `Cursos de graduação com bolsa de estudo de até ${DISCOUNT_CEILING_PCT}% — Bacharelado, Licenciatura e Tecnólogo — Bolsa Click`),
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
        name: 'Graduação',
        item: 'https://www.bolsaclick.com.br/graduacao',
      },
    ],
  },
}

export const metadata: Metadata = {
  title: `Bolsa de Estudo em Faculdades - Graduação com até ${DISCOUNT_CEILING_PCT}% de Desconto`,
  description: `Encontre bolsa de estudo em faculdades para graduação com até ${DISCOUNT_CEILING_PCT}% de desconto. Desconto em faculdade para bacharelado, licenciatura e tecnólogo. Cadastre-se grátis!`,
  keywords: [
    'bolsa de estudo graduação',
    'bolsa de estudos graduação',
    'desconto em faculdade graduação',
    'bolsa faculdade graduação',
    'faculdade com bolsa graduação',
    'bolsa de estudo bacharelado',
    'bolsa de estudo licenciatura',
    'bolsa de estudo tecnólogo',
    'graduação com bolsa',
    'graduação com desconto',
    'faculdade graduação',
    'cursos superiores',
    'ensino superior',
    'EAD',
    'graduação EAD',
    'graduação presencial',
    'licenciatura',
    'bacharelado',
    'tecnólogo',
    'faculdades com desconto',
    'bolsas de estudo',
    'bolsa para faculdade',
    'educação superior',
    'bolsa click',
    'bolsa click faculdade',
    'bolsa click graduação',
  ],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/graduacao',
  },
  openGraph: {
    title: `Bolsa de Estudo em Faculdades - Graduação com até ${DISCOUNT_CEILING_PCT}% de Desconto`,
    description: `Encontre bolsa de estudo em faculdades para graduação. Desconto em faculdade de até ${DISCOUNT_CEILING_PCT}% para bacharelado, licenciatura e tecnólogo. Cadastre-se grátis!`,
    url: 'https://www.bolsaclick.com.br/graduacao',
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: OG_CARD_URL,
        width: 1200,
        height: 630,
        alt: 'Bolsas de Estudo para Graduação - Bolsa Click',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bolsaclick',
    title: `Bolsa de Estudo em Faculdades - Graduação com até ${DISCOUNT_CEILING_PCT}% de Desconto`,
    description: `Graduação com bolsa de estudo? Encontre a sua na Bolsa Click. Desconto em faculdade de até ${DISCOUNT_CEILING_PCT}%. Cadastre-se grátis!`,
    images: [OG_CARD_URL],
  },
};

export default async function Page() {
  const offers = await getVitrine({
    levels: ['GRADUACAO'],
    perLevel: 3,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />
      <GraduacaoClient offers={offers} />
    </>
  )
}
