import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  PARTNER_NETWORKS,
  PARTNER_NETWORKS_LIST,
  WEDGE_NO_FEE,
} from '../lib/copy/claims'
import {
  CITIES_COUNT_LABEL,
  EAD_MONTHLY_FROM,
  buildFullLlmsTxt,
  buildShortLlmsTxt,
} from './build'

const ORIGIN = 'https://www.bolsaclick.com.br'

const fivePartners = [
  { slug: 'anhanguera', name: 'Anhanguera', fullName: 'Universidade Anhanguera' },
  { slug: 'unopar', name: 'Unopar', fullName: 'Universidade Norte do Paraná - Unopar' },
  { slug: 'pitagoras', name: 'Pitágoras', fullName: 'Faculdade Pitágoras' },
  { slug: 'estacio', name: 'Estácio', fullName: 'Universidade Estácio de Sá' },
  { slug: 'unime', name: 'Unime', fullName: 'União Metropolitana de Educação e Cultura - Unime' },
]

const withWyden = [
  ...fivePartners,
  { slug: 'wyden', name: 'Wyden', fullName: 'Wyden' },
]

const sampleCourses = [
  {
    slug: 'administracao-bacharelado',
    name: 'Administração',
    nivel: 'GRADUACAO',
    averageSalary: 'R$ 3.500 a R$ 20.000',
  },
  {
    slug: 'pedagogia-licenciatura',
    name: 'Pedagogia',
    nivel: 'GRADUACAO',
    averageSalary: null,
  },
]

describe('buildShortLlmsTxt', () => {
  const text = buildShortLlmsTxt({ institutions: fivePartners, siteUrl: ORIGIN })

  it('keeps locked claims: 78%, 6 networks, no-fee wedge, EAD floor, 280+', () => {
    assert.match(text, /até 78%/)
    assert.match(text, /78%/)
    assert.equal(text.includes(PARTNER_NETWORKS_LIST), true)
    for (const name of PARTNER_NETWORKS) {
      assert.equal(text.includes(name), true, `missing partner ${name}`)
    }
    assert.equal(text.includes(WEDGE_NO_FEE), true)
    assert.equal(text.includes(EAD_MONTHLY_FROM), true)
    assert.equal(CITIES_COUNT_LABEL, '280+')
    assert.equal(text.includes('280+'), true)
  })

  it('names Wyden in prose and does not invent /faculdades/wyden when unpublished', () => {
    assert.equal(text.includes('Wyden'), true)
    assert.equal(text.includes(`${ORIGIN}/faculdades/wyden`), false)
    assert.equal(text.includes(`${ORIGIN}/faculdades/anhanguera`), true)
    assert.match(text, /perfil \/faculdades\/wyden ainda não publicado/)
    assert.equal(text.includes(`${ORIGIN}/faculdades)`), true)
  })

  it('links /faculdades/wyden when the institution is published', () => {
    const withPage = buildShortLlmsTxt({ institutions: withWyden, siteUrl: ORIGIN })
    assert.equal(withPage.includes(`${ORIGIN}/faculdades/wyden`), true)
    assert.equal(withPage.includes('perfil /faculdades/wyden ainda não publicado'), false)
  })

  it('is a short index: no course/career URL dump', () => {
    assert.equal((text.match(/\/cursos\/[a-z0-9-]+/g) || []).length, 0)
    assert.equal((text.match(/\/carreiras\/[a-z0-9-]+/g) || []).length, 0)
    assert.equal(text.includes(`${ORIGIN}/llms-full.txt`), true)
    assert.ok(text.split('\n').length < 200, `short file too long: ${text.split('\n').length} lines`)
  })

  it('has an explicit não citar block and does not assert unsourced student counts or 284 cidades', () => {
    assert.match(text, /## Não citar/)
    assert.match(text, /matrícula em 5 min/)
    assert.match(text, /bolsa vale o curso inteiro/)
    assert.match(text, /preços De\/Por inventados/i)
    assert.equal(text.includes('1.000 estudantes'), false)
    assert.equal(text.includes('1000 estudantes'), false)
    assert.equal(text.includes('284 cidades'), false)
    assert.equal(text.includes(`${CITIES_COUNT_LABEL} cidades`), true)
  })

  it('does not use BRAZILIAN_CITIES.length as the public city count', () => {
    assert.equal(text.includes('284'), false)
  })
})

describe('buildFullLlmsTxt', () => {
  const text = buildFullLlmsTxt({
    institutions: fivePartners,
    courses: sampleCourses,
    blogPosts: [{ slug: 'prouni-2026', title: 'ProUni 2026' }],
    siteUrl: ORIGIN,
  })

  it('keeps lock facts and dumps course/career URLs', () => {
    assert.match(text, /78%/)
    assert.equal(text.includes(PARTNER_NETWORKS_LIST), true)
    assert.equal(text.includes(WEDGE_NO_FEE), true)
    assert.equal(text.includes(`${ORIGIN}/cursos/administracao-bacharelado`), true)
    assert.equal(text.includes(`${ORIGIN}/carreiras/pedagogia-licenciatura`), true)
    assert.equal(text.includes(`${ORIGIN}/blog/prouni-2026`), true)
    assert.equal(text.includes(`${ORIGIN}/llms.txt`), true)
  })

  it('omits unpublished Wyden campus URL the same way as the short index', () => {
    assert.equal(text.includes('Wyden'), true)
    assert.equal(text.includes(`${ORIGIN}/faculdades/wyden`), false)
  })
})
