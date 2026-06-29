#!/usr/bin/env node
// scripts/fetch-career-images.mjs
//
// Busca imagens no Pexels para cada profissão em enrichment-data.json,
// faz upload no Tigris e atualiza o imageUrl no JSON.
//
// USO:
//   node --env-file=.env scripts/fetch-career-images.mjs [flags]
//
// FLAGS:
//   --dry-run         Não faz download/upload, só loga o que faria
//   --slug=<slug>     Processa só um curso do JSON
//   --force           Reprocessa mesmo entradas que já têm imageUrl

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// ─── Config ───────────────────────────────────────────────────────────────────

const PEXELS_KEY = process.env.PEXELS_API_KEY || ''
const ENDPOINT_URL = process.env.TIGRIS_ENDPOINT_URL || 'https://t3.storage.dev'
const ACCESS_KEY = process.env.TIGRIS_ACCESS_KEY_ID || ''
const SECRET_KEY = process.env.TIGRIS_SECRET_ACCESS_KEY || ''
const BUCKET_NAME = process.env.TIGRIS_BUCKET_NAME || 'bolsa-click'
const PUBLIC_BASE = `https://bolsa-click.fly.storage.tigris.dev`

const JSON_PATH = join(process.cwd(), 'scripts', 'enrichment-data.json')
const DELAY_MS = 400 // ~150 req/min, bem abaixo do limite de 200 req/h

// ─── Args ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const FORCE = args.includes('--force')
const SLUG_FILTER = args.find(a => a.startsWith('--slug='))?.split('=')[1]

// ─── Pexels search terms ──────────────────────────────────────────────────────
// Para profissões com nome em PT que Pexels não entende bem, mapeia pra
// um termo em inglês mais buscável. Adicionar conforme necessário.

const SEARCH_OVERRIDES = {
  'Administrador': 'business administrator office',
  'Advogado': 'lawyer attorney court',
  'Agrônomo': 'agronomist agriculture field',
  'Analista de dados': 'data analyst computer',
  'Analista de marketing': 'marketing analyst office',
  'Analista financeiro': 'financial analyst',
  'Arquiteto': 'architect blueprint building',
  'Assistente social': 'social worker community',
  'Atuário': 'actuary insurance statistics',
  'Biólogo': 'biologist laboratory',
  'Biomédico': 'biomedical scientist lab',
  'Bombeiro': 'firefighter',
  'Chef de cozinha': 'chef kitchen cooking',
  'Cientista de dados': 'data scientist computer',
  'Contador': 'accountant office finance',
  'Corretor de imóveis': 'real estate agent property',
  'Delegado': 'police detective investigator',
  'Dentista': 'dentist dental clinic',
  'Designer gráfico': 'graphic designer creative',
  'Economista': 'economist finance charts',
  'Educador físico': 'physical education trainer',
  'Enfermeiro': 'nurse hospital care',
  'Engenheiro civil': 'civil engineer construction',
  'Engenheiro de software': 'software engineer coding',
  'Farmacêutico': 'pharmacist pharmacy medicine',
  'Fisioterapeuta': 'physiotherapist rehabilitation',
  'Fonoaudiólogo': 'speech therapist',
  'Fotógrafo': 'photographer camera',
  'Geólogo': 'geologist field rocks',
  'Jornalista': 'journalist reporter news',
  'Juiz': 'judge courtroom law',
  'Médico': 'doctor physician hospital',
  'Nutricionista': 'nutritionist dietitian food',
  'Odontologista': 'dentist dental',
  'Pedagogo': 'teacher educator classroom',
  'Policial': 'police officer uniform',
  'Professor': 'teacher classroom education',
  'Psicólogo': 'psychologist therapy session',
  'Publicitário': 'advertising creative agency',
  'Químico': 'chemist laboratory',
  'Veterinário': 'veterinarian animal clinic',
  'Zootecnista': 'animal scientist livestock',
}

// ─── S3 client ────────────────────────────────────────────────────────────────

const s3 = new S3Client({
  region: 'auto',
  endpoint: ENDPOINT_URL,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function searchPexels(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`
  const res = await fetch(url, { headers: { Authorization: PEXELS_KEY } })
  if (!res.ok) throw new Error(`Pexels ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.photos ?? []
}

async function downloadImage(photoUrl) {
  const res = await fetch(photoUrl)
  if (!res.ok) throw new Error(`Download falhou: ${res.status}`)
  const buf = await res.arrayBuffer()
  return Buffer.from(buf)
}

async function uploadToTigris(buffer, key) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
    // Tigris public bucket — sem ACL necessário
  }))
  return `${PUBLIC_BASE}/${key}`
}

function getSearchQuery(entry) {
  // Usa override se existir, senão usa o nome da profissão direto
  if (SEARCH_OVERRIDES[entry.name]) return SEARCH_OVERRIDES[entry.name]
  // Remove sufixos de tipo de curso para a busca ser mais precisa
  return entry.name
    .replace(/\s*[-–]\s*(Bacharelado|Licenciatura|Tecnólogo|MBA|Especialização).*$/i, '')
    .trim()
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!PEXELS_KEY) {
    console.error('❌ PEXELS_API_KEY não definida no .env')
    process.exit(1)
  }
  if (!ACCESS_KEY || !SECRET_KEY) {
    console.error('❌ Credenciais Tigris não configuradas')
    process.exit(1)
  }

  const data = JSON.parse(readFileSync(JSON_PATH, 'utf-8'))
  const entries = SLUG_FILTER ? data.filter(e => e.slug === SLUG_FILTER) : data

  if (SLUG_FILTER && entries.length === 0) {
    console.error(`❌ Slug não encontrado: ${SLUG_FILTER}`)
    process.exit(1)
  }

  console.log(`\n🔍 ${DRY_RUN ? '[DRY RUN] ' : ''}Processando ${entries.length} profissões...\n`)

  let done = 0, skipped = 0, errors = 0

  for (const entry of entries) {
    // Pula entradas que já têm imagem própria (não o OG padrão)
    const hasImage = entry.imageUrl && entry.imageUrl.startsWith('https://') && !entry.imageUrl.includes('og-image')
    if (hasImage && !FORCE) {
      console.log(`⏭️  ${entry.name} — já tem imagem`)
      skipped++
      continue
    }

    const query = getSearchQuery(entry)

    try {
      // Busca no Pexels
      const photos = await searchPexels(query)

      if (photos.length === 0) {
        // Tenta com termo mais genérico (primeira palavra)
        const fallbackQuery = query.split(' ')[0]
        console.log(`⚠️  ${entry.name} — sem resultado para "${query}", tentando "${fallbackQuery}"`)
        const fallbackPhotos = await searchPexels(fallbackQuery)
        if (fallbackPhotos.length === 0) {
          console.log(`❌ ${entry.name} — sem imagem encontrada`)
          errors++
          await sleep(DELAY_MS)
          continue
        }
        photos.push(...fallbackPhotos)
      }

      const photo = photos[0]
      const photoUrl = photo.src.large // 1880px — boa qualidade sem ser pesado
      const photographer = photo.photographer

      if (DRY_RUN) {
        console.log(`✅ [dry] ${entry.name} — "${query}" → ${photo.url} (foto: ${photographer})`)
        done++
        continue
      }

      // Download + upload
      const buffer = await downloadImage(photoUrl)
      const storageKey = `carreiras/${entry.slug}.jpg`
      const publicUrl = await uploadToTigris(buffer, storageKey)

      // Atualiza o entry no array original (não só no subarray filtrado)
      const idx = data.findIndex(e => e.slug === entry.slug)
      data[idx].imageUrl = publicUrl
      data[idx].imageAlt = `${entry.name} — carreira e formação`

      // Salva após cada upload (permite retomar se interrompido)
      writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), 'utf-8')

      console.log(`✅ ${entry.name} — ${publicUrl} (foto: ${photographer})`)
      done++
    } catch (err) {
      console.error(`❌ ${entry.name} — ${err.message}`)
      errors++
    }

    await sleep(DELAY_MS)
  }

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`✅ ${done} imagens ${DRY_RUN ? 'encontradas (dry)' : 'salvas'}`)
  if (skipped) console.log(`⏭️  ${skipped} já tinham imagem`)
  if (errors)  console.log(`❌ ${errors} erros`)
  console.log(`${'─'.repeat(50)}\n`)

  if (!DRY_RUN && done > 0) {
    console.log(`📝 enrichment-data.json atualizado com os imageUrls.\n`)
    console.log(`Próximo passo: rodar o import para o banco:`)
    console.log(`  node --env-file=.env scripts/enrich-courses-from-json.mjs\n`)
  }
}

main().catch(err => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
