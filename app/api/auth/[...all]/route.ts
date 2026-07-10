import { auth } from '@/app/lib/auth/auth'
import { toNextJsHandler } from 'better-auth/next-js'

// Rota catch-all do Better Auth. Coexiste com /api/auth/sync e /api/auth/profile
// (rotas específicas têm precedência no Next). Firebase segue funcionando na Fase 1.
export const { GET, POST } = toNextJsHandler(auth)
