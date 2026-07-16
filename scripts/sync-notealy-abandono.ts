/**
 * sync-notealy-abandono
 * ---------------------
 * Estágio de CRM calculado por COMPORTAMENTO no produto.
 *
 * Lê a cohort comportamental "Abandonou checkout" do PostHog (quem validou CPF
 * no checkout mas não chegou à página de sucesso), e:
 *   - dry-run (padrão): conta o público e exporta um CSV de retargeting
 *     (WhatsApp), no mesmo padrão de export-disparo-reativacao.ts;
 *   - --apply: além disso, grava a tag "abandonou_checkout" no Notealy (upsert
 *     por telefone→email→CPF), movendo o contato para esse estágio.
 *
 * NÃO envia email/WhatsApp — só taggeia e exporta a lista. O disparo em si é
 * feito pela ferramenta de dispatch (importando o CSV) ou por um template do
 * Notealy, com aprovação explícita e opt-out ("responda SAIR").
 *
 * Config (env): POSTHOG_KEY_USER (chave de query server-side), NOTEALY_API_TOKEN,
 * NOTEALY_TAG_ABANDONO. Opcionais: POSTHOG_API_HOST (default us.posthog.com),
 * POSTHOG_PROJECT_ID (default 160050), NOTEALY_ABANDONO_COHORT_ID (default 419066).
 *
 * Uso:
 *   node --env-file=.env tsx scripts/sync-notealy-abandono.ts            # dry-run
 *   node --env-file=.env tsx scripts/sync-notealy-abandono.ts --apply    # + taggeia no Notealy
 */
import { writeFileSync } from 'fs'

const APPLY = process.argv.includes('--apply')

const POSTHOG_API_HOST = process.env.POSTHOG_API_HOST || 'https://us.posthog.com'
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID || '160050'
const POSTHOG_KEY = process.env.POSTHOG_KEY_USER
const COHORT_ID = process.env.NOTEALY_ABANDONO_COHORT_ID || '419066'

const NOTEALY_API_URL = process.env.NOTEALY_API_URL || 'https://thanos.notealy.com/v1'
const NOTEALY_API_TOKEN = process.env.NOTEALY_API_TOKEN
const NOTEALY_TAG_ABANDONO = process.env.NOTEALY_TAG_ABANDONO

const SITE = 'https://www.bolsaclick.com.br'
const OUT = '/private/tmp/claude-501/-Users-rodrigosilverio-Code-bolsa-click-portal/scratchpad/retargeting-abandono-checkout.csv'

interface PostHogPerson {
  properties?: { email?: string; phone?: string; name?: string }
}
interface Contact {
  name: string
  email?: string
  phone?: string
}

function firstName(name?: string): string {
  const n = (name || '').trim().split(/\s+/)[0] ?? ''
  const clean = n.replace(/^[^\p{L}]+/u, '').replace(/[^\p{L}]+$/u, '')
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase() : 'tudo bem'
}
function waPhone(phone?: string): string {
  const d = (phone || '').replace(/\D/g, '')
  if (!d) return ''
  return d.startsWith('55') ? d : `55${d}`
}
function csvCell(s: string): string {
  return `"${(s ?? '').replace(/"/g, '""')}"`
}

/** Percorre todas as páginas de pessoas da cohort no PostHog. */
async function fetchCohortPersons(): Promise<Contact[]> {
  if (!POSTHOG_KEY) throw new Error('POSTHOG_KEY_USER ausente — não dá pra ler a cohort.')
  const contacts: Contact[] = []
  let url: string | null =
    `${POSTHOG_API_HOST}/api/projects/${POSTHOG_PROJECT_ID}/cohorts/${COHORT_ID}/persons/?limit=200`

  while (url) {
    const res: Response = await fetch(url, {
      headers: { Authorization: `Bearer ${POSTHOG_KEY}` },
    })
    if (!res.ok) {
      throw new Error(`PostHog ${res.status}: ${await res.text().catch(() => '')}`)
    }
    const data: { results?: PostHogPerson[]; next?: string | null } = await res.json()
    for (const p of data.results ?? []) {
      const email = p.properties?.email?.trim() || undefined
      const phone = p.properties?.phone?.trim() || undefined
      if (!email && !phone) continue // sem canal de contato → não é retargetável
      contacts.push({ name: p.properties?.name?.trim() || '', email, phone })
    }
    url = data.next ?? null
  }
  return contacts
}

/** Upsert de contato no Notealy com a tag de "abandonou_checkout". */
async function tagAbandono(c: Contact): Promise<void> {
  if (!NOTEALY_API_TOKEN) throw new Error('NOTEALY_API_TOKEN ausente.')
  const phone = waPhone(c.phone)
  const payload: Record<string, unknown> = { name: c.name || 'Contato', channel: 'WEB' }
  if (c.email) payload.email = c.email
  if (phone) payload.phone = `+${phone}`
  if (NOTEALY_TAG_ABANDONO) payload.tagIds = [NOTEALY_TAG_ABANDONO]

  const res = await fetch(`${NOTEALY_API_URL}/people`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${NOTEALY_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`Notealy ${res.status}: ${await res.text().catch(() => '')}`)
  }
}

async function main() {
  console.log(`=== sync-notealy-abandono (${APPLY ? 'APPLY' : 'DRY-RUN'}) ===`)
  console.log(`  Cohort PostHog: ${COHORT_ID}`)

  const contacts = await fetchCohortPersons()
  const withEmail = contacts.filter((c) => c.email).length
  const withPhone = contacts.filter((c) => waPhone(c.phone)).length

  // Exporta CSV de retargeting (WhatsApp) — mesmo padrão do disparo de reativação.
  const link = `${SITE}/descubra-sua-bolsa?utm_source=whatsapp&utm_medium=retargeting&utm_campaign=abandono-checkout`
  const rows = contacts
    .filter((c) => waPhone(c.phone))
    .map((c) => {
      const nome = firstName(c.name)
      const msg =
        `Oi ${nome}! 👋 Aqui é do Bolsa Click. Vi que você já estava quase garantindo sua bolsa e parou no meio do caminho. ` +
        `Sua bolsa de até 80% sem nota de corte ainda está te esperando — que tal retomar seu sonho de faculdade? ${link} ` +
        `— se não quiser mais receber, responda SAIR.`
      return [nome, waPhone(c.phone), c.email ?? '', link, msg]
    })
  const header = ['nome', 'telefone_wa', 'email', 'link', 'mensagem']
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n')
  writeFileSync(OUT, '﻿' + csv, 'utf8')

  console.log(`  Contatos na cohort (com email OU telefone): ${contacts.length}`)
  console.log(`    com email:    ${withEmail}`)
  console.log(`    com telefone: ${withPhone}`)
  console.log(`  CSV de retargeting (WhatsApp): ${rows.length} linhas → ${OUT}`)

  if (!APPLY) {
    console.log('\n  DRY-RUN: nada foi gravado no Notealy. Rode com --apply para taggear.')
    return
  }

  if (!NOTEALY_TAG_ABANDONO) {
    throw new Error('NOTEALY_TAG_ABANDONO ausente — defina a tag antes de --apply.')
  }
  let tagged = 0
  let failed = 0
  for (const c of contacts) {
    try {
      await tagAbandono(c)
      tagged++
    } catch (e) {
      failed++
      console.error(`  ✗ falha ao taggear (${c.email || c.phone}):`, (e as Error).message)
    }
  }
  console.log(`\n  Notealy: ${tagged} contatos movidos para "abandonou_checkout", ${failed} falhas.`)
}

main().catch((e) => {
  console.error('Erro:', (e as Error).message)
  process.exit(1)
})
