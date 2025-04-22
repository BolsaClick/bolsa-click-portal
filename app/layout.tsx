// app/layout.tsx
import './globals.css'
import { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'sonner'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/utils/react-query'
import { ClientProviders } from './components/providers/ClientProviders'
import Head from './head'


export const metadata: Metadata = {
  title: {
    default: 'Bolsa Click',
    template: '%s - Bolsa Click',
  },
  description: 'Economize com bolsas de estudo com até 80% de desconto em faculdades de todo o Brasil.',
  other: {
    'application/ld+json': JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Bolsa Click",
      "url": "https://www.bolsaclick.com.br",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.bolsaclick.com.br/cursos?courseName={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    })
  },
  keywords: ['bolsas de estudo', 'graduação EAD', 'faculdades com desconto', 'educação superior', 'bolsa para faculdade', 'bolsa para faculdade feminina', 'bolsa para faculdade masculina', 'bolsa click', 'bolsa click faculdade', 'bolsa click graduação', 'bolsa click EAD', 'bolsa click presencial'],
  openGraph: {
    title: 'Bolsa Click - Até 80% de Desconto em Faculdades',
    description: 'Compare bolsas de estudo com até 80% de desconto em faculdades de todo o Brasil.',
  
  
    url: 'https://www.bolsaclick.com.br',
    siteName: 'Bolsa Click',
    images: [
      {
        url: 'https://www.bolsaclick.com.br/favicon.png',
        width: 1200,
        height: 630,
        alt: 'Bolsa Click',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bolsaclick',
    title: 'Bolsa Click - Até 80% de Desconto em Faculdades',
    description: 'Compare bolsas de estudo com até 80% de desconto em faculdades de todo o Brasil.',
    images: ['https://www.bolsaclick.com.br/favicon.png'],
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  robots: 'index, follow',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <Head />
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
