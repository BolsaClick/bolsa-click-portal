// Parte de `banners.ts` segura pro cliente: sem Prisma, sem `probe-image-size`
// (que arrasta `needle` → `fs`, inexistente no browser). Importado tanto por
// código server quanto por componentes `'use client'` (ex.: app/admin/banners/page.tsx)
// — ver `banners.ts` pro que é exclusivo de servidor.
import type { SiteKey } from '@/app/lib/seo/site-config'

/** Sites que existem hoje pra segmentação de banner — ver `SiteKey`. */
export const BANNER_SITE_KEYS: SiteKey[] = ['bolsaclick', 'bolsamais', 'anhanguera']

export function isValidSiteKey(value: unknown): value is SiteKey {
  return typeof value === 'string' && (BANNER_SITE_KEYS as string[]).includes(value)
}

export interface PublicBanner {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  linkUrl: string | null
  // Dimensões REAIS do arquivo (não as do card/design), pra caixa do
  // carrossel seguir a proporção de cada imagem sem cortar — ver
  // `probeBannerDimensions` em `banners.ts` e o comentário no topo do HeroBannerSlider.
  width: number
  height: number
}
