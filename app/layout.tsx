import { queryClient } from '@/utils/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { Analytics } from '@vercel/analytics/react'
import { Metadata } from 'next'
import Script from 'next/script'
import { Toaster } from 'sonner'
import { AnalyticsScripts } from './components/organisms/AnalyticsScripts'
import { ClientProviders } from './components/providers/ClientProviders'
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
  other: {
    copyright: 'Bolsa Click',
    abstract: 'Bolsas de Estudo de até 95% para Faculdades e Escolas | Bolsa Click',
    'application/ld+json': JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: theme.name,
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
    ]),
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-title" content="Bolsa Click" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="author" content="Bolsa Click" />
        <meta name="publisher" content="Bolsa Click" />
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

        <Script id="wati-whatsapp" strategy="afterInteractive">
          {`
            (function() {
              var url = 'https://wati-integration-prod-service.clare.ai/v2/watiWidget.js?85782';
              var s = document.createElement('script');
              s.type = 'text/javascript';
              s.async = true;
              s.src = url;

              var options = {
                enabled: true,
                chatButtonSetting: {
                  backgroundColor: "#023e73",
                  ctaText: "Precisa de ajuda? 💙",
                  borderRadius: "25",
                  marginLeft: "0",
                  marginRight: "20",
                  marginBottom: "20",
                  ctaIconWATI: false,
                  position: "right"
                },
                brandSetting: {
                  brandName: "Bolsa Click",
                  brandSubTitle: "undefined",
                  brandImg: "https://blog.bolsaclick.com.br/wp-content/uploads/2025/05/whatsappimage.png",
                  welcomeText: "Seja bem-vindo! Como posso ajudar?",
                  messageText: "Olá! 👋 Tudo certo? Estava dando uma olhada nessa página do Bolsa Click: {{page_link}} e surgiu uma dúvida. Você pode me ajudar? 💙",
                  backgroundColor: "#023e73",
                  ctaText: "Precisa de ajuda? 💙",
                  borderRadius: "25",
                  autoShow: false,
                  phoneNumber: "5511936200198"
                }
              };

              s.onload = function () {
                CreateWhatsappChatWidget(options);
              };

              var x = document.getElementsByTagName('script')[0];
              x.parentNode.insertBefore(s, x);
            })();
          `}
        </Script>

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
