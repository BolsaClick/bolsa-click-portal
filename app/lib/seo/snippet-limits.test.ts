import assert from 'node:assert/strict'
import { test } from 'node:test'

import { renderedTitleLength, SNIPPET_TITLE_BODY_MAX, validateBlogSnippet } from './snippet-limits'

test('mede o title como sai na página: sem marca duplicada, com o sufixo do layout', () => {
  assert.equal(renderedTitleLength('Guia'), 'Guia | Bolsa Click'.length)
  assert.equal(renderedTitleLength('Guia | Bolsa Click'), 'Guia | Bolsa Click'.length)
  assert.equal(SNIPPET_TITLE_BODY_MAX, 46)
})

test('aceita title de 46 e description de 155; recusa 47 e 156', () => {
  assert.deepEqual(validateBlogSnippet({ metaTitle: 'a'.repeat(46), metaDescription: 'b'.repeat(155) }), [])
  const issues = validateBlogSnippet({ metaTitle: 'a'.repeat(47), metaDescription: 'b'.repeat(156) })
  assert.deepEqual(issues.map(i => i.field), ['metaTitle', 'metaDescription'])
})

test('sem meta, mede o fallback que a página usa (title e excerpt)', () => {
  const issues = validateBlogSnippet({ title: 'x'.repeat(50), excerpt: 'y'.repeat(200) })
  assert.equal(issues.length, 2)
  assert.match(issues[1].message, /resumo/)
  // meta curto resolve mesmo com title/excerpt longos
  assert.deepEqual(
    validateBlogSnippet({ title: 'x'.repeat(80), metaTitle: 'curto', excerpt: 'y'.repeat(300), metaDescription: 'ok' }),
    [],
  )
})
