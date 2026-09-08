import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { NextRequest } from 'next/server'
import {
  META_ATTRIBUTION_KEY,
  metaAttributionFromRequest,
  readMetaAttribution,
} from './meta-attribution'

function req(opts: { headers?: Record<string, string>; cookies?: Record<string, string> } = {}) {
  const headers = new Headers(opts.headers ?? {})
  const cookies = Object.entries(opts.cookies ?? {})
  if (cookies.length) {
    headers.set('cookie', cookies.map(([k, v]) => `${k}=${v}`).join('; '))
  }
  return new NextRequest('https://www.bolsaclick.com.br/api/athena-checkout/charge', {
    method: 'POST',
    headers,
  })
}

describe('metaAttributionFromRequest', () => {
  it('reads _fbp/_fbc from the request cookies when the client sends nothing', () => {
    const a = metaAttributionFromRequest(
      req({
        cookies: { _fbp: 'fb.1.123.456', _fbc: 'fb.1.123.AbCd' },
        headers: { 'user-agent': 'Mozilla/5.0', 'x-forwarded-for': '203.0.113.7, 70.41.3.18' },
      }),
    )
    assert.equal(a.fbp, 'fb.1.123.456')
    assert.equal(a.fbc, 'fb.1.123.AbCd')
    assert.equal(a.userAgent, 'Mozilla/5.0')
    // Só o PRIMEIRO ip do x-forwarded-for é o do visitante; o resto são proxies.
    assert.equal(a.clientIp, '203.0.113.7')
  })

  it('lets the browser value win — it is the only source for a synthesized _fbc', () => {
    const a = metaAttributionFromRequest(req({ cookies: { _fbp: 'do-cookie' } }), {
      fbp: 'do-cliente',
      fbc: 'fb.1.999.fbclid-da-url',
    })
    assert.equal(a.fbp, 'do-cliente')
    // Sem cookie `_fbc`: é exatamente o caso do pixel que carregou depois do
    // consentimento, e só o cliente tem o valor montado do fbclid.
    assert.equal(a.fbc, 'fb.1.999.fbclid-da-url')
  })

  it('falls back to x-real-ip and never returns empty strings', () => {
    const a = metaAttributionFromRequest(
      req({ headers: { 'x-real-ip': '198.51.100.9', 'user-agent': '   ' } }),
      { fbp: '', fbc: '   ' },
    )
    assert.equal(a.clientIp, '198.51.100.9')
    assert.equal(a.userAgent, undefined)
    assert.equal(a.fbp, undefined)
    assert.equal(a.fbc, undefined)
  })
})

describe('readMetaAttribution', () => {
  it('round-trips what the charge route persisted', () => {
    const atribuicao = metaAttributionFromRequest(
      req({
        cookies: { _fbp: 'fb.1.1.p', _fbc: 'fb.1.1.c' },
        headers: { 'user-agent': 'UA', 'x-real-ip': '1.2.3.4', referer: 'https://x/checkout' },
      }),
    )
    // Como a rota grava, e como a confirmação relê.
    const metadata = { checkoutFlow: 'estacio', [META_ATTRIBUTION_KEY]: atribuicao }
    assert.deepEqual(readMetaAttribution(metadata), {
      fbp: 'fb.1.1.p',
      fbc: 'fb.1.1.c',
      clientIp: '1.2.3.4',
      userAgent: 'UA',
      eventSourceUrl: 'https://x/checkout',
    })
  })

  it('never throws for transactions created before this key existed', () => {
    const vazio = { fbp: undefined, fbc: undefined, clientIp: undefined, userAgent: undefined, eventSourceUrl: undefined }
    assert.deepEqual(readMetaAttribution(null), {})
    assert.deepEqual(readMetaAttribution(undefined), {})
    assert.deepEqual(readMetaAttribution('nao é objeto'), {})
    assert.deepEqual(readMetaAttribution({ checkoutFlow: 'estacio' }), {})
    assert.deepEqual(readMetaAttribution({ [META_ATTRIBUTION_KEY]: 'lixo' }), {})
    // Chave presente mas com tipos errados: descarta campo a campo, sem quebrar.
    assert.deepEqual(readMetaAttribution({ [META_ATTRIBUTION_KEY]: { fbp: 42, fbc: null } }), vazio)
  })
})
