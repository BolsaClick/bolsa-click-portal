// Tipos do Cloudflare Turnstile (https://developers.cloudflare.com/turnstile)
// Declarado uma única vez aqui pra evitar conflitos entre múltiplos componentes
// que renderizam o widget.

interface TurnstileRenderOptions {
  sitekey: string
  callback: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
  theme?: 'light' | 'dark' | 'auto'
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: string | HTMLElement, opts: TurnstileRenderOptions) => string
      reset: (widgetId?: string) => void
    }
  }
}

export {}
