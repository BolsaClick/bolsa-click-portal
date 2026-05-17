'use client'

import Script from 'next/script'
import { useConsent } from '../providers/ConsentProvider'

type Props = {
  gtmId?: string
  ga4Id?: string
  facebookPixelIds?: string[]
  tiktokPixelId?: string
}

const logScriptError = (label: string) => (event: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[analytics] ${label} failed to load`, event)
  }
}

export function AnalyticsScripts({ gtmId, ga4Id, facebookPixelIds, tiktokPixelId }: Props) {
  const { hydrated, isCategoryEnabled, versionKey } = useConsent()

  if (!hydrated) return null

  const analytics = isCategoryEnabled('analytics')
  const marketing = isCategoryEnabled('marketing')
  const pixels = facebookPixelIds ?? []

  return (
    <>
      {/* GTM (marketing) */}
      {marketing && gtmId && (
        <>
          <Script
            id="gtm-head"
            key={`gtm-${versionKey}`}
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
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {/* GA4 (analytics) */}
      {analytics && ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            key={`ga4-loader-${versionKey}`}
            strategy="lazyOnload"
            crossOrigin="anonymous"
            onError={logScriptError('GA4')}
          />
          <Script
            id="ga4"
            key={`ga4-init-${versionKey}`}
            strategy="lazyOnload"
            onError={logScriptError('GA4 init')}
          >
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4Id}');
            `}
          </Script>
        </>
      )}

      {/* Meta Pixel (marketing) */}
      {marketing && pixels.length > 0 && (
        <>
          <Script
            id="facebook-pixel"
            key={`fbq-${versionKey}`}
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
              ${pixels.map((id) => `fbq('init', '${id}');`).join('\n              ')}
              fbq('track', 'PageView');
            `}
          </Script>
          {pixels.map((pixelId) => (
            <noscript key={pixelId}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          ))}
        </>
      )}

      {/* TikTok Pixel (marketing) */}
      {marketing && tiktokPixelId && (
        <Script
          id="tiktok-pixel"
          key={`ttq-${versionKey}`}
          strategy="lazyOnload"
          onError={logScriptError('TikTok Pixel')}
        >
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
              ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
              ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
              for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
              ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
              ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
              ttq.load('${tiktokPixelId}');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      )}

      {/* UTMify (marketing) */}
      {marketing && (
        <Script
          src="https://cdn.utmify.com.br/scripts/utms/latest.js"
          key={`utmify-${versionKey}`}
          data-utmify-prevent-xcod-sck=""
          data-utmify-prevent-subids=""
          strategy="lazyOnload"
          crossOrigin="anonymous"
          onError={logScriptError('UTMify')}
        />
      )}
    </>
  )
}
