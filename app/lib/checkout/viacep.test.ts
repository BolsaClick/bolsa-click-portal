/**
 * O ViaCEP virou caminho crítico do checkout da Estácio (preenche 4 campos
 * obrigatórios escondidos). Cada falha precisa virar `ok: false` com motivo —
 * é isso que faz o checkout MOSTRAR os campos em vez de travar.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { lookupCep } from './viacep'

type Resp = { ok: boolean; status: number; json: () => Promise<unknown> }
const responde = (body: unknown, status = 200) => async (): Promise<Resp> => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
})

describe('lookupCep', () => {
  it('CEP completo: endereço preenchido, nada faltando', async () => {
    const r = await lookupCep('01310-100', {
      fetchImpl: responde({ logradouro: 'Avenida Paulista', bairro: 'Bela Vista', localidade: 'São Paulo', uf: 'sp' }),
    })
    assert.deepEqual(r, {
      ok: true,
      address: { street: 'Avenida Paulista', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP' },
      missing: [],
    })
  })

  it('CEP geral de cidade pequena: logradouro e bairro vazios vão em `missing`', async () => {
    const r = await lookupCep('58700000', {
      fetchImpl: responde({ logradouro: '', bairro: '', localidade: 'Patos', uf: 'PB' }),
    })
    assert.equal(r.ok, true)
    assert.deepEqual(r.ok && r.missing, ['street', 'neighborhood'])
  })

  it('CEP inexistente (erro: true) → not_found', async () => {
    const r = await lookupCep('99999999', { fetchImpl: responde({ erro: true }) })
    assert.deepEqual(r, { ok: false, reason: 'not_found' })
  })

  it('HTTP 500 → http', async () => {
    const r = await lookupCep('01310100', { fetchImpl: responde(null, 500) })
    assert.deepEqual(r, { ok: false, reason: 'http' })
  })

  it('rede fora → network, sem lançar', async () => {
    const r = await lookupCep('01310100', {
      fetchImpl: async () => {
        throw new TypeError('Failed to fetch')
      },
    })
    assert.deepEqual(r, { ok: false, reason: 'network' })
  })

  it('ViaCEP pendurado → timeout dentro do prazo, sem lançar', async () => {
    const inicio = Date.now()
    const r = await lookupCep('01310100', {
      timeoutMs: 50,
      fetchImpl: (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            const e = new Error('aborted')
            e.name = 'AbortError'
            reject(e)
          })
        }),
    })
    assert.deepEqual(r, { ok: false, reason: 'timeout' })
    assert.ok(Date.now() - inicio < 1000)
  })

  it('JSON inválido → network (não estoura)', async () => {
    const r = await lookupCep('01310100', {
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError('Unexpected token')
        },
      }),
    })
    assert.deepEqual(r, { ok: false, reason: 'network' })
  })

  it('CEP com menos de 8 dígitos nem consulta', async () => {
    let chamou = false
    const r = await lookupCep('0131', {
      fetchImpl: async () => {
        chamou = true
        return { ok: true, status: 200, json: async () => ({}) }
      },
    })
    assert.deepEqual(r, { ok: false, reason: 'invalid' })
    assert.equal(chamou, false)
  })
})
