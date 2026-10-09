/**
 * Regressão: acrescentar um site não pode deixar buraco em Record indexado
 * por SiteKey.
 *
 * Cenário real (out/2026): `SiteKey` declarava três sites, mas dois Records
 * indexados por ela só tinham duas chaves — `colorsByTheme` em
 * tailwind.config.ts e `stats` em app/lib/constants/stats.ts. Subir com
 * NEXT_PUBLIC_THEME=bolsamais quebrava o config do Tailwind no load
 * (`colorsByTheme[theme].emerald` sobre undefined) e `getStats()` devolvia
 * undefined. O TypeScript não pegava: o acesso era por índice com cast.
 *
 * Estes testes falham contra o HEAD anterior à consolidação em brands.ts.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  DEFAULT_SITE_KEY,
  SITE_BRANDS,
  SITE_KEYS,
  getSiteBrand,
  isSiteKey,
  resolveSiteKey,
} from './brands'

test('todo SiteKey tem marca completa — nenhum campo vazio', () => {
  for (const key of SITE_KEYS) {
    const brand = SITE_BRANDS[key]
    assert.ok(brand, `sem entrada para ${key}`)
    assert.equal(brand.key, key, `chave divergente em ${key}`)

    for (const field of [
      'primary',
      'secondary',
      'logoColor',
      'logoWhite',
      'headerAccentClass',
      'helpCenterUrl',
      'dataLayerSuccessEvent',
    ] as const) {
      assert.equal(typeof brand[field], 'string', `${key}.${field} não é string`)
      assert.ok(brand[field].length > 0, `${key}.${field} vazio`)
    }
  }
})

test('a rampa de cor tem os 11 tons que o Tailwind espera', () => {
  const TONS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
  for (const key of SITE_KEYS) {
    for (const tom of TONS) {
      const cor = SITE_BRANDS[key].ramp[tom]
      assert.match(cor, /^#[0-9a-f]{6}$/i, `${key}.ramp[${tom}] inválido: ${cor}`)
    }
  }
})

test('stats de todo site trazem os quatro números', () => {
  for (const key of SITE_KEYS) {
    const { stats } = SITE_BRANDS[key]
    assert.equal(typeof stats.maxDiscount, 'number', `${key}: maxDiscount`)
    assert.ok(stats.maxDiscount > 0, `${key}: maxDiscount zerado`)
    for (const field of ['citiesCount', 'studentsCount', 'partnersCount'] as const) {
      assert.ok(stats[field]?.length, `${key}.stats.${field} vazio`)
    }
  }
})

test('tema desconhecido cai no default em vez de devolver undefined', () => {
  // Era aqui que estourava: índice direto num Record incompleto.
  assert.equal(resolveSiteKey('bolsamais'), 'bolsamais')
  assert.equal(resolveSiteKey('tema-que-nao-existe'), DEFAULT_SITE_KEY)
  assert.equal(resolveSiteKey(''), DEFAULT_SITE_KEY)
  assert.equal(resolveSiteKey(undefined), DEFAULT_SITE_KEY)
  assert.equal(resolveSiteKey(null), DEFAULT_SITE_KEY)

  assert.ok(getSiteBrand('tema-que-nao-existe').ramp[700], 'brand de fallback sem rampa')
})

test('isSiteKey não aceita chave herdada de Object.prototype', () => {
  // `value in SITE_BRANDS` pegaria 'toString' se o guard fosse ingênuo.
  assert.equal(isSiteKey('toString'), false)
  assert.equal(isSiteKey('constructor'), false)
  assert.equal(isSiteKey(42), false)
  assert.equal(isSiteKey('bolsaclick'), true)
})
