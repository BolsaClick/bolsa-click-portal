'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { CheckoutContext } from '@/app/lib/analytics/checkout-funnel'
import { createStepTracker, type CheckoutStep } from '@/app/lib/analytics/checkout-steps'

type TrackFn = Parameters<typeof createStepTracker>[0]

/**
 * Liga o rastreador de blocos ao estado do formulário. `steps[i].ok` é
 * recalculado a cada tecla; o rastreador garante um disparo por bloco.
 *
 * Devolve `startStep(n)`, para o `onFocus` (em captura) da seção do bloco.
 * `ctx` null = oferta ainda carregando: nada é emitido até ela existir.
 */
export function useCheckoutSteps(
  track: TrackFn,
  ctx: CheckoutContext | null,
  steps: Array<CheckoutStep & { ok: boolean }>,
) {
  const trackerRef = useRef<ReturnType<typeof createStepTracker> | null>(null)
  if (ctx && !trackerRef.current) trackerRef.current = createStepTracker(track, ctx)

  const okKey = steps.map((s) => (s.ok ? 1 : 0)).join('')
  useEffect(() => {
    const tracker = trackerRef.current
    if (!tracker) return
    for (const step of steps) if (step.ok) tracker.complete(step)
    // `okKey` resume `steps`: só re-roda quando algum bloco muda de estado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [okKey, ctx !== null])

  const stepsRef = useRef(steps)
  stepsRef.current = steps
  return useCallback((n: number) => {
    const step = stepsRef.current.find((s) => s.n === n)
    if (step) trackerRef.current?.start(step)
  }, [])
}
