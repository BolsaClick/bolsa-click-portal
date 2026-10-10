import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { createStepTracker } from './checkout-steps'

function spy() {
  const eventos: Array<{ event: string; step?: unknown; name?: unknown; flow?: unknown }> = []
  const track = (event: string, props?: Record<string, unknown>) => {
    eventos.push({ event, step: props?.step_number, name: props?.step_name, flow: props?.checkout_flow })
  }
  return { eventos, track }
}

const CTX = { flow: 'estacio' as const, checkoutFlow: 'estacio_checkout' }
const ENDERECO = { n: 2, name: 'endereco' }

describe('createStepTracker — onde a pessoa parou', () => {
  it('started no primeiro foco, completed quando fica válido, um de cada', () => {
    const { eventos, track } = spy()
    const t = createStepTracker(track, CTX)
    t.start(ENDERECO)
    t.start(ENDERECO)
    t.complete(ENDERECO)
    t.complete(ENDERECO)
    assert.deepEqual(eventos, [
      { event: 'checkout_step_started', step: 2, name: 'endereco', flow: 'estacio_checkout' },
      { event: 'checkout_step_completed', step: 2, name: 'endereco', flow: 'estacio_checkout' },
    ])
  })

  it('bloco completado sem foco (autofill) emite started antes, para o par fechar', () => {
    const { eventos, track } = spy()
    createStepTracker(track, CTX).complete(ENDERECO)
    assert.deepEqual(eventos.map((e) => e.event), ['checkout_step_started', 'checkout_step_completed'])
  })

  it('quem começou e não completou fica só com started — é o sinal de abandono do bloco', () => {
    const { eventos, track } = spy()
    const t = createStepTracker(track, CTX)
    t.complete({ n: 1, name: 'estudante' })
    t.start(ENDERECO)
    const started = eventos.filter((e) => e.event === 'checkout_step_started').map((e) => e.name)
    const completed = eventos.filter((e) => e.event === 'checkout_step_completed').map((e) => e.name)
    assert.deepEqual(started, ['estudante', 'endereco'])
    assert.deepEqual(completed, ['estudante'])
  })
})
