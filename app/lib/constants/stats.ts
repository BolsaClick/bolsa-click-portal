// CLAUDE.md: nunca inventar números. Fallback estático usado por components
// CLIENT-ONLY (Stats.tsx — Framer Motion). Servers DEVEM usar
// `getTrustData()` de @/app/lib/trust pra contagem real via Prisma.
// Bases verificáveis: 6 redes ativas (prisma.institution — Anhanguera,
// Unopar, Pitágoras, Estácio, Unime, Wyden), polos em 283 cidades
// (estudo Panorama Bolsa 2026), +1.000 estudantes beneficiados.
// Teto 78%: vitrine home Publicidade e Propaganda presencial SP.
export const stats = {
  bolsaclick: {
    maxDiscount: 78,
    citiesCount: '280+',
    studentsCount: '+1.000',
    partnersCount: '6',
  },
  anhanguera: {
    maxDiscount: 78,
    citiesCount: '280+',
    studentsCount: '+1.000',
    partnersCount: '6',
  },
} as const

export function getStats() {
  const theme = process.env.NEXT_PUBLIC_THEME || 'bolsaclick'
  return stats[theme as keyof typeof stats]
}
