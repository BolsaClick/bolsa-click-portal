import { PrismaClient } from '@prisma/client'

/**
 * Ajusta o pool de conexões conforme a fase, porque build e runtime têm
 * necessidades opostas:
 *
 * - **Build (`next build`, SSG):** cada worker que pré-renderiza páginas abre
 *   seu próprio pool. Com pool alto o Postgres estoura ("too many clients
 *   already") e o build falha → usamos `connection_limit=1` por worker.
 * - **Runtime (servidor persistente, ex.: Railway):** é um processo só servindo
 *   requests concorrentes. `connection_limit=1` serializa o app inteiro numa
 *   única conexão (requests enfileiram até `pool_timeout`) → usamos um pool
 *   maior (default 5, ajustável via `DB_CONNECTION_LIMIT`).
 *
 * A distinção usa `NEXT_PHASE`, que o Next define como `phase-production-build`
 * durante o build. `pool_timeout` mínimo de 20s cobre DATABASE_URLs de
 * preview/local que venham com timeout agressivo (ex.: 2s), insuficiente pra SSG.
 */
function databaseUrlWithPool(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url) return undefined
  try {
    const u = new URL(url)
    const isBuild = process.env.NEXT_PHASE === 'phase-production-build'
    const connectionLimit = isBuild ? '1' : process.env.DB_CONNECTION_LIMIT ?? '5'
    u.searchParams.set('connection_limit', connectionLimit)
    const poolTimeout = Number(u.searchParams.get('pool_timeout') ?? 0)
    if (!Number.isFinite(poolTimeout) || poolTimeout < 20) {
      u.searchParams.set('pool_timeout', '20')
    }
    return u.toString()
  } catch {
    return url
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ datasourceUrl: databaseUrlWithPool() })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
