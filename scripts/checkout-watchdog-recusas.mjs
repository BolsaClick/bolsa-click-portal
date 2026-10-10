/**
 * Regras de alerta de recusa de parceiro do checkout-watchdog, em função pura
 * (sem banco) para serem testadas — ver checkout-watchdog-recusas.test.ts.
 *
 * Entrada: linhas de `PartnerInscriptionOutcome` da janela recente.
 * Saída: achados no formato do watchdog ({severity, check, message, transacoes?}).
 *
 *   - MS002 na Estácio → CRÍTICO já na PRIMEIRA ocorrência. É "a instituição
 *     não aceitou os dados", e o formulário da Estácio acabou de mudar
 *     (formulário único, PR #146) sem teste de ponta a ponta contra a Athena.
 *     Uma MS002 é suspeita de regressão até prova em contrário.
 *   - Parceiro com TODOS os envios da janela falhando (≥ 3) → CRÍTICO: é
 *     parceiro fora ou integração quebrada, não azar de um candidato.
 *   - Qualquer outra recusa ou erro → AVISO (sai no Slack/e-mail, não deixa o
 *     job vermelho). MS004 = oferta que sumiu no parceiro, ação é de catálogo.
 */

/** Parceiro com pelo menos isto de envios na janela, TODOS falhando, é crítico. */
export const FALHA_TOTAL_MIN_ENVIOS = 3

/** 123.456.789-09 → ***.***.*89-09 — o alerta vai para Slack e e-mail. */
export function mascararCpf(cpf) {
  const d = String(cpf || '').replace(/\D/g, '')
  return d.length === 11 ? `***.***.*${d.slice(7, 9)}-${d.slice(9)}` : '—'
}

const codigo = (l) => String(l.errorCode || '').toUpperCase()

function detalhe(l) {
  return {
    ext: `${l.partner}/${l.flow}`,
    valor: l.errorCode || (l.httpStatus ? `HTTP ${l.httpStatus}` : l.outcome),
    flow: `${l.courseName || l.offerId || 'oferta ?'} · CPF ${mascararCpf(l.cpf)}`,
    motivo: String(l.errorMessage || '').slice(0, 200),
  }
}

export function avaliarRecusas(linhas, { janelaMin }) {
  const achados = []
  const falhas = linhas.filter((l) => l.outcome !== 'SUCCESS')

  // 1) MS002 na Estácio: grita na primeira.
  const ms002 = falhas.filter((l) => l.partner === 'estacio' && codigo(l) === 'MS002')
  if (ms002.length > 0) {
    achados.push({
      severity: 'critical',
      check: 'estacio-ms002',
      message: `${ms002.length} inscrição(ões) Estácio recusada(s) com MS002 nos últimos ${janelaMin}min — a YDUQS não aceitou os DADOS enviados. Suspeita de regressão do formulário único (PR #146): conferir o payload antes de qualquer contorno.`,
      transacoes: ms002.map(detalhe),
    })
  }

  // 2) Parceiro com tudo falhando.
  const porParceiro = {}
  for (const l of linhas) {
    const p = (porParceiro[l.partner] ||= { total: 0, falhas: 0 })
    p.total += 1
    if (l.outcome !== 'SUCCESS') p.falhas += 1
  }
  for (const [parceiro, n] of Object.entries(porParceiro)) {
    if (n.total >= FALHA_TOTAL_MIN_ENVIOS && n.falhas === n.total) {
      achados.push({
        severity: 'critical',
        check: 'parceiro-falha-total',
        message: `${parceiro}: ${n.total} de ${n.total} envios falharam nos últimos ${janelaMin}min — parceiro fora ou integração quebrada.`,
      })
    }
  }

  // 3) Demais recusas/erros: aviso, para alguém olhar.
  const outras = falhas.filter((l) => !ms002.includes(l))
  if (outras.length > 0) {
    const porCodigo = {}
    for (const l of outras) {
      const k = `${l.partner}:${l.errorCode || (l.httpStatus ? `HTTP${l.httpStatus}` : l.outcome)}`
      porCodigo[k] = (porCodigo[k] || 0) + 1
    }
    achados.push({
      severity: 'warn',
      check: 'recusa-parceiro',
      message: `${outras.length} recusa(s)/erro(s) de parceiro nos últimos ${janelaMin}min: ${Object.entries(porCodigo)
        .map(([k, n]) => `${k}=${n}`)
        .join(', ')}`,
      transacoes: outras.slice(0, 20).map(detalhe),
    })
  }

  if (falhas.length === 0) {
    achados.push({
      severity: 'info',
      check: 'recusa-parceiro',
      message: `Nenhuma recusa de parceiro nos últimos ${janelaMin}min (${linhas.length} envio(s)).`,
    })
  }

  return achados
}
