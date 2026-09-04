import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'
import { BRAND_COOKIE_NAME, DEFAULT_BRAND, isBrandId } from '@/app/lib/admin/brands'
import { callBrandApi, type BrandCallFailureKind } from '@/app/lib/admin/brand-client'

/**
 * Proxy multimarca: o admin logado neste site chama sempre
 * `/api/admin/brand/<resto-do-caminho>` a partir da UI, e esta rota decide,
 * pela marca guardada em cookie de servidor, se atende localmente (Prisma
 * deste processo) ou repassa pra `https://www.bolsamais.com.br` com a chave
 * de serviço — ver `app/lib/admin/brand-client.ts`.
 *
 * A sessão do admin (token Firebase) é checada aqui do mesmo jeito que em
 * qualquer rota `/api/admin/*` de hoje — trocar de marca não é um jeito
 * novo de pular login, só escolhe qual back-end aquela chamada específica
 * atinge.
 */

type RouteContext = { params: Promise<{ path: string[] }> }

const FAILURE_STATUS: Record<BrandCallFailureKind, number> = {
  unavailable: 503,
  network: 502,
  unauthorized: 401,
  not_found: 404,
  http_error: 502,
}

async function handle(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const auth = await withAdminAuth(request)
  if (isAuthError(auth)) return auth

  const { path } = await context.params
  const rawBrand = request.cookies.get(BRAND_COOKIE_NAME)?.value
  const brand = isBrandId(rawBrand) ? rawBrand : DEFAULT_BRAND

  const targetPath = `/api/admin/${path.join('/')}${request.nextUrl.search}`

  let body: unknown
  if (!['GET', 'HEAD', 'DELETE'].includes(request.method)) {
    const text = await request.text()
    if (text) {
      try {
        body = JSON.parse(text)
      } catch {
        body = text
      }
    }
  }

  const result = await callBrandApi({
    brand,
    path: targetPath,
    method: request.method,
    body,
    originForLocal: request.nextUrl.origin,
    authHeaderForLocal: request.headers.get('Authorization'),
  })

  if (result.ok) {
    return NextResponse.json(result.data, { status: result.status })
  }

  // Nunca "não tem dado" silencioso: o front distingue rede/chave/rota
  // inexistente por `brandCallKind`, em vez de receber um 200 vazio.
  return NextResponse.json(
    { error: result.message, brand, brandCallKind: result.kind },
    { status: result.status ?? FAILURE_STATUS[result.kind] }
  )
}

export const GET = handle
export const POST = handle
export const PATCH = handle
export const PUT = handle
export const DELETE = handle
