/**
 * Script para definir política de acesso público no bucket Tigris
 *
 * Para executar:
 * npx tsx scripts/set-bucket-policy.ts
 */

import { S3Client, PutBucketPolicyCommand, GetBucketPolicyCommand } from '@aws-sdk/client-s3'
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
  console.log('🚀 Configurando política de acesso público no bucket...\n')
  console.log(`Bucket: ${BUCKET_NAME}`)
  console.log(`Endpoint: ${ENDPOINT_URL}\n`)

  if (!ACCESS_KEY || !SECRET_KEY || !BUCKET_NAME) {
    console.error('❌ Credenciais não configuradas!')
    process.exit(1)
  }

  // Política para permitir leitura pública
  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'PublicReadGetObject',
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
      },
    ],
  }

  try {
    // Verificar política atual
    try {
      const getCommand = new GetBucketPolicyCommand({ Bucket: BUCKET_NAME })
      const currentPolicy = await s3Client.send(getCommand)
      console.log('Política atual:', currentPolicy.Policy)
    } catch {
      console.log('Nenhuma política existente.\n')
    }

    // Aplicar nova política
    const putCommand = new PutBucketPolicyCommand({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(policy),
    })

    await s3Client.send(putCommand)
    console.log('✅ Política de acesso público aplicada!')
    console.log('\nPolítica:', JSON.stringify(policy, null, 2))
  } catch (error) {
    console.error('❌ Erro ao aplicar política:', error)
  }
}

main()
