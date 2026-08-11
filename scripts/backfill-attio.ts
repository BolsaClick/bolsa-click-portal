/**
 * Backfill da tabela Lead para o CRM (Attio).
 *
 * Dry-run por padrão: conta, agrupa e mostra amostra sem escrever nada.
 * `--apply` grava de verdade.
 *
 *   npx tsx --env-file=.env scripts/backfill-attio.ts
 *   npx tsx --env-file=.env scripts/backfill-attio.ts --apply
 *
 * Ordena do mais ANTIGO para o mais novo de propósito: o estágio no Attio
 * nunca regride e a UTM é de primeiro toque, então processar em ordem
 * cronológica reproduz a história real do candidato. Ao contrário, o registro
 * mais novo entraria primeiro e a atribuição ficaria no toque errado.
 */

import { PrismaClient } from '@prisma/client'
import { upsertCandidato, toMarca, type Estagio, type OrigemFluxo } from '../app/lib/api/attio'

const prisma = new PrismaClient()
const APPLY = process.argv.includes('--apply')

// 25 escritas/s é o limite do Attio; cada lead custa 2 requests (leitura do
// estágio + upsert). 120ms entre leads deixa folga confortável.
const DELAY_MS = 120

/** `source` da tabela Lead → opção do select origem_fluxo no Attio. */
function toOrigemFluxo(source: string | null): OrigemFluxo | undefined {
  if (!source) return undefined
  if (source.startsWith('ingressa-')) return 'ingressa'
  if (source === 'simulador-de-bolsa') return 'simulador'
  if (source === 'teste-vocacional') return 'teste-vocacional'
  if (source === 'checkout-matricula') return 'checkout-matricula'
  if (source === 'checkout-estacio') return 'checkout-estacio'
  return undefined
}

/**
 * Estágio inferido do que o banco sabe. Conservador de propósito: o banco não
 * registra inscrição nem matrícula (isso vive no parceiro e no PostHog), então
 * todo mundo entra como `lead`. Quem já converteu será promovido pelo próprio
 * fluxo na próxima interação — e a precedência garante que promover é possível,
 * rebaixar não.
 */
function inferirEstagio(): Estagio {
  return 'lead'
}

function utmDoExtraData(extraData: unknown): Record<string, string> | undefined {
  if (!extraData || typeof extraData !== 'object') return undefined
  const utm = (extraData as Record<string, unknown>).utm
  if (!utm || typeof utm !== 'object') return undefined
  const r = utm as Record<string, unknown>
  const pick = (k: string) => (typeof r[k] === 'string' && r[k] ? (r[k] as string) : undefined)
  const out = {
    utmSource: pick('utm_source'),
    utmMedium: pick('utm_medium'),
    utmCampaign: pick('utm_campaign'),
    utmContent: pick('utm_content'),
  }
  return Object.values(out).some(Boolean) ? (out as Record<string, string>) : undefined
}

async function main() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'asc' } })

  const semTelefone = leads.filter((l) => !l.phone || l.phone.replace(/\D/g, '').length < 10)
  const elegiveis = leads.filter((l) => !semTelefone.includes(l))

  console.log(`\n=== BACKFILL ATTIO ${APPLY ? '(APPLY — GRAVANDO)' : '(DRY RUN — nada será escrito)'} ===\n`)
  console.log(`leads na tabela:      ${leads.length}`)
  console.log(`sem telefone válido:  ${semTelefone.length}  (pulados — telefone é a chave de casamento)`)
  console.log(`elegíveis:            ${elegiveis.length}`)

  const porFonte = new Map<string, number>()
  const porMarca = new Map<string, number>()
  let comNascimento = 0
  let comUtm = 0
  for (const l of elegiveis) {
    porFonte.set(l.source ?? '(sem source)', (porFonte.get(l.source ?? '(sem source)') ?? 0) + 1)
    porMarca.set(l.institutionName ?? '(sem marca)', (porMarca.get(l.institutionName ?? '(sem marca)') ?? 0) + 1)
    if (l.birthDate) comNascimento++
    if (utmDoExtraData(l.extraData)) comUtm++
  }

  console.log(`\npor origem:`)
  for (const [k, v] of [...porFonte].sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`)
  console.log(`\npor marca:`)
  for (const [k, v] of [...porMarca].sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`)
  console.log(`\ncom nascimento: ${comNascimento}   com UTM: ${comUtm}`)

  // Como cada nome de unidade do catálogo cai nas opções do select. Confira
  // esta tabela ANTES do --apply: o que virar "Outra" indevidamente vira
  // segmentação perdida no CRM, e corrigir depois exige reescrever tudo.
  const mapeamento = new Map<string, { marca: string; n: number }>()
  for (const l of elegiveis) {
    if (!l.institutionName) continue
    const destino = toMarca(l.institutionName) ?? '(nenhuma)'
    const atual = mapeamento.get(l.institutionName)
    mapeamento.set(l.institutionName, { marca: destino, n: (atual?.n ?? 0) + 1 })
  }
  console.log(`\nmapeamento de marca (catálogo → opção no Attio):`)
  for (const [nome, { marca, n }] of [...mapeamento].sort((a, b) => b[1].n - a[1].n)) {
    const alerta = marca === 'Outra' ? '  <-- CONFERIR' : ''
    console.log(`  ${String(n).padStart(3)}  ${nome}  ->  ${marca}${alerta}`)
  }

  // Telefones repetidos viram UM registro no Attio (a chave é única). Contar
  // antes evita a surpresa de "mandei 163 e apareceram 150".
  const telefonesUnicos = new Set(elegiveis.map((l) => l.phone.replace(/\D/g, '')))
  console.log(`\ntelefones únicos: ${telefonesUnicos.size} — este é o número de registros que devem aparecer no Attio`)
  console.log(`(${elegiveis.length - telefonesUnicos.size} leads compartilham telefone e serão mesclados)`)

  if (!APPLY) {
    console.log(`\nAmostra dos 3 primeiros (mais antigos):`)
    for (const l of elegiveis.slice(0, 3)) {
      console.log(`  ${l.createdAt.toISOString().slice(0, 10)}  ${l.name}  ${l.institutionName ?? '-'}  ${l.source ?? '-'}`)
    }
    console.log(`\nNada foi escrito. Rode com --apply para gravar.\n`)
    await prisma.$disconnect()
    return
  }

  let ok = 0
  let erro = 0
  for (const [i, lead] of elegiveis.entries()) {
    try {
      await upsertCandidato({
        phone: lead.phone,
        name: lead.name,
        email: lead.email || undefined,
        cpf: lead.cpf || undefined,
        birthDate: lead.birthDate,
        brand: lead.institutionName || undefined,
        courseName: lead.courseName || undefined,
        modality: lead.modalidade || undefined,
        estagio: inferirEstagio(),
        origemFluxo: toOrigemFluxo(lead.source),
        leadId: lead.id,
        utm: utmDoExtraData(lead.extraData),
      })
      ok++
    } catch (e) {
      erro++
      console.error(`  ✗ ${lead.id} (${lead.name}): ${e instanceof Error ? e.message : String(e)}`)
    }
    if ((i + 1) % 25 === 0) console.log(`  ... ${i + 1}/${elegiveis.length}`)
    await new Promise((r) => setTimeout(r, DELAY_MS))
  }

  console.log(`\ngravados: ${ok}   erros: ${erro}\n`)
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
