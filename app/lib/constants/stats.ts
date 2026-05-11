export const stats = {
  bolsaclick: {
    maxDiscount: 95,
    institutionsCount: '30.000+',
    coursesCount: '100.000+',
    studentsCount: '+10k',
    partnersCount: '+25',
  },
  anhanguera: {
    maxDiscount: 85,
    institutionsCount: '30.000+',
    coursesCount: '100.000+',
    studentsCount: '+10k',
    partnersCount: '+25',
  },
} as const

export function getStats() {
  const theme = process.env.NEXT_PUBLIC_THEME || 'bolsaclick'
  return stats[theme as keyof typeof stats]
}
