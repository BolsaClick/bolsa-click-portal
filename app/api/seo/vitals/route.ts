import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const Metric = z.object({
  id: z.string().max(100),
  name: z.enum(['LCP', 'INP', 'CLS', 'FCP', 'TTFB']),
  value: z.number().nonnegative().finite(),
  rating: z.enum(['good', 'needs-improvement', 'poor']).optional(),
  navigationType: z.string().max(40).optional(),
  path: z.string().startsWith('/').max(500),
  site: z.string().max(40),
  ts: z.number().int().positive(),
})

export async function POST(request: NextRequest) {
  const parsed = Metric.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })

  // JSON estruturado é coletado pela plataforma de logs e pode ser roteado ao
  // backend de observabilidade sem acoplar o cliente a um fornecedor.
  console.info(JSON.stringify({ event: 'web_vital', ...parsed.data }))
  return new NextResponse(null, { status: 204 })
}
