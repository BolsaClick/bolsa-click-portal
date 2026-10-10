import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { OfferDetails } from '@/app/lib/api/get-offer-details'
import { candidateSchema } from './candidate'
import { DADOS_ADMIN_PADRAO } from './dados-admin-padrao'
import {
  buildAthenaEnrollment,
  buildCognaInscriptionPayload,
  buildCognaMarketplaceData,
  CODIGO_INSCRICAO_POS_TECNICO,
  CODIGO_VESTIBULAR_ENEM,
  estacioAddressError,
  estacioVisibleAddressFields,
} from './partner-payload'

const candidate = candidateSchema.parse({
  email: 'maria@exemplo.com',
  name: 'Maria Souza',
  cpf: '529.982.247-25',
  birthDate: '15-03-2000',
  phone: '(81) 98765-4321',
})

const enderecoRecife = {
  zipCode: '50030-230',
  number: '120',
  street: 'Rua do Bom Jesus',
  neighborhood: 'Recife',
  city: 'Recife',
  state: 'pe',
}

describe('buildAthenaEnrollment (Estácio)', () => {
  const payload = buildAthenaEnrollment({
    offerId: 'OF-1',
    academicLevel: 'GRADUACAO',
    candidate,
    address: enderecoRecife,
    ingresso: { codFormaIngresso: 24, acceptTerms: true },
  })

  it('manda o endereço REAL do candidato — nunca DADOS_ADMIN_PADRAO', () => {
    assert.deepEqual(payload.address, {
      street: 'Rua do Bom Jesus',
      number: '120',
      neighborhood: 'Recife',
      zipCode: '50030230',
      state: 'PE',
      city: 'Recife',
    })
    assert.notEqual(payload.address.zipCode, DADOS_ADMIN_PADRAO.cep)
  })

  it('aluno: os 5 campos, nascimento em ISO, documentos só com dígitos', () => {
    assert.deepEqual(payload.student, {
      name: 'Maria Souza',
      cpf: '52998224725',
      email: 'maria@exemplo.com',
      mobile: '81987654321',
      birthDate: '2000-03-15',
    })
  })

  it('consentimentos e forma de ingresso', () => {
    assert.equal(payload.options.acceptTerms, true)
    assert.equal(payload.options.codFormaIngresso, 24)
    assert.equal(payload.options.useEnem, false)
    assert.equal(payload.options.acceptReceiveEmail, true)
  })

  it('ENEM liga useEnem e manda o ano de conclusão', () => {
    const enem = buildAthenaEnrollment({
      offerId: 'OF-1',
      academicLevel: 'GRADUACAO',
      candidate,
      address: enderecoRecife,
      ingresso: { codFormaIngresso: CODIGO_VESTIBULAR_ENEM, graduationYear: '2018', acceptTerms: true },
    })
    assert.equal(enem.options.useEnem, true)
    assert.equal(enem.options.graduationYear, 2018)
  })

  it('pós-graduação força a forma fixa 15', () => {
    const pos = buildAthenaEnrollment({
      offerId: 'OF-1',
      academicLevel: 'POS_GRADUACAO',
      candidate,
      address: enderecoRecife,
      ingresso: { codFormaIngresso: 24, acceptTerms: true },
    })
    assert.equal(pos.options.codFormaIngresso, CODIGO_INSCRICAO_POS_TECNICO)
  })
})

describe('adaptador Cogna — comportamento preservado', () => {
  const offer = {
    dmhId: 'DMH-1',
    businessKey: 'BK-1',
    academicLevel: 'GRADUACAO',
    ingressType: ['VESTIBULAR'],
    shift: 'VIRTUAL',
  } as unknown as OfferDetails

  it('marketplace: 5 campos reais + administrativos de DADOS_ADMIN_PADRAO', () => {
    const data = buildCognaMarketplaceData(candidate, 'ENEM')
    assert.equal(data.cpf, '52998224725')
    assert.equal(data.birthDate, '15-03-2000')
    assert.equal(data.rg, DADOS_ADMIN_PADRAO.rg)
    assert.equal(data.gender, DADOS_ADMIN_PADRAO.gender)
    assert.equal(data.cep, DADOS_ADMIN_PADRAO.cep)
    assert.equal(data.ingressType, 'ENEM')
  })

  it('inscrição: graduação usa o tipo de ingresso escolhido', () => {
    const payload = buildCognaInscriptionPayload(candidate, offer, 'ENEM', undefined) as unknown as Record<string, unknown>
    const json = JSON.stringify(payload)
    assert.match(json, /52998224725/)
    assert.match(json, /2000-03-15/)
    assert.match(json, /"ENEM"/)
  })
})

describe('endereço da Estácio no formulário', () => {
  it('antes do ViaCEP responder: só CEP e número', () => {
    assert.deepEqual(estacioVisibleAddressFields(null), ['zipCode', 'number'])
  })

  it('ViaCEP completo: o candidato não digita logradouro, bairro, cidade nem UF', () => {
    const ok = {
      ok: true as const,
      address: { street: 'Rua A', neighborhood: 'B', city: 'C', state: 'PE' },
      missing: [],
    }
    assert.deepEqual(estacioVisibleAddressFields(ok), ['zipCode', 'number'])
  })

  it('ViaCEP fora do ar / timeout / CEP inexistente: os quatro campos APARECEM', () => {
    for (const reason of ['timeout', 'network', 'http', 'not_found'] as const) {
      assert.deepEqual(estacioVisibleAddressFields({ ok: false, reason }), [
        'zipCode', 'number', 'street', 'neighborhood', 'city', 'state',
      ], reason)
    }
  })

  it('CEP geral: aparecem só os que vieram vazios', () => {
    const parcial = {
      ok: true as const,
      address: { street: '', neighborhood: '', city: 'Patos', state: 'PB' },
      missing: ['street' as const, 'neighborhood' as const],
    }
    assert.deepEqual(estacioVisibleAddressFields(parcial), ['zipCode', 'number', 'street', 'neighborhood'])
  })

  it('estacioAddressError exige os 6 campos que a Athena recebe', () => {
    assert.equal(estacioAddressError(enderecoRecife), null)
    assert.equal(estacioAddressError({ ...enderecoRecife, zipCode: '5003' }), 'CEP inválido.')
    assert.equal(estacioAddressError({ ...enderecoRecife, number: ' ' }), 'Informe o número.')
    assert.equal(estacioAddressError({ ...enderecoRecife, street: '' }), 'Informe o logradouro.')
    assert.equal(estacioAddressError({ ...enderecoRecife, state: 'P' }), 'Informe o estado (UF).')
  })
})
