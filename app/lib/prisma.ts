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

/**
 * Erros transitórios de conexão (o Postgres fecha conexão ociosa e o Prisma
 * tenta reusá-la morta). Acontece principalmente no build/SSG longo, onde uma
 * única falha dessas derruba o deploy inteiro (ex.: P1017 em
 * /bolsas-de-estudo/[city]). Retry com backoff resolve — o Prisma reabre a
 * conexão na tentativa seguinte.
 */
const TRANSIENT_DB_ERROR_CODES = new Set(['P1001', 'P1002', 'P1008', 'P1017'])

function isTransientDbError(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code
  return typeof code === 'string' && TRANSIENT_DB_ERROR_CODES.has(code)
}

function createPrismaClient() {
  return new PrismaClient({ datasourceUrl: databaseUrlWithPool() }).$extends({
    query: {
      async $allOperations({ args, query }) {
        const RETRIES = 2
        for (let attempt = 0; ; attempt++) {
          try {
            return await query(args)
          } catch (error) {
            if (attempt >= RETRIES || !isTransientDbError(error)) throw error
            await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
          }
        }
      },
    },
  })
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
