/**
 * `buildCourseInstances` alimenta `Course.hasCourseInstance` na página de
 * curso nacional e na de curso+cidade (~10 mil URLs). Sem hasCourseInstance
 * com courseMode, a página não é elegível ao rich result de curso — a de
 * cidade ficou fora até out/2026 porque a lógica só existia inline na
 * nacional.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { buildCourseInstances } from './schema-helpers'

const URL = 'https://www.bolsaclick.com.br/cursos/direito-bacharelado/sao-paulo'

type Instance = {
  courseMode: string
  courseWorkload: string
  provider?: { '@type': string; name: string }
  offers?: { price: string; url: string; seller?: { '@id': string } }
}

test('uma instância por instituição, com a menor mensalidade dela', () => {
  const instances = buildCourseInstances(
    [
      { brand: 'Anhanguera', minPrice: 300, modality: 'PRESENCIAL' },
      { brand: 'Anhanguera', prices: { withDiscount: 250 }, modality: 'PRESENCIAL' },
      { brand: 'Estácio', minPrice: 199.9, modality: 'EAD' },
    ],
    { duration: '5 anos', url: URL },
  )

  assert.equal(instances.length, 2)
  const [anhanguera, estacio] = instances as Instance[]
  assert.deepEqual(anhanguera.provider, { '@type': 'CollegeOrUniversity', name: 'Anhanguera' })
  assert.equal(anhanguera.offers?.price, '250.00')
  assert.equal(anhanguera.courseMode, 'Onsite')
  assert.equal(anhanguera.courseWorkload, 'P5Y')
  assert.equal(estacio.offers?.price, '199.90')
  assert.equal(estacio.courseMode, 'Online')
  assert.equal(estacio.offers?.url, URL)
  assert.equal(estacio.offers?.seller?.['@id'], 'https://www.bolsaclick.com.br/#organization')
})

test('instituição que tem EAD entre as ofertas vira Online', () => {
  const [instance] = buildCourseInstances(
    [
      { brand: 'Unopar', minPrice: 150, modality: 'PRESENCIAL' },
      { brand: 'Unopar', minPrice: 120, modality: 'EAD' },
    ],
    { duration: '4 anos', url: URL },
  )
  assert.equal(instance.courseMode, 'Online')
})

test('instituição sem preço válido sai sem offers, mas mantém courseMode', () => {
  const [instance] = buildCourseInstances(
    [{ brand: 'Wyden', minPrice: 0, modality: 'PRESENCIAL' }],
    { duration: '4 anos', url: URL },
  )
  assert.equal(instance.courseMode, 'Onsite')
  assert.equal('offers' in instance, false)
})

test('sem oferta com marca: instância genérica, preço só se informado', () => {
  const [semPreco] = buildCourseInstances([], { duration: null, url: URL })
  assert.equal(semPreco.courseMode, 'Online')
  assert.equal(semPreco.courseWorkload, 'P4Y')
  assert.equal('offers' in semPreco, false)
  assert.equal('provider' in semPreco, false)

  const [comPreco] = buildCourseInstances([{ minPrice: 99 }], {
    duration: '4 anos',
    url: URL,
    fallbackLowPrice: 99,
  }) as Instance[]
  assert.equal(comPreco.offers?.price, '99.00')
  assert.equal(comPreco.offers?.seller, undefined)
})

test('null/undefined não quebra', () => {
  assert.equal(buildCourseInstances(null, { duration: '4 anos', url: URL }).length, 1)
  assert.equal(buildCourseInstances(undefined, { duration: '4 anos', url: URL }).length, 1)
})
