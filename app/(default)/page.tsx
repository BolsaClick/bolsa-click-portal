import type { Metadata } from 'next'
import HeroSection from '../components/organisms/HeroSection'
import Cta from '../components/organisms/Cta'
import Recommended from '../components/organisms/Recommended'
import HowWork from '../components/organisms/Recommended/HowWork'
import Filter from '../components/molecules/Filter'


export const metadata: Metadata = {
  title: 'Bolsa Click - Descontos de até 80% em Faculdades',
  description: 'Economize com bolsas de estudo de até 80% de desconto em faculdades de todo o Brasil. Graduação, EAD e presencial.',
  keywords: [
    'bolsas de estudo',
    'descontos em faculdades',
    'graduação EAD',
    'bolsas universitárias',
    'educação superior acessível',
    'ensino superior',
    'faculdades com bolsa',
    'bolsas de estudo', 'graduação EAD', 'faculdades com desconto', 'educação superior', 'bolsa para faculdade', 'bolsa para faculdade feminina', 'bolsa para faculdade masculina', 'bolsa click', 'bolsa click faculdade', 'bolsa click graduação', 'bolsa click EAD', 'bolsa click presencial'
  ],
  authors: [{ name: 'Bolsa Click', url: 'https://www.bolsaclick.com.br' }],
  creator: 'Bolsa Click',
  publisher: 'Bolsa Click',
  metadataBase: new URL('https://www.bolsaclick.com.br'),
  alternates: {
    canonical: 'https://www.bolsaclick.com.br',
  },
  robots: 'index, follow',
  openGraph: {
    title: 'Bolsa Click - Até 80% de Desconto em Faculdades',
    description: 'Compare bolsas de estudo com até 80% de desconto em faculdades de todo o Brasil.',
    url: 'https://www.bolsaclick.com.br',
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
    title: 'Bolsa Click - Até 80% de Desconto em Faculdades',
    description: 'Encontre bolsas em graduação e pós-graduação com até 80% de desconto.',
    images: ['https://www.bolsaclick.com.br/favicon.png'],
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Filter />
      <Cta />
      <Recommended />
      <HowWork />
    </>
  )
}
