/**
 * Upload das imagens para o novo bucket público do Tigris
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Novas credenciais do bucket público
const ENDPOINT_URL = 'https://t3.storage.dev'
const ACCESS_KEY = 'tid_eehIqtaNVhUaxVmPWOHYkExytXaFUIergzAZORrgyGJxQNXsoP'
const SECRET_KEY = 'tsec_iSNNeVG2rcsQVbprTDFKkt3A4Z9fKUZ-qnLw1q1JP3-c0NkcF0X3nC7qYzMgWJbO-JlWCE'
const BUCKET_NAME = 'bolsa-click'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: ENDPOINT_URL,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
})

const IMAGES_DIR = path.join(process.cwd(), 'public', 'assets', 'images')

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

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

async function main() {
  console.log('🚀 Upload das imagens para o bucket público...\n')
  console.log(`Bucket: ${BUCKET_NAME}`)
  console.log(`Endpoint: ${ENDPOINT_URL}\n`)

  const results: { slug: string; newUrl: string }[] = []

  for (const [fileName, slug] of Object.entries(IMAGE_TO_SLUG)) {
    const localFilePath = path.join(IMAGES_DIR, fileName)

    if (!fs.existsSync(localFilePath)) {
      console.error(`❌ ${slug} - Arquivo não encontrado: ${fileName}`)
      continue
    }

    try {
      const fileBuffer = fs.readFileSync(localFilePath)
      const ext = path.extname(fileName).toLowerCase()
      const contentType = CONTENT_TYPES[ext] || 'image/jpeg'
      const storageKey = `cursos/${slug}${ext}`

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: storageKey,
        Body: fileBuffer,
        ContentType: contentType,
      })

      await s3Client.send(command)

      const newUrl = `${ENDPOINT_URL}/${BUCKET_NAME}/${storageKey}`
      results.push({ slug, newUrl })
      console.log(`✅ ${slug} → ${newUrl}`)
    } catch (error) {
      console.error(`❌ ${slug}:`, error instanceof Error ? error.message : error)
    }
  }

  // Atualizar banco de dados
  console.log('\n📝 Atualizando banco de dados...\n')

  for (const { slug, newUrl } of results) {
    try {
      await prisma.featuredCourse.update({
        where: { slug },
        data: { imageUrl: newUrl },
      })
      console.log(`✅ DB: ${slug}`)
    } catch (error) {
      console.error(`❌ DB ${slug}:`, error instanceof Error ? error.message : error)
    }
  }

  console.log('\n========================================')
  console.log(`✅ ${results.length} imagens enviadas e atualizadas!`)
  console.log('========================================\n')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
