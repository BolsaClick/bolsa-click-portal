import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'
import { uploadFile, generateFilePath } from '@/app/lib/tigris/storage'

/**
 * POST /api/admin/upload
 * Faz upload de uma imagem para o Tigris Storage
 */
export async function POST(request: NextRequest) {
  const authResult = await withAdminAuth(request)
  if (isAuthError(authResult)) return authResult

  try {
    const body = await request.json()
    const { file, filename, folder = 'uploads' } = body

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo (aceitar apenas imagens)
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    let mimeType = 'image/jpeg'

    if (file.includes('data:')) {
      const match = file.match(/data:([^;]+);/)
      if (match) mimeType = match[1]
    }

    if (!validTypes.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WebP.' },
        { status: 400 }
      )
    }

    // Gerar path único
    const path = generateFilePath(folder, filename || 'image.jpg')

    // Fazer upload
    const url = await uploadFile(file, path)

    return NextResponse.json({
      success: true,
      url,
      path,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer upload do arquivo' },
      { status: 500 }
    )
  }
}
