import { adminAuth } from './admin'

export interface AdminClaims {
  admin: boolean
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR'
  permissions: string[]
}

/**
 * Define custom claims de admin para um usuário
 */
export async function setAdminClaims(
  uid: string,
  claims: AdminClaims
): Promise<void> {
  if (!adminAuth) {
    throw new Error('Firebase Admin not configured')
  }

  await adminAuth.setCustomUserClaims(uid, claims)
}

/**
 * Remove claims de admin de um usuário
 */
export async function removeAdminClaims(uid: string): Promise<void> {
  if (!adminAuth) {
    throw new Error('Firebase Admin not configured')
  }

  await adminAuth.setCustomUserClaims(uid, { admin: false })
}

/**
 * Obtém claims de admin de um usuário
 */
export async function getAdminClaims(uid: string): Promise<AdminClaims | null> {
  if (!adminAuth) {
    throw new Error('Firebase Admin not configured')
  }

  const user = await adminAuth.getUser(uid)
  const claims = user.customClaims as AdminClaims | undefined

  if (!claims?.admin) {
    return null
  }

  return claims
}

/**
 * Verifica token e permissões de admin
 */
export async function verifyAdminToken(
  token: string,
  requiredPermissions?: string[]
): Promise<{ uid: string; claims: AdminClaims } | null> {
  if (!adminAuth) {
    return null
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token)
    const claims = decodedToken as unknown as {
      admin?: boolean
      role?: string
      permissions?: string[]
    }

    if (!claims.admin) {
      return null
    }

    // Verificar permissões requeridas
    if (requiredPermissions && requiredPermissions.length > 0) {
      const userPermissions = claims.permissions || []
      // SUPER_ADMIN tem todas as permissões
      if (claims.role !== 'SUPER_ADMIN') {
        const hasPermission = requiredPermissions.every((p) =>
          userPermissions.includes(p)
        )
        if (!hasPermission) {
          return null
        }
      }
    }

    return {
      uid: decodedToken.uid,
      claims: {
        admin: true,
        role: claims.role as AdminClaims['role'],
        permissions: claims.permissions || [],
      },
    }
  } catch (error) {
    console.error('Error verifying admin token:', error)
    return null
  }
}
