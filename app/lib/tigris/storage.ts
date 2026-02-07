import { S3Client, PutObjectCommand, PutObjectAclCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

// Configuração do Tigris (S3-compatible) - Bucket Público
const ENDPOINT_URL = process.env.TIGRIS_ENDPOINT_URL || 'https://t3.storage.dev'
const ACCESS_KEY = process.env.TIGRIS_ACCESS_KEY_ID || ''
const SECRET_KEY = process.env.TIGRIS_SECRET_ACCESS_KEY || ''
const BUCKET_NAME = process.env.TIGRIS_BUCKET_NAME || 'bolsa-click'

// URL pública segue o formato: https://<bucket>.fly.storage.tigris.dev/<path>
const PUBLIC_URL_BASE = `https://${BUCKET_NAME}.fly.storage.tigris.dev`

const s3Client = new S3Client({
  region: 'auto',
  endpoint: ENDPOINT_URL,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
})

/**
 * Faz upload de um arquivo para o Tigris Storage
 * @param fileData Base64 string ou Buffer
 * @param path Caminho do arquivo (ex: 'courses/image.jpg')
 * @param contentType Tipo MIME do arquivo
 * @returns URL pública do arquivo
 */
export async function uploadFile(
  fileData: string | Buffer,
  path: string,
  contentType: string = 'image/jpeg'
): Promise<string> {
  let buffer: Buffer

  if (typeof fileData === 'string') {
    // Se for base64, converter para Buffer
    const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData
    buffer = Buffer.from(base64Data, 'base64')

    // Detectar tipo MIME do base64 se disponível
    if (fileData.includes('data:')) {
      const match = fileData.match(/data:([^;]+);/)
      if (match) contentType = match[1]
    }
  } else {
    buffer = fileData
  }

  // Upload do arquivo
  const putCommand = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: path,
    Body: buffer,
    ContentType: contentType,
  })

  await s3Client.send(putCommand)

  // Define o ACL como público
  const aclCommand = new PutObjectAclCommand({
    Bucket: BUCKET_NAME,
    Key: path,
    ACL: 'public-read',
  })

  await s3Client.send(aclCommand)

  // Retorna a URL pública do arquivo
  // Tigris público usa: https://<bucket>.fly.storage.tigris.dev/<path>
  const publicUrl = `${PUBLIC_URL_BASE}/${path}`
  return publicUrl
}

/**
 * Deleta um arquivo do Tigris Storage
 * @param path Caminho do arquivo
 */
export async function deleteFile(path: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: path,
  })

  await s3Client.send(command)
}

/**
 * Gera um caminho único para o arquivo
 * @param folder Pasta de destino
 * @param originalName Nome original do arquivo
 * @returns Caminho único
 */
export function generateFilePath(folder: string, originalName: string): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  return `${folder}/${timestamp}-${randomId}.${extension}`
}

/**
 * Extrai o path a partir de uma URL do Tigris
 * @param url URL do arquivo
 * @returns Path do arquivo ou null
 */
export function getPathFromURL(url: string): string | null {
  try {
    const urlObj = new URL(url)
    // URL pública: https://bucket.fly.storage.tigris.dev/path
    // Remove a barra inicial do pathname
    return urlObj.pathname.slice(1)
  } catch {
    return null
  }
}

/**
 * Gera a URL pública a partir do path
 * @param path Caminho do arquivo
 * @returns URL pública
 */
export function getPublicURL(path: string): string {
  return `${PUBLIC_URL_BASE}/${path}`
}
