/**
 * Regras de alerta do checkout-watchdog para recusa de parceiro. A principal:
 * UMA MS002 na Estácio já é crítico (job vermelho + Slack + e-mail) — o
 * formulário único (PR #146) foi ao ar sem teste de ponta a ponta na Athena.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { avaliarRecusas, mascararCpf } from './checkout-watchdog-recusas.mjs'

type Linha = Record<string, unknown>
type Achado = { severity: string; check: string; message: string; transacoes?: Array<Record<string, string>> }
const avaliar = (linhas: Linha[]): Achado[] => avaliarRecusas(linhas, { janelaMin: 40 })

const ok = (partner: string): Linha => ({ partner, flow: 'checkout-direto', outcome: 'SUCCESS' })
const recusa = (partner: string, errorCode: string | null, extra: Linha = {}): Linha => ({
  partner,
  flow: 'checkout-direto',
  outcome: 'REFUSED',
  errorCode,
  cpf: '52998224725',
  courseName: 'Administração',
  errorMessage: 'Dados inválidos',
  ...extra,
})

describe('avaliarRecusas', () => {
  it('UMA MS002 na Estácio, no meio de sucessos, já é crítico', () => {
    const achados = avaliar([ok('estacio'), ok('estacio'), recusa('estacio', 'MS002'), ok('cogna')])
    const critico = achados.find((a) => a.check === 'estacio-ms002')
    assert.ok(critico, 'MS002 tem que gerar achado')
    assert.equal(critico.severity, 'critical')
    assert.equal(critico.transacoes?.length, 1)
  })

  it('código em minúsculas também conta', () => {
    const achados = avaliar([recusa('estacio', 'ms002')])
    assert.ok(achados.some((a) => a.check === 'estacio-ms002' && a.severity === 'critical'))
  })

  it('o alerta não vaza CPF inteiro', () => {
    const [critico] = avaliar([recusa('estacio', 'MS002')])
    const texto = JSON.stringify(critico)
    assert.ok(!texto.includes('52998224725'))
    assert.match(texto, /\*\*\*\.\*\*\*\.\*47-25/)
    assert.match(texto, /Administração/)
  })

  it('MS004 (oferta sumiu) é aviso, não crítico', () => {
    const achados = avaliar([ok('estacio'), recusa('estacio', 'MS004')])
    assert.equal(achados.filter((a) => a.severity === 'critical').length, 0)
    const aviso = achados.find((a) => a.check === 'recusa-parceiro')
    assert.equal(aviso?.severity, 'warn')
    assert.match(aviso!.message, /estacio:MS004=1/)
  })

  it('MS002 na Cogna não é a regra da Estácio (aviso)', () => {
    const achados = avaliar([ok('cogna'), recusa('cogna', 'MS002')])
    assert.ok(!achados.some((a) => a.check === 'estacio-ms002'))
    assert.ok(achados.some((a) => a.check === 'recusa-parceiro' && a.severity === 'warn'))
  })

  it('parceiro com 3 de 3 falhando → crítico; 2 de 2 ainda não', () => {
    const tres = avaliar([recusa('cogna', null, { httpStatus: 502, outcome: 'ERROR' }), recusa('cogna', 'X'), recusa('cogna', 'Y')])
    assert.ok(tres.some((a) => a.check === 'parceiro-falha-total' && a.severity === 'critical'))
    const dois = avaliar([recusa('cogna', 'X'), recusa('cogna', 'Y')])
    assert.ok(!dois.some((a) => a.check === 'parceiro-falha-total'))
  })

  it('sem falhas → só info', () => {
    const achados = avaliar([ok('estacio'), ok('cogna')])
    assert.deepEqual(achados.map((a) => a.severity), ['info'])
  })

  it('mascararCpf', () => {
    assert.equal(mascararCpf('529.982.247-25'), '***.***.*47-25')
    assert.equal(mascararCpf(null), '—')
  })
})
