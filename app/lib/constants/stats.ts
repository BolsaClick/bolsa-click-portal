// CLAUDE.md: nunca inventar números. Fallback estático usado por components
// CLIENT-ONLY (Stats.tsx — Framer Motion). Servers DEVEM usar
// `getTrustData()` de @/app/lib/trust pra contagem real via Prisma.
// Bases verificáveis: 6 redes ativas (prisma.institution — Anhanguera,
// Unopar, Pitágoras, Estácio, Unime, Wyden), polos em 283 cidades
// (estudo Panorama Bolsa 2026), +1.000 estudantes beneficiados.
// Teto de desconto: DISCOUNT_CEILING_PCT (app/lib/copy/claims.ts).
//
// Os números por site moram em app/lib/site/brands.ts junto com o resto do
// que varia por marca. Antes havia um Record próprio aqui com só 2 das 3
// chaves de SiteKey, e `getStats()` devolvia undefined no terceiro site.
import { siteBrand, getSiteBrand, type SiteKey } from '@/app/lib/site/brands'

export type SiteStats = (typeof siteBrand)['stats']

export function getStats(site?: SiteKey): SiteStats {
  return site ? getSiteBrand(site).stats : siteBrand.stats
}
