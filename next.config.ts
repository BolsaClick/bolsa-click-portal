import type { NextConfig } from "next";

// Content-Security-Policy em modo Report-Only.
// Estratégia: coletar violações em /api/csp-report por 1-2 semanas pra
// completar a whitelist, depois trocar a chave do header pra
// "Content-Security-Policy" (enforce). Em Report-Only nada é bloqueado.
//
// Whitelist construída a partir dos integrações conhecidas do projeto:
//   - Stripe (checkout cartão)            - PostHog (analytics)
//   - GTM / Google Analytics              - Meta Pixel
//   - TikTok Pixel + Events API           - UTMify (pixel + Orders API)
//   - Firebase Auth + Firestore           - Tigris Storage (imagens)
//   - Notealy (server-side, não importa pro CSP do browser)
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  // Inline scripts são usados pelo Next (hydration tokens) e pelos pixels;
  // 'unsafe-inline' é necessário até migrarmos pra nonces.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.utmify.com.br https://analytics.tiktok.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://us-assets.i.posthog.com https://apis.google.com https://www.gstatic.com https://va.vercel-scripts.com",
  // Styles: Tailwind injeta inline; Google Fonts CSS é externo.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // Imagens: data: pra QR Codes PIX, blob: pra previews, https: pra CDN/remotePatterns.
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob:",
  // Fetch / XHR / WebSocket — todas as APIs first-party + integrações.
  "connect-src 'self' https://api.stripe.com https://us.i.posthog.com https://us-assets.i.posthog.com https://api.utmify.com.br https://analytics.tiktok.com https://www.google-analytics.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://*.facebook.com https://thanos.notealy.com https://tartarus-api.inovitdigital.com.br https://elysium-api.inovitdigital.com.br https://t3.storageapi.dev https://bolsa-click.fly.storage.tigris.dev https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://*.firebaseio.com",
  // iframes: Stripe Elements, GTM noscript pixel.
  "frame-src 'self' https://js.stripe.com https://www.googletagmanager.com https://www.facebook.com",
  // Frame ancestors — quem pode embedar o site (Clickjacking).
  "frame-ancestors 'self'",
  // Form actions — pra onde formulários podem submeter.
  "form-action 'self' https://api.stripe.com",
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
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
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
    return courseDupes.flatMap(([from, to]) => [
      { source: `/cursos/${from}`, destination: `/cursos/${to}`, permanent: true },
      { source: `/carreiras/${from}`, destination: `/carreiras/${to}`, permanent: true },
    ])
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
