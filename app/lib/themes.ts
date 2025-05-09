export const themes = {
  bolsaclick: {
    name: 'Bolsa Click',
    title: 'Bolsa Click - Até 80% de Desconto em Faculdades',
    shortTitle: 'Bolsa Click',
    description: 'Compare bolsas de estudo com até 80% de desconto em faculdades de todo o Brasil.',
    favicon: '/favicon.png',
    ogImage: 'https://www.bolsaclick.com.br/favicon.png',
    siteUrl: 'https://www.bolsaclick.com.br',
    twitter: '@bolsaclick',
  },
  anhanguera: {
    name: 'Anhanguera - Bolsa Click',
    title: 'Anhanguera Bolsas de Estudo',
    shortTitle: 'Faculdade Anhanguera',
    description: 'Garanta sua vaga na Anhanguera com bolsas de até 70% de desconto.',
    favicon: '/favicon-anhanguera.png',
    ogImage: 'https://www.anhangueracursos.com.br/favicon-anhanguera.png',
    siteUrl: 'https://www.anhangueracursos.com.br',
    twitter: '@bolsaclick',
  },
} as const

export function getCurrentTheme() {
  const theme = process.env.NEXT_PUBLIC_THEME || 'bolsaclick'
  return themes[theme as keyof typeof themes]
}
