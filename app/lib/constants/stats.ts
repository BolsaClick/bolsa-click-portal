// CLAUDE.md: nunca inventar números. Fallback estático usado por components
// CLIENT-ONLY (Stats.tsx — Framer Motion). Servers DEVEM usar
// `getTrustData()` de @/app/lib/trust pra contagem real via Prisma.
// Bases verificáveis: 5 redes ativas (prisma.institution), polos em 283
// cidades (estudo Panorama Bolsa 2026), +1.000 estudantes beneficiados.
export const stats = {
  bolsaclick: {
    maxDiscount: 80,
    citiesCount: '280+',
    studentsCount: '+1.000',
    partnersCount: '5',
  },
  anhanguera: {
    maxDiscount: 85,
    citiesCount: '280+',
    studentsCount: '+1.000',
    partnersCount: '5',
  },
} as const

export function getStats() {
  const theme = process.env.NEXT_PUBLIC_THEME || 'bolsaclick'
  return stats[theme as keyof typeof stats]
}
