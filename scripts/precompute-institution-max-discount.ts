#!/usr/bin/env tsx
/**
 * precompute-institution-max-discount
 * ------------------------------------
 * Calcula o maior desconto REAL (%) de cada MARCA (graduação, nacional) e
 * PERSISTE em InstitutionMaxDiscountCache. /faculdades/[slug] LÊ esse valor —
 * nunca deriva no render (ver o comentário do model em prisma/schema.prisma
 * pro histórico dos 2 reverts que motivaram este script).
 *
 * Grava o valor BRUTO medido (`maxDiscountPctRaw`), SEM aplicar
 * DISCOUNT_CEILING_PCT aqui — o teto editorial é responsabilidade exclusiva
 * da LEITURA (getBrandDiscountState/getDisplayDiscountPct em
 * app/lib/utils/institution-discount.ts). Truncar na gravação já causou um
 * bug real: quando o teto subiu de 78% pra 80% (claims.ts), os valores
 * persistidos ficaram travados em 78 até o reprocessamento manual. Truncar
 * só na leitura faz uma mudança na constante valer pro site inteiro sem
 * reprocessar nada.
 *
 * REGRA INEGOCIÁVEL (requisito 1 da tarefa): se a medição de uma marca teve
 * QUALQUER falha de busca (exceção após retries) OU colheu amostra menor que
 * MIN_SAMPLE_TO_WRITE, o upsert daquela marca é PULADO — o registro anterior
 * fica exatamente como estava. Nunca sobrescreve um valor bom com um zero
 * que pode ter vindo de falha.
 *
 * Disciplina de API (a Tartarus falha SOB CARGA — é o problema em
 * investigação, não algo pra reproduzir aqui):
 *   - Concorrência 1 (sequencial), com espaçamento entre TODAS as chamadas.
 *   - Aborta a rodada inteira (não só a marca corrente) se detectar uma
 *     sequência de EXCEÇÕES reais (ex.: 400 embrulhando 429) — sinal de
 *     degradação/rate limit. Uma lista vazia sem exceção NÃO conta pra esse
 *     streak (uma marca de catálogo estreito, ex.: IBMEC, legitimamente
 *     devolve vazio pra vários TOP_CURSOS sem a API estar degradada); a
 *     defesa contra a falha que NÃO lança erro ("200 vazio sob carga") é o
 *     piso agregado de amostra (MIN_SAMPLE_TO_WRITE), não um streak por
 *     chamada. Marcas já processadas e gravadas ANTES do aborto permanecem
 *     gravadas; as restantes preservam o valor anterior.
 *   - Loga quantas chamadas HTTP fez, pro relatório final.
 *
 * Fontes: Tartarus (Cogna: anhanguera/unopar/pitagoras/unime) via
 * `cogna/courses/search?brands=X`; Athena (YDUQS: estacio/wyden/ibmec) via
 * `GET api/offers?brand=X` — mesma rota "uma consulta por marca" já validada
 * em get-courses-filter.ts (a consulta ABERTA sem brand é a que quebra na
 * Athena). Chamada direto no client `athena` (não via `searchAthenaOffers`,
 * que engole erro e devolve `[]` — ver comentário de `fetchAthenaCourseBrand`
 * abaixo pro porquê isso importa aqui).
 *
 * USO:
 *   node --env-file=.env node_modules/.bin/tsx scripts/precompute-institution-max-discount.ts
 *   ... --dry-run                 não escreve no banco, só imprime
 *   ... --brands=ibmec,estacio    processa só essas marcas (default: as 7)
 *   ... --delay=500               ms entre chamadas HTTP (default 400)
 */
import { PrismaClient } from '@prisma/client'
import { tartarus, athena } from '../app/lib/api/axios'
import { cleanCourseNameForAthena, normalizeAthenaOffer, type AthenaOffer } from '../app/lib/api/athena-offers'
import { normalizeBrand, cognaBrandParam, yduqsBrandSlug } from '../app/lib/utils/brand'
import { getPriceAnchor } from '../app/lib/utils/price-anchor'
import { TOP_CURSOS } from '../app/cursos/_data/cursos'

const prisma = new PrismaClient()

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const eq = a.indexOf('=')
      return eq === -1 ? [a.slice(2), true] : [a.slice(2, eq), a.slice(eq + 1)]
    }),
) as Record<string, string | boolean>

const DRY_RUN = !!args['dry-run']
const DELAY_MS = Number(args.delay ?? 400)
/** Corta TOP_CURSOS pros primeiros N — só pra smoke test barato antes da
 *  rodada real. Default: todos (22). NÃO usar em produção (amostra cai). */
const COURSE_LIMIT = Number(args['course-limit'] ?? 0) || undefined

/** Marcas suportadas — mesmos 7 slugs de Institution.slug no banco. */
const ALL_BRAND_SLUGS = ['anhanguera', 'unopar', 'pitagoras', 'unime', 'estacio', 'wyden', 'ibmec'] as const
type BrandSlug = (typeof ALL_BRAND_SLUGS)[number]

const BRAND_SLUG_TO_LABEL: Record<BrandSlug, string> = {
  anhanguera: 'Anhanguera',
  unopar: 'Unopar',
  pitagoras: 'Pitágoras',
  unime: 'Unime',
  estacio: 'Estácio',
  wyden: 'Wyden',
  ibmec: 'IBMEC',
}
const COGNA_BRANDS = new Set<BrandSlug>(['anhanguera', 'unopar', 'pitagoras', 'unime'])

const requestedBrands =
  typeof args.brands === 'string'
    ? args.brands.split(',').map((s) => s.trim()).filter(Boolean)
    : [...ALL_BRAND_SLUGS]
const BRANDS = requestedBrands.filter((b): b is BrandSlug => (ALL_BRAND_SLUGS as readonly string[]).includes(b))

/**
 * Amostra mínima (nº total de ofertas de graduação coletadas pra uma marca,
 * somando os TOP_CURSOS) pra confiar na medição — abaixo disso, PRESERVA o
 * registro anterior em vez de gravar. Calibrado pro caso mais estreito
 * legítimo conhecido: IBMEC tem 122 ofertas de graduação medidas hoje
 * (todas desconto 0) — um piso de 20 sobra folga confortável pra marcas
 * pequenas sem abrir brecha pro padrão de falha conhecido (Tartarus 200 com
 * lista vazia sob carga, que produziria uma amostra perto de zero).
 * Mesmo valor documentado em app/lib/utils/institution-discount.ts
 * (MIN_SAMPLE_FOR_RELIABLE_READ) — a leitura reaplica esse piso como defesa
 * em profundidade, mas por construção todo row gravado aqui já o satisfaz.
 */
const MIN_SAMPLE_TO_WRITE = 20

/** Sinal de degradação da API: nº de EXCEÇÕES reais em sequência (não listas
 *  vazias — ver comentário acima) que aborta a rodada inteira. Baixo de
 *  propósito — o objetivo é parar de bater numa API instável, não estatística. */
const ABORT_ON_CONSECUTIVE_BAD_CALLS = 6

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface RawOffer {
  brand?: string
  minPrice?: number
  maxPrice?: number
}

let totalCalls = 0
let consecutiveBadCalls = 0
let aborted = false

const paramsSerializer = (p: Record<string, string | number | string[]>) => {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (Array.isArray(v)) v.forEach((x) => sp.append(k, String(x)))
    else sp.append(k, String(v))
  }
  return sp.toString()
}

/** Uma chamada Cogna (Tartarus), UM curso × UMA marca. Sem retry-e-engolir:
 *  se a chamada falhar, devolve failed=true — nunca vira um `[]` silencioso
 *  que pareceria "buscou e não achou nada" (é exatamente essa confusão que
 *  causou os 2 reverts). */
async function fetchCognaCourseBrand(
  courseName: string,
  cognaBrand: string,
): Promise<{ offers: RawOffer[]; failed: boolean }> {
  totalCalls++
  try {
    const res = await tartarus.get('cogna/courses/search', {
      params: {
        page: 1,
        size: 50,
        academicLevel: ['GRADUACAO'],
        courseName,
        brands: [cognaBrand],
      },
      paramsSerializer,
      timeout: 20_000,
    })
    const data = res.data?.data
    return { offers: Array.isArray(data) ? (data as RawOffer[]) : [], failed: false }
  } catch (err) {
    console.error(`    ✗ Tartarus falhou (${courseName} / ${cognaBrand}):`, (err as Error).message)
    return { offers: [], failed: true }
  }
}

/**
 * Uma chamada Athena (YDUQS), UM curso × UMA marca — via `brand`, a rota
 * validada (a consulta aberta sem brand é a que quebra na Athena).
 *
 * NÃO usa `searchAthenaOffers` (app/lib/api/athena-offers.ts): aquela função
 * é feita pro SSR ao vivo do site, onde engolir erro e devolver `[]` é o
 * comportamento certo (não pode derrubar a página). Aqui é o oposto — um
 * `[]` que veio de um 500/timeout escondido é exatamente a falha que a
 * REGRA INEGOCIÁVEL deste script precisa enxergar. Descoberto na prática:
 * rodando o reprocessamento (2026-09-02), a Athena devolveu 500 em ~70% das
 * chamadas de Estácio, mas `searchAthenaOffers` engoliu todas — o script
 * quase gravou um valor com amostra severamente degradada e `failed: false`.
 * Chama o client `athena` diretamente (mesmo padrão de `fetchCognaCourseBrand`
 * acima) pra que a exceção real chegue até aqui e conte pro streak de aborto.
 */
async function fetchAthenaCourseBrand(
  courseName: string,
  yduqsBrand: string,
): Promise<{ offers: RawOffer[]; failed: boolean }> {
  totalCalls++
  if (!process.env.ATHENA_BASE_URL) {
    console.error('    ✗ Athena falhou: ATHENA_BASE_URL não configurado')
    return { offers: [], failed: true }
  }
  try {
    const query: Record<string, string> = { academicLevel: 'GRADUACAO', brand: yduqsBrand.toLowerCase() }
    const cleanedName = cleanCourseNameForAthena(courseName)
    if (cleanedName) query.courseName = cleanedName

    const response = await athena.get('api/offers', { params: query, timeout: 15_000 })
    const data = response.data
    const list: AthenaOffer[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.offers)
          ? data.offers
          : []
    return { offers: list.map(normalizeAthenaOffer) as RawOffer[], failed: false }
  } catch (err) {
    console.error(`    ✗ Athena falhou (${courseName} / ${yduqsBrand}):`, (err as Error).message)
    return { offers: [], failed: true }
  }
}

function offerDiscountPct(o: RawOffer): number {
  const anchor = getPriceAnchor({ from: o.maxPrice, to: o.minPrice })
  return anchor ? anchor.discountPct : 0
}

interface BrandMeasurement {
  brandSlug: BrandSlug
  /** Bruto, sem teto — ver comentário do topo do arquivo. */
  maxDiscountPctRaw: number
  offersWithDiscount: number
  sampleSize: number
  hadFailure: boolean
}

async function measureBrand(brandSlug: BrandSlug): Promise<BrandMeasurement> {
  const label = BRAND_SLUG_TO_LABEL[brandSlug]
  const isCogna = COGNA_BRANDS.has(brandSlug)
  const cognaBrand = isCogna ? cognaBrandParam(label) : null
  const yduqsBrand = !isCogna ? yduqsBrandSlug(label) : null

  let sampleSize = 0
  let offersWithDiscount = 0
  let maxDiscountPctRaw = 0
  let hadFailure = false

  const cursos = COURSE_LIMIT ? TOP_CURSOS.slice(0, COURSE_LIMIT) : TOP_CURSOS

  for (const curso of cursos) {
    if (aborted) break

    const result =
      isCogna && cognaBrand
        ? await fetchCognaCourseBrand(curso.apiCourseName, cognaBrand)
        : !isCogna && yduqsBrand
          ? await fetchAthenaCourseBrand(curso.apiCourseName, yduqsBrand)
          : { offers: [] as RawOffer[], failed: true }

    if (result.failed) {
      // Exceção de verdade (ex.: 400 embrulhando 429) — sinal real de
      // degradação da API. SÓ isto conta pro streak de aborto.
      hadFailure = true
      consecutiveBadCalls++
    } else {
      // 200 sem exceção, mesmo com lista vazia, NÃO conta como "chamada
      // ruim": uma marca de catálogo estreito (ex.: IBMEC, forte em
      // negócios/direito/engenharia) legitimamente devolve vazio pra vários
      // dos TOP_CURSOS (ex.: Enfermagem, Pedagogia) sem que a API esteja
      // degradada — contar isso quase impediu de medir o IBMEC de verdade.
      // A defesa contra a OUTRA falha conhecida ("200 com lista vazia sob
      // carga", indistinguível caso a caso) é o piso agregado de amostra
      // (MIN_SAMPLE_TO_WRITE) aplicado no fim: se a rodada toda degradar
      // nesse padrão, o total coletado fica baixo demais e a marca cai em
      // PRESERVE, sem precisar adivinhar chamada a chamada.
      consecutiveBadCalls = 0
    }

    // Filtra por marca de novo (normalizeBrand) — defesa extra caso a API
    // devolva algo fora do filtro solicitado.
    const brandOffers = result.offers.filter((o) => normalizeBrand(o.brand) === label)
    sampleSize += brandOffers.length
    for (const o of brandOffers) {
      const pct = offerDiscountPct(o)
      if (pct > 0) offersWithDiscount++
      if (pct > maxDiscountPctRaw) maxDiscountPctRaw = pct
    }

    if (consecutiveBadCalls >= ABORT_ON_CONSECUTIVE_BAD_CALLS) {
      console.error(
        `\n⚠ Sinal de degradação: ${consecutiveBadCalls} chamadas ruins em sequência. Abortando a rodada — não vou continuar batendo numa API instável.`,
      )
      aborted = true
      hadFailure = true
      break
    }

    await sleep(DELAY_MS + Math.floor(Math.random() * 150))
  }

  return {
    brandSlug,
    // Bruto — SEM Math.min(..., DISCOUNT_CEILING_PCT). O teto é aplicado só
    // na leitura (ver comentário do topo do arquivo).
    maxDiscountPctRaw,
    offersWithDiscount,
    sampleSize,
    hadFailure,
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════')
  console.log(`  precompute-institution-max-discount  dry-run=${DRY_RUN}`)
  console.log(
    `  marcas=${BRANDS.join(', ')}  delay=${DELAY_MS}ms  cursos/marca=${COURSE_LIMIT ?? TOP_CURSOS.length}${COURSE_LIMIT ? ` (smoke test, de ${TOP_CURSOS.length})` : ''}`,
  )
  console.log('═══════════════════════════════════════════════\n')

  const report: Array<BrandMeasurement & { action: 'WRITE' | 'PRESERVE (falha)' | 'PRESERVE (amostra baixa)' | 'PULADO (abortado)' }> = []

  for (const brandSlug of BRANDS) {
    if (aborted) {
      report.push({
        brandSlug,
        maxDiscountPctRaw: 0,
        offersWithDiscount: 0,
        sampleSize: 0,
        hadFailure: true,
        action: 'PULADO (abortado)',
      })
      continue
    }

    console.log(`▶ ${BRAND_SLUG_TO_LABEL[brandSlug]} (${brandSlug})`)
    const m = await measureBrand(brandSlug)

    // REQUISITO 1 — nunca persistir valor originado de falha nem amostra
    // pequena demais. Skip = registro anterior PRESERVADO intocado.
    const trustworthy = !m.hadFailure && m.sampleSize >= MIN_SAMPLE_TO_WRITE
    const action: (typeof report)[number]['action'] = trustworthy
      ? 'WRITE'
      : m.hadFailure
        ? 'PRESERVE (falha)'
        : 'PRESERVE (amostra baixa)'

    console.log(
      `  desconto máx (bruto): ${m.maxDiscountPctRaw}%  |  amostra: ${m.sampleSize} ofertas (${m.offersWithDiscount} com desconto)  |  falha: ${m.hadFailure}  →  ${action}`,
    )

    if (trustworthy && !DRY_RUN) {
      await prisma.institutionMaxDiscountCache.upsert({
        where: { brand: brandSlug },
        create: {
          brand: brandSlug,
          maxDiscountPctRaw: m.maxDiscountPctRaw,
          offersWithDiscount: m.offersWithDiscount,
          sampleSize: m.sampleSize,
        },
        update: {
          maxDiscountPctRaw: m.maxDiscountPctRaw,
          offersWithDiscount: m.offersWithDiscount,
          sampleSize: m.sampleSize,
          measuredAt: new Date(),
        },
      })
    }

    report.push({ ...m, action })
  }

  console.log('\n─── resumo ───')
  console.log('marca'.padEnd(12), 'ação'.padEnd(26), 'bruto'.padEnd(10), 'amostra'.padEnd(10), 'c/desconto')
  for (const r of report) {
    console.log(
      r.brandSlug.padEnd(12),
      r.action.padEnd(26),
      `${r.maxDiscountPctRaw}%`.padEnd(10),
      String(r.sampleSize).padEnd(10),
      String(r.offersWithDiscount),
    )
  }
  console.log(`\nchamadas HTTP totais: ${totalCalls}`)
  console.log(aborted ? 'RODADA ABORTADA por sinal de degradação.' : 'Rodada concluída sem abortar.')
  console.log(DRY_RUN ? '(dry-run, nada escrito no banco)' : '')

  await prisma.$disconnect()
  if (aborted) process.exitCode = 1
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
