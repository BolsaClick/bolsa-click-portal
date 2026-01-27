// app/pos-graduacao/page.tsx
import { Metadata } from 'next'
import PosGraduacaoClient from './PosGraduacaoClient';

export const metadata: Metadata = {
  title: 'Cursos de Pós-graduação com até 80% de Desconto',
  description: 'Descubra cursos de pós-graduação presenciais, EAD e semipresenciais com bolsas de estudo de até 80% em diversas áreas do conhecimento.',
  keywords: [
    'pós-graduação',
    'especialização',
    'mba',
    'cursos de pós',
    'pós-graduação EAD',
    'pós-graduação presencial',
    'especialização profissional',
    'mestrado',
    'doutorado',
    'áreas do conhecimento',
    'faculdades com desconto',
    'bolsas de estudo', 'pós-graduação EAD', 'faculdades com desconto', 'educação superior', 'bolsa para pós-graduação', 'bolsa click', 'bolsa click faculdade', 'bolsa click pós-graduação', 'bolsa click EAD', 'bolsa click presencial'
  ],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/pos-graduacao',
  },
  openGraph: {
    title: 'Cursos de Pós-graduação com até 80% de Desconto',
    description: 'Escolha entre especialização, MBA ou mestrado e estude com bolsa de até 80% em diversas áreas.',
    url: 'https://www.bolsaclick.com.br/pos-graduacao',
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: 'https://www.bolsaclick.com.br/favicon.png',
        width: 1200,
        height: 630,
        alt: 'Bolsa Click',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bolsaclick',
    title: 'Cursos de Pós-graduação com até 80% de Desconto',
    description: 'Pós-graduação com bolsa de estudo? Encontre a sua na Bolsa Click com descontos imperdíveis.',
    images: ['https://www.bolsaclick.com.br/favicon.png'],
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'Cursos de Pós-graduação',
      description: 'Descubra cursos de pós-graduação presenciais, EAD e semipresenciais com bolsas de estudo de até 80% em diversas áreas do conhecimento.',
      provider: {
        '@type': 'Organization',
        name: 'Bolsa Click',
        url: 'https://www.bolsaclick.com.br',
        logo: 'https://www.bolsaclick.com.br/assets/logo-bolsa-click-rosa.png',
      },
      educationalLevel: 'Pós-graduação',
      courseMode: ['Presencial', 'EAD', 'Semipresencial'],
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
