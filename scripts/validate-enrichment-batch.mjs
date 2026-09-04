#!/usr/bin/env node
// scripts/validate-enrichment-batch.mjs
//
// Portão de qualidade dos lotes de enriquecimento editorial escritos pelo agente
// Hermes Ops. Lê as partes JSON de um lote, valida schema + regras editoriais do
// CLAUDE.md + originalidade cruzada, e (com --merge) funde no enrichment-data.json.
//
// Roda ANTES de scripts/enrich-courses-from-json.mjs — este valida o conteúdo,
// aquele escreve no banco.
//
// USO:
//   node scripts/validate-enrichment-batch.mjs --lote=3            # valida e relata
//   node scripts/validate-enrichment-batch.mjs --lote=3 --merge    # valida e funde no acumulado
//   node scripts/validate-enrichment-batch.mjs --dir=/caminho/qualquer
//
// Estrutura esperada do diretório do lote:
//   <dir>/cursos.json          lista pedida: [{ slug, name, nivel }]
//   <dir>/partes/parte-NN.json arrays de cursos escritos pelo Hermes
//
// Calibração: rodado contra o lote 2 (100 cursos já em produção) dá zero erro e
// sobreposição máxima de 11% — os limiares têm folga pra reprovar só problema real.

import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    if (!a.startsWith('--')) return [a, true]
    const eq = a.indexOf('=')
    return eq === -1 ? [a.slice(2), true] : [a.slice(2, eq), a.slice(eq + 1)]
  }),
)

const DIR = args.dir || join(homedir(), `Code/.maestri/enrich/lote${args.lote || '3'}`)
const PARTES = join(DIR, 'partes')
const ACUMULADO = join(dirname(fileURLToPath(import.meta.url)), 'enrichment-data.json')
const MERGE = !!args.merge

// ---- regras editoriais (CLAUDE.md) ----
const CONCORRENTES = /quero\s*-?\s*bolsa|educa\s*-?\s*mais(\s*brasil)?|educamais|vai\s*de\s*bolsa|bolsa\s*universit[áa]ria|edupass/i
const NOTA_INVENTADA = /nota\s+(do\s+|no\s+)?mec|conceito\s+(capes|preliminar)|nota\s+\d[,.]?\d?\s*(no|do|de)\s*mec|ranking\s+(do\s+)?mec|estrelas?\s+no\s+mec/i
const CLICHES = [
  'é importante destacar', 'vale ressaltar', 'vale destacar', 'no cenário atual',
  'cada vez mais', 'em um mundo cada vez mais', 'descubra ', 'venha conhecer',
  'garanta sua vaga', 'não é à toa', 'mergulhe ', 'não por acaso',
  'nos dias de hoje', 'atualmente, o mercado', 'é fundamental destacar',
]
const RAMPA = /^(no cenário|atualmente|nos últimos anos|em um mundo|com o avanço|diante d|nos dias de hoje|com a transformação|hoje em dia)/i

// ---- schema (espelha scripts/enrich-courses-from-json.mjs) ----
const VALID_TYPES = ['BACHARELADO', 'LICENCIATURA', 'TECNOLOGO', 'ESPECIALIZACAO', 'MBA', 'PROFISSIONALIZANTE']
const VALID_NIVEL = ['GRADUACAO', 'POS_GRADUACAO', 'CURSO_PROFISSIONALIZANTE']
const VALID_DEMAND = ['ALTA', 'MEDIA', 'BAIXA']
const REQ_STR = ['slug', 'apiCourseName', 'name', 'fullName', 'type', 'nivel', 'description', 'longDescription', 'duration', 'averageSalary', 'marketDemand']
const REQ_ARR = ['areas', 'skills', 'careerPaths']

const erros = []
const avisos = []
const err = (slug, msg) => erros.push(`${slug}: ${msg}`)
const warn = (slug, msg) => avisos.push(`${slug}: ${msg}`)

// ---- carrega partes ----
const arquivos = readdirSync(PARTES).filter((f) => /^parte-\d+\.json$/.test(f)).sort()
if (!arquivos.length) {
  console.error('Nenhuma parte encontrada em', PARTES)
  process.exit(1)
}

const cursos = []
for (const f of arquivos) {
  let parsed
  try {
    parsed = JSON.parse(readFileSync(join(PARTES, f), 'utf-8'))
  } catch (e) {
    erros.push(`${f}: JSON inválido — ${e.message}`)
    continue
  }
  if (!Array.isArray(parsed)) {
    erros.push(`${f}: não é array`)
    continue
  }
  parsed.forEach((c) => cursos.push({ ...c, _arquivo: f }))
}
console.log(`Partes lidas: ${arquivos.length} | cursos: ${cursos.length}`)

// ---- cobertura vs lista pedida ----
const pedidos = JSON.parse(readFileSync(join(DIR, 'cursos.json'), 'utf-8'))
const pedidoSlugs = new Set(pedidos.map((c) => c.slug))
const entregues = new Set(cursos.map((c) => c.slug))
const faltando = [...pedidoSlugs].filter((s) => !entregues.has(s))
const extras = [...entregues].filter((s) => !pedidoSlugs.has(s))
if (faltando.length) avisos.push(`FALTANDO ${faltando.length} curso(s): ${faltando.join(', ')}`)
if (extras.length) erros.push(`SLUG FORA DA LISTA (${extras.length}): ${extras.join(', ')}`)

// duplicata de slug dentro do lote
const vistos = new Map()
for (const c of cursos) {
  if (vistos.has(c.slug)) erros.push(`slug repetido no lote: ${c.slug} (${vistos.get(c.slug)} e ${c._arquivo})`)
  else vistos.set(c.slug, c._arquivo)
}

// já enriquecido antes?
const acumulado = JSON.parse(readFileSync(ACUMULADO, 'utf-8'))
const jaTem = new Set(acumulado.map((c) => c.slug))
cursos.filter((c) => jaTem.has(c.slug)).forEach((c) => warn(c.slug, 'já existe no acumulado — vai sobrescrever'))

// ---- validação por curso ----
for (const c of cursos) {
  const s = c.slug || `(sem slug em ${c._arquivo})`

  for (const f of REQ_STR) {
    if (!c[f] || typeof c[f] !== 'string' || !c[f].trim()) err(s, `campo "${f}" vazio/inválido`)
  }
  for (const f of REQ_ARR) {
    if (!Array.isArray(c[f]) || c[f].length === 0) err(s, `array "${f}" vazio`)
    else if (c[f].length < 4) warn(s, `"${f}" com só ${c[f].length} item(ns) — brief pede 4 a 8`)
  }
  if (!VALID_TYPES.includes(c.type)) err(s, `type "${c.type}" inválido`)
  if (!VALID_NIVEL.includes(c.nivel)) err(s, `nivel "${c.nivel}" inválido`)
  if (!VALID_DEMAND.includes(c.marketDemand)) err(s, `marketDemand "${c.marketDemand}" inválido`)
  if (c.nivel === 'POS_GRADUACAO' && !['ESPECIALIZACAO', 'MBA'].includes(c.type)) err(s, `type ${c.type} incompatível com POS_GRADUACAO`)
  if (c.nivel === 'GRADUACAO' && !['BACHARELADO', 'LICENCIATURA', 'TECNOLOGO'].includes(c.type)) err(s, `type ${c.type} incompatível com GRADUACAO`)

  const ld = c.longDescription || ''
  const de = c.description || ''
  if (ld.length < 800) err(s, `longDescription ${ld.length} chars (mín 800)`)
  if (de.length > 220) err(s, `description ${de.length} chars (máx 220)`)
  if (/[*_#`]{1,}/.test(ld) && /(\*\*|##|```)/.test(ld)) warn(s, 'longDescription parece ter markdown')

  const texto = `${de} ${ld} ${(c.areas || []).join(' ')} ${(c.careerPaths || []).join(' ')} ${(c.keywords || []).join(' ')}`
  if (CONCORRENTES.test(texto)) err(s, `MENCIONA CONCORRENTE — "${texto.match(CONCORRENTES)[0]}"`)
  if (NOTA_INVENTADA.test(texto)) err(s, `nota MEC/CAPES inventada — "${texto.match(NOTA_INVENTADA)[0]}"`)

  const baixo = texto.toLowerCase()
  const achados = CLICHES.filter((k) => baixo.includes(k))
  if (achados.length) warn(s, `clichê de IA: ${achados.join(' / ')}`)
  if (RAMPA.test(ld.trim())) warn(s, `abre com rampa de contextualização: "${ld.trim().slice(0, 60)}..."`)

  if (c.averageSalary && !/R\$\s?[\d.]+/.test(c.averageSalary)) warn(s, `averageSalary em formato estranho: "${c.averageSalary}"`)
  if (/segundo o glassdoor|de acordo com o glassdoor|dados do catho|segundo a catho/i.test(texto)) {
    warn(s, 'atribui fonte de salário (brief pede faixa nua)')
  }
}

// ---- originalidade entre cursos do lote (trigramas de palavra) ----
function trigramas(t) {
  const p = t.toLowerCase().replace(/[^a-zà-ú0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
  const set = new Set()
  for (let i = 0; i + 2 < p.length; i++) set.add(`${p[i]} ${p[i + 1]} ${p[i + 2]}`)
  return set
}
const perfis = cursos.map((c) => ({ slug: c.slug, tri: trigramas(c.longDescription || '') }))
for (let i = 0; i < perfis.length; i++) {
  for (let j = i + 1; j < perfis.length; j++) {
    const a = perfis[i].tri, b = perfis[j].tri
    if (!a.size || !b.size) continue
    let inter = 0
    for (const t of a) if (b.has(t)) inter++
    const jac = inter / (a.size + b.size - inter)
    if (jac > 0.5) err(perfis[i].slug, `texto quase idêntico a ${perfis[j].slug} (${(jac * 100).toFixed(0)}% de sobreposição)`)
    else if (jac > 0.32) warn(perfis[i].slug, `sobreposição alta com ${perfis[j].slug} (${(jac * 100).toFixed(0)}%)`)
  }
}

// ---- relatório ----
console.log(`\n=== AVISOS (${avisos.length}) ===`)
avisos.forEach((a) => console.log('  ⚠ ', a))
console.log(`\n=== ERROS (${erros.length}) ===`)
erros.forEach((e) => console.log('  ✗ ', e))

if (erros.length) {
  console.log('\nBLOQUEADO — corrigir os erros antes de aplicar.')
  process.exit(1)
}
console.log('\n✓ Portão de qualidade passou.')

if (MERGE) {
  const porSlug = new Map(acumulado.map((c) => [c.slug, c]))
  for (const c of cursos) {
    const { _arquivo, ...limpo } = c
    porSlug.set(c.slug, limpo)
  }
  const novo = [...porSlug.values()]
  // arquivo original não tem newline final — preservar pra não sujar o diff
  writeFileSync(ACUMULADO, JSON.stringify(novo, null, 2))
  console.log(`\n✓ enrichment-data.json: ${acumulado.length} → ${novo.length} cursos`)
} else {
  console.log(`(sem --merge: nada foi escrito. Acumulado ficaria com ${new Set([...jaTem, ...entregues]).size} cursos.)`)
}
