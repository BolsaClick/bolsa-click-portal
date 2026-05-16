import { NextRequest, NextResponse } from 'next/server'
import { getVitrine, type VitrineLevel } from '@/app/lib/api/get-vitrine'

const VALID_LEVELS = new Set<VitrineLevel>([
  'GRADUACAO',
  'POS_GRADUACAO',
  'CURSO_PROFISSIONALIZANTE',
])

export const revalidate = 600

/**
 * GET /api/vitrine
 *
 * Query params:
 *  - level: VitrineLevel (repetível). Ex: ?level=GRADUACAO&level=POS_GRADUACAO
 *           Se omitido, retorna mix dos três níveis.
 *  - perLevel: número de cursos por nível (default 3, max 10)
 *
 * Retorna: { courses: VitrineCourse[] }
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams

  const rawLevels = params.getAll('level').map((l) => l.toUpperCase())
  const levels = rawLevels.filter((l): l is VitrineLevel =>
    VALID_LEVELS.has(l as VitrineLevel),
  )

  const perLevelParam = parseInt(params.get('perLevel') || '3', 10)
  const perLevel = Math.min(Math.max(perLevelParam || 3, 1), 10)

  const courses = await getVitrine({
    levels: levels.length > 0 ? levels : undefined,
    perLevel,
  })

  return NextResponse.json(
    { courses },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400',
      },
    },
  )
}
