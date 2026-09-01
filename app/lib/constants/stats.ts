// CLAUDE.md: nunca inventar números. Fallback estático usado por components
// CLIENT-ONLY (Stats.tsx — Framer Motion). Servers DEVEM usar
// `getTrustData()` de @/app/lib/trust pra contagem real via Prisma.
// Bases verificáveis: 6 redes ativas (prisma.institution — Anhanguera,
// Unopar, Pitágoras, Estácio, Unime, Wyden), polos em 283 cidades
// (estudo Panorama Bolsa 2026), +1.000 estudantes beneficiados.
// Teto de desconto: DISCOUNT_CEILING_PCT (app/lib/copy/claims.ts).
import { DISCOUNT_CEILING_PCT } from '@/app/lib/copy/claims'

export const stats = {
  bolsaclick: {
    maxDiscount: DISCOUNT_CEILING_PCT,
    citiesCount: '280+',
    studentsCount: '+1.000',
    partnersCount: '6',
  },
  anhanguera: {
    maxDiscount: DISCOUNT_CEILING_PCT,
    citiesCount: '280+',
    studentsCount: '+1.000',
    partnersCount: '6',
  },
} as const

export function getStats() {
  const theme = process.env.NEXT_PUBLIC_THEME || 'bolsaclick'
  return stats[theme as keyof typeof stats]
}
