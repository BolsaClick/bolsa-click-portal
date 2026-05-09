export const CONSENT_VERSION = 1
export const CONSENT_STORAGE_KEY = 'bc_consent_v1'
export const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 ano

export type ConsentCategory =
  | 'necessary'
  | 'analytics'
  | 'marketing'
  | 'personalization'

export type ConsentCategoriesState = Record<ConsentCategory, boolean>

export type ConsentState = {
  version: number
  ts: number
  categories: ConsentCategoriesState
}

export const DEFAULT_DENIED: ConsentCategoriesState = {
  necessary: true,
  analytics: false,
  marketing: false,
  personalization: false,
}

export const ALL_ACCEPTED: ConsentCategoriesState = {
  necessary: true,
  analytics: true,
  marketing: true,
  personalization: true,
}

export const CATEGORY_META: Record<
  ConsentCategory,
  { label: string; description: string; locked?: boolean }
> = {
  necessary: {
    label: 'Necessários',
    description:
      'Essenciais para o funcionamento do site — login, favoritos, atendimento. Não podem ser desativados.',
    locked: true,
  },
  analytics: {
    label: 'Analytics',
    description:
      'Nos ajudam a entender como você usa o site para melhorarmos a experiência (Google Analytics, PostHog).',
  },
  marketing: {
    label: 'Marketing',
    description:
      'Permitem mostrar bolsas e cursos relevantes em outras plataformas (Meta Pixel, Google Tag Manager, UTMify).',
  },
  personalization: {
    label: 'Personalização',
    description:
      'Adaptam o conteúdo e as recomendações de bolsa ao seu perfil de busca.',
  },
}
