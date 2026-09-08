import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  trackCheckoutStepCompleted,
  trackCheckoutError,
  trackCheckoutViewed,
  trackEnrollmentConverted,
} from './checkout-funnel'

type Captured = { event: string; props: Record<string, unknown> }

function spy() {
  const eventos: Captured[] = []
  const track = (event: string, props?: Record<string, unknown>) => {
    eventos.push({ event, props: props ?? {} })
  }
  return { eventos, track }
}

const CTX = {
  flow: 'estacio' as const,
  checkoutFlow: 'estacio_checkout',
  brand: 'UNIVERSIDADE ESTÁCIO DE SÁ',
  modality: 'EAD',
  courseName: 'Arquivologia',
}

describe('checkout_flow chega em TODO evento do funil', () => {
  // O funil só fecha se o mesmo identificador atravessar da abertura à
  // conversão. Em 2026-09-08, `enrollment_converted` e `checkout_error` eram os
  // dois únicos que chegavam sem ele — o funil abria por fluxo e fechava
  // anônimo, e nenhuma conversão era atribuível a um checkout.
  it('viewed, step, error e converted carregam o mesmo checkout_flow', () => {
    const { eventos, track } = spy()

    trackCheckoutViewed(track, CTX)
    trackCheckoutStepCompleted(track, { ...CTX, stepNumber: 1, stepName: 'estudante' })
    trackCheckoutError(track, 'cep_autofill', new Error('falhou'), 'estacio_checkout')
    trackEnrollmentConverted(track, { ...CTX, value: 19.9 })

    assert.deepEqual(
      eventos.map((e) => e.event),
      ['checkout_viewed', 'checkout_step_completed', 'checkout_error', 'enrollment_converted'],
    )
    for (const e of eventos) {
      assert.equal(e.props.checkout_flow, 'estacio_checkout', `${e.event} sem checkout_flow`)
    }
  })

  it('trackCheckoutError sem fluxo continua funcionando (chamador antigo)', () => {
    const { eventos, track } = spy()
    trackCheckoutError(track, 'algum_passo', new Error('x'))
    assert.equal(eventos[0].props.checkout_flow, undefined)
    assert.equal(eventos[0].props.step, 'algum_passo')
  })
})

describe('trackCheckoutStepCompleted', () => {
  it('identifica o passo por número E por nome', () => {
    const { eventos, track } = spy()
    trackCheckoutStepCompleted(track, { ...CTX, stepNumber: 2, stepName: 'endereco' })
    assert.equal(eventos[0].props.step_number, 2)
    assert.equal(eventos[0].props.step_name, 'endereco')
    // Contexto da oferta preservado — sem ele não dá para quebrar o abandono
    // por marca/modalidade, que é o motivo de medir passo a passo.
    assert.equal(eventos[0].props.brand, 'UNIVERSIDADE ESTÁCIO DE SÁ')
    assert.equal(eventos[0].props.course_name, 'Arquivologia')
  })
})

describe('trackCheckoutError', () => {
  it('nunca derruba o checkout, mesmo se o track explodir', () => {
    const explode = () => {
      throw new Error('posthog fora do ar')
    }
    assert.doesNotThrow(() => trackCheckoutError(explode, 'passo', new Error('x'), 'f'))
  })

  it('sanitiza a mensagem antes de enviar (pode ecoar CPF/e-mail digitado)', () => {
    const { eventos, track } = spy()
    trackCheckoutError(track, 'cpf_validation', new Error('CPF 529.982.247-25 inválido'), 'f')
    const msg = String(eventos[0].props.error_message)
    assert.ok(!msg.includes('529.982.247-25'), `mensagem não sanitizada: ${msg}`)
  })
})
