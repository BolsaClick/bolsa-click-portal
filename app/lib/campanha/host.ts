/**
 * Detecção do host de campanha `campanha.anhangueracursos.com.br`.
 *
 * É o MESMO deploy/tema do anhanguera-cursos (`NEXT_PUBLIC_THEME=anhanguera`,
 * ver app/lib/themes.ts) — só um domínio extra apontado pro mesmo serviço
 * Railway (ver infra em docs internos). A diferença de comportamento (pagar
 * a matrícula no nosso gateway em vez do CognaPay, origem distinta no Attio)
 * é decidida em runtime por HOST, nunca por env — por isso este helper existe
 * como fonte única de verdade: qualquer lugar que precise saber "estou no
 * host de campanha?" usa ele, em vez de comparar a string na mão.
 *
 * Fora deste host (anhanguera-cursos "normal", bolsaclick, bolsamais), todo
 * `isCampanhaAnhangueraHost*` retorna false e nenhum comportamento muda.
 */
export const CAMPANHA_ANHANGUERA_HOST = 'campanha.anhangueracursos.com.br'

/** Tira porta e um eventual `www.` antes de comparar. */
function normalizeHost(host: string): string {
  return host.split(':')[0].toLowerCase().replace(/^www\./, '')
}

/** Server-side: passe `request.headers.get('host')`. */
export function isCampanhaAnhangueraHost(host: string | null | undefined): boolean {
  if (!host) return false
  return normalizeHost(host) === CAMPANHA_ANHANGUERA_HOST
}

/**
 * Client-side: lê `window.location.hostname`. Sempre `false` no servidor
 * (SSR) — quem usa isto num componente cliente deve fazer a checagem real
 * dentro de um `useEffect` (e guardar o resultado em estado) pra não gerar
 * mismatch de hidratação entre o HTML do servidor e o do browser.
 */
export function isCampanhaAnhangueraHostClient(): boolean {
  if (typeof window === 'undefined') return false
  return isCampanhaAnhangueraHost(window.location.hostname)
}
