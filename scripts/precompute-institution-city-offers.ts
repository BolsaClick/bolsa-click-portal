/**
 * precompute-institution-city-offers
 * ----------------------------------
 * Popula InstitutionCityOfferCache com offerCount + minPrice por MARCA × cidade,
 * a partir da API viva. É a fonte ESTÁVEL que o sitemap e a página
 * /faculdades/[slug]/em/[city] usam pra decidir index/noindex (Fase 4).
 *
 * Estratégia: uma busca por cidade (sem curso) retorna as ofertas de TODAS as
 * marcas naquela cidade → agrupa por marca (normalizeBrand → slug). Tartarus
 * cobre as 4 marcas Cogna; a Athena (Estácio/YDUQS) é best-effort (o contrato de
 * busca por cidade ainda é incerto — se não retornar, Estácio fica sem inventário
 * e a superfície dela permanece dormente, que é o comportamento seguro).
 *
 * Flags (env / argv):
 *   --dry-run            não escreve no banco, só imprime
 *   CITY_LIMIT=N         processa só as N primeiras cidades (default: todas)
 *   CONCURRENCY=N        cidades em paralelo (default 4)
 *
 * Uso: node --env-file=.env node_modules/.bin/tsx scripts/precompute-institution-city-offers.ts --dry-run CITY_LIMIT=3
 */
import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import { BRAZILIAN_CITIES } from '../app/lib/constants/brazilian-cities'
import { normalizeBrand } from '../app/lib/utils/brand'
import { searchAthenaOffers, normalizeAthenaOffer } from '../app/lib/api/athena-offers'
import { TOP_CURSOS } from '../app/cursos/_data/cursos'

const prisma = new PrismaClient()

const DRY_RUN = process.argv.includes('--dry-run')
const arg = (k: string) =>
  process.argv.find((a) => a.startsWith(`${k}=`))?.split('=')[1] ?? process.env[k]
const CITY_LIMIT = Number(arg('CITY_LIMIT') ?? BRAZILIAN_CITIES.length)
const CONCURRENCY = Number(arg('CONCURRENCY') ?? 4)
const PAGE_SIZE = 50

const TARTARUS = process.env.NEXT_PUBLIC_TARTARUS_API
if (!TARTARUS) {
  console.error('ERRO: NEXT_PUBLIC_TARTARUS_API não está no env.')
  process.exit(1)
}
const tartarus = axios.create({ baseURL: TARTARUS, timeout: 25_000 })

// normalizeBrand devolve o nome ("Anhanguera") → mapeia pro slug da instituição.
const BRAND_NAME_TO_SLUG: Record<string, string> = {
  Anhanguera: 'anhanguera',
  Unopar: 'unopar',
  Pitágoras: 'pitagoras',
  Unime: 'unime',
  Estácio: 'estacio',
}

interface RawOffer {
  brand?: string
  minPrice?: number
  prices?: { withDiscount?: number }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function pMap<T, R>(items: T[], fn: (item: T, i: number) => Promise<R>, concurrency: number): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++
      results[i] = await fn(items[i], i)
    }
  })
  await Promise.all(workers)
  return results
}

const paramsSerializer = (p: Record<string, string | number | string[]>) => {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (Array.isArray(v)) v.forEach((x) => sp.append(k, String(x)))
    else sp.append(k, String(v))
  }
  return sp.toString()
}

// Ofertas Tartarus de UM curso numa cidade (busca granular — evita a saturação
// por marca que uma busca só-cidade tem, subcontando marcas menores).
async function fetchTartarusCourseCity(courseName: string, city: string, state: string): Promise<RawOffer[]> {
  const params: Record<string, string | number | string[]> = {
    page: 1,
    size: PAGE_SIZE,
    academicLevel: ['GRADUACAO'],
    courseName,
    city,
    state,
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await tartarus.get('cogna/courses/search', { params, paramsSerializer })
      const data = res.data?.data
      return Array.isArray(data) ? (data as RawOffer[]) : []
    } catch {
      if (attempt === 3) return []
      await sleep(400 * 2 ** (attempt - 1) + Math.floor(Math.random() * 300))
    }
  }
  return []
}

// Varre os TOP_CURSOS de uma cidade (Cogna) e junta todas as ofertas cruas.
async function fetchTartarusCity(city: string, state: string): Promise<RawOffer[]> {
  const perCourse = await pMap(
    TOP_CURSOS,
    (curso) => fetchTartarusCourseCity(curso.apiCourseName, city, state),
    4
  )
  return perCourse.flat()
}

// Athena (Estácio) por cidade — best-effort. Sem courseName; se o contrato não
// suportar, retorna [] e a Estácio fica sem inventário (esperado).
async function fetchAthenaCity(city: string, state: string): Promise<RawOffer[]> {
  try {
    const list = await searchAthenaOffers({ city, state, academicLevel: 'GRADUACAO' })
    return list.map(normalizeAthenaOffer) as RawOffer[]
  } catch (err) {
    console.error(`  ✗ Athena falhou em ${city}/${state}:`, (err as Error).message)
    return []
  }
}

function offerPrice(o: RawOffer): number {
  return Number(o.minPrice ?? o.prices?.withDiscount ?? 0)
}

async function main() {
  const cities = BRAZILIAN_CITIES.slice(0, CITY_LIMIT)
  console.log('═══════════════════════════════════════════════')
  console.log(`  precompute-institution-city-offers  dry-run=${DRY_RUN}`)
  console.log(`  cities=${cities.length}  concurrency=${CONCURRENCY}`)
  console.log('═══════════════════════════════════════════════\n')

  let upserts = 0
  const brandTotals = new Map<string, number>() // slug → nº de cidades com >=1 oferta

  await pMap(
    cities,
    async (city) => {
      const [tartarusOffers, athenaOffers] = await Promise.all([
        fetchTartarusCity(city.name, city.state),
        fetchAthenaCity(city.name, city.state),
      ])
      const all = [...tartarusOffers, ...athenaOffers]

      // Agrupa por slug de marca.
      const perBrand = new Map<string, { count: number; min: number | null }>()
      for (const o of all) {
        const slug = BRAND_NAME_TO_SLUG[normalizeBrand(o.brand)]
        if (!slug) continue
        const price = offerPrice(o)
        const cur = perBrand.get(slug) ?? { count: 0, min: null }
        cur.count += 1
        if (price > 0 && (cur.min === null || price < cur.min)) cur.min = price
        perBrand.set(slug, cur)
      }

      for (const [slug, agg] of perBrand) {
        brandTotals.set(slug, (brandTotals.get(slug) ?? 0) + 1)
        if (DRY_RUN) {
          console.log(`  ${city.name}/${city.state}  ${slug}: ${agg.count} ofertas, min R$ ${agg.min ?? '—'}`)
          continue
        }
        await prisma.institutionCityOfferCache.upsert({
          where: { brand_citySlug: { brand: slug, citySlug: city.slug } },
          create: { brand: slug, citySlug: city.slug, offerCount: agg.count, minPrice: agg.min },
          update: { offerCount: agg.count, minPrice: agg.min, fetchedAt: new Date() },
        })
        upserts++
      }
    },
    CONCURRENCY
  )

  console.log('\n─── resumo (cidades com ≥1 oferta por marca) ───')
  for (const [slug, n] of [...brandTotals].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${slug}: ${n} cidades`)
  }
  console.log(`\n${DRY_RUN ? '(dry-run, nada escrito)' : `upserts: ${upserts}`}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
