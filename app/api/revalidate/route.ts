import { timingSafeEqual } from 'node:crypto'
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/revalidate
// Headers: x-revalidate-secret (tem que bater com REVALIDATE_SECRET)
// Body opcional: { paths?: string[] } — sem body, refaz as vitrines padrão.
//
// Por que existe: a home (revalidate 1h) e /faculdades/[slug] (24h) são
// pré-renderizadas no build. Se a Athena/Tartarus falham DURANTE o build da
// Railway, as prateleiras saem vazias e ficam congeladas assim até o próximo
// ciclo — foi o que aconteceu no deploy de 30/09 (home sem nenhuma prateleira,
// /faculdades/* sem cursos). O workflow revalidate-after-deploy chama esta rota
// quando a Railway marca o deploy como concluído.
//
// Também invalida a tag `institution-courses` (unstable_cache de
// getInstitutionCourses): uma falha do Tartarus grava [] ali por 1h, e sem
// limpar a tag a página refeita leria a mesma lista vazia.

const DEFAULT_PATHS = ['/', '/faculdades']

function isAuthorized(provided: string | null, expected: string): boolean {
  if (!provided) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'REVALIDATE_SECRET not configured' }, { status: 503 })
  }
  if (!isAuthorized(req.headers.get('x-revalidate-secret'), secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let extraPaths: string[] = []
  const raw = await req.text()
  if (raw.trim()) {
    try {
      const body = JSON.parse(raw) as { paths?: unknown }
      if (Array.isArray(body.paths)) {
        extraPaths = body.paths.filter(
          (p): p is string => typeof p === 'string' && p.startsWith('/'),
        )
      }
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
  }

  revalidateTag('institution-courses')
  const paths = [...new Set([...DEFAULT_PATHS, ...extraPaths])]
  for (const path of paths) revalidatePath(path)
  // Todas as páginas de faculdade de uma vez (rota dinâmica, dynamicParams=false).
  revalidatePath('/faculdades/[slug]', 'page')

  return NextResponse.json({
    ok: true,
    revalidated: [...paths, '/faculdades/[slug]'],
    tags: ['institution-courses'],
  })
}
