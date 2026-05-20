#!/usr/bin/env node
// scripts/enrich-courses-from-json.mjs
//
// Lê scripts/enrichment-data.json (conteúdo editorial preparado offline) e
// upserta na tabela FeaturedCourse com isActive=true + enrichedAt agora.
//
// USO:
//   node --env-file=.env scripts/enrich-courses-from-json.mjs [flags]
//
// FLAGS:
//   --dry-run         Não escreve no DB, só loga
//   --slug=<slug>     Processa só um curso do JSON
//   --file=<path>     Override do arquivo (default: scripts/enrichment-data.json)
//
// O JSON deve ser um array de objetos com:
// {
//   "slug": "engenharia-de-software-bacharelado",
//   "apiCourseName": "Engenharia de Software",          // nome limpo
//   "name": "Engenharia de Software",                    // nome de exibição
//   "fullName": "Engenharia de Software - Bacharelado",  // nome completo
//   "type": "BACHARELADO|LICENCIATURA|TECNOLOGO|ESPECIALIZACAO|MBA",
//   "nivel": "GRADUACAO|POS_GRADUACAO",
//   "description": "≤200 chars",
//   "longDescription": "≥800 chars, pt-BR, sem markdown",
//   "duration": "ex: '4 anos'",
//   "areas": ["..."],
//   "skills": ["..."],
//   "careerPaths": ["..."],
//   "averageSalary": "R$ X.XXX a R$ XX.XXX",
//   "marketDemand": "ALTA|MEDIA|BAIXA",
//   "imageUrl": "/assets/...",  // opcional, default og-image
//   "keywords": ["..."]          // opcional, default vazio
// }

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const VALID_TYPES = ['BACHARELADO', 'LICENCIATURA', 'TECNOLOGO', 'ESPECIALIZACAO', 'MBA']
const VALID_NIVEL = ['GRADUACAO', 'POS_GRADUACAO']
const VALID_DEMAND = ['ALTA', 'MEDIA', 'BAIXA']
const DEFAULT_IMAGE = '/assets/og-image-bolsaclick.png'

const REQUIRED_STRINGS = ['slug', 'apiCourseName', 'name', 'fullName', 'type', 'nivel', 'description', 'longDescription', 'duration', 'averageSalary', 'marketDemand']
const REQUIRED_ARRAYS = ['areas', 'skills', 'careerPaths']

function validate(c, idx) {
  for (const f of REQUIRED_STRINGS) {
    if (!c[f] || typeof c[f] !== 'string' || !c[f].trim()) {
      throw new Error(`[${idx}] ${c.slug || '(sem slug)'}: campo "${f}" vazio ou inválido`)
    }
  }
  for (const f of REQUIRED_ARRAYS) {
    if (!Array.isArray(c[f]) || c[f].length === 0) {
      throw new Error(`[${idx}] ${c.slug}: array "${f}" vazio`)
    }
  }
  if (!VALID_TYPES.includes(c.type)) throw new Error(`[${idx}] ${c.slug}: type "${c.type}" inválido`)
  if (!VALID_NIVEL.includes(c.nivel)) throw new Error(`[${idx}] ${c.slug}: nivel "${c.nivel}" inválido`)
  if (!VALID_DEMAND.includes(c.marketDemand)) throw new Error(`[${idx}] ${c.slug}: marketDemand "${c.marketDemand}" inválido`)
  if (c.longDescription.length < 800) throw new Error(`[${idx}] ${c.slug}: longDescription ${c.longDescription.length} chars (min 800)`)
  if (c.description.length > 220) throw new Error(`[${idx}] ${c.slug}: description ${c.description.length} chars (max 220)`)
  if (c.nivel === 'GRADUACAO' && !['BACHARELADO', 'LICENCIATURA', 'TECNOLOGO'].includes(c.type)) {
    throw new Error(`[${idx}] ${c.slug}: type ${c.type} incompatível com GRADUACAO`)
  }
  if (c.nivel === 'POS_GRADUACAO' && !['ESPECIALIZACAO', 'MBA'].includes(c.type)) {
    throw new Error(`[${idx}] ${c.slug}: type ${c.type} incompatível com POS_GRADUACAO`)
  }
}

/**
 * Roda o enrich a partir do JSON. Pode receber um `prisma` externo (pra reuso
 * no meta-script `seed.ts`) ou criar e fechar o seu próprio.
 *
 * @param {{ dryRun?: boolean, slug?: string, file?: string, prisma?: PrismaClient }} opts
 * @returns {Promise<{ ok: number, fail: number, errors: Array<{slug:string, error:string}> }>}
 */
export async function enrichCoursesFromJson(opts = {}) {
  const {
    dryRun = false,
    slug: singleSlug,
    file = join(process.cwd(), 'scripts', 'enrichment-data.json'),
  } = opts

  console.log(`=== enrich-from-json ===`)
  console.log({ file, dryRun, singleSlug })

  const raw = readFileSync(file, 'utf-8')
  const data = JSON.parse(raw)
  if (!Array.isArray(data)) throw new Error('JSON precisa ser um array')

  let pool = data
  if (singleSlug) pool = pool.filter((c) => c.slug === singleSlug)

  console.log(`Cursos no JSON: ${data.length} | Processando: ${pool.length}`)

  pool.forEach(validate)
  console.log('Validação OK pra todos os', pool.length, 'cursos')

  if (dryRun) {
    pool.forEach((c, i) =>
      console.log(`[${i + 1}/${pool.length}] [DRY] ${c.slug} | ${c.name} | ${c.type} | ${c.nivel} | desc=${c.longDescription.length}c`),
    )
    return { ok: 0, fail: 0, errors: [], dryRun: true, count: pool.length }
  }

  const ownsPrisma = !opts.prisma
  const prisma = opts.prisma ?? new PrismaClient()
  let ok = 0
  let fail = 0
  const errors = []

  for (const [i, c] of pool.entries()) {
    try {
      await prisma.featuredCourse.upsert({
        where: { slug: c.slug },
        create: {
          slug: c.slug,
          apiCourseName: c.apiCourseName,
          name: c.name,
          fullName: c.fullName,
          type: c.type,
          nivel: c.nivel,
          description: c.description,
          longDescription: c.longDescription,
          duration: c.duration,
          areas: c.areas,
          skills: c.skills,
          careerPaths: c.careerPaths,
          averageSalary: c.averageSalary,
          marketDemand: c.marketDemand,
          imageUrl: c.imageUrl || DEFAULT_IMAGE,
          keywords: c.keywords || [],
          isActive: true,
          enrichedAt: new Date(),
          enrichmentNote: c.enrichmentNote || 'enriched via JSON (manual research)',
        },
        update: {
          apiCourseName: c.apiCourseName,
          name: c.name,
          fullName: c.fullName,
          type: c.type,
          nivel: c.nivel,
          description: c.description,
          longDescription: c.longDescription,
          duration: c.duration,
          areas: c.areas,
          skills: c.skills,
          careerPaths: c.careerPaths,
          averageSalary: c.averageSalary,
          marketDemand: c.marketDemand,
          imageUrl: c.imageUrl || DEFAULT_IMAGE,
          keywords: c.keywords || [],
          isActive: true,
          enrichedAt: new Date(),
          enrichmentNote: c.enrichmentNote || 'enriched via JSON (manual research)',
        },
      })
      console.log(`[${i + 1}/${pool.length}] ✓ ${c.slug}`)
      ok++
    } catch (e) {
      console.error(`[${i + 1}/${pool.length}] ✗ ${c.slug}: ${e.message}`)
      errors.push({ slug: c.slug, error: e.message })
      fail++
    }
  }

  if (ownsPrisma) await prisma.$disconnect()
  console.log(`\n=== RESUMO ===`)
  console.log(`✓ Sucessos: ${ok}`)
  console.log(`✗ Falhas: ${fail}`)
  return { ok, fail, errors }
}

// Execução direta via CLI
const isMainModule = import.meta.url === pathToFileURL(process.argv[1] ?? '').href
if (isMainModule) {
  const args = Object.fromEntries(
    process.argv.slice(2).map((arg) => {
      if (!arg.startsWith('--')) return [arg, true]
      const eq = arg.indexOf('=')
      return eq === -1 ? [arg.slice(2), true] : [arg.slice(2, eq), arg.slice(eq + 1)]
    }),
  )

  enrichCoursesFromJson({
    dryRun: !!args['dry-run'],
    slug: args.slug,
    file: args.file,
  })
    .then((res) => {
      if (res.errors?.length) {
        console.log('Erros:')
        res.errors.forEach((e) => console.log(`  - ${e.slug}: ${e.error}`))
        process.exit(1)
      }
    })
    .catch((e) => {
      console.error('Fatal:', e)
      process.exit(1)
    })
}
