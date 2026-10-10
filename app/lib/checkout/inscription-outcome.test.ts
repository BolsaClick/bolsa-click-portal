/**
 * Gravar o desfecho NUNCA pode derrubar a inscrição — e a classificação
 * precisa separar "parceiro disse não" (REFUSED, é o que o watchdog grita) de
 * "parceiro não respondeu" (ERROR, infraestrutura).
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { AxiosError, AxiosHeaders } from 'axios'

import {
  cognaVerdictFromError,
  cognaVerdictFromResponse,
  isJaInscritoNaCogna,
  marketplaceVerdict,
  recordInscriptionOutcome,
  toOutcomeRow,
  type InscriptionOutcomeRecord,
} from './inscription-outcome'
import { athenaVerdict, type AthenaEnrollmentAttempt } from './athena-enrollment'

const base: InscriptionOutcomeRecord = {
  partner: 'estacio',
  channel: 'athena',
  flow: 'checkout-direto',
  outcome: 'REFUSED',
  errorCode: 'ms002',
  errorMessage: 'x'.repeat(5000),
  cpf: '529.982.247-25',
  offerId: 'OF-1',
}

function axiosErr(status: number | null, data?: unknown): AxiosError {
  const err = new AxiosError('Request failed', 'ERR_BAD_REQUEST')
  if (status !== null) {
    err.response = {
      status,
      statusText: '',
      headers: {},
      config: { headers: new AxiosHeaders() },
      data,
    }
  }
  return err
}

describe('recordInscriptionOutcome — nunca derruba a inscrição', () => {
  it('banco fora: devolve false, não lança', async () => {
    const ok = await recordInscriptionOutcome(base, {
      write: async () => {
        throw new Error('relation "PartnerInscriptionOutcome" does not exist')
      },
    })
    assert.equal(ok, false)
  })

  it('banco pendurado: desiste no teto de tempo', async () => {
    const inicio = Date.now()
    const ok = await recordInscriptionOutcome(base, {
      timeoutMs: 50,
      write: () => new Promise(() => {}),
    })
    assert.equal(ok, false)
    assert.ok(Date.now() - inicio < 1000)
  })

  it('grava a linha normalizada', async () => {
    let gravado: Record<string, unknown> | null = null
    const ok = await recordInscriptionOutcome(base, {
      write: async (row) => {
        gravado = row
      },
    })
    assert.equal(ok, true)
    assert.equal(gravado!.errorCode, 'MS002')
    assert.equal(gravado!.cpf, '52998224725')
  })
})

describe('toOutcomeRow', () => {
  it('trunca a mensagem do parceiro e zera opcionais ausentes', () => {
    const row = toOutcomeRow({ ...base, offerId: undefined })
    assert.equal((row.errorMessage as string).length, 1000)
    assert.equal(row.offerId, null)
    assert.equal(row.transactionId, null)
    assert.equal(row.alreadyEnrolled, false)
  })
})

describe('athenaVerdict (Estácio)', () => {
  it('MS002 da YDUQS → REFUSED com o código', () => {
    const attempt: AthenaEnrollmentAttempt = {
      accepted: false,
      message: 'A instituição não aceitou alguns dos dados informados.',
      errorCode: 'MS002',
      providerMessage: 'Dados inválidos',
      kind: 'refused',
      httpStatus: null,
    }
    assert.deepEqual(athenaVerdict(attempt), {
      outcome: 'REFUSED',
      errorCode: 'MS002',
      errorMessage: 'Dados inválidos',
      httpStatus: null,
    })
  })

  it('rede fora → ERROR, não REFUSED', () => {
    const attempt: AthenaEnrollmentAttempt = {
      accepted: false,
      message: 'x',
      errorCode: null,
      providerMessage: 'ECONNRESET',
      kind: 'error',
      httpStatus: null,
    }
    assert.equal(athenaVerdict(attempt).outcome, 'ERROR')
  })

  it('ATL016 (CPF já inscrito) → SUCCESS marcado como alreadyEnrolled', () => {
    const v = athenaVerdict({
      accepted: true,
      result: {
        numeroInscricao: '123',
        paymentUrl: null,
        pixCode: null,
        amount: null,
        dueDate: null,
        alreadyEnrolled: true,
        status: null,
        errorCode: 'ATL016',
        providerMessage: null,
      },
    })
    assert.deepEqual(v, { outcome: 'SUCCESS', partnerInscriptionId: '123', alreadyEnrolled: true })
  })
})

describe('Cogna', () => {
  it('2xx com id → SUCCESS', () => {
    assert.deepEqual(cognaVerdictFromResponse({ id: 'abc' }), {
      outcome: 'SUCCESS',
      partnerInscriptionId: 'abc',
    })
  })

  it('2xx sem id nem success → REFUSED', () => {
    assert.equal(cognaVerdictFromResponse({}).outcome, 'REFUSED')
  })

  it('400 com mensagem da Cogna → REFUSED, com status e mensagem', () => {
    const v = cognaVerdictFromError(axiosErr(400, { cognaError: { message: 'Oferta inválida', code: 'OF01' } }))
    assert.deepEqual(v, {
      outcome: 'REFUSED',
      httpStatus: 400,
      errorCode: 'OF01',
      errorMessage: 'Oferta inválida',
    })
  })

  it('502 / sem resposta → ERROR', () => {
    assert.equal(cognaVerdictFromError(axiosErr(502, {})).outcome, 'ERROR')
    assert.equal(cognaVerdictFromError(axiosErr(null)).outcome, 'ERROR')
    assert.equal(cognaVerdictFromError(new Error('boom')).outcome, 'ERROR')
  })

  it('"já possui inscrição" → SUCCESS (é a mesma pessoa voltando)', () => {
    const v = cognaVerdictFromError(axiosErr(400, { message: 'Candidato já possui inscrição nesta oferta' }))
    assert.equal(v.outcome, 'SUCCESS')
    assert.equal(v.alreadyEnrolled, true)
    assert.equal(isJaInscritoNaCogna('Inscrição já existe'), true)
    assert.equal(isJaInscritoNaCogna('Oferta inválida'), false)
  })

  it('marketplace', () => {
    assert.equal(marketplaceVerdict({ success: true, data: { id: 9 } }).partnerInscriptionId, '9')
    assert.deepEqual(marketplaceVerdict({ success: false, error: 'idDmhElastic não encontrado na oferta' }), {
      outcome: 'REFUSED',
      errorMessage: 'idDmhElastic não encontrado na oferta',
    })
  })
})
