import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type ConsentLogPayload = {
  categories?: Record<string, boolean>
  version?: number
  ts?: number
}

export async function POST(req: NextRequest) {
  let body: ConsentLogPayload | null = null
  try {
    body = (await req.json()) as ConsentLogPayload
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  if (!body || typeof body !== 'object' || !body.categories) {
    return NextResponse.json({ ok: false, error: 'missing_categories' }, { status: 400 })
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  const userAgent = req.headers.get('user-agent') ?? 'unknown'
  const referer = req.headers.get('referer') ?? null

  const log = {
    type: 'consent_given',
    categories: body.categories,
    version: body.version ?? null,
    ts: body.ts ?? Date.now(),
    receivedAt: new Date().toISOString(),
    ip,
    userAgent,
    referer,
  }

  // Server-side log — substituir por persistência em DB se necessário
  // (ex: Prisma → tabela ConsentLog) para auditoria queryable.
  console.info('[consent]', JSON.stringify(log))

  return NextResponse.json({ ok: true })
}
