import { NextRequest, NextResponse } from 'next/server'
import { submitToIndexNow } from '@/app/lib/indexnow'

// POST /api/indexnow
// Body: { urls: string[] } | { url: string }
// Headers: x-indexnow-secret (must match INDEXNOW_API_SECRET env)
//
// Use a partir de server actions de admin (publish post, save course, etc).
// Exemplo:
//   await fetch('/api/indexnow', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json', 'x-indexnow-secret': process.env.INDEXNOW_API_SECRET },
//     body: JSON.stringify({ urls: ['https://www.bolsaclick.com.br/blog/...'] }),
//   })

export async function POST(req: NextRequest) {
  const secret = process.env.INDEXNOW_API_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'INDEXNOW_API_SECRET not configured' }, { status: 503 })
  }

  if (req.headers.get('x-indexnow-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const payload = body as { url?: string; urls?: string[] }
  const urls = payload.urls ?? (payload.url ? [payload.url] : [])

  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: 'Missing url(s)' }, { status: 400 })
  }

  const result = await submitToIndexNow(urls)
  return NextResponse.json(result, { status: result.ok ? 200 : 502 })
}
