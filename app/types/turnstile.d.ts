// Tipos do Cloudflare Turnstile (https://developers.cloudflare.com/turnstile)
// Declarado uma única vez aqui pra evitar conflitos entre múltiplos componentes
// que renderizam o widget. Sem `export {}` → vira ambient script, auto-incluído
// pelo tsconfig (`"include": ["**/*.ts"]`). NÃO importar este arquivo em
// runtime — `.d.ts` não é módulo, Next/webpack quebra no build.

interface TurnstileRenderOptions {
  sitekey: string
  callback: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
  theme?: 'light' | 'dark' | 'auto'
}

interface Window {
  turnstile?: {
    render: (el: string | HTMLElement, opts: TurnstileRenderOptions) => string
    reset: (widgetId?: string) => void
  }
}
