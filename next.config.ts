import type { NextConfig } from "next";

// Content-Security-Policy em modo Report-Only.
// Estratégia: coletar violações em /api/csp-report por 1-2 semanas pra
// completar a whitelist, depois trocar a chave do header pra
// "Content-Security-Policy" (enforce). Em Report-Only nada é bloqueado.
//
// Whitelist construída a partir dos integrações conhecidas do projeto:
//   - PostHog (analytics)                 - Meta Pixel
//   - GTM / Google Analytics
//   - TikTok Pixel + Events API           - UTMify (pixel + Orders API)
//   - Firebase Auth + Firestore           - Tigris Storage (imagens)
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  // Inline scripts são usados pelo Next (hydration tokens) e pelos pixels;
  // 'unsafe-inline' é necessário até migrarmos pra nonces.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.utmify.com.br https://analytics.tiktok.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://us-assets.i.posthog.com https://apis.google.com https://www.gstatic.com https://va.vercel-scripts.com",
  // Styles: Tailwind injeta inline; Google Fonts CSS é externo.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // Imagens: data: pra QR Codes PIX, blob: pra previews, https: pra CDN/remotePatterns.
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob:",
  // Fetch / XHR / WebSocket — todas as APIs first-party + integrações.
  // PostHog agora é servido via proxy same-origin (/ingest/*, ver rewrites()
  // abaixo) — us.i.posthog.com / us-assets.i.posthog.com deixam de ser
  // chamados pelo browser, mas ficam na whitelist como fallback defensivo.
  // us.posthog.com (ui_host) é novo: usado pelo SDK pros links do toolbar/
  // dashboard apontarem pro domínio certo do PostHog em vez do proxy.
  "connect-src 'self' https://hermes.bolsamais.com.br https://us.i.posthog.com https://us-assets.i.posthog.com https://us.posthog.com https://api.utmify.com.br https://analytics.tiktok.com https://www.google-analytics.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://*.facebook.com https://tartarus-api.inovitdigital.com.br https://elysium-api.inovitdigital.com.br https://t3.storageapi.dev https://bolsa-click.fly.storage.tigris.dev https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://*.firebaseio.com",
  // iframes: GTM noscript pixel + checkout embutido da Cogna na tela de sucesso.
  // kroton.platosedu.io é o checkout de pós/profissionalizante, que permite embed
  // (o de graduação, pay.anhanguera.com, responde frame-ancestors 'self' e não).
  // A CSP hoje é Report-Only; declarar já evita o bloqueio quando virar enforce.
  // us.posthog.com: toolbar do PostHog (iframe), quando habilitado via ui_host.
  "frame-src 'self' https://www.googletagmanager.com https://www.facebook.com https://kroton.platosedu.io https://us.posthog.com",
  // Frame ancestors — quem pode embedar o site (Clickjacking).
  "frame-ancestors 'self'",
  // Form actions — pra onde formulários podem submeter.
  "form-action 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "upgrade-insecure-requests",
  // Onde mandar os relatórios. Mantemos report-uri (legacy) + report-to
  // (Reporting API moderna) — cobertura cross-browser.
  "report-uri /api/csp-report",
  "report-to csp-endpoint",
].join('; ')

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Tree-shaking agressivo das libs mais usadas — reduz JS bundle final
  // (lucide-react sozinha pode economizar 50-100KiB em pages que usam poucos ícones)
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@phosphor-icons/react',
      'framer-motion',
      'date-fns',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.pagar.me' },
      { protocol: 'https', hostname: 'pagar.me' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 't3.storageapi.dev' },
      { protocol: 'https', hostname: 'bolsa-click.fly.storage.tigris.dev' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          // CSP em Report-Only: nada é bloqueado, mas violações são enviadas
          // pra /api/csp-report. Depois de 1-2 semanas auditando, trocar a
          // chave pra "Content-Security-Policy" (enforce).
          { key: 'Content-Security-Policy-Report-Only', value: CSP_REPORT_ONLY },
          // Reporting API (browsers modernos) — endpoint chamado "csp-endpoint"
          // é referenciado pelo "report-to" dentro da CSP.
          {
            key: 'Report-To',
            value: JSON.stringify({
              group: 'csp-endpoint',
              max_age: 10886400,
              endpoints: [{ url: '/api/csp-report' }],
            }),
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/assets/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Edge cache pras páginas ISR. s-maxage define cache CDN; swr serve
      // versão antiga enquanto revalida em background. Páginas mais "frias"
      // (blog/carreiras) ganham TTL maior; /faculdade-ead é estável (1h).
      {
        source: '/cursos/:slug*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/faculdades/:slug*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/bolsas-de-estudo/:slug*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/carreiras/:slug*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/blog/:slug*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/faculdade-ead',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/bolsas/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/como-conseguir-bolsa-de-estudo',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      // Chunk do SDK carregado sob demanda (ex.: session replay); vive no
      // host de assets, não no de ingestão — path próprio na doc oficial do
      // PostHog (posthog.com/docs/advanced/proxy/nextjs).
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      // Catch-all: ingestão de eventos, /flags, /decide etc. — precisa vir
      // DEPOIS das regras mais específicas acima (static/array), senão elas
      // nunca seriam alcançadas.
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/utm/:path*",
        destination: "https://cdn.utmify.com.br/:path*",
      },
    ];
  },
  async redirects() {
    // Canonicaliza slugs duplicados/bugados que vêm da API Tartarus pra suas
    // versões canônicas no nosso catálogo enriched. Evita conteúdo duplicado
    // e preserva autoridade SEO via 301 caso algum link externo aponte pra
    // essas variantes.
    const courseDupes = [
      ['letras-portuguesingles', 'letras-portugues-e-ingles-bacharelado'],
      ['engenharia-de-controle-de-automacao', 'engenharia-de-controle-e-automacao-bacharelado'],
      ['cst-em-mecatronica-industrial', 'mecatronica-industrial-tecnologo'],
      ['cst-em-automacao-industrial', 'automacao-industrial-tecnologo'],
    ]
    // Posts de blog duplicados: uma rodada de geração criou variante com sufixo
    // `-2026-07` em vez de atualizar o post existente, e as duas versões ficaram
    // vivas competindo pela mesma query. Três dos quatro pares são termos de
    // dinheiro (prouni, desconto em faculdade, bolsa pra quem trabalha), então a
    // canibalização estava batendo justamente nos posts de maior valor.
    //
    // O sobrevivente é sempre o slug limpo — URL melhor e, em três dos quatro
    // casos, também o texto mais longo. O 301 tem que ir pro ar ANTES de
    // desativar o duplicado: `app/blog/[slug]/page.tsx` filtra por isActive, e
    // sem redirect a URL desativada viraria 404, jogando fora a autoridade.
    const blogDupes = [
      [
        'prouni-2026-inscricao-notas-de-corte-como-usar-2026-07',
        'prouni-2026-inscricao-notas-de-corte-como-usar',
      ],
      [
        'desconto-em-faculdade-diferenca-prouni-fies-bolsa-direta-2026-07',
        'desconto-em-faculdade-diferenca-prouni-fies-bolsa-direta',
      ],
      [
        'bolsas-de-estudo-para-quem-ja-trabalha-opcoes-como-concorrer-2026-07',
        'bolsas-de-estudo-para-quem-ja-trabalha-opcoes-como-concorrer',
      ],
      [
        'quem-foi-louis-pasteur-descobertas-medicina-2026-07',
        'quem-foi-louis-pasteur-descobertas-medicina',
      ],
      // Pares que já estavam resolvidos no banco (duplicata inativa), mas cuja
      // URL antiga pode ter link externo apontando — 301 em vez de 404.
      [
        'diferenca-entre-bacharelado-licenciatura-e-tecnologo-qual-escolher-2026-07',
        'diferenca-entre-bacharelado-licenciatura-e-tecnologo-qual-escolher',
      ],
      [
        'o-que-e-computacao-em-nuvem-por-que-empresas-querem-profissionais',
        'computacao-em-nuvem-o-que-e-por-que-empresas-querem-profissionais',
      ],
      [
        'o-que-e-computacao-em-nuvem-por-que-empresas-querem-profissionais-2026-07',
        'computacao-em-nuvem-o-que-e-por-que-empresas-querem-profissionais',
      ],
    ]
    return [
      ...courseDupes.flatMap(([from, to]) => [
        { source: `/cursos/${from}`, destination: `/cursos/${to}`, permanent: true },
        { source: `/carreiras/${from}`, destination: `/carreiras/${to}`, permanent: true },
      ]),
      ...blogDupes.map(([from, to]) => ({
        source: `/blog/${from}`,
        destination: `/blog/${to}`,
        permanent: true,
      })),
      // URL "natural" que não existe (a central de ajuda é /central-de-ajuda).
      // 301 pra não devolver 404 a backlink externo/citação que chute esse path
      // (a auditoria GEO flagou o /perguntas-frequentes → 404).
      { source: '/perguntas-frequentes', destination: '/central-de-ajuda', permanent: true },
      { source: '/faq/perguntas-frequentes', destination: '/central-de-ajuda', permanent: true },
    ]
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
