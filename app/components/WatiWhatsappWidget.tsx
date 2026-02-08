'use client'

import Script from 'next/script'
import { useWhatsappFeatureFlag } from '@/app/lib/hooks/usePostHogFeatureFlags'

export function WatiWhatsappWidget() {
  const showWhatsapp = useWhatsappFeatureFlag()

  if (!showWhatsapp) return null

  return (
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
  )
}
