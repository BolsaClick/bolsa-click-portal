/**
 * Executa `cb` quando o navegador estiver ocioso, com teto de 5s.
 *
 * Serve para tirar trabalho pesado de terceiros do caminho da hidratação: o
 * main thread já está ocupado montando a página, e competir com ele é o que
 * empurra o INP acima de 200ms. Fora do browser (SSR) não faz nada.
 *
 * Vivia duplicado dentro do PostHogProvider; virou módulo quando o AuthContext
 * passou a precisar do mesmo comportamento.
 */
export function whenIdle(cb: () => void): void {
  if (typeof window === 'undefined') return
  const win = window as typeof window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number
  }
  if (typeof win.requestIdleCallback === 'function') {
    win.requestIdleCallback(cb, { timeout: 5000 })
  } else {
    setTimeout(cb, 1)
  }
}
