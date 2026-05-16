'use client'

import Script from 'next/script'
import { useWhatsappFeatureFlag } from '@/app/lib/hooks/usePostHogFeatureFlags'

export function WatiWhatsappWidget() {
  const showWhatsapp = useWhatsappFeatureFlag()

  if (!showWhatsapp) return null

  return (
    <Script
      id="wati-whatsapp"
      strategy="lazyOnload"
      onError={(event) => {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn('[analytics] Wati WhatsApp failed to load', event)
        }
      }}
    >
      {`
        (function() {
          // Defer until the page is fully loaded and idle, so the widget never
          // tries to insert into a DOM that isn't ready yet (was a source of
          // "Cannot set properties of null (setting 'innerHTML')").
          function boot() {
            var url = 'https://wati-integration-prod-service.clare.ai/v2/watiWidget.js?85782';
            var anchor = document.getElementsByTagName('script')[0];
            if (!anchor || !anchor.parentNode) {
              if (document.body) {
                document.body.appendChild(document.createElement('script'));
                anchor = document.getElementsByTagName('script')[0];
              }
              if (!anchor || !anchor.parentNode) return;
            }
            var s = document.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = url;
            s.crossOrigin = 'anonymous';

            var options = {
              enabled: true,
              chatButtonSetting: {
                backgroundColor: "#023e73",
                ctaText: "Precisa de ajuda? \\ud83d\\udc99",
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
                messageText: "Ol\\u00e1! \\ud83d\\udc4b Tudo certo? Estava dando uma olhada nessa p\\u00e1gina do Bolsa Click: {{page_link}} e surgiu uma d\\u00favida. Voc\\u00ea pode me ajudar? \\ud83d\\udc99",
                backgroundColor: "#023e73",
                ctaText: "Precisa de ajuda? \\ud83d\\udc99",
                borderRadius: "25",
                autoShow: false,
                phoneNumber: "551153043216"
              }
            };

            s.onload = function () {
              try {
                if (typeof CreateWhatsappChatWidget === 'function') {
                  CreateWhatsappChatWidget(options);
                }
              } catch (err) {
                // Swallow widget init errors so they don't bubble up to PostHog.
              }
            };
            s.onerror = function () { /* ignore network failures */ };

            anchor.parentNode.insertBefore(s, anchor);
          }

          var idle = window.requestIdleCallback || function (cb) { return setTimeout(cb, 1500); };
          if (document.readyState === 'complete') {
            idle(boot);
          } else {
            window.addEventListener('load', function () { idle(boot); }, { once: true });
          }
        })();
      `}
    </Script>
  )
}
