#!/usr/bin/env node
/**
 * tracking-watchdog.mjs — blindagem contra apagão de tracking (CMO).
 *
 * Por que existe: o Pixel Meta do Bolsa Click ficou 17 dias morto (30/jun→17/jul)
 * e ninguém percebeu, porque não havia vigilância automática. Este script roda
 * fora de qualquer sessão de agente (cron/CI), detecta queda por MARCA (pageviews
 * de um host caem >X% ou zeram) e por EVENTO (heartbeat de evento de alto volume
 * silencia, conversões param de ingerir), e falha (exit 1) quando acha anomalia
 * crítica — o que faz o GitHub Actions notificar o dono do repo por email, sem
 * depender de nenhuma credencial extra pra alertar.
 *
 * Fontes:
 *   - PostHog (HogQL query API): pageviews por host + last-seen/contagem por evento.
 *   - Meta Graph API (opcional): last_fired_time do dataset/pixel — o cheque que
 *     teria pego o apagão de 17 dias diretamente.
 *
 * Credenciais (env):
 *   POSTHOG_API_KEY          (obrigatório) — personal API key com escopo query:read no projeto 160050
 *   POSTHOG_PROJECT_ID       (opcional)    — sobrescreve o projectId do config
 *   META_SYSTEM_USER_TOKEN   (opcional)    — token durável (ads_read) p/ freshness do pixel; sem ele o cheque Meta é SKIPPED
 *   SLACK_WEBHOOK_URL        (opcional)    — push do resumo pro Slack
 *   RESEND_API_KEY + ALERT_EMAIL_TO + ALERT_EMAIL_FROM (opcional) — push por email
 *
 * Uso:
 *   node scripts/tracking-watchdog.mjs            # roda todos os cheques
 *   node scripts/tracking-watchdog.mjs --json     # imprime relatório como JSON
 *   node scripts/tracking-watchdog.mjs --no-fail  # nunca dá exit 1 (observação)
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONFIG = JSON.parse(readFileSync(join(__dirname, 'tracking-watchdog.config.json'), 'utf8'))

const ARGS = new Set(process.argv.slice(2))
const AS_JSON = ARGS.has('--json')
const NO_FAIL = ARGS.has('--no-fail')

const findings = [] // { severity: 'critical'|'warn'|'info', check, brand?, message }
function add(severity, check, message, extra = {}) {
  findings.push({ severity, check, message, ...extra })
}

// ---------- PostHog ----------
const PH_HOST = (process.env.POSTHOG_HOST || CONFIG.posthog.host).replace(/\/$/, '')
const PH_PROJECT = process.env.POSTHOG_PROJECT_ID || CONFIG.posthog.projectId
const PH_KEY = process.env.POSTHOG_API_KEY

async function phQuery(sql) {
  if (!PH_KEY) throw new Error('POSTHOG_API_KEY ausente')
  const res = await fetch(`${PH_HOST}/api/projects/${PH_PROJECT}/query/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PH_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query: sql } }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`PostHog query ${res.status}: ${body.slice(0, 300)}`)
  }
  const data = await res.json()
  return data.results || []
}

function median(nums) {
  if (!nums.length) return 0
  const s = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

/** Cheque 1 — queda de pageviews por host/marca (último dia completo vs mediana de 7 dias). */
async function checkPageviewsByHost() {
  const ignore = new Set(CONFIG.ignoreHosts || [])
  // Dias COMPLETOS: ontem (=1) até 8 dias atrás. Projeto em UTC.
  const rows = await phQuery(
    `SELECT properties.$host AS host, toDate(timestamp) AS day, count() AS pv
     FROM events
     WHERE event = '$pageview'
       AND timestamp >= toStartOfDay(now()) - INTERVAL 8 DAY
       AND timestamp <  toStartOfDay(now())
     GROUP BY host, day`,
  )
  const byHost = new Map()
  for (const [host, day, pv] of rows) {
    if (ignore.has(host)) continue
    if (!byHost.has(host)) byHost.set(host, new Map())
    byHost.get(host).set(String(day), Number(pv))
  }

  const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString().slice(0, 10)

  for (const cfg of CONFIG.hosts) {
    const days = byHost.get(cfg.host) || new Map()
    const yday = days.get(yesterday) || 0
    const priorVals = [...days.entries()]
      .filter(([d]) => d !== yesterday)
      .map(([, v]) => v)
    const baseline = median(priorVals)

    if (baseline < cfg.minDailyBaseline) {
      add('info', 'pageviews', `${cfg.brand} (${cfg.host}): baseline baixo (${baseline}/dia) — abaixo do piso de alerta (${cfg.minDailyBaseline}). Ontem=${yday}.`, { brand: cfg.brand })
      continue
    }
    if (yday === 0) {
      add('critical', 'pageviews', `${cfg.brand} (${cfg.host}): ZERO pageviews ontem (baseline ~${baseline}/dia). Provável queda de tracking/DNS/SSL.`, { brand: cfg.brand })
    } else if (yday < baseline * (1 - cfg.dropPct)) {
      add('warn', 'pageviews', `${cfg.brand} (${cfg.host}): ${yday} pageviews ontem vs baseline ~${baseline}/dia (queda >${Math.round(cfg.dropPct * 100)}%).`, { brand: cfg.brand })
    } else {
      add('info', 'pageviews', `${cfg.brand} (${cfg.host}): OK — ${yday} pageviews ontem (baseline ~${baseline}/dia).`, { brand: cfg.brand })
    }
  }
}

/** Cheque 2 — heartbeat: eventos de alto volume que silenciaram além do limite. */
async function checkEventHeartbeats() {
  const names = CONFIG.heartbeatEvents.map((e) => `'${e.event}'`).join(', ')
  const rows = await phQuery(
    `SELECT event, dateDiff('hour', max(timestamp), now()) AS hours_since
     FROM events
     WHERE event IN (${names})
       AND timestamp > now() - INTERVAL 14 DAY
     GROUP BY event`,
  )
  const seen = new Map(rows.map(([ev, h]) => [ev, Number(h)]))
  for (const cfg of CONFIG.heartbeatEvents) {
    const hours = seen.has(cfg.event) ? seen.get(cfg.event) : Infinity
    if (hours > cfg.maxSilenceHours) {
      const label = Number.isFinite(hours) ? `${hours}h sem ingerir` : 'sem eventos em 14d'
      add(cfg.severity || 'warn', 'heartbeat', `Evento '${cfg.event}': ${label} (limite ${cfg.maxSilenceHours}h).`)
    } else {
      add('info', 'heartbeat', `Evento '${cfg.event}': OK (${hours}h desde o último).`)
    }
  }
}

/** Cheque 3 — conversões: agregado parou de ingerir na janela vs janela anterior. */
async function checkConversionStall() {
  const names = CONFIG.conversionEvents.map((e) => `'${e}'`).join(', ')
  const w = CONFIG.conversionWindowHours
  const rows = await phQuery(
    `SELECT
       countIf(timestamp > now() - INTERVAL ${w} HOUR) AS cur,
       countIf(timestamp <= now() - INTERVAL ${w} HOUR AND timestamp > now() - INTERVAL ${w * 2} HOUR) AS prev
     FROM events
     WHERE event IN (${names})
       AND timestamp > now() - INTERVAL ${w * 2} HOUR`,
  )
  const [cur = 0, prev = 0] = (rows[0] || []).map(Number)
  if (prev > 0 && cur === 0) {
    add('warn', 'conversions', `Conversões pararam: 0 na janela de ${w}h (janela anterior teve ${prev}). Eventos: ${CONFIG.conversionEvents.join(', ')}.`)
  } else {
    add('info', 'conversions', `Conversões: ${cur} na janela de ${w}h (anterior ${prev}).`)
  }

  // Detalhe por-evento (last-seen) — só informativo, não paga alerta (conversões são esparsas).
  const detail = await phQuery(
    `SELECT event, count() AS c, dateDiff('hour', max(timestamp), now()) AS hours_since
     FROM events WHERE event IN (${names}) AND timestamp > now() - INTERVAL 30 DAY
     GROUP BY event ORDER BY c DESC`,
  )
  for (const [ev, c, h] of detail) {
    add('info', 'conversions-detail', `  ${ev}: ${c} em 30d, último há ${h}h.`)
  }
}

// ---------- Meta ----------
/** Cheque 4 — freshness do pixel Meta (o cheque que teria pego o apagão de 17 dias). */
async function checkMetaPixelFreshness() {
  const token = process.env.META_SYSTEM_USER_TOKEN
  if (!token) {
    add('info', 'meta-pixel', `SKIPPED — META_SYSTEM_USER_TOKEN ausente. (Dependência Rodrigo: System User token durável habilita este cheque, que é o que pega o apagão do pixel diretamente.)`)
    return
  }
  const id = CONFIG.meta.datasetId
  const url = `https://graph.facebook.com/v21.0/${id}?fields=name,last_fired_time,server_last_fired_time,is_active&access_token=${encodeURIComponent(token)}`
  try {
    const res = await fetch(url)
    const data = await res.json()
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error))
    const last = data.last_fired_time || data.server_last_fired_time
    if (!last) {
      add('critical', 'meta-pixel', `Pixel ${CONFIG.meta.datasetName}: sem last_fired_time — nunca disparou ou API mudou.`)
      return
    }
    const hours = Math.round((Date.now() - new Date(last).getTime()) / 3600000)
    if (hours > CONFIG.meta.maxStaleHours) {
      add('critical', 'meta-pixel', `Pixel ${CONFIG.meta.datasetName}: último evento há ${hours}h (limite ${CONFIG.meta.maxStaleHours}h). APAGÃO DE PIXEL.`)
    } else {
      add('info', 'meta-pixel', `Pixel ${CONFIG.meta.datasetName}: OK — último evento há ${hours}h.`)
    }
  } catch (err) {
    add('warn', 'meta-pixel', `Falha ao checar pixel Meta: ${err.message}`)
  }
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
    body: JSON.stringify({ from, to: to.split(','), subject: '[Bolsa Click] Alerta de tracking', text: summary }),
  }).catch(() => {})
}

// ---------- Main ----------
async function main() {
  if (!PH_KEY) {
    console.error('ERRO: POSTHOG_API_KEY ausente. Este é o segredo obrigatório (dependência Rodrigo).')
    process.exit(2)
  }

  const checks = [
    checkPageviewsByHost,
    checkEventHeartbeats,
    checkConversionStall,
    checkMetaPixelFreshness,
  ]
  for (const c of checks) {
    try {
      await c()
    } catch (err) {
      add('warn', 'runner', `Cheque ${c.name} falhou: ${err.message}`)
    }
  }

  const crit = findings.filter((f) => f.severity === 'critical')
  const warn = findings.filter((f) => f.severity === 'warn')

  if (AS_JSON) {
    console.log(JSON.stringify({ ok: crit.length === 0, critical: crit, warn, all: findings }, null, 2))
  } else {
    const icon = { critical: '🔴', warn: '🟡', info: '🟢' }
    console.log(`\n=== Tracking Watchdog — ${new Date().toISOString()} ===`)
    for (const f of findings) {
      if (f.check === 'conversions-detail') { console.log(f.message); continue }
      console.log(`${icon[f.severity] || '•'} [${f.check}] ${f.message}`)
    }
    console.log(`\nResumo: ${crit.length} crítico(s), ${warn.length} aviso(s).`)
  }

  if (crit.length || warn.length) {
    const lines = [...crit, ...warn].map((f) => `${f.severity === 'critical' ? '🔴' : '🟡'} [${f.check}] ${f.message}`)
    const summary = `Tracking Watchdog — ${crit.length} crítico(s), ${warn.length} aviso(s)\n` + lines.join('\n')
    await pushSlack(summary)
    await pushEmail(summary)
  }

  const shouldFail = !NO_FAIL && (CONFIG.failOn === 'warn' ? crit.length + warn.length > 0 : crit.length > 0)
  process.exit(shouldFail ? 1 : 0)
}

main().catch((err) => {
  console.error('Watchdog crashou:', err)
  process.exit(2)
})
