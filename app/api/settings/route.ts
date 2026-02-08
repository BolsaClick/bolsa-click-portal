import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

const SETTINGS_ID = 'default'

const DEFAULTS = {
  whatsappNumber: '5511936200198',
  contactEmail: 'contato@bolsaclick.com.br',
  contactPhone: '(11) 93620-0198',
  facebookUrl: 'https://facebook.com/bolsaclickbrasil',
  instagramUrl: 'https://instagram.com/bolsaclick',
  linkedinUrl: 'https://linkedin.com/company/bolsaclick',
  siteName: 'Bolsa Click',
  siteDescription: 'O maior marketplace de bolsas de estudo do Brasil',
  logoUrl: '/assets/logo-bolsa-click-rosa.png',
}

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: SETTINGS_ID },
    })

    return NextResponse.json(
      { settings: settings ?? DEFAULTS },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching public settings:', error)
    return NextResponse.json({ settings: DEFAULTS })
  }
}
