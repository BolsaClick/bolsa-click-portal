// app/layout.tsx
import './globals.css'
import { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'sonner'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/utils/react-query'
import { ClientProviders } from './components/providers/ClientProviders'
import { getCurrentTheme } from './lib/themes'

const theme = getCurrentTheme()

export const metadata: Metadata = {
  title: {
    default: theme.shortTitle,
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
other: {
  'copyright': 'Bolsa Click',
  'abstract': 'Bolsas de Estudo de até 95% para Faculdades e Escolas | Bolsa Click',
  'application/ld+json': JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: theme.name,
      url: theme.siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${theme.siteUrl}/cursos?courseName={search_term_string}`,
        'query-input': 'required name=search_term_string',
      }
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
        'https://www.linkedin.com/company/bolsaclick'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+55-11-99999-9999',
        contactType: 'customer service',
        areaServed: 'BR',
        availableLanguage: ['Portuguese']
      }
    }
  ])
},

}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-title" content="Bolsa Click" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="author" content="Bolsa Click" />
        <meta name="publisher" content="Bolsa Click" />
      </head>
      <body className="antialiased">
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
