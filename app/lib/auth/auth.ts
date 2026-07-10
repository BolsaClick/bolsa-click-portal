import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin } from 'better-auth/plugins'
import { nextCookies } from 'better-auth/next-js'
import { prisma } from '@/app/lib/prisma'

/**
 * Better Auth — migração da auth do portal (Firebase → Better Auth), FASE 1.
 *
 * Convive com o Firebase: usa tabelas PRÓPRIAS (`authUser`/`authSession`/
 * `authAccount`/`authVerification`, mapeadas p/ `ba_*` no banco) pra NÃO colidir
 * com o model `User` já existente (perfil + firebaseUid). O vínculo Better Auth
 * ↔ `User` (perfil) será por email na migração dos usuários (Fase 2).
 *
 * Sessão em cookie httpOnly (nextCookies). Plugin admin pras roles (Fase 3).
 * Import dos hashes scrypt do Firebase (senha transparente) entra na Fase 2.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true },
  user: { modelName: 'authUser' },
  session: { modelName: 'authSession' },
  account: { modelName: 'authAccount' },
  verification: { modelName: 'authVerification' },
  plugins: [admin(), nextCookies()],
})
