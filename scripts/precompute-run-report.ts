#!/usr/bin/env tsx
/**
 * Lê os resumos das rodadas do precompute-city-offers gravados em ActivityLog
 * (action = PRECOMPUTE_RUN). Só leitura, sem API.
 *
 * Existe porque ninguém do time consegue ler os logs do GitHub Actions hoje
 * (gh sem login). A pergunta que ele responde primeiro: os ~30% de falha da
 * Cogna são 429 (teto da conta → reduzir volume) ou outra coisa (timeout, 5xx,
 * 200-vazio → dá para otimizar)?
 *
 *   npx tsx --env-file=.env scripts/precompute-run-report.ts          # últimas 5
 *   npx tsx --env-file=.env scripts/precompute-run-report.ts --n=10
 */
import { PrismaClient } from '@prisma/client'

const n = Number(process.argv.find((a) => a.startsWith('--n='))?.slice(4)) || 5
const prisma = new PrismaClient()

type Tally = Record<string, number>
interface RunDetails {
  iniciou?: string
  duracaoMin?: number
  truncada?: boolean
  abortada?: string | null
  fila?: { total?: number; velhas?: number; lacunas?: number }
  processados?: number
  upserts?: number
  cognaComOferta?: number
  cognaVazio?: number
  cognaVazioEmLoteSuspeito?: number
  zeroSobrePositivoConfirmado?: number
  zeroSobrePositivoDesmentido?: number
  zeroSobrePositivoNaoGravado?: number
  falhasFinais?: { cogna?: Tally; athena?: Tally }
  falhasPorTentativa?: { cogna?: Tally; athena?: Tally }
  frescorDepois?: Record<string, number>[] | null
}
const fmt = (t: Tally | undefined) =>
  Object.entries(t ?? {})
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${k}=${v}`)
    .join(' ') || 'nenhuma'

async function main() {
  const runs = await prisma.activityLog.findMany({
    where: { action: 'PRECOMPUTE_RUN', entity: 'CityCourseOfferCache' },
    orderBy: { createdAt: 'desc' },
    take: n,
  })
  if (runs.length === 0) {
    console.log('Nenhuma rodada registrada ainda (o registro começou com a fila por par, 2026-10-10).')
    return
  }
  for (const run of runs) {
    const d = (run.details ?? {}) as RunDetails
    const falhasCogna = Object.values((d.falhasFinais?.cogna ?? {}) as Tally).reduce((s, v) => s + v, 0)
    console.log(`\n── ${d.iniciou} · ${d.duracaoMin} min ${d.abortada ? `· ABORTADA: ${d.abortada}` : d.truncada ? '· truncada' : '· completa'}`)
    console.log(`   fila ${d.fila?.total} (velhas ${d.fila?.velhas}, lacunas ${d.fila?.lacunas}) · processados ${d.processados} · upserts ${d.upserts}`)
    console.log(
      `   Cogna: com oferta ${d.cognaComOferta} · 200-vazio ${d.cognaVazio} (${d.cognaVazioEmLoteSuspeito} em lote suspeito) · falhas ${falhasCogna} (${d.processados ? Math.round((falhasCogna / d.processados) * 100) : 0}%)`,
    )
    console.log(`   Cogna motivo final:         ${fmt(d.falhasFinais?.cogna)}`)
    console.log(
      `   Cogna zero sobre positivo:  confirmados ${d.zeroSobrePositivoConfirmado ?? 0} · DESMENTIDOS ${d.zeroSobrePositivoDesmentido ?? 0} (falha silenciosa medida) · não gravados ${d.zeroSobrePositivoNaoGravado ?? 0}`,
    )
    console.log(`   Cogna motivo por tentativa: ${fmt(d.falhasPorTentativa?.cogna)}`)
    console.log(`   Athena motivo final:        ${fmt(d.falhasFinais?.athena)}`)
    for (const f of d.frescorDepois ?? []) {
      console.log(
        `   frescor camada ${f.camada}: >7d ${f.acima7d} · >14d ${f.acima14d} · >28d ${f.acima28d} de ${f.linhas} · mais velha ${f.idadeMaxDias}d`,
      )
    }
  }
}

main().finally(() => prisma.$disconnect())
