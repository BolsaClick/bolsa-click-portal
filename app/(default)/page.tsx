import type { Metadata } from 'next'
import HeroSection from '../components/organisms/HeroSection'
import Cta from '../components/organisms/Cta'
import Filter from '../components/molecules/Filter'
import { getCurrentTheme } from '../lib/themes'
import ScholarshipCarousel from '../components/molecules/ScolarShipCarousel'
import AboutSection from '../components/molecules/AboutSection'
import HowWork from '../components/organisms/Recommended/HowWork'

const theme = getCurrentTheme()

export const metadata: Metadata = {
  title: {
    default: 'Bolsas de Estudo de até 95%',
    template: `%s - ${theme.shortTitle}`,
  },
  description: theme.description,
  keywords: [
    'bolsas de estudo',
    'graduação EAD',
    'faculdades com desconto',
    'educação superior',
    'bolsa para faculdade',
    'bolsa click',
    theme.shortTitle.toLowerCase(),
  ],
  openGraph: {
    title: theme.title,
    description: theme.description,
    url: theme.siteUrl,
    siteName: theme.name,
    images: [
      {
        url: theme.ogImage,
        width: 1200,
        height: 630,
        alt: theme.name,
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: theme.twitter,
    title: theme.title,
    description: theme.description,
    images: [theme.ogImage],
  },
  icons: {
    icon: theme.favicon,
    shortcut: theme.favicon,
    apple: theme.favicon,
  },
  robots: 'index, follow',
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: theme.name,
      url: theme.siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${theme.siteUrl}/cursos/result?={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    }),

  },
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Filter />
      <Cta />
      <ScholarshipCarousel />
      <AboutSection />
      <HowWork />
    </>
  )
}
