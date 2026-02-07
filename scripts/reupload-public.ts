/**
 * Re-upload das imagens com acesso público
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
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

const IMAGES = [
  'cursos/administracao-1770321591469.jpg',
  'cursos/analise-e-desenvolvimento-de-sistemas-1770321595646.jpeg',
  'cursos/arquitetura-e-urbanismo-1770321598249.jpg',
  'cursos/biomedicina-1770321602331.jpeg',
  'cursos/ciencias-contabeis-1770321597858.jpg',
  'cursos/direito-1770321592788.webp',
  'cursos/educacao-fisica-1770321594477.jpeg',
  'cursos/enfermagem-1770321593254.jpeg',
  'cursos/engenharia-civil-1770321600666.jpg',
  'cursos/engenharia-de-producao-1770321602163.jpg',
  'cursos/farmacia-1770321604209.jpeg',
  'cursos/fisioterapia-1770321599211.jpg',
  'cursos/gestao-comercial-1770321602982.jpeg',
  'cursos/gestao-de-recursos-humanos-1770321596203.webp',
  'cursos/marketing-1770321597144.webp',
  'cursos/medicina-1770321604382.webp',
  'cursos/nutricao-1770321598677.jpg',
  'cursos/odontologia-1770321602565.jpg',
  'cursos/pedagogia-1770321595209.jpg',
  'cursos/psicologia-1770321593711.jpg',
]

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

async function main() {
  console.log('🚀 Re-upload das imagens com acesso público...\n')

  for (const key of IMAGES) {
    try {
      // Baixar o objeto existente
      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
      const response = await s3Client.send(getCommand)

      if (!response.Body) {
        console.log(`❌ ${key}: Sem conteúdo`)
        continue
      }

      const body = await streamToBuffer(response.Body as NodeJS.ReadableStream)
      const contentType = response.ContentType || 'image/jpeg'

      // Re-upload com ACL público
      const putCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
        ACL: 'public-read',
      })

      await s3Client.send(putCommand)
      console.log(`✅ ${key}`)
    } catch (error) {
      console.log(`❌ ${key}: ${error instanceof Error ? error.message : 'Erro'}`)
    }
  }

  console.log('\n✅ Concluído!')
}

main()
