export const themes = {
  bolsaclick: {
    name: 'Bolsa Click',
    title: 'Bolsa Click | Bolsas de Estudo com até 80% de Desconto',
    shortTitle: 'Bolsa Click',
    description: 'Bolsa Click é a plataforma de bolsas de estudo com até 80% de desconto nas maiores redes de ensino do Brasil. Graduação, pós, técnicos e EAD. Cadastre-se grátis!',
    favicon: '/favicon.ico',
    ogImage: 'https://www.bolsaclick.com.br/assets/og-image-bolsaclick.png',
    siteUrl: 'https://www.bolsaclick.com.br',
    twitter: '@bolsaclick',
  },
  anhanguera: {
    name: 'Anhanguera - Bolsa Click',
    title: 'Anhanguera Bolsas de Estudo',
    shortTitle: 'Faculdade Anhanguera',
    description: 'O Bolsa Click tem Bolsas de Estudo de até 80% nas maiores redes de ensino do Brasil, com polos em mais de 280 cidades. Graduação e pós, técnicos, idiomas',
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
