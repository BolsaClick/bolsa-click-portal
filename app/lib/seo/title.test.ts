import assert from 'node:assert/strict'
import { test } from 'node:test'

import { stripBrandSuffix } from './title'

test('remove o sufixo de marca final, com qualquer separador', () => {
  assert.equal(stripBrandSuffix('Faculdade EAD: Guia Completo | Bolsa Click'), 'Faculdade EAD: Guia Completo')
  assert.equal(stripBrandSuffix('Comunicação oficial | Central de Ajuda - Bolsa Click'), 'Comunicação oficial | Central de Ajuda')
  assert.equal(stripBrandSuffix('Guia — Bolsa Click  '), 'Guia')
})

test('não mexe na marca no meio do título nem em título sem sufixo', () => {
  assert.equal(stripBrandSuffix('O Bolsa Click é confiável?'), 'O Bolsa Click é confiável?')
  assert.equal(stripBrandSuffix('Central de Ajuda'), 'Central de Ajuda')
})
