import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
