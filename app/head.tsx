/* eslint-disable @next/next/next-script-for-ga */
/* eslint-disable @next/next/no-sync-scripts */

export default function Head() {
  return (
    <>
      {/* Meta Tags OpenGraph / Twitter */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Bolsa Click" />
      <meta property="og:title" content="Bolsas de Estudo com até 85% de Desconto - Bolsa Click" />
      <meta property="og:description" content="Encontre bolsas de estudo para graduação, pós, técnicos e mais. Cadastre-se grátis e estude com até 85% de desconto!" />
      <meta property="og:url" content="https://www.bolsaclick.com.br" />
      <meta property="og:image" content="https://www.bolsaclick.com.br/assets/og-banner.png" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Bolsas de Estudo com até 85% de Desconto - Bolsa Click" />
      <meta name="twitter:description" content="Cadastre-se grátis no Bolsa Click e encontre bolsas de até 85% para cursos presenciais e EAD." />
      <meta name="twitter:image" content="https://www.bolsaclick.com.br/assets/og-banner.png" />

      {/* Schema.org: Organização */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          }),
        }}
      />

      {/* Schema.org: Campo de busca no Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://www.bolsaclick.com.br/",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.bolsaclick.com.br/buscar-cursos?q={search_term_string}",
              "query-input": {
                "@type": "PropertyValueSpecification",
                "valueRequired": true,
                "valueName": "search_term_string"
              }
            }
          }),
        }}
      />

      {/* Schema.org: Programa Educacional com Bolsa */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOccupationalProgram",
            "name": "Bolsas de estudo com até 85% de desconto",
            "educationalProgramMode": ["online", "presencial", "semipresencial"],
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
              "description": "Inscreva-se gratuitamente para obter bolsas de estudo em universidades e escolas com até 85% de desconto."
            }
          }),
        }}
      />

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

      {/* Google Analytics GA4 */}
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
