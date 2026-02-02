// app/pos-graduacao/page.tsx
import { Metadata } from 'next'
import PosGraduacaoClient from './PosGraduacaoClient';

export const metadata: Metadata = {
  title: 'Bolsa de Estudo em Faculdades - Pós-graduação com até 80% de Desconto',
  description: 'Encontre bolsa de estudo em faculdades para pós-graduação com até 80% de desconto. Desconto em faculdade para especialização, MBA e mestrado. Mais de 30.000 faculdades parceiras. Cadastre-se grátis!',
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
    title: 'Bolsa de Estudo em Faculdades - Pós-graduação com até 80% de Desconto',
    description: 'Encontre bolsa de estudo em faculdades para pós-graduação. Desconto em faculdade de até 80% para especialização, MBA e mestrado. Cadastre-se grátis!',
    url: 'https://www.bolsaclick.com.br/pos-graduacao',
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: 'https://www.bolsaclick.com.br/assets/og-image-bolsaclick.png',
        width: 1200,
        height: 630,
        alt: 'Bolsas de Estudo para Pós-Graduação - Bolsa Click',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bolsaclick',
    title: 'Bolsa de Estudo em Faculdades - Pós-graduação com até 80% de Desconto',
    description: 'Pós-graduação com bolsa de estudo? Encontre a sua na Bolsa Click. Desconto em faculdade de até 80%. Cadastre-se grátis!',
    images: ['https://www.bolsaclick.com.br/assets/og-image-bolsaclick.png'],
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'Cursos de Pós-graduação',
      description: 'Descubra cursos de pós-graduação presenciais, EAD e semipresenciais com bolsas de estudo de até 80% em diversas áreas do conhecimento. Especialização, MBA e Mestrado.',
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
      educationalLevel: 'Pós-graduação',
      courseMode: ['Presencial', 'EAD', 'Semipresencial'],
      timeToComplete: 'P18M',
      occupationalCategory: 'Ensino Superior',
      audience: {
        '@type': 'EducationalAudience',
        educationalRole: 'student',
      },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'BRL',
        lowPrice: '0',
        highPrice: '0',
        offerCount: '50000',
        availability: 'https://schema.org/InStock',
      },
      url: 'https://www.bolsaclick.com.br/pos-graduacao',
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
    }),
  },
};

export default function Page() {
  return <PosGraduacaoClient />
}
