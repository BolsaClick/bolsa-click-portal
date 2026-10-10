import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { birthDateToIso, candidateSchema, maskBirthDate, maskCep, maskCpf } from './candidate'

// CPF válido (dígitos verificadores corretos), usado só em teste.
const CPF_VALIDO = '52998224725'

const valido = {
  email: 'maria@exemplo.com',
  name: '  Maria Souza  ',
  cpf: '529.982.247-25',
  birthDate: '15-03-2000',
  phone: '(11) 98765-4321',
}

describe('candidateSchema — captação mínima dos dois checkouts', () => {
  it('tem exatamente os 5 campos', () => {
    assert.deepEqual(Object.keys(candidateSchema.shape).sort(), ['birthDate', 'cpf', 'email', 'name', 'phone'])
  })

  it('aceita o candidato válido e normaliza CPF, telefone e nome', () => {
    const out = candidateSchema.parse(valido)
    assert.equal(out.cpf, CPF_VALIDO)
    assert.equal(out.phone, '11987654321')
    assert.equal(out.name, 'Maria Souza')
    assert.equal(out.birthDate, '15-03-2000')
  })

  it('recusa CPF com dígito verificador errado', () => {
    assert.equal(candidateSchema.safeParse({ ...valido, cpf: '529.982.247-26' }).success, false)
  })

  it('recusa data inexistente, formato errado e menor de 15 anos', () => {
    assert.equal(candidateSchema.safeParse({ ...valido, birthDate: '31-02-2000' }).success, false)
    assert.equal(candidateSchema.safeParse({ ...valido, birthDate: '2000-03-15' }).success, false)
    const ano = new Date().getFullYear() - 10
    assert.equal(candidateSchema.safeParse({ ...valido, birthDate: `01-01-${ano}` }).success, false)
  })

  it('recusa data vazia com mensagem (o fix de 08/10: nunca travar em silêncio)', () => {
    const r = candidateSchema.safeParse({ ...valido, birthDate: '' })
    assert.equal(r.success, false)
    assert.match(r.error!.issues[0].message, /Data de nascimento/)
  })

  it('exige celular (11 dígitos com 9), não fixo', () => {
    assert.equal(candidateSchema.safeParse({ ...valido, phone: '(11) 3456-7890' }).success, false)
  })
})

describe('conversões e máscaras', () => {
  it('birthDateToIso converte DD-MM-AAAA para o formato da Athena', () => {
    assert.equal(birthDateToIso('15-03-2000'), '2000-03-15')
    assert.equal(birthDateToIso('2000-03-15'), undefined)
    assert.equal(birthDateToIso(''), undefined)
  })

  it('máscaras', () => {
    assert.equal(maskCpf('52998224725999'), '529.982.247-25')
    assert.equal(maskBirthDate('15032000'), '15-03-2000')
    assert.equal(maskCep('01310100'), '01310-100')
  })
})
