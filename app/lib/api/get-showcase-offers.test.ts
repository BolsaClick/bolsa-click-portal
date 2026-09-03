import assert from 'node:assert/strict'
import { test } from 'node:test'

import { DISCOUNT_CEILING_PCT } from '../copy/claims'
import {
  CURSOS_FEATURED_SLOTS,
  baseCourseName,
  discountFromPrices,
  pickShelfOffer,
  tartarusBaseUrl,
} from './get-showcase-offers'

test('baseCourseName distinguishes Administração from Administração Pública', () => {
  assert.equal(baseCourseName('Administração - Bacharelado'), 'administracao')
  assert.equal(baseCourseName('Administração Pública - Bacharelado'), 'administracao publica')
  assert.notEqual(
    baseCourseName('Administração Pública - Bacharelado'),
    baseCourseName('Administração'),
  )
})

test(`stub De/Por 119/950, 99.99/1290 and 109/1100 compute above the ${DISCOUNT_CEILING_PCT}% ceiling`, () => {
  assert.equal(discountFromPrices(119, 950), 87)
  assert.equal(discountFromPrices(99.99, 1290), 92)
  assert.equal(discountFromPrices(109, 1100), 90)
  for (const pct of [87, 90, 92]) {
    assert.ok(pct > DISCOUNT_CEILING_PCT)
  }
})

test('pickShelfOffer drops inflated stubs and Administração Pública', () => {
  const slot = CURSOS_FEATURED_SLOTS.find((s) => s.courseName === 'Administração')!
  const picked = pickShelfOffer(
    [
      {
        name: 'Administração - Bacharelado',
        brand: 'UNOPAR',
        minPrice: 99.99,
        maxPrice: 1290,
        modality: 'EAD',
        commercialModality: 'EAD',
      },
      {
        name: 'Administração Pública - Bacharelado',
        brand: 'UNOPAR',
        minPrice: 107.2,
        maxPrice: 186.67,
        modality: 'EAD',
        commercialModality: 'EAD',
      },
      {
        name: 'Administração - Bacharelado',
        brand: 'UNOPAR',
        minPrice: 107.2,
        maxPrice: 186.67,
        modality: 'EAD',
        commercialModality: 'EAD',
        city: 'CURITIBA',
        uf: 'PR',
      },
    ],
    slot,
  )
  assert.ok(picked)
  assert.equal(picked.name, 'Administração - Bacharelado')
  assert.equal(picked.minPrice, 107.2)
  assert.equal(discountFromPrices(picked.minPrice!, picked.maxPrice!), 42)
})

test('tartarusBaseUrl falls back to the public API when env is missing', () => {
  const prev = process.env.NEXT_PUBLIC_TARTARUS_API
  delete process.env.NEXT_PUBLIC_TARTARUS_API
  try {
    assert.equal(tartarusBaseUrl(), 'https://tartarus-api.inovitdigital.com.br/api')
  } finally {
    if (prev === undefined) delete process.env.NEXT_PUBLIC_TARTARUS_API
    else process.env.NEXT_PUBLIC_TARTARUS_API = prev
  }
})

test('pickShelfOffer keeps Pedagogia semipresencial when there is no commercial EAD', () => {
  const slot = CURSOS_FEATURED_SLOTS.find((s) => s.courseName === 'Pedagogia')!
  const picked = pickShelfOffer(
    [
      {
        name: 'Pedagogia - Licenciatura',
        brand: 'ANHANGUERA',
        minPrice: 179.28,
        maxPrice: 332.22,
        modality: 'EAD',
        commercialModality: 'SEMIPRESENCIAL',
        city: 'BELO HORIZONTE',
        uf: 'MG',
      },
    ],
    slot,
  )
  assert.ok(picked)
  assert.equal(picked.commercialModality, 'SEMIPRESENCIAL')
  assert.equal(discountFromPrices(picked.minPrice!, picked.maxPrice!), 46)
})

test('pickShelfOffer still returns a real offer when city is missing (national fallback)', () => {
  const slot = CURSOS_FEATURED_SLOTS.find((s) => s.courseName === 'Administração')!
  const picked = pickShelfOffer(
    [
      {
        name: 'Administração - Bacharelado',
        brand: 'UNOPAR',
        minPrice: 107.2,
        maxPrice: 186.67,
        modality: 'EAD',
        commercialModality: 'EAD',
        city: 'SAO PAULO',
        uf: 'SP',
      },
    ],
    slot,
  )
  assert.ok(picked)
  assert.equal(picked.city, 'SAO PAULO')
})

test('pickShelfOffer prefers requested EAD over semipresencial when both exist', () => {
  const slot = CURSOS_FEATURED_SLOTS.find((s) => s.courseName === 'Pedagogia')!
  const picked = pickShelfOffer(
    [
      {
        name: 'Pedagogia - Licenciatura',
        brand: 'ANHANGUERA',
        minPrice: 181.25,
        maxPrice: 328.57,
        modality: 'EAD',
        commercialModality: 'SEMIPRESENCIAL',
      },
      {
        name: 'Pedagogia - Licenciatura',
        brand: 'UNOPAR',
        minPrice: 150,
        maxPrice: 400,
        modality: 'EAD',
        commercialModality: 'EAD',
      },
    ],
    slot,
  )
  assert.equal(picked?.commercialModality, 'EAD')
  assert.equal(picked?.minPrice, 150)
})
