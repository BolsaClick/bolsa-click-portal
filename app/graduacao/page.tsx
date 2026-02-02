// app/graduacao/page.tsx
import { Metadata } from 'next'
import GraduacaoClient from './GraduacaoClient';

export const metadata: Metadata = {
  title: 'Bolsa de Estudo em Faculdades - Graduação com até 80% de Desconto',
  description: 'Encontre bolsa de estudo em faculdades para graduação com até 80% de desconto. Desconto em faculdade para bacharelado, licenciatura e tecnólogo. Mais de 30.000 faculdades parceiras. Cadastre-se grátis!',
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
    title: 'Bolsa de Estudo em Faculdades - Graduação com até 80% de Desconto',
    description: 'Encontre bolsa de estudo em faculdades para graduação. Desconto em faculdade de até 80% para bacharelado, licenciatura e tecnólogo. Cadastre-se grátis!',
    url: 'https://www.bolsaclick.com.br/graduacao',
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: 'https://www.bolsaclick.com.br/assets/og-image-bolsaclick.png',
        width: 1200,
        height: 630,
        alt: 'Bolsas de Estudo para Graduação - Bolsa Click',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bolsaclick',
    title: 'Bolsa de Estudo em Faculdades - Graduação com até 80% de Desconto',
    description: 'Graduação com bolsa de estudo? Encontre a sua na Bolsa Click. Desconto em faculdade de até 80%. Cadastre-se grátis!',
    images: ['https://www.bolsaclick.com.br/favicon.png'],
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'Cursos de Graduação',
      description: 'Descubra cursos de graduação presenciais, EAD e semipresenciais com bolsas de estudo de até 80% em diversas áreas do conhecimento. Bacharelado, Licenciatura e Tecnólogo.',
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
      educationalLevel: 'Graduação',
      courseMode: ['Presencial', 'EAD', 'Semipresencial'],
      timeToComplete: 'P4Y',
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
        offerCount: '100000',
        availability: 'https://schema.org/InStock',
      },
      url: 'https://www.bolsaclick.com.br/graduacao',
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
    }),
  },
};

export default function Page() {
  return <GraduacaoClient />
}
