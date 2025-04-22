/* eslint-disable @next/next/next-script-for-ga */
/* eslint-disable @next/next/no-sync-scripts */

export default function Head() {
  return (
    <>
      {/* JSON-LD: Organização */}
      <script type="application/ld+json">
        {`
        {
          "@context": "http://schema.org",
          "@type": "Organization",
          "name": "Bolsa Click",
          "url": "https://www.bolsaclick.com.br",
          "logo": "https://www.bolsaclick.com.br/favicon.png",
          "sameAs": [
            "https://www.facebook.com/bolsaclick",
            "https://www.instagram.com/bolsaclick",
            "https://twitter.com/bolsaclick"
          ]
        }
        `}
      </script>

      {/* JSON-LD: Programa Educacional com Bolsa */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOccupationalProgram",
          "name": "Bolsas de estudo com até 85% de desconto",
          "educationalProgramMode": ["online", "presencial"],
          "occupationalCredentialAwarded": [
            "Graduação",
            "Pós-graduação",
            "Curso técnico",
            "Educação básica"
          ],
          "provider": {
            "@type": "Organization",
            "name": "Bolsa Click",
            "url": "https://www.bolsaclick.com.br"
          },
          "programPrerequisites": "Ensino médio completo",
          "offers": {
            "@type": "Offer",
            "url": "https://www.bolsaclick.com.br",
            "price": "0",
            "priceCurrency": "BRL",
            "availability": "https://schema.org/InStock",
            "eligibleRegion": {
              "@type": "Country",
              "name": "Brasil"
            },
            "description": "Inscreva-se gratuitamente para obter bolsas de estudo em universidades e escolas parceiras com até 85% de desconto."
          }
        })}
      </script>

      {/* Cookie Consent */}
      <script
        id="cookieyes"
        type="text/javascript"
        src="https://cdn-cookieyes.com/client_data/2a0be4de7c11618e75d1c64f/script.js"
      ></script>

      {/* WhatsApp Plugin Reportana */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          var a = document.createElement('script');
          a.sync = true;
          a.src = 'https://app.reportana.com/whatsapp-plugin/script.js?shop_id=22250&v=' + Date.now();
          document.head.appendChild(a);
        `,
        }}
      />

      {/* Google Tag Manager */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-P8WLDPC5');
          `,
        }}
      />

      {/* Google Analytics - GA4 */}
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-WVC65E2PST"></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WVC65E2PST');
            gtag('config', 'AW-16785148719');
          `,
        }}
      />
    </>
  )
}
