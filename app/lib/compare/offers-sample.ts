/**
 * Estatísticas vivas das páginas /comparar/[pair].
 *
 * Extraído de app/comparar/[pair]/page.tsx quando o mesmo modo de falha de
 * 08/10/2026 (Cogna devolvendo 429, Tartarus reempacotando como 400) apareceu
 * nesta superfície. Na home a prateleira sumia; aqui some a tabela de
 * mensalidade — nas páginas que acabaram de ser otimizadas pra CTR.
 *
 * O princípio é o de app/lib/home/vitrine.ts: fonte caída DEGRADA a seção, não
 * derruba a página, e nunca inventa número. Três coisas mudam em relação ao
 * que estava na página:
 *
 * 1. `Promise.allSettled` com a falha REGISTRADA, em vez de `.catch(() => [])`
 *    por curso. O catch silencioso fazia uma amostra de 3 cursos de 21 ficar
 *    indistinguível de uma amostra completa — e `courseCount`/`cityCount`
 *    saíam subcontados na tela como se fossem o catálogo inteiro.
 *
 * 2. Amostra degradada NÃO entra no cache de 24h. Esse era o agravante em
 *    relação à home: lá a prateleira voltava no request seguinte, aqui um
 *    único 429 na hora errada congelava a tabela vazia por um dia inteiro,
 *    em todos os pares de uma vez (o cache é um só, compartilhado).
 *
 * 3. Fallback pro catálogo próprio (InstitutionCityOfferCache, precomputado
 *    semanalmente no GitHub Actions). É a segunda fonte independente que esta
 *    página não tinha — o equivalente ao que a Athena é pra prateleira da
 *    home. Ele não sabe tudo que a amostra viva sabe (não tem curso nem preço
 *    médio), e o que ele não sabe vira "—", não vira estimativa.
 */

import { unstable_cache } from 'next/cache'
import type { Course } from '@/app/interface/course'
import { TOP_CURSOS } from '@/app/cursos/_data/cursos'
import { getShowFiltersCourses, type OfferSource } from '@/app/lib/api/get-courses-filter'
import { capturePostHogServerEvent } from '@/app/lib/analytics/posthog-server'
import { prisma } from '@/app/lib/prisma'

/** De onde saíram os números que a tabela mostra. Nunca é "estimado". */
export type CompareStatsSource = 'live' | 'catalogo'

/**
 * `null` significa "esta fonte não mede isso", e a tabela escreve "—".
 * Diferente de `0`, que seria uma medição real de ausência.
 */
export type BrandStats = {
  offerCount: number
  courseCount: number | null
  cityCount: number | null
  avgPrice: number | null
  minPrice: number | null
}

export type OffersSample = {
  offers: Course[]
  /** Quantos dos TOP_CURSOS responderam sem rejeitar. */
  okCourses: number
  totalCourses: number
  /** Fontes que caíram em alguma das buscas (vem do getShowFiltersCourses). */
  failedSources: OfferSource[]
}

const EMPTY_SAMPLE: OffersSample = {
  offers: [],
  okCourses: 0,
  totalCourses: TOP_CURSOS.length,
  failedSources: [],
}

/**
 * Piso de cobertura da amostra. Abaixo disso, `courseCount` e `cityCount`
 * seriam subcontagens apresentadas como fato — pior que não mostrar a linha.
 */
const MIN_SAMPLE_COVERAGE = 0.6

export function normalizeLabel(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}

/**
 * Amostra dos TOP_CURSOS. Sem `unstable_cache` de propósito — quem decide o
 * que vai pro cache é `fetchOffersSample`, e só amostra sadia vai.
 */
export async function collectOffersSample(): Promise<OffersSample> {
  const settled = await Promise.allSettled(
    TOP_CURSOS.map((curso) =>
      getShowFiltersCourses(
        curso.apiCourseName,
        undefined,
        undefined,
        undefined,
        'GRADUACAO',
        1,
        50,
      ),
    ),
  )

  const offers: Course[] = []
  const failedSources = new Set<OfferSource>()
  let okCourses = 0

  settled.forEach((result, index) => {
    if (result.status === 'rejected') {
      // Rejeição aqui já significa "Cogna E Estácio sem nada" pra este curso:
      // getShowFiltersCourses só rejeita quando a principal cai sem a outra
      // compensar. Não dá pra tratar como "curso sem oferta".
      console.error(
        `[comparar] amostra: ${TOP_CURSOS[index].apiCourseName} falhou nas duas fontes:`,
        result.reason instanceof Error ? result.reason.message : result.reason,
      )
      return
    }
    okCourses += 1
    const value = result.value as { data?: unknown; failedSources?: OfferSource[] }
    for (const source of value?.failedSources ?? []) failedSources.add(source)
    if (Array.isArray(value?.data)) offers.push(...(value.data as Course[]))
  })

  return {
    offers,
    okCourses,
    totalCourses: TOP_CURSOS.length,
    failedSources: [...failedSources],
  }
}

/**
 * Amostra parcial não serve pra esta tabela.
 *
 * `failedSources` não-vazio reprova mesmo com os 21 cursos "respondendo":
 * quando a Cogna cai e a Athena compensa, cada busca RESOLVE com dado só da
 * Estácio. A amostra parece cheia, mas toda marca Cogna fica zerada — e numa
 * página cujo conteúdo inteiro é a comparação lado a lado, isso vira "a
 * Estácio tem 500 cursos e a Anhanguera não tem nenhum". Sumir com a linha é
 * ruim; publicar essa linha é mentir.
 */
export function isSampleUsable(sample: OffersSample): boolean {
  if (sample.offers.length === 0) return false
  if (sample.failedSources.length > 0) return false
  return sample.okCourses >= Math.ceil(sample.totalCourses * MIN_SAMPLE_COVERAGE)
}

export function computeBrandStats(offers: Course[], brandName: string): BrandStats {
  const brandKey = normalizeLabel(brandName)
  const brandOffers = offers.filter((o) => normalizeLabel(o.brand || '') === brandKey)
  const prices = brandOffers.map((o) => o.minPrice || 0).filter((p) => p > 0)
  const courses = new Set(
    brandOffers.map((o) => normalizeLabel(o.name || '')).filter(Boolean),
  )
  const cities = new Set(
    brandOffers.map((o) => normalizeLabel(o.unitCity || o.city || '')).filter(Boolean),
  )
  return {
    offerCount: brandOffers.length,
    courseCount: courses.size,
    cityCount: cities.size,
    avgPrice: prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null,
    minPrice: prices.length ? Math.min(...prices) : null,
  }
}

/** Erro-portador: leva a amostra degradada pra fora do unstable_cache sem gravá-la. */
function degradedSampleError(sample: OffersSample): Error {
  const error = new Error(
    `[comparar] amostra degradada (${sample.okCourses}/${sample.totalCourses} cursos, fontes caídas: ${sample.failedSources.join(',') || 'nenhuma'})`,
  )
  Object.assign(error, { degradedSample: sample })
  return error
}

function readDegradedSample(error: unknown): OffersSample | null {
  const carried = (error as { degradedSample?: OffersSample } | null | undefined)
    ?.degradedSample
  return carried && Array.isArray(carried.offers) ? carried : null
}

/**
 * `unstable_cache` guarda valor RESOLVIDO; rejeição passa direto sem virar
 * entrada. É assim que a amostra ruim fica fora do cache de 24h: degradada
 * vira throw, e `fetchOffersSample` desembrulha do próprio erro.
 *
 * Chave v2 — a v1 pode ter uma amostra vazia gravada de algum 429 anterior.
 */
const cachedSample = unstable_cache(
  async (): Promise<OffersSample> => {
    const sample = await collectOffersSample()
    if (!isSampleUsable(sample)) throw degradedSampleError(sample)
    return sample
  },
  ['compare-offers-sample-v2'],
  { revalidate: 86400, tags: ['compare-offers'] },
)

export async function fetchOffersSample(): Promise<OffersSample> {
  try {
    return await cachedSample()
  } catch (error) {
    const degraded = readDegradedSample(error)
    if (degraded) return degraded
    console.error('[comparar] amostra de ofertas falhou inteira:', error)
    return EMPTY_SAMPLE
  }
}

export type CatalogStats = {
  stats: Map<string, BrandStats>
  /** Precompute mais antigo entre as marcas lidas — vira rótulo de frescor. */
  measuredAt: Date | null
}

/**
 * Fallback durável: o que o nosso próprio precompute semanal já mediu
 * (scripts/precompute-institution-city-offers.ts varre o Brasil por marca ×
 * cidade). `brand` nessa tabela é o slug da Institution.
 *
 * Mede cidade, oferta e piso de preço — NÃO mede curso nem preço médio, e
 * esses dois saem `null` de propósito. Marca fora do BRAND_NAME_TO_SLUG do
 * precompute (hoje Wyden, IBMEC e Mackenzie) não tem linha nenhuma, e quem
 * chama trata como "sem dado".
 */
export async function loadCatalogStats(slugs: string[]): Promise<CatalogStats> {
  try {
    const rows = await prisma.institutionCityOfferCache.groupBy({
      by: ['brand'],
      where: { brand: { in: slugs }, offerCount: { gt: 0 } },
      _count: { _all: true },
      _sum: { offerCount: true },
      _min: { minPrice: true, fetchedAt: true },
    })
    const stats = new Map<string, BrandStats>()
    let measuredAt: Date | null = null
    for (const row of rows) {
      stats.set(row.brand, {
        offerCount: row._sum.offerCount ?? 0,
        courseCount: null,
        cityCount: row._count._all,
        avgPrice: null,
        minPrice: row._min.minPrice ?? null,
      })
      const fetched = row._min.fetchedAt
      if (fetched && (!measuredAt || fetched < measuredAt)) measuredAt = fetched
    }
    return { stats, measuredAt }
  } catch (error) {
    console.error('[comparar] catálogo (InstitutionCityOfferCache) indisponível:', error)
    return { stats: new Map(), measuredAt: null }
  }
}

export type CompareStats = {
  a: BrandStats
  b: BrandStats
  source: CompareStatsSource
  measuredAt: Date | null
}

type InstitutionRef = { slug: string; name: string }

/**
 * Decisão pura (sem I/O) de qual fonte sustenta as linhas vivas.
 *
 * Regra que não se negocia: as DUAS marcas saem da MESMA fonte. Misturar
 * amostra viva de uma com catálogo da outra põe números de origens diferentes
 * na mesma linha — não é comparação, são dois fatos empilhados. Se uma das
 * duas não tem dado na fonte escolhida, a fonte inteira é descartada.
 */
export function pickCompareStats(
  sample: OffersSample,
  catalog: CatalogStats,
  instA: InstitutionRef,
  instB: InstitutionRef,
): CompareStats | null {
  if (isSampleUsable(sample)) {
    const a = computeBrandStats(sample.offers, instA.name)
    const b = computeBrandStats(sample.offers, instB.name)
    if (a.offerCount > 0 && b.offerCount > 0) {
      return { a, b, source: 'live', measuredAt: null }
    }
  }

  const a = catalog.stats.get(instA.slug)
  const b = catalog.stats.get(instB.slug)
  if (a && b) return { a, b, source: 'catalogo', measuredAt: catalog.measuredAt }

  return null
}

/**
 * Best-effort, igual ao reportEmptyShelf da vitrine: sem isso a página "falha
 * parecendo normal" — a tabela encolhe algumas linhas e ninguém fica sabendo.
 */
function reportDegradedStats(
  pair: string,
  sample: OffersSample,
  source: CompareStatsSource | 'nenhuma',
) {
  console.error(
    `[comparar] estatísticas de "${pair}" caíram pra "${source}" (amostra ${sample.okCourses}/${sample.totalCourses}, fontes caídas: ${sample.failedSources.join(',') || 'nenhuma'})`,
  )
  capturePostHogServerEvent({
    event: 'compare_stats_degraded',
    distinctId: 'server-comparar',
    properties: {
      pair,
      source,
      okCourses: sample.okCourses,
      totalCourses: sample.totalCourses,
      failedSources: sample.failedSources,
    },
  }).catch((err) => {
    console.error('[comparar] falha ao reportar degradação pro PostHog:', err)
  })
}

export async function loadCompareStats(
  instA: InstitutionRef,
  instB: InstitutionRef,
): Promise<CompareStats | null> {
  const sample = await fetchOffersSample()
  const catalog = isSampleUsable(sample)
    ? { stats: new Map<string, BrandStats>(), measuredAt: null }
    : await loadCatalogStats([instA.slug, instB.slug])

  const picked = pickCompareStats(sample, catalog, instA, instB)
  if (!picked || picked.source !== 'live') {
    reportDegradedStats(
      `${instA.slug}-vs-${instB.slug}`,
      sample,
      picked?.source ?? 'nenhuma',
    )
  }
  return picked
}
