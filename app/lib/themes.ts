import { seoSite } from './seo/site-config'

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
  bolsamais: {
    name: 'Bolsa Mais',
    title: 'Bolsa Mais | Encontre sua bolsa de estudo',
    shortTitle: 'Bolsa Mais',
    description: 'Encontre bolsas de estudo e compare cursos, modalidades e mensalidades para escolher sua próxima formação.',
    favicon: '/icon1.png',
    ogImage: 'https://www.bolsamais.com.br/icon1.png',
    siteUrl: 'https://www.bolsamais.com.br',
    twitter: '@bolsamais',
  },
} as const

export function getCurrentTheme() {
  return {
    ...themes[seoSite.key],
    name: seoSite.name,
    title: seoSite.title,
    shortTitle: seoSite.shortTitle,
    description: seoSite.description,
    favicon: seoSite.favicon,
    ogImage: seoSite.ogImage,
    siteUrl: seoSite.siteUrl,
  }
}
