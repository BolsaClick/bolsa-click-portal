import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '../firebase/admin-claims'

export interface AdminAuthResult {
  uid: string
  role: string
  permissions: string[]
}

/**
 * Middleware para verificar autenticação de admin em rotas API
 * Retorna AdminAuthResult se autorizado, NextResponse de erro caso contrário
 */
export async function withAdminAuth(
  request: NextRequest,
  requiredPermissions?: string[]
): Promise<AdminAuthResult | NextResponse> {
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
