/**
 * Script para fazer upload das imagens dos cursos para o Tigris Storage
 * e atualizar o banco de dados com as novas URLs
 *
 * Para executar:
 * npx tsx scripts/upload-course-images.ts
 */

import { PrismaClient } from '@prisma/client'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const prisma = new PrismaClient()

// Configuração do Tigris (S3-compatible) - Aceita TIGRIS_ ou AWS_ prefix
const ENDPOINT_URL = process.env.TIGRIS_ENDPOINT_URL || process.env.AWS_ENDPOINT_URL || 'https://t3.storageapi.dev'
const ACCESS_KEY = process.env.TIGRIS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || ''
const SECRET_KEY = process.env.TIGRIS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || ''
const BUCKET_NAME = process.env.TIGRIS_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME || ''

const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION || 'auto',
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

  // Retorna a URL pública
  return `${ENDPOINT_URL}/${BUCKET_NAME}/${key}`
}

async function main() {
  console.log('Iniciando upload das imagens dos cursos para o Tigris Storage...\n')

  // Verificar credenciais
  if (!ACCESS_KEY || !SECRET_KEY || !BUCKET_NAME) {
    console.error('❌ Credenciais do Tigris não configuradas!')
    console.error('Verifique as variáveis: TIGRIS_ACCESS_KEY_ID, TIGRIS_SECRET_ACCESS_KEY, TIGRIS_BUCKET_NAME')
    process.exit(1)
  }

  console.log(`Bucket: ${BUCKET_NAME}`)
  console.log(`Endpoint: ${ENDPOINT_URL}\n`)

  // Buscar todos os cursos
  const courses = await prisma.featuredCourse.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      imageUrl: true,
    },
  })

  console.log(`Encontrados ${courses.length} cursos no banco de dados.\n`)

  let uploadedCount = 0
  let errorCount = 0

  for (const course of courses) {
    // Extrair nome do arquivo da imageUrl atual (ex: /assets/images/adm.jpg -> adm.jpg)
    const currentImagePath = course.imageUrl

    // Pular se já é uma URL externa (já foi migrada)
    if (currentImagePath.startsWith('http')) {
      console.log(`⏭️  ${course.name} - Já está no storage externo`)
      continue
    }

    // Construir caminho local do arquivo
    const fileName = path.basename(currentImagePath)
    const localFilePath = path.join(IMAGES_DIR, fileName)

    // Verificar se arquivo existe
    if (!fs.existsSync(localFilePath)) {
      console.error(`❌ ${course.name} - Arquivo não encontrado: ${localFilePath}`)
      errorCount++
      continue
    }

    try {
      // Gerar key para o storage (cursos/slug-timestamp.ext)
      const ext = path.extname(fileName)
      const timestamp = Date.now()
      const storageKey = `cursos/${course.slug}-${timestamp}${ext}`

      // Fazer upload
      console.log(`📤 Uploading ${course.name}...`)
      const newUrl = await uploadImage(localFilePath, storageKey)

      // Atualizar banco de dados
      await prisma.featuredCourse.update({
        where: { id: course.id },
        data: { imageUrl: newUrl },
      })

      console.log(`✅ ${course.name} - ${newUrl}`)
      uploadedCount++
    } catch (error) {
      console.error(`❌ ${course.name} - Erro no upload:`, error)
      errorCount++
    }
  }

  console.log('\n========================================')
  console.log(`✅ ${uploadedCount} imagens enviadas com sucesso`)
  if (errorCount > 0) {
    console.log(`❌ ${errorCount} erros`)
  }
  console.log('========================================')

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('Erro fatal:', error)
  prisma.$disconnect()
  process.exit(1)
})
