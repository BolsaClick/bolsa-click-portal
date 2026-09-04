/**
 * Checkout Watchdog — pega dinheiro cobrado que não virou inscrição.
 *
 * POR QUE ELE EXISTE
 *
 * Os três checkouts pagos do portal (Cogna/matrícula, campanha ingressa e
 * Estácio) têm a mesma forma: cobra primeiro, e a inscrição no parceiro só
 * acontece depois que o pagamento confirma. Quando esse segundo passo falha, a
 * falha é SILENCIOSA — o aluno pagou, a tela dele mostra sucesso ou fica
 * girando, e nenhum log grita. Só o aluno descobre, dias depois.
 *
 * Em 2026-09-04 apareceram três variantes disso no mesmo dia: um claim que
 * nunca elegia ninguém (nunca inscrevia), um que podia eleger dois (inscrevia
 * em dobro) e um estorno cujo endpoint estava afirmado mas não verificado.
 *
 * Este watchdog não tenta prever a próxima variante. Ele mede o SINTOMA que
 * todas compartilham: existe transação paga sem desfecho gravado?
 *
 * VARIÁVEIS
 *   DATABASE_URL             (obrigatória)
 *   SLACK_WEBHOOK_URL        (opcional) — push do resumo pro Slack
 *   RESEND_API_KEY + ALERT_EMAIL_TO + ALERT_EMAIL_FROM (opcional) — push por email
 *
 * FLAGS
 *   --json      saída legível por máquina
 *   --no-fail   nunca sai com código 1 (útil para rodar na mão)
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ARGS = new Set(process.argv.slice(2))
const AS_JSON = ARGS.has('--json')
const NO_FAIL = ARGS.has('--no-fail')

/**
 * Carência antes de considerar uma transação travada. A confirmação normal
 * leva segundos; 10 minutos é folga de sobra para retry de webhook e para o
 * polling do cliente, sem deixar o problema envelhecer um dia inteiro.
 */
const CARENCIA_MIN = Number(process.env.CHECKOUT_WATCHDOG_CARENCIA_MIN) || 10

/**
 * Janela de análise. Existe para o alerta falar do AGORA: sem ela, transações
 * antigas — de antes de os fluxos gravarem desfecho — deixariam o job vermelho
 * para sempre, e um alerta permanentemente vermelho é um alerta desligado.
 */
const JANELA_DIAS = Number(process.env.CHECKOUT_WATCHDOG_JANELA_DIAS) || 7

const findings = []
function add(severity, check, message, extra = {}) {
  findings.push({ severity, check, message, ...extra })
}

const brl = (centavos) =>
  (Number(centavos || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/**
 * As três chaves em que cada fluxo grava o desfecho da inscrição. Transação
 * paga sem NENHUMA delas é uma transação que cobrou e não concluiu.
 *
 *   confirmResults  → fluxo Cogna/matrícula  (confirm-matricula.ts)
 *   campaignResult  → fluxo campanha ingressa (confirm-campaign.ts)
 *   estacioResult   → fluxo Estácio/YDUQS     (confirm-estacio.ts)
 *
 * Um fluxo novo que esqueça de gravar desfecho aparece aqui como falso
 * positivo — que é o comportamento certo: melhor investigar do que ficar cego.
 */
const CHAVES_DE_DESFECHO = ['confirmResults', 'campaignResult', 'estacioResult']

// ---------- Checagens ----------

/** CRÍTICO: pagou e a inscrição nunca aconteceu. É o cheque principal. */
async function checkPagoSemDesfecho() {
  const linhas = await prisma.$queryRaw`
    SELECT id,
           "externalTransactionId" AS ext,
           "paidAt",
           "amountInCents"         AS cents,
           "courseName",
           COALESCE(metadata->>'checkoutFlow', 'cogna') AS flow,
           metadata->>'estacioClaimedAt'  AS claim_estacio,
           metadata->>'campaignClaimedAt' AS claim_campanha
    FROM "Transaction"
    WHERE status = 'PAID'
      AND "paidAt" < now() - make_interval(mins => ${CARENCIA_MIN}::int)
      AND "paidAt" > now() - make_interval(days => ${JANELA_DIAS}::int)
      AND metadata->'confirmResults' IS NULL
      AND metadata->'campaignResult' IS NULL
      AND metadata->'estacioResult'  IS NULL
    ORDER BY "paidAt" DESC
    LIMIT 50
  `

  if (linhas.length === 0) {
    add('info', 'pago-sem-desfecho', `Nenhuma transação paga sem inscrição nos últimos ${JANELA_DIAS} dias.`)
    return
  }

  const total = linhas.reduce((s, l) => s + Number(l.cents || 0), 0)
  const porFluxo = {}
  for (const l of linhas) porFluxo[l.flow] = (porFluxo[l.flow] || 0) + 1

  add(
    'critical',
    'pago-sem-desfecho',
    `${linhas.length} transação(ões) pagas há mais de ${CARENCIA_MIN}min SEM inscrição — ${brl(total)} cobrados sem contrapartida. Por fluxo: ${
      Object.entries(porFluxo).map(([f, n]) => `${f}=${n}`).join(', ')
    }`,
    { transacoes: linhas.map((l) => ({ ext: l.ext, flow: l.flow, paidAt: l.paidAt, valor: brl(l.cents) })) },
  )

  // O claim carimbado distingue "ninguém assumiu" de "alguém assumiu e morreu
  // no meio" — são causas diferentes e levam a lugares diferentes no código.
  const semClaim = linhas.filter((l) => !l.claim_estacio && !l.claim_campanha).length
  if (semClaim > 0) {
    add(
      'warn',
      'pago-sem-claim',
      `${semClaim} dessas nunca tiveram claim carimbado: ninguém sequer assumiu a inscrição (suspeita de claim que não elege).`,
    )
  }
}

/** CRÍTICO: o parceiro recusou, o estorno foi tentado e NÃO confirmou. */
async function checkEstornoNaoConfirmado() {
  const linhas = await prisma.$queryRaw`
    SELECT "externalTransactionId" AS ext,
           "paidAt",
           "amountInCents" AS cents,
           COALESCE(metadata->'estacioResult'->>'reason',
                    metadata->'campaignResult'->>'reason') AS motivo
    FROM "Transaction"
    WHERE "paidAt" > now() - make_interval(days => ${JANELA_DIAS}::int)
      AND (
        (metadata->'estacioResult'->>'status'  = 'refused' AND metadata->'estacioResult'->>'refunded'  = 'false')
        OR
        (metadata->'campaignResult'->>'status' = 'refused' AND metadata->'campaignResult'->>'refunded' = 'false')
      )
    ORDER BY "paidAt" DESC
    LIMIT 50
  `

  if (linhas.length === 0) {
    add('info', 'estorno-nao-confirmado', 'Nenhum estorno pendente de confirmação.')
    return
  }

  const total = linhas.reduce((s, l) => s + Number(l.cents || 0), 0)
  add(
    'critical',
    'estorno-nao-confirmado',
    `${linhas.length} recusa(s) do parceiro em que o estorno NÃO confirmou — ${brl(total)} retidos indevidamente. Precisa de estorno manual no gateway.`,
    { transacoes: linhas.map((l) => ({ ext: l.ext, paidAt: l.paidAt, valor: brl(l.cents), motivo: l.motivo })) },
  )
}

/** Denominador: sem ele, "0 problemas" tanto pode ser saúde quanto funil parado. */
async function checkVolume() {
  const [linha] = await prisma.$queryRaw`
    SELECT
      COUNT(*) FILTER (WHERE status = 'PAID' AND "paidAt" > now() - interval '24 hours') AS pagas_24h,
      COUNT(*) FILTER (
        WHERE status = 'PAID' AND "paidAt" > now() - interval '24 hours'
          AND (metadata->'confirmResults' IS NOT NULL
               OR metadata->'campaignResult' IS NOT NULL
               OR metadata->'estacioResult'  IS NOT NULL)
      ) AS concluidas_24h
    FROM "Transaction"
  `

  const pagas = Number(linha?.pagas_24h || 0)
  const ok = Number(linha?.concluidas_24h || 0)

  if (pagas === 0) {
    add('info', 'volume', 'Nenhum pagamento nas últimas 24h — nada a conferir (ou o funil parou).')
    return
  }
  add('info', 'volume', `Últimas 24h: ${pagas} pagamento(s), ${ok} com inscrição concluída (${Math.round((ok / pagas) * 100)}%).`)
}

// ---------- Notificações ----------
async function pushSlack(summary) {
  const url = process.env.SLACK_WEBHOOK_URL
  if (!url) return
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: summary }),
  }).catch(() => {})
}

async function pushEmail(summary) {
  const key = process.env.RESEND_API_KEY
  const to = process.env.ALERT_EMAIL_TO
  const from = process.env.ALERT_EMAIL_FROM
  if (!key || !to || !from) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: to.split(','),
      subject: '[Bolsa Click] Cobrança sem inscrição no checkout',
      text: summary,
    }),
  }).catch(() => {})
}

// ---------- Main ----------
async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('ERRO: DATABASE_URL ausente — sem banco não há o que medir.')
    process.exit(2)
  }

  const checks = [checkPagoSemDesfecho, checkEstornoNaoConfirmado, checkVolume]
  for (const c of checks) {
    try {
      await c()
    } catch (err) {
      // Cheque que não roda não é ressalva, é cegueira: um job verde por causa
      // de credencial errada ou banco fora é exatamente a falha silenciosa que
      // este watchdog existe para pegar.
      add('critical', 'runner', `Cheque ${c.name} não pôde rodar: ${err.message}`)
    }
  }

  const crit = findings.filter((f) => f.severity === 'critical')
  const warn = findings.filter((f) => f.severity === 'warn')

  if (AS_JSON) {
    console.log(JSON.stringify({ ok: crit.length === 0, critical: crit, warn, all: findings }, null, 2))
  } else {
    const icon = { critical: '🔴', warn: '🟡', info: '🟢' }
    console.log(`\n=== Checkout Watchdog — ${new Date().toISOString()} ===`)
    for (const f of findings) {
      console.log(`${icon[f.severity] || '•'} [${f.check}] ${f.message}`)
      for (const t of f.transacoes || []) {
        console.log(`      ↳ ${t.ext}  ${t.valor}  ${t.flow || ''} ${t.motivo ? `— ${t.motivo}` : ''}`)
      }
    }
    console.log(`\nResumo: ${crit.length} crítico(s), ${warn.length} aviso(s).`)
  }

  if (crit.length || warn.length) {
    const lines = [...crit, ...warn].map(
      (f) => `${f.severity === 'critical' ? '🔴' : '🟡'} [${f.check}] ${f.message}`,
    )
    const summary = `Checkout Watchdog — ${crit.length} crítico(s), ${warn.length} aviso(s)\n` + lines.join('\n')
    await pushSlack(summary)
    await pushEmail(summary)
  }

  await prisma.$disconnect()
  process.exit(!NO_FAIL && crit.length > 0 ? 1 : 0)
}

main().catch(async (err) => {
  console.error('Checkout Watchdog crashou:', err)
  await prisma.$disconnect().catch(() => {})
  process.exit(2)
})
