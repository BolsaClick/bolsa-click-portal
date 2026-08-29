// llms.txt — índice curto (llmstxt.org) para AI assistants
// (ChatGPT, Claude, Perplexity, Gemini). Catálogo longo: /llms-full.txt.

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { buildShortLlmsTxt } from './build'

export const revalidate = 3600 // 1h

export async function GET() {
  const institutions = await prisma.institution.findMany({
    where: { isActive: true },
    select: { slug: true, name: true, fullName: true },
  })

  const body = buildShortLlmsTxt({ institutions })

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
