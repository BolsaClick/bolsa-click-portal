// app/graduacao/page.tsx
import { Metadata } from 'next'
import GraduacaoClient from './GraduacaoClient';

export const metadata: Metadata = {
  title: 'Cursos de Graduação com até 80% de Desconto',
  description: 'Descubra cursos de graduação presenciais, EAD e semipresenciais com bolsas de estudo de até 80% em diversas áreas do conhecimento.',
  keywords: [
    'graduação',
    'cursos superiores',
    'faculdade com bolsa',
    'ensino superior',
    'EAD',
    'licenciatura',
    'bacharelado',
    'tecnólogo',
    'áreas do conhecimento',
    'faculdades com desconto',
  ],
  robots: 'index, follow',
  openGraph: {
    title: 'Cursos de Graduação com até 80% de Desconto',
    description: 'Escolha entre bacharelado, licenciatura ou tecnólogo e estude com bolsa de até 80% em diversas áreas.',
    url: 'https://www.bolsaclick.com.br/graduacao',
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
    title: 'Cursos de Graduação com até 80% de Desconto',
    description: 'Graduação com bolsa de estudo? Encontre a sua na Bolsa Click com descontos imperdíveis.',
    images: ['https://www.bolsaclick.com.br/favicon.png'],
  },
};

export default function Page() {
  return <GraduacaoClient />
}
