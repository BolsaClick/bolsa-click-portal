/**
 * snapshot-price-index
 * --------------------
 * Grava UMA fotografia do inventário de ofertas em PriceIndexSnapshot +
 * PriceIndexEntry. É a série histórica que sustenta o estudo trimestral de
 * /estudos (ver docs do model em prisma/schema.prisma).
 *
 * POR QUE ESTE SCRIPT EXISTE: CityCourseOfferCache e InstitutionCityOfferCache
 * guardam estado atual e são sobrescritos a cada rodada. Sem série temporal não
 * é possível afirmar "subiu X% no trimestre" — e é essa frase que faz veículo
 * citar o estudo. O relógio da série só começa a correr quando isto roda pela
 * primeira vez, por isso ele foi ligado antes do resto do índice ser construído.
 *
 * ONDE RODA: pendurado no FIM do workflow precompute-institution-city-offers
 * (domingo 04:17 UTC), que já roda depois do precompute de curso×cidade (03:17).
 * Lê os dois caches já frescos. NÃO tem cron próprio, de propósito.
 *
 * ELE LÊ OS CACHES, não o que a rodada buscou. Assim uma rodada truncada ou com
 * lote suspeito não contamina a série: o cache preserva o último valor bom
 * (mesma filosofia de InstitutionMaxDiscountCache). O snapshot é retrato do
 * inventário conhecido, não do que deu certo naquela execução.
 *
 * Flags (env / argv):
 *   --dry-run        calcula e imprime, não escreve no banco
 *   PERIOD=2026-T4   sobrescreve o rótulo do período (default: derivado da data)
 *   MIN_ROWS=N       piso de linhas de cache pra aceitar a medição (default 500)
 *
 * Uso local (NUNCA contra produção):
 *   node --env-file=.env node_modules/.bin/tsx scripts/snapshot-price-index.ts --dry-run
 */
import { PrismaClient, PriceIndexScope } from '@prisma/client'
import { BRAZILIAN_CITIES } from '../app/lib/constants/brazilian-cities'

const prisma = new PrismaClient()

const DRY_RUN = process.argv.includes('--dry-run')

// Piso de evidência. Uma rodada que enxerga quase nada quase sempre é falha de
// leitura, não mercado que evaporou — e um ponto falso na série é pior que um
// ponto faltando, porque vira afirmação pública ("caiu 80% no trimestre").
// Melhor pular a semana e gravar na próxima.
const MIN_ROWS = Number(process.env.MIN_ROWS ?? 500)

const stateByCitySlug = new Map(BRAZILIAN_CITIES.map((c) => [c.slug, c.state]))

/** Rótulo do trimestre a partir da data: 2026-10-08 -> "2026-T4". */
function periodLabel(date: Date): string {
  return `${date.getUTCFullYear()}-T${Math.floor(date.getUTCMonth() / 3) + 1}`
}

/** Menor valor positivo entre os candidatos; undefined se nenhum servir. */
function lowest(values: Array<number | null | undefined>): number | undefined {
  const valid = values.filter((v): v is number => typeof v === 'number' && v > 0)
  return valid.length > 0 ? Math.min(...valid) : undefined
}

type Bucket = {
  offers: number
  cities: Set<string>
  prices: number[]
}

function bucket(): Bucket {
  return { offers: 0, cities: new Set(), prices: [] }
}

function add(map: Map<string, Bucket>, key: string, offers: number, citySlug: string, price?: number) {
  let b = map.get(key)
  if (!b) {
    b = bucket()
    map.set(key, b)
  }
  b.offers += offers
  if (offers > 0) b.cities.add(citySlug)
  if (price !== undefined) b.prices.push(price)
}

function toEntries(scope: PriceIndexScope, map: Map<string, Bucket>) {
  return [...map.entries()].map(([scopeKey, b]) => ({
    scope,
    scopeKey,
    offersCount: b.offers,
    citiesCovered: b.cities.size,
    minPrice: b.prices.length > 0 ? Math.min(...b.prices) : null,
    avgMinPrice:
      b.prices.length > 0
        ? Math.round((b.prices.reduce((s, p) => s + p, 0) / b.prices.length) * 100) / 100
        : null,
  }))
}

async function main() {
  const startedAt = Date.now()

  // CityCourseOfferCache guarda featuredCourseId cru, sem relation declarada no
  // schema — então o slug do curso vem de um join em memória, igual ao que
  // buildCourseCitiesSitemap já faz. Não declarei a relation de propósito: ela
  // mudaria uma tabela quente só pra conveniência deste script.
  const [courseRows, brandRows, courses] = await Promise.all([
    prisma.cityCourseOfferCache.findMany({
      select: {
        featuredCourseId: true,
        citySlug: true,
        offerCount: true,
        athenaOfferCount: true,
        minPrice: true,
        athenaMinPrice: true,
        fetchedAt: true,
      },
    }),
    prisma.institutionCityOfferCache.findMany({
      select: { brand: true, citySlug: true, offerCount: true, minPrice: true, fetchedAt: true },
    }),
    prisma.featuredCourse.findMany({ select: { id: true, slug: true } }),
  ])

  const slugByCourseId = new Map(courses.map((c) => [c.id, c.slug]))

  console.log(
    `[snapshot] curso×cidade ${courseRows.length} linhas · marca×cidade ${brandRows.length} linhas`,
  )

  const totalRows = courseRows.length + brandRows.length
  if (totalRows < MIN_ROWS) {
    console.error(
      `[snapshot] ABORTADO: ${totalRows} linhas de cache, abaixo do piso MIN_ROWS=${MIN_ROWS}. ` +
        'Medição rala quase sempre é falha de leitura — não gravo ponto falso na série.',
    )
    // Sai 0 de propósito: isto não é falha do job que nos hospeda. O precompute
    // que roda antes já terminou o trabalho dele; só a foto fica pra próxima.
    return
  }

  const national = new Map<string, Bucket>()
  const byCourse = new Map<string, Bucket>()
  const byCity = new Map<string, Bucket>()
  const byState = new Map<string, Bucket>()
  const byBrand = new Map<string, Bucket>()

  let stalest: Date | null = null
  const noteStale = (d: Date | null | undefined) => {
    if (d && (!stalest || d < stalest)) stalest = d
  }

  for (const row of courseRows) {
    // Soma as duas fontes — mesma contagem mesclada que o sitemap e o gate das
    // páginas usam. Ler só uma delas subnotifica cidade atendida só pela Athena.
    const offers = row.offerCount + row.athenaOfferCount
    const price = lowest([row.minPrice, row.athenaMinPrice])
    const courseSlug = slugByCourseId.get(row.featuredCourseId)
    noteStale(row.fetchedAt)

    add(national, 'br', offers, row.citySlug, price)
    if (courseSlug) add(byCourse, courseSlug, offers, row.citySlug, price)
    add(byCity, row.citySlug, offers, row.citySlug, price)

    const uf = stateByCitySlug.get(row.citySlug)
    if (uf) add(byState, uf, offers, row.citySlug, price)
  }

  for (const row of brandRows) {
    noteStale(row.fetchedAt)
    add(byBrand, row.brand, row.offerCount, row.citySlug, lowest([row.minPrice]))
  }

  const entries = [
    ...toEntries(PriceIndexScope.NATIONAL, national),
    ...toEntries(PriceIndexScope.COURSE, byCourse),
    ...toEntries(PriceIndexScope.CITY, byCity),
    ...toEntries(PriceIndexScope.STATE, byState),
    ...toEntries(PriceIndexScope.BRAND, byBrand),
  ]

  const period = process.env.PERIOD || periodLabel(new Date())
  const nationalEntry = entries.find((e) => e.scope === PriceIndexScope.NATIONAL)

  console.log(
    `[snapshot] período ${period} · ${entries.length} entries ` +
      `(cursos ${byCourse.size}, cidades ${byCity.size}, UFs ${byState.size}, marcas ${byBrand.size})`,
  )
  console.log(
    `[snapshot] nacional: ${nationalEntry?.offersCount ?? 0} ofertas em ` +
      `${nationalEntry?.citiesCovered ?? 0} cidades · menor preço ${nationalEntry?.minPrice ?? '-'}`,
  )

  if (DRY_RUN) {
    console.log('[snapshot] --dry-run: nada gravado.')
    return
  }

  const snapshot = await prisma.priceIndexSnapshot.create({
    data: {
      period,
      courseCityRows: courseRows.length,
      institutionCityRows: brandRows.length,
      stalestFetchedAt: stalest,
      entries: { createMany: { data: entries } },
    },
    select: { id: true },
  })

  console.log(
    `[snapshot] gravado ${snapshot.id} · ${entries.length} entries · ` +
      `${Math.round((Date.now() - startedAt) / 1000)}s`,
  )
}

main()
  .catch((e) => {
    // P2021 = tabela não existe. Acontece na janela entre o merge deste código e
    // a aplicação da migration 20261008180000_add_price_index_snapshot, que é
    // manual (o DATABASE_URL aponta pra produção). Sair 0 aqui desacopla as duas
    // coisas: o job semanal não fica vermelho por uma migration pendente, e um
    // workflow vermelho continua significando "o precompute quebrou", que é o
    // sinal que importa. Assim que a migration rodar, a foto passa a sair sozinha.
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2021') {
      console.warn(
        '[snapshot] tabela PriceIndexSnapshot ainda não existe — migration pendente. ' +
          'Pulando a foto desta semana sem falhar o job.',
      )
      return
    }
    console.error('Fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
