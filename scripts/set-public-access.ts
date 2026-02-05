/**
 * Script para tornar as imagens públicas no Tigris Storage
 *
 * Para executar:
 * npx tsx scripts/set-public-access.ts
 */

import { S3Client, PutObjectAclCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import * as dotenv from 'dotenv'

dotenv.config()

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

async function main() {
  console.log('🚀 Configurando acesso público para as imagens...\n')
  console.log(`Bucket: ${BUCKET_NAME}`)
  console.log(`Endpoint: ${ENDPOINT_URL}\n`)

  if (!ACCESS_KEY || !SECRET_KEY || !BUCKET_NAME) {
    console.error('❌ Credenciais não configuradas!')
    process.exit(1)
  }

  try {
    // Listar objetos na pasta cursos/
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: 'cursos/',
    })

    const listResponse = await s3Client.send(listCommand)
    const objects = listResponse.Contents || []

    console.log(`Encontrados ${objects.length} objetos na pasta cursos/\n`)

    for (const obj of objects) {
      if (!obj.Key) continue

      try {
        const aclCommand = new PutObjectAclCommand({
          Bucket: BUCKET_NAME,
          Key: obj.Key,
          ACL: 'public-read',
        })

        await s3Client.send(aclCommand)
        console.log(`✅ ${obj.Key}`)
      } catch (error) {
        console.log(`❌ ${obj.Key}: ${error instanceof Error ? error.message : 'Erro'}`)
      }
    }

    console.log('\n✅ Concluído!')
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

main()
