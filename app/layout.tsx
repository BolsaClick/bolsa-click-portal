import { queryClient } from '@/utils/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { Analytics } from '@vercel/analytics/react'
import { Metadata } from 'next'
import Script from 'next/script'
import { Toaster } from 'sonner'
import { AnalyticsScripts } from './components/organisms/AnalyticsScripts'
import { ClientProviders } from './components/providers/ClientProviders'
import { WatiWhatsappWidget } from './components/WatiWhatsappWidget'
import './globals.css'
import { getCurrentTheme } from './lib/themes'

const theme = getCurrentTheme()

const idsByTheme = {
  bolsaclick: {
    gtm: 'GTM-K4KZBRF3',
    facebookPixel: '3830716730578943',
  },
  anhanguera: {
    gtm: 'GTM-PPD7PKN5',
    facebookPixel: '3830716730578943',
  },
} as const

const themeName = process.env.NEXT_PUBLIC_THEME || 'bolsaclick'
const ids = idsByTheme[themeName as keyof typeof idsByTheme]

export const metadata: Metadata = {
  title: {
    default: theme.shortTitle,
    template: `%s | ${theme.shortTitle}`,
  },
  description: theme.description,
  keywords: [
    'bolsa de estudo',
    'bolsa de estudos',
    'bolsas de estudo',
    'bolsa de estudo faculdade',
    'bolsa de estudos faculdade',
    'desconto em faculdade',
    'desconto faculdade',
    'bolsa faculdade',
    'faculdade com bolsa',
    'faculdades com bolsa',
    'faculdades com desconto',
    'faculdade com desconto',
    'bolsa para faculdade',
    'bolsa de estudo até 95%',
    '30.000 faculdades',
    '100.000 cursos',
    'bolsa de estudo online',
    'bolsa de estudo EAD',
    'bolsa de estudo presencial',
    'melhor bolsa de estudo',
    'graduação EAD',
    'educação superior',
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
    locale: 'pt_br',
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
  alternates: {
    canonical: theme.siteUrl,
  },
  applicationName: theme.name,
  other: {
    copyright: 'Bolsa Click',
    abstract: 'Bolsas de Estudo de até 95% para Faculdades e Escolas | Bolsa Click',
  },
}

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: theme.name,
    alternateName: ['BolsaClick', 'Bolsa Click Brasil', 'bolsaclick.com.br'],
    url: theme.siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${theme.siteUrl}/curso/resultado?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bolsa Click',
    url: theme.siteUrl,
    logo: `${theme.siteUrl}/logo-bolsa-click-rosa.png`,
    sameAs: [
      'https://www.instagram.com/bolsaclick',
      'https://www.facebook.com/bolsaclickbrasil',
      'https://www.linkedin.com/company/bolsaclick',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+55-11-99999-9999',
      contactType: 'customer service',
      areaServed: 'BR',
      availableLanguage: ['Portuguese'],
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name: 'Bolsas de estudo com até 95% de desconto',
    educationalProgramMode: ['online', 'presencial', 'semipresencial'],
    occupationalCredentialAwarded: [
      'Graduação',
      'Pós-graduação',
      'Curso técnico',
    ],
    provider: {
      '@type': 'Organization',
      name: 'Bolsa Click',
      url: theme.siteUrl,
    },
    programPrerequisites: 'Ensino médio completo',
    offers: {
      '@type': 'Offer',
      url: theme.siteUrl,
      price: '0',
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      eligibleRegion: {
        '@type': 'Country',
        name: 'Brasil',
      },
      description: 'Inscreva-se gratuitamente para obter bolsas de estudo em universidades e escolas com até 95% de desconto.',
    },
  },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <head>
        {/* Eclesiastes 3:1 — Tudo tem o seu tempo determinado, e há tempo para todo o propósito debaixo do céu. */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-title" content="Bolsa Click" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="author" content="Bolsa Click" />
        <meta name="publisher" content="Bolsa Click" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        {/* GTM (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${ids.gtm}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        {/* Facebook Pixel (noscript) */}
        {ids.facebookPixel && (
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${ids.facebookPixel}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        )}

        <AnalyticsScripts gtm={ids.gtm} facebookPixelId={ids.facebookPixel} />

        <Script
          src="https://cdn-cookieyes.com/client_data/2a0be4de7c11618e75d1c64f/script.js"
          strategy="afterInteractive"
        />

        <WatiWhatsappWidget />

        <Toaster richColors position="top-right" />
        <Analytics />
        <QueryClientProvider client={queryClient}>
          <ClientProviders>
            <div className="flex min-h-screen flex-col">
              <main className="flex flex-1 flex-col">{children}</main>
            </div>
          </ClientProviders>
        </QueryClientProvider>
      </body>
    </html>
  )
}
