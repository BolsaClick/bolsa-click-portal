/**
 * Regressão: o checkout da Estácio não pode voltar a pedir o que a Athena não
 * exige.
 *
 * Out/2026: 25 pessoas abriram o checkout da Estácio e 4 terminaram o
 * formulário (84% de abandono). Ele pedia 15 campos (11 obrigatórios) —
 * gênero, RG e o endereço inteiro digitado à mão. Passou a usar o formulário
 * único da Cogna (5 campos) + CEP e número, com o ViaCEP preenchendo o resto.
 *
 * Estes testes falham se alguém:
 *  - devolver gênero ou RG ao formulário ou ao payload;
 *  - voltar a exigir logradouro/bairro/cidade/UF digitados quando o ViaCEP
 *    respondeu;
 *  - trocar o formulário único por campos próprios da Estácio.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

import { candidateSchema } from '@/app/lib/checkout/candidate'
import { buildAthenaEnrollment, estacioVisibleAddressFields } from '@/app/lib/checkout/partner-payload'

const SOURCE = readFileSync(join(process.cwd(), 'app/checkout/estacio/EstacioCheckoutClient.tsx'), 'utf-8')

describe('checkout Estácio — campos pedidos ao candidato', () => {
  it('não pede gênero nem RG', () => {
    assert.doesNotMatch(SOURCE, /\bgender\b/, 'gender voltou ao EstacioCheckoutClient')
    assert.doesNotMatch(SOURCE, /['"`.]rg\b|\brg:/, 'rg voltou ao EstacioCheckoutClient')
    assert.doesNotMatch(SOURCE, />\s*G[êe]nero\s*</i, 'campo "Gênero" voltou à tela')
    assert.doesNotMatch(SOURCE, />\s*RG\s*</, 'campo "RG" voltou à tela')
  })

  it('usa o formulário único (schema e campos compartilhados com a Cogna)', () => {
    assert.match(SOURCE, /zodResolver\(candidateSchema\)/)
    for (const campo of ['EmailField', 'NameField', 'CpfField', 'BirthDateField', 'PhoneField']) {
      assert.match(SOURCE, new RegExp(`<${campo}\\b`), `${campo} não está no checkout da Estácio`)
    }
  })

  it('o payload da Athena não carrega gênero nem RG', () => {
    const payload = buildAthenaEnrollment({
      offerId: 'OF-1',
      candidate: candidateSchema.parse({
        email: 'a@b.com',
        name: 'Ana Lima',
        cpf: '52998224725',
        birthDate: '01-01-2000',
        phone: '11987654321',
      }),
      address: { zipCode: '01310100', number: '1', street: 'R', neighborhood: 'B', city: 'C', state: 'SP' },
      ingresso: { codFormaIngresso: 24, acceptTerms: true },
    })
    assert.deepEqual(Object.keys(payload.student).sort(), ['birthDate', 'cpf', 'email', 'mobile', 'name'])
  })

  it('com o ViaCEP respondendo, o candidato só digita CEP e número', () => {
    const visiveis = estacioVisibleAddressFields({
      ok: true,
      address: { street: 'Av. Boa Viagem', neighborhood: 'Boa Viagem', city: 'Recife', state: 'PE' },
      missing: [],
    })
    assert.deepEqual(visiveis, ['zipCode', 'number'])
    // E os campos de endereço só são desenhados sob `showAddressField`.
    for (const f of ['street', 'neighborhood', 'city', 'state']) {
      assert.match(SOURCE, new RegExp(`showAddressField\\('${f}'\\)`), `campo ${f} desenhado sem a condição do ViaCEP`)
    }
  })
})
