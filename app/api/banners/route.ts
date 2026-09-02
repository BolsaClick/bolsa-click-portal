import { NextResponse } from 'next/server'
import { getActiveBanners } from '@/app/lib/banners'

/**
 * GET /api/banners
 * Retorna banners ativos, dentro do período de vigência e segmentados pro
 * site atual (endpoint público — ver `getActiveBanners`)
 */
export async function GET() {
  try {
    const banners = await getActiveBanners()
    return NextResponse.json({ banners })
  } catch (error) {
    console.error('Error fetching public banners:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
