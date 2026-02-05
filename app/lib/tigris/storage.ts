import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

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

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: path,
    Body: buffer,
    ContentType: contentType,
  })

  await s3Client.send(command)

  // Retorna a URL pública do arquivo
  // Tigris usa o formato: https://t3.storageapi.dev/BUCKET_NAME/path
  const publicUrl = `${ENDPOINT_URL}/${BUCKET_NAME}/${path}`
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
    // Remove a barra inicial
    return urlObj.pathname.slice(1)
  } catch {
    return null
  }
}
