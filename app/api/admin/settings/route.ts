import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'

const SETTINGS_ID = 'default'

export async function GET(request: NextRequest) {
  const auth = await withAdminAuth(request, ['admin_management'])
  if (isAuthError(auth)) return auth

  try {
    const settings = await prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: { id: SETTINGS_ID },
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const auth = await withAdminAuth(request, ['admin_management'])
  if (isAuthError(auth)) return auth

  try {
    const body = await request.json()

    const allowedFields = [
      'whatsappNumber',
      'contactEmail',
      'contactPhone',
      'facebookUrl',
      'instagramUrl',
      'linkedinUrl',
      'siteName',
      'siteDescription',
      'logoUrl',
    ]

    const data: Record<string, string> = {}
    for (const field of allowedFields) {
      if (field in body && typeof body[field] === 'string') {
        data[field] = body[field].trim()
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo válido para atualizar' },
        { status: 400 }
      )
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      update: { ...data, updatedBy: auth.uid },
      create: { id: SETTINGS_ID, ...data, updatedBy: auth.uid },
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    )
  }
}
