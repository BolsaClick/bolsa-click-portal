'use client'

import Script from 'next/script'

type Props = {
  ga4: string
  gtm: string
  aw?: string
}

export function AnalyticsScripts({ ga4, gtm, aw }: Props) {
  return (
    <>
      {/* GTM HEAD SCRIPT */}
      <Script id="gtm-head" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtm}');
        `}
      </Script>

      {/* GA4 Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`}
        strategy="afterInteractive"
      />
      <Script id="ga4" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${ga4}');
          ${aw ? `gtag('config', '${aw}');` : ''}
        `}
      </Script>
    </>
  )
}
