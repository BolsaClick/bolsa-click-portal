export type SiteKey = 'bolsaclick' | 'bolsamais' | 'anhanguera'

export type SeoSiteConfig = {
  key: SiteKey
  name: string
  shortTitle: string
  /** Variações do nome da marca para schema.org — sinal de entidade, não repetir `name`. */
  alternateNames: string[]
  title: string
  description: string
  siteUrl: string
  host: string
  favicon: string
  ogImage: string
  logo: string
  twitter?: string
  editorialTeamPath: string
  indexingEnabled: boolean
}

function normalizedUrl(value: string): string {
  return value.replace(/\/+$/, '')
}

const selected = (process.env.NEXT_PUBLIC_THEME ?? 'bolsaclick') as SiteKey

const defaults: Record<SiteKey, Omit<SeoSiteConfig, 'indexingEnabled'>> = {
  bolsaclick: {
    key: 'bolsaclick',
    name: 'Bolsa Click',
    shortTitle: 'Bolsa Click',
    alternateNames: ['BolsaClick', 'Bolsa Click Brasil', 'bolsaclick.com.br'],
    title: 'Bolsa Click | Bolsas de Estudo com até 80% de Desconto',
    description: 'Bolsas de estudo para graduação, pós-graduação, cursos técnicos e EAD. Compare opções e faça sua inscrição grátis.',
    siteUrl: 'https://www.bolsaclick.com.br',
    host: 'www.bolsaclick.com.br',
    favicon: '/favicon.ico',
    ogImage: '/assets/og-image-bolsaclick.png',
    logo: '/assets/logo-bolsa-click-rosa.png',
    twitter: '@bolsaclick',
    editorialTeamPath: '/sobre/equipe-editorial',
  },
  bolsamais: {
    key: 'bolsamais',
    name: 'Bolsa Mais',
    shortTitle: 'Bolsa Mais',
    alternateNames: ['BolsaMais', 'bolsamais.com.br'],
    title: 'Bolsa Mais | Encontre sua bolsa de estudo',
    description: 'Encontre bolsas de estudo e compare cursos, modalidades e mensalidades para escolher sua próxima formação.',
    siteUrl: 'https://www.bolsamais.com.br',
    host: 'www.bolsamais.com.br',
    favicon: '/icon1.png',
    ogImage: '/icon1.png',
    logo: '/icon1.png',
    editorialTeamPath: '/sobre/equipe-editorial',
  },
  anhanguera: {
    key: 'anhanguera',
    name: 'Anhanguera - Bolsa Click',
    shortTitle: 'Faculdade Anhanguera',
    alternateNames: ['Anhanguera', 'anhangueracursos.com.br'],
    title: 'Anhanguera Bolsas de Estudo',
    description: 'Bolsas de estudo para cursos de graduação, pós-graduação, técnicos e idiomas.',
    siteUrl: 'https://www.anhangueracursos.com.br',
    host: 'www.anhangueracursos.com.br',
    favicon: '/favicon-anhanguera.png',
    ogImage: '/favicon-anhanguera.png',
    logo: '/favicon-anhanguera.png',
    twitter: '@bolsaclick',
    editorialTeamPath: '/sobre/equipe-editorial',
  },
}

const base = defaults[selected] ?? defaults.bolsaclick
const siteUrl = normalizedUrl(process.env.NEXT_PUBLIC_SITE_URL ?? base.siteUrl)

// A marca nova nasce em warmup. Liberar indexação exige uma decisão explícita
// no ambiente, nunca apenas um deploy ou a existência das rotas.
const indexingEnabled =
  selected !== 'bolsamais' || process.env.NEXT_PUBLIC_SEO_INDEXING_ENABLED === 'true'

export const seoSite: SeoSiteConfig = {
  ...base,
  siteUrl,
  host: new URL(siteUrl).host,
  ogImage: base.ogImage.startsWith('http') ? base.ogImage : `${siteUrl}${base.ogImage}`,
  logo: base.logo.startsWith('http') ? base.logo : `${siteUrl}${base.logo}`,
  indexingEnabled,
}

export function absoluteUrl(path = ''): string {
  if (!path) return seoSite.siteUrl
  if (/^https?:\/\//.test(path)) return path
  return `${seoSite.siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}

export function publicRobots(indexable = true): 'index, follow' | 'noindex, follow' {
  return seoSite.indexingEnabled && indexable ? 'index, follow' : 'noindex, follow'
}
