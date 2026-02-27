export const themes = {
  bolsaclick: {
    name: 'Bolsa Click',
    title: 'Bolsa Click - Bolsas de Estudo até 95% | 30.000+ Faculdades | 100.000+ Cursos',
    shortTitle: 'Bolsa Click - Bolsas de Estudo',
    description: 'Bolsa Click é a plataforma de bolsas de estudo com até 95% de desconto em mais de 30.000 faculdades. Graduação, pós-graduação, técnicos e EAD. Cadastre-se grátis!',
    favicon: '/favicon.ico',
    ogImage: 'https://www.bolsaclick.com.br/assets/og-image-bolsaclick.png',
    siteUrl: 'https://www.bolsaclick.com.br',
    twitter: '@bolsaclick',
  },
  anhanguera: {
    name: 'Anhanguera - Bolsa Click',
    title: 'Anhanguera Bolsas de Estudo',
    shortTitle: 'Faculdade Anhanguera',
    description: 'O Bolsa Click tem Bolsas de Estudo de até 85% em mais de 30.000 Escolas e Faculdades em todo Brasil. Graduação e pós, educação básica, técnicos, idiomas',
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
