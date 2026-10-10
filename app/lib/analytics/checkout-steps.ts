import {
  trackCheckoutStepCompleted,
  trackCheckoutStepStarted,
  type CheckoutContext,
} from './checkout-funnel'

type TrackFn = Parameters<typeof trackCheckoutStepStarted>[0]

export interface CheckoutStep {
  n: number
  name: string
}

/**
 * Rastreador dos blocos do formulário — o mesmo nos dois checkouts.
 *
 * Cada bloco emite `checkout_step_started` uma vez (primeiro foco) e
 * `checkout_step_completed` uma vez (primeira vez que fica válido). Voltar
 * atrás e redigitar não conta de novo — inflaria justamente o degrau que a
 * gente quer medir.
 *
 * Bloco que completa sem foco (autofill de quem está logado, ViaCEP) emite o
 * `started` antes do `completed`: o par precisa fechar para "parou no bloco X"
 * (started sem completed) não contar essa pessoa como desistente.
 */
export function createStepTracker(track: TrackFn, ctx: CheckoutContext) {
  const started = new Set<number>()
  const completed = new Set<number>()

  const start = (step: CheckoutStep) => {
    if (started.has(step.n)) return
    started.add(step.n)
    trackCheckoutStepStarted(track, { ...ctx, stepNumber: step.n, stepName: step.name })
  }

  const complete = (step: CheckoutStep) => {
    if (completed.has(step.n)) return
    start(step)
    completed.add(step.n)
    trackCheckoutStepCompleted(track, { ...ctx, stepNumber: step.n, stepName: step.name })
  }

  return { start, complete }
}
