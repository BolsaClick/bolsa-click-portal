/**
 * Sanidade das listas revisadas à mão em reconcile-api-course-names.ts.
 * Erro de digitação aqui faria o script pular um curso sem avisar.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { RENAMES, WITHOUT_PARTNER } from './reconcile-api-course-names'

describe('reconcile-api-course-names', () => {
  it('nenhum curso aparece duas vezes, nem nas duas listas', () => {
    const origens = [...RENAMES.map(([from]) => from), ...WITHOUT_PARTNER]
    assert.equal(new Set(origens).size, origens.length)
  })

  it('o nome novo nunca carrega o prefixo editorial que causou o problema', () => {
    for (const [from, to] of RENAMES) {
      assert.notEqual(from, to)
      assert.doesNotMatch(to, /^(Curso Profissionalizante de|Especialização em)\b/, to)
    }
  })

  it('51 cursos com página de cidade e zero oferta: 17 renomeados + 34 sem página de cidade', () => {
    assert.equal(RENAMES.length, 17)
    assert.equal(WITHOUT_PARTNER.length, 34)
  })
})
