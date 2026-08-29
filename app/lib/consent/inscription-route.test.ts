import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { isInscriptionRoute } from './inscription-route'

describe('isInscriptionRoute', () => {
  it('covers every checkout / matricula inscription rail', () => {
    assert.equal(isInscriptionRoute('/checkout/estacio'), true)
    assert.equal(isInscriptionRoute('/checkout/matricula'), true)
    assert.equal(isInscriptionRoute('/checkout/matricula/sucesso'), true)
    assert.equal(isInscriptionRoute('/checkout'), true)
    assert.equal(isInscriptionRoute('/matricula'), true)
  })

  it('does not hide consent on the rest of the site', () => {
    assert.equal(isInscriptionRoute('/'), false)
    assert.equal(isInscriptionRoute('/curso/resultado'), false)
    assert.equal(isInscriptionRoute('/faculdades/estacio'), false)
  })
})
