/**
 * Heurística server-side (por User-Agent) pra saber se a requisição
 * provavelmente vem de um celular, ANTES de qualquer JS rodar no cliente.
 *
 * "Mobi" é o sinal recomendado pelo próprio Google pra dynamic serving
 * (https://developers.google.com/search/mobile-sites/mobile-seo/dynamic-serving)
 * — está presente em praticamente todo UA de navegador de celular: Chrome
 * Android manda "...Mobile Safari/...", Safari iOS manda ".../Mobile/...".
 * iPad moderno (que pede o site desktop por padrão) NÃO contém "Mobi" e
 * cai no ramo desktop — correto, já que sua viewport também costuma ficar
 * perto ou acima do breakpoint `lg` (1024px).
 *
 * É só uma heurística de *primeiro render*: `useIsDesktopViewport` confirma
 * (ou corrige) no cliente via `matchMedia`, então um UA ambíguo nunca trava
 * o usuário no estado errado — só custa um re-render extra.
 */
export function isMobileUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false
  return /Mobi/i.test(userAgent)
}
