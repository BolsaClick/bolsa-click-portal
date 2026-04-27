'use client'

import Script from 'next/script'

type Props = {
  gtmId?: string
  ga4Id?: string
  facebookPixelIds?: string[]
}

const logScriptError = (label: string) => (event: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.warn(`[analytics] ${label} failed to load`, event)
  }
}

export function AnalyticsScripts({ gtmId, ga4Id, facebookPixelIds }: Props) {
  return (
    <>
      {/* GTM HEAD SCRIPT */}
      {gtmId && (
        <Script
          id="gtm-head"
          strategy="lazyOnload"
          onError={logScriptError('GTM')}
        >
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;j.crossOrigin='anonymous';f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}
        </Script>
      )}

      {/* GA4 Script */}
      {ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="lazyOnload"
            crossOrigin="anonymous"
            onError={logScriptError('GA4')}
          />
          <Script id="ga4" strategy="lazyOnload" onError={logScriptError('GA4 init')}>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4Id}');
            `}
          </Script>
        </>
      )}

      {facebookPixelIds && facebookPixelIds.length > 0 && (
        <Script
          id="facebook-pixel"
          strategy="lazyOnload"
          onError={logScriptError('Meta Pixel')}
        >
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;t.crossOrigin='anonymous';
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            ${facebookPixelIds.map(id => `fbq('init', '${id}');`).join('\n            ')}
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* UTMify */}
      <Script
        src="https://cdn.utmify.com.br/scripts/utms/latest.js"
        data-utmify-prevent-xcod-sck=""
        data-utmify-prevent-subids=""
        strategy="lazyOnload"
        crossOrigin="anonymous"
        onError={logScriptError('UTMify')}
      />
    </>
  )
}
