import { Metadata } from 'next'
import { Fraunces, Montserrat } from 'next/font/google'
import Script from 'next/script'
import { Toaster } from 'sonner'
import { AnalyticsScripts } from './components/organisms/AnalyticsScripts'
import CookieConsent from './components/organisms/CookieConsent'
import { ClientProviders } from './components/providers/ClientProviders'
import { ConsentProvider } from './components/providers/ConsentProvider'
import { GatedVercelAnalytics } from './components/providers/GatedVercelAnalytics'
import { WatiWhatsappWidget } from './components/WatiWhatsappWidget'
import './globals.css'
import { business } from './lib/constants/business'
import { getCurrentTheme } from './lib/themes'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-montserrat',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-fraunces',
})

const theme = getCurrentTheme()

const gtmId = process.env.NEXT_PUBLIC_GTM_ID || ''
const ga4Id = process.env.NEXT_PUBLIC_GA4_ID || ''
const facebookPixelIds = process.env.NEXT_PUBLIC_FB_PIXEL_IDS
  ? process.env.NEXT_PUBLIC_FB_PIXEL_IDS.split(',')
  : []

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
    'bolsaclick',
    'bolsa click bolsas de estudo',
    'site bolsa click',
    'plataforma bolsa click',
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
  applicationName: theme.name,
  category: 'education',
  other: {
    copyright: 'Bolsa Click',
    abstract: 'Bolsa Click é uma plataforma de bolsas de estudo para faculdades e universidades com descontos de até 95%. Graduação, pós-graduação, cursos técnicos e EAD em todo o Brasil.',
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
    '@id': `${theme.siteUrl}/#organization`,
    name: 'Bolsa Click',
    alternateName: ['BolsaClick', 'Bolsa Click Bolsas de Estudo'],
    ...(business.legalName && { legalName: business.legalName }),
    ...(business.cnpj && { taxID: business.cnpj, vatID: business.cnpj }),
    description: 'Plataforma brasileira de bolsas de estudo com até 95% de desconto em faculdades e universidades. Graduação, pós-graduação, cursos técnicos e EAD.',
    url: theme.siteUrl,
    logo: `${theme.siteUrl}/logo-bolsa-click-rosa.png`,
    image: theme.ogImage,
    naics: '611710',
    industry: 'Educação Superior',
    knowsAbout: ['bolsas de estudo', 'educação superior', 'faculdades', 'graduação', 'pós-graduação', 'EAD'],
    slogan: 'Bolsas de estudo com até 95% de desconto',
    sameAs: [
      'https://www.instagram.com/bolsaclick',
      'https://www.facebook.com/bolsaclickbrasil',
      'https://www.linkedin.com/company/bolsaclick',
    ],
    areaServed: {
      '@type': 'Country',
      name: 'Brasil',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.locality,
      addressRegion: business.address.region,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    },
    ...(business.supportPhone && {
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: business.supportPhone,
        contactType: 'customer service',
        areaServed: 'BR',
        availableLanguage: ['Portuguese'],
        email: business.supportEmail,
      },
    }),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      { '@type': 'SiteNavigationElement', position: 1, name: 'Cursos', url: `${theme.siteUrl}/cursos` },
      { '@type': 'SiteNavigationElement', position: 2, name: 'Graduação', url: `${theme.siteUrl}/graduacao` },
      { '@type': 'SiteNavigationElement', position: 3, name: 'Pós-Graduação', url: `${theme.siteUrl}/pos-graduacao` },
      { '@type': 'SiteNavigationElement', position: 4, name: 'Profissionalizantes', url: `${theme.siteUrl}/cursos-profissionalizantes` },
      { '@type': 'SiteNavigationElement', position: 5, name: 'Faculdades', url: `${theme.siteUrl}/faculdades` },
      { '@type': 'SiteNavigationElement', position: 6, name: 'Blog', url: `${theme.siteUrl}/blog` },
      { '@type': 'SiteNavigationElement', position: 7, name: 'Como Funciona', url: `${theme.siteUrl}/quem-somos` },
      { '@type': 'SiteNavigationElement', position: 8, name: 'Central de Ajuda', url: `${theme.siteUrl}/central-de-ajuda` },
      { '@type': 'SiteNavigationElement', position: 9, name: 'Contato', url: `${theme.siteUrl}/contato` },
    ],
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
    <html lang="pt-br" className={`${montserrat.variable} ${fraunces.variable}`}>
      <Script
        id="utmify-pixel"
        strategy="lazyOnload"
      >
        {`(function(){
          function boot(){
            window.pixelId = "69a7352596ee946eac5f88dd";
            var a = document.createElement("script");
            a.setAttribute("async", "");
            a.setAttribute("defer", "");
            a.setAttribute("crossorigin", "anonymous");
            a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
            (document.head || document.body || document.documentElement).appendChild(a);
          }
          var idle = window.requestIdleCallback || function (cb) { return setTimeout(cb, 1500); };
          if (document.readyState === 'complete') {
            idle(boot);
          } else {
            window.addEventListener('load', function(){ idle(boot); }, { once: true });
          }
        })();`}
      </Script>
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
      <body className={`${montserrat.className} antialiased`}>
        <ConsentProvider>
          <AnalyticsScripts gtmId={gtmId} ga4Id={ga4Id} facebookPixelIds={facebookPixelIds} />

          <WatiWhatsappWidget />

          <Toaster richColors position="top-right" />
          <GatedVercelAnalytics />
          <ClientProviders>
            <div className="flex min-h-screen flex-col">
              <main className="flex flex-1 flex-col">{children}</main>
            </div>
          </ClientProviders>

          <CookieConsent />
        </ConsentProvider>
      </body>
    </html>
  )
}
