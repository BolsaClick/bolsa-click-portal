import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, FirebaseStorage } from 'firebase/storage'
import { app } from './config'

// Inicializa o Storage (se o app estiver configurado)
let storage: FirebaseStorage | null = null
if (app) {
  storage = getStorage(app)
}

/**
 * Faz upload de um arquivo para o Firebase Storage
 * @param file O arquivo para upload (base64 ou Blob)
 * @param path O caminho no storage (ex: 'courses/image.jpg')
 * @returns A URL pública do arquivo
 */
export async function uploadFile(
  fileData: string | Blob,
  path: string
): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage not configured')
  }

  const storageRef = ref(storage, path)

  let blob: Blob

  if (typeof fileData === 'string') {
    // Se for base64, converter para Blob
    const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)

    // Detectar tipo MIME
    let mimeType = 'image/jpeg'
    if (fileData.includes('data:')) {
      const match = fileData.match(/data:([^;]+);/)
      if (match) mimeType = match[1]
    }

    blob = new Blob([byteArray], { type: mimeType })
  } else {
    blob = fileData
  }

  await uploadBytes(storageRef, blob)
  const downloadURL = await getDownloadURL(storageRef)

  return downloadURL
}

/**
 * Deleta um arquivo do Firebase Storage
 * @param path O caminho do arquivo no storage
 */
export async function deleteFile(path: string): Promise<void> {
  if (!storage) {
    throw new Error('Firebase Storage not configured')
  }

  const storageRef = ref(storage, path)
  await deleteObject(storageRef)
}

/**
 * Gera um nome de arquivo único
 * @param folder A pasta onde o arquivo será salvo
 * @param originalName O nome original do arquivo
 * @returns O caminho completo para o arquivo
 */
export function generateFilePath(folder: string, originalName: string): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop() || 'jpg'
  return `${folder}/${timestamp}-${randomId}.${extension}`
}

/**
 * Extrai o path do Storage a partir de uma URL do Firebase
 * @param url A URL do Firebase Storage
 * @returns O path do arquivo ou null se não for uma URL válida
 */
export function getPathFromURL(url: string): string | null {
  try {
    const decodedUrl = decodeURIComponent(url)
    const match = decodedUrl.match(/\/o\/(.+?)\?/)
    return match ? match[1] : null
  } catch {
    return null
  }
}
