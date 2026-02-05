/**
 * Script para fazer upload das imagens dos cursos para o Tigris Storage
 * Gera um arquivo JSON com os mapeamentos para atualizar o banco depois
 *
 * Para executar:
 * npx tsx scripts/upload-course-images-local.ts
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

// Configuração do Tigris (S3-compatible)
const ENDPOINT_URL = process.env.TIGRIS_ENDPOINT_URL || process.env.AWS_ENDPOINT_URL || 'https://t3.storageapi.dev'
const ACCESS_KEY = process.env.TIGRIS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || ''
const SECRET_KEY = process.env.TIGRIS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || ''
const BUCKET_NAME = process.env.TIGRIS_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME || ''

const s3Client = new S3Client({
  region: 'auto',
  endpoint: ENDPOINT_URL,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
})

// Diretório das imagens
const IMAGES_DIR = path.join(process.cwd(), 'public', 'assets', 'images')

// Mapeamento de extensão para content-type
const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

// Mapeamento de imagem -> slug (baseado nos dados dos cursos)
const IMAGE_TO_SLUG: Record<string, string> = {
  'adm.jpg': 'administracao',
  'direito.webp': 'direito',
  'enfermagem.jpeg': 'enfermagem',
  'psicologia.jpg': 'psicologia',
  'educacao-fisica.jpeg': 'educacao-fisica',
  'pedagogia.jpg': 'pedagogia',
  'analise-e-desenvolvimento-de-sistemas.jpeg': 'analise-e-desenvolvimento-de-sistemas',
  'gestao-de-recursos-humanos.webp': 'gestao-de-recursos-humanos',
  'marketing.webp': 'marketing',
  'ciencias-contabeis.jpg': 'ciencias-contabeis',
  'arquitetura-e-urbanismo.jpg': 'arquitetura-e-urbanismo',
  'nutricao.jpg': 'nutricao',
  'fisioterapia.jpg': 'fisioterapia',
  'engenharia-civil.jpg': 'engenharia-civil',
  'engenharia-de-producao.jpg': 'engenharia-de-producao',
  'Biomedicina.jpeg': 'biomedicina',
  'odontologia.jpg': 'odontologia',
  'gestao-comercial.jpeg': 'gestao-comercial',
  'farmacia.jpeg': 'farmacia',
  'medicina.webp': 'medicina',
}

async function uploadImage(filePath: string, key: string): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath)
  const ext = path.extname(filePath).toLowerCase()
  const contentType = CONTENT_TYPES[ext] || 'image/jpeg'

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  })

  await s3Client.send(command)

  return `${ENDPOINT_URL}/${BUCKET_NAME}/${key}`
}

async function main() {
  console.log('Iniciando upload das imagens dos cursos para o Tigris Storage...\n')

  // Verificar credenciais
  if (!ACCESS_KEY || !SECRET_KEY || !BUCKET_NAME) {
    console.error('❌ Credenciais do Tigris não configuradas!')
    process.exit(1)
  }

  console.log(`Bucket: ${BUCKET_NAME}`)
  console.log(`Endpoint: ${ENDPOINT_URL}\n`)

  const results: { slug: string; oldUrl: string; newUrl: string }[] = []
  let uploadedCount = 0
  let errorCount = 0

  for (const [fileName, slug] of Object.entries(IMAGE_TO_SLUG)) {
    const localFilePath = path.join(IMAGES_DIR, fileName)

    if (!fs.existsSync(localFilePath)) {
      console.error(`❌ ${slug} - Arquivo não encontrado: ${fileName}`)
      errorCount++
      continue
    }

    try {
      const ext = path.extname(fileName)
      const timestamp = Date.now()
      const storageKey = `cursos/${slug}-${timestamp}${ext}`

      console.log(`📤 Uploading ${slug}...`)
      const newUrl = await uploadImage(localFilePath, storageKey)

      results.push({
        slug,
        oldUrl: `/assets/images/${fileName}`,
        newUrl,
      })

      console.log(`✅ ${slug} - ${newUrl}`)
      uploadedCount++
    } catch (error) {
      console.error(`❌ ${slug} - Erro no upload:`, error)
      errorCount++
    }
  }

  console.log('\n========================================')
  console.log(`✅ ${uploadedCount} imagens enviadas com sucesso`)
  if (errorCount > 0) {
    console.log(`❌ ${errorCount} erros`)
  }
  console.log('========================================\n')

  // Salvar resultados em JSON
  const outputPath = path.join(process.cwd(), 'scripts', 'uploaded-images.json')
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
  console.log(`📁 Mapeamento salvo em: ${outputPath}`)

  // Gerar SQL para atualização
  console.log('\n📝 SQL para atualizar o banco de dados:\n')
  for (const r of results) {
    console.log(`UPDATE "FeaturedCourse" SET "imageUrl" = '${r.newUrl}' WHERE slug = '${r.slug}';`)
  }
}

main().catch((error) => {
  console.error('Erro fatal:', error)
  process.exit(1)
})
