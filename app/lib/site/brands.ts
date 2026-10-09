/**
 * Fonte única de verdade do que muda entre os sites que rodam este código.
 *
 * Antes deste arquivo, `NEXT_PUBLIC_THEME` era comparado como string solta em
 * 12 lugares (Header, Header/New, SecureHeader, SecureFooter, Footer,
 * AboutSection, stats.ts, os dois SuccessClient, WebVitalsReporter,
 * site-config e tailwind.config). Cada site novo multiplicava esses ramos, e
 * dois deles indexavam um Record incompleto — `colorsByTheme` e `stats` só
 * tinham duas das três chaves de `SiteKey`, então subir com
 * NEXT_PUBLIC_THEME=bolsamais quebrava no carregamento do config do Tailwind.
 *
 * Regra daqui pra frente: nenhum componente lê `process.env.NEXT_PUBLIC_THEME`.
 * Lê `siteBrand`. Acrescentar site = acrescentar uma entrada em SITE_BRANDS.
 *
 * `resolveSiteKey` existe pra que tema desconhecido caia no default em vez de
 * devolver `undefined` e estourar duas camadas adiante.
 */

import { DISCOUNT_CEILING_PCT } from '../copy/claims'

export type SiteKey = 'bolsaclick' | 'bolsamais' | 'anhanguera'

export const DEFAULT_SITE_KEY: SiteKey = 'bolsaclick'

/** Rampa de 11 tons usada pelo Tailwind como escala `emerald-*` do site. */
export type ColorRamp = {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

export type SiteBrand = {
  key: SiteKey

  /** Paleta consumida por tailwind.config.ts. */
  primary: string
  secondary: string
  ramp: ColorRamp

  /** Logo sobre fundo claro. */
  logoColor: string
  /** Logo sobre fundo escuro/colorido. */
  logoWhite: string

  /** Classe de fundo da faixa colorida do Header. */
  headerAccentClass: string

  /** Central de ajuda da marca. */
  helpCenterUrl: string

  /**
   * Nome do evento de sucesso empurrado no dataLayer do GTM. Os dois sites
   * antigos usam nomes diferentes por motivo histórico de tagueamento — não
   * unificar sem alinhar com quem mantém o GTM.
   */
  dataLayerSuccessEvent: string

  /**
   * Números de confiança do fallback client-only. CLAUDE.md: nunca inventar.
   * Server components devem usar `getTrustData()` de @/app/lib/trust.
   */
  stats: {
    maxDiscount: number
    citiesCount: string
    studentsCount: string
    partnersCount: string
  }

  /**
   * Depoimentos citam "Bolsa Click" no corpo do texto, então só podem aparecer
   * no site que leva esse nome.
   */
  showTestimonials: boolean
}

const BOLSACLICK_RAMP: ColorRamp = {
  50: '#e7f0fa',
  100: '#d0e0f5',
  200: '#a6c4e6',
  300: '#7da9d8',
  400: '#548dca',
  500: '#023e73',
  600: '#02345f',
  700: '#022a4c',
  800: '#011f39',
  900: '#011525',
  950: '#000a12',
}

export const SITE_BRANDS: Record<SiteKey, SiteBrand> = {
  bolsaclick: {
    key: 'bolsaclick',
    primary: '#023e73',
    secondary: '#f21d44',
    ramp: BOLSACLICK_RAMP,
    logoColor: '/assets/logo-bolsa-click-rosa.png',
    logoWhite: '/assets/logo-bolsa-click-branco.png',
    headerAccentClass: 'bg-emerald-700',
    helpCenterUrl: 'https://ajuda.bolsaclick.com.br/pt-br/',
    dataLayerSuccessEvent: 'formBSuccess',
    stats: {
      maxDiscount: DISCOUNT_CEILING_PCT,
      citiesCount: '280+',
      studentsCount: '+1.000',
      partnersCount: '6',
    },
    showTestimonials: true,
  },

  anhanguera: {
    key: 'anhanguera',
    primary: '#f94d12',
    secondary: '#17375c',
    ramp: {
      50: '#fff7f3',
      100: '#ffece6',
      200: '#ffd2c2',
      300: '#ffb299',
      400: '#fca96c',
      500: '#f94d12',
      600: '#d63c06',
      700: '#b12f03',
      800: '#8a2302',
      900: '#6b1b01',
      950: '#4a0f00',
    },
    logoColor: '/assets/logo-anhanguera-bolsa-click.svg',
    logoWhite: '/assets/logo-anhanguera-bolsa-click-branco.svg',
    headerAccentClass: 'bg-[#d63c06]',
    helpCenterUrl: 'https://ajuda.anhangueracursos.com.br/pt-br/',
    dataLayerSuccessEvent: 'formSuccess',
    stats: {
      maxDiscount: DISCOUNT_CEILING_PCT,
      citiesCount: '280+',
      studentsCount: '+1.000',
      partnersCount: '6',
    },
    showTestimonials: false,
  },

  /**
   * Marca em warmup: já existia em `SiteKey` e em `site-config`, mas nunca
   * teve paleta nem logo próprios — por isso quebrava no Tailwind. Os valores
   * abaixo são PROVISÓRIOS e deliberadamente herdam a paleta do Bolsa Click
   * pra que o site suba; trocar por identidade própria antes de liberar
   * indexação (`NEXT_PUBLIC_SEO_INDEXING_ENABLED`).
   */
  bolsamais: {
    key: 'bolsamais',
    primary: '#023e73',
    secondary: '#f21d44',
    ramp: BOLSACLICK_RAMP,
    logoColor: '/icon1.png',
    logoWhite: '/icon1.png',
    headerAccentClass: 'bg-emerald-700',
    helpCenterUrl: 'https://ajuda.bolsaclick.com.br/pt-br/',
    dataLayerSuccessEvent: 'formBSuccess',
    stats: {
      maxDiscount: DISCOUNT_CEILING_PCT,
      citiesCount: '280+',
      studentsCount: '+1.000',
      partnersCount: '6',
    },
    showTestimonials: false,
  },
}

export const SITE_KEYS = Object.keys(SITE_BRANDS) as SiteKey[]

export function isSiteKey(value: unknown): value is SiteKey {
  // hasOwnProperty, não `in`: `'toString' in SITE_BRANDS` é true pelo
  // prototype e faria 'toString' passar por SiteKey válido.
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(SITE_BRANDS, value)
  )
}

/** Tema desconhecido ou ausente cai no default em vez de estourar. */
export function resolveSiteKey(value?: string | null): SiteKey {
  return isSiteKey(value) ? value : DEFAULT_SITE_KEY
}

export function getSiteBrand(value?: string | null): SiteBrand {
  return SITE_BRANDS[resolveSiteKey(value)]
}

/**
 * Marca do site atual. `process.env.NEXT_PUBLIC_THEME` é inlinado em build
 * time pelo Next, então isto resolve igual no servidor e no cliente — é o que
 * permite ler a marca direto na renderização, sem useEffect.
 */
export const siteBrand: SiteBrand = getSiteBrand(process.env.NEXT_PUBLIC_THEME)
