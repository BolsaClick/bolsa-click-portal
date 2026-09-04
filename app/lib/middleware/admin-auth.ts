import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { verifyAdminToken } from '../firebase/admin-claims'

export interface AdminAuthResult {
  uid: string
  role: string
  permissions: string[]
}

/**
 * Compara duas strings em constant-time pra evitar timing attacks.
 * Strings de tamanhos diferentes retornam false imediatamente (mesmo
 * trade-off aceito em app/lib/middleware/agent-auth.ts).
 */
function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'utf8')
  const bBuf = Buffer.from(b, 'utf8')
  if (aBuf.length !== bBuf.length) return false
  return timingSafeEqual(aBuf, bBuf)
}

/**
 * Segundo caminho de autenticação pra `withAdminAuth`, usado pelo futuro
 * painel administrativo único (fala com os sites a partir do servidor
 * dele, nunca do navegador — por isso essa rota não passa por CORS).
 *
 * Header: `X-Admin-Api-Key: <chave>`
 * Env var: `ADMIN_PANEL_API_KEY`
 *
 * Se a env var não estiver definida, esse caminho simplesmente não
 * existe — nunca autoriza, não há valor default.
 */
function checkServiceApiKey(request: NextRequest): boolean {
  const expectedKey = process.env.ADMIN_PANEL_API_KEY
  if (!expectedKey) return false

  const providedKey = request.headers.get('X-Admin-Api-Key')
  if (!providedKey) return false

  return safeCompare(providedKey, expectedKey)
}

/**
 * Middleware para verificar autenticação de admin em rotas API
 * Retorna AdminAuthResult se autorizado, NextResponse de erro caso contrário
 *
 * Aceita dois caminhos de autenticação:
 *   1. Chave de serviço (`X-Admin-Api-Key`) — pensada pro painel
 *      administrativo único falar com este site sem login de usuário.
 *   2. Token Firebase de usuário (`Authorization: Bearer <token>`) — o
 *      caminho de hoje, usado pela interface administrativa do site.
 *      Este caminho não muda de comportamento.
 */
export async function withAdminAuth(
  request: NextRequest,
  requiredPermissions?: string[]
): Promise<AdminAuthResult | NextResponse> {
  // Caminho 1: chave de serviço. Nesta fatia a chave vale acesso
  // administrativo completo do site (equivalente a todas as permissões).
  // TODO(painel único): quando existir modelo de papel por site, trocar
  // este `permissions: requiredPermissions ?? []` por uma checagem real
  // de granularidade — hoje a chave nunca é negada por permissão.
  if (checkServiceApiKey(request)) {
    console.log(
      `[admin-auth] Requisição autorizada via chave de serviço: ${request.method} ${request.nextUrl.pathname}`
    )
    return {
      uid: 'service:admin-panel',
      role: 'SERVICE',
      permissions: requiredPermissions ?? [],
    }
  }

  // Caminho 2 (existente, intacto): token de usuário Firebase.
  const authHeader = request.headers.get('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized - No token provided' },
      { status: 401 }
    )
  }

  const token = authHeader.split('Bearer ')[1]
  const result = await verifyAdminToken(token, requiredPermissions)

  if (!result) {
    return NextResponse.json(
      { error: 'Forbidden - Insufficient permissions' },
      { status: 403 }
    )
  }

  return {
    uid: result.uid,
    role: result.claims.role,
    permissions: result.claims.permissions,
  }
}

/**
 * Helper para verificar se o resultado é um erro
 */
export function isAuthError(
  result: AdminAuthResult | NextResponse
): result is NextResponse {
  return result instanceof NextResponse
}
