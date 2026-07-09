import { PrismaClient } from '@prisma/client'

/**
 * Limita o pool de conexões por client. Sem isso o Prisma usa o default
 * (num_cpus * 2 + 1) por client; no `next build` cada worker que pré-renderiza
 * as páginas estáticas abre seu próprio pool → o Postgres estoura
 * ("too many clients already") e o build falha. Em serverless (Vercel) manter o
 * pool baixo por instância também é a recomendação do Prisma.
 *
 * `connection_limit=1` mantém ~1 conexão por worker/instância; `pool_timeout`
 * faz as queries concorrentes da mesma página aguardarem em fila em vez de falhar.
 * Mantém um `pool_timeout` mínimo porque ambientes locais/preview podem trazer
 * DATABASE_URL com timeout agressivo (ex.: 2s), insuficiente para SSG.
 */
function databaseUrlWithPool(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url) return undefined
  try {
    const u = new URL(url)
    if (!u.searchParams.has('connection_limit')) u.searchParams.set('connection_limit', '1')
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
