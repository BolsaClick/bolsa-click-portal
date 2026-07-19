// Sub-sitemap dinâmico — atende /sitemap/0.xml a /sitemap/4.xml.
// Refatorado de app/sitemap.ts pra Route Handler pra ter controle total
// sobre a resposta XML e contornar bugs do generateSitemaps() do Next 15.

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { BRAZILIAN_CITIES } from '@/app/lib/constants/brazilian-cities'
import { shouldIndexInstitutionCityPage } from '@/app/lib/seo/city-page-gate'
import { isOffTopicNoindex } from '@/app/lib/blog/noindex-slugs'
import { COURSE_PROFILES } from '@/app/lib/teste-vocacional/methodology-profiles'
import { seoSite } from '@/app/lib/seo/site-config'

const SITE_URL = seoSite.siteUrl

// lastmod estável por deploy — NÃO usar `new Date()` por request.
// As páginas estáticas não têm updatedAt próprio, então um `new Date()` a cada
// requisição fazia o lastmod mudar a cada poucos segundos, o que leva o Google
// a desconfiar e ignorar o sinal de freshness. Fixado no boot do módulo: muda
// só quando há novo deploy (que é quando o conteúdo estático pode ter mudado).
// As páginas de dinheiro (cursos, cidades, faculdades, posts) já usam o
// updatedAt real da entidade — este constante cobre só estáticas e fallbacks.
const BUILD_TIME = new Date().toISOString()

export const revalidate = 3600

type SitemapEntry = {
  loc: string
  lastmod?: string
  changefreq?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never'
  priority?: number
}

const MAX_URLS_PER_SITEMAP = 45_000
const MAX_COMPARE_URLS = 1_000

const FALLBACK_COURSE_SLUGS = [
  'administracao-bacharelado', 'direito-bacharelado', 'enfermagem-bacharelado',
  'psicologia-bacharelado', 'educacao-fisica-bacharelado', 'farmacia-bacharelado',
  'medicina-bacharelado', 'engenharia-civil-bacharelado', 'pedagogia-licenciatura',
  'analise-e-desenvolvimento-de-sistemas-tecnologo', 'gestao-de-recursos-humanos-tecnologo',
  'marketing-tecnologo', 'nutricao-bacharelado', 'odontologia-bacharelado',
  'fisioterapia-bacharelado', 'biomedicina-bacharelado', 'ciencias-contabeis-bacharelado',
  'arquitetura-e-urbanismo-bacharelado', 'engenharia-de-producao-bacharelado',
  'gestao-comercial-tecnologo',
]

const CITY_TIER_1_CUTOFF = 60
const CITY_TIER_2_CUTOFF = 160

const cityRankBySlug = new Map(BRAZILIAN_CITIES.map((c, idx) => [c.slug, idx]))

function cityTier(citySlug: string): 1 | 2 | 3 {
  const rank = cityRankBySlug.get(citySlug) ?? 999
  if (rank < CITY_TIER_1_CUTOFF) return 1
  if (rank < CITY_TIER_2_CUTOFF) return 2
  return 3
}

function cityCoursePriority(trendScore: number, citySlug: string): number {
  const tier = cityTier(citySlug)
  const trendNorm = Math.max(0, Math.min(100, trendScore)) / 100
  const tierBonus = tier === 1 ? 0.15 : tier === 2 ? 0.08 : 0
  return Math.round((0.30 + trendNorm * 0.35 + tierBonus) * 100) / 100
}

// Fallback p/ cursos SEM cache de oferta auditado (raro após threshold=5).
// Sem dado de oferta, ser conservador: não emitir tier-1 incondicional (era a
// 2ª fonte do flood). Só emite cidade de topo com demanda mínima; resto espera
// o precompute popular o cache e cair no branch ciente de oferta.
function shouldEmitCityUrl(trendScore: number, citySlug: string): boolean {
  const tier = cityTier(citySlug)
  if (tier === 1) return trendScore >= 30
  if (tier === 2) return trendScore >= 60
  return false
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`[sitemap] timeout ${label} após ${ms}ms`)), ms)
  )
  return Promise.race([promise, timeout])
}

// ─────────────────────────────────────────────────────────────────────────
// BUILDERS
// ─────────────────────────────────────────────────────────────────────────

async function buildStaticSitemap(): Promise<SitemapEntry[]> {
  const now = BUILD_TIME
  let citySlugsWithOffers = new Set<string>()

  try {
    // A página usa `offers.length > 0` como gate. No sitemap usamos o espelho
    // persistido desse inventário, alimentado pelo precompute da mesma API,
    // para evitar 284 requests externos em uma única geração. O Route Handler
    // já revalida em 1h. Em falha, a escolha é conservadora: não emitir city
    // spokes em vez de voltar a listar URLs que podem responder noindex.
    // Só linhas atualizadas nos últimos 14 dias: cache defasado do estoque
    // vivo gerava mismatch sitemap × noindex (auditoria 2026-07, Critical #3).
    const staleCutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    const rows = await withTimeout(
      prisma.cityCourseOfferCache.findMany({
        where: { offerCount: { gt: 0 }, fetchedAt: { gte: staleCutoff } },
        distinct: ['citySlug'],
        select: { citySlug: true },
      }),
      8_000,
      'scholarship-cities',
    )
    citySlugsWithOffers = new Set(rows.map(({ citySlug }) => citySlug))
    console.log(`[sitemap:static] ${citySlugsWithOffers.size} cidades com oferta`)
  } catch (error) {
    console.error('[sitemap:static] erro ao carregar cidades com oferta:', error)
  }

  return [
    { loc: SITE_URL, lastmod: now, changefreq: 'daily', priority: 1.0 },
    { loc: `${SITE_URL}/cursos`, lastmod: now, changefreq: 'daily', priority: 0.9 },
    { loc: `${SITE_URL}/graduacao`, lastmod: now, changefreq: 'daily', priority: 0.95 },
    { loc: `${SITE_URL}/pos-graduacao`, lastmod: now, changefreq: 'daily', priority: 0.95 },
    { loc: `${SITE_URL}/cursos-profissionalizantes`, lastmod: now, changefreq: 'daily', priority: 0.95 },
    { loc: `${SITE_URL}/faculdades`, lastmod: now, changefreq: 'weekly', priority: 0.85 },
    { loc: `${SITE_URL}/bolsas-de-estudo`, lastmod: now, changefreq: 'daily', priority: 1.0 },
    { loc: `${SITE_URL}/blog`, lastmod: now, changefreq: 'daily', priority: 0.9 },
    { loc: `${SITE_URL}/quem-somos`, lastmod: now, changefreq: 'weekly', priority: 0.7 },
    { loc: `${SITE_URL}/bolsa-click-e-confiavel`, lastmod: now, changefreq: 'monthly', priority: 0.8 },
    { loc: `${SITE_URL}/bolsa-de-estudo-e-gratis`, lastmod: now, changefreq: 'monthly', priority: 0.8 },
    { loc: `${SITE_URL}/como-saber-se-um-site-de-bolsa-e-confiavel`, lastmod: now, changefreq: 'monthly', priority: 0.8 },
    { loc: `${SITE_URL}/como-funciona-bolsa-de-estudo`, lastmod: now, changefreq: 'monthly', priority: 0.8 },
    { loc: `${SITE_URL}/contato`, lastmod: now, changefreq: 'weekly', priority: 0.7 },
    { loc: `${SITE_URL}/central-de-ajuda`, lastmod: now, changefreq: 'weekly', priority: 0.7 },
    { loc: `${SITE_URL}/faq`, lastmod: now, changefreq: 'weekly', priority: 0.8 },
    { loc: `${SITE_URL}/carreiras`, lastmod: now, changefreq: 'weekly', priority: 0.9 },
    { loc: `${SITE_URL}/teste-vocacional`, lastmod: now, changefreq: 'monthly', priority: 0.85 },
    { loc: `${SITE_URL}/simulador-de-bolsa`, lastmod: now, changefreq: 'monthly', priority: 0.9 },
    { loc: `${SITE_URL}/descubra-sua-bolsa`, lastmod: now, changefreq: 'monthly', priority: 0.9 },
    { loc: `${SITE_URL}/enem`, lastmod: now, changefreq: 'monthly', priority: 0.85 },
    { loc: `${SITE_URL}/prouni`, lastmod: now, changefreq: 'monthly', priority: 0.85 },
    { loc: `${SITE_URL}/sisu`, lastmod: now, changefreq: 'monthly', priority: 0.85 },
    { loc: `${SITE_URL}/fies`, lastmod: now, changefreq: 'monthly', priority: 0.85 },
    { loc: `${SITE_URL}/encceja`, lastmod: now, changefreq: 'monthly', priority: 0.8 },
    ...BRAZILIAN_CITIES
      .filter((city) => citySlugsWithOffers.has(city.slug))
      .map((city) => ({
        loc: `${SITE_URL}/bolsas-de-estudo/${city.slug}`,
        lastmod: now,
        changefreq: 'weekly' as const,
        priority: 0.7,
      })),
    ...['realista', 'investigativo', 'artistico', 'social', 'empreendedor', 'convencional'].map((tipo) => ({
      loc: `${SITE_URL}/teste-vocacional/perfil/${tipo}`,
      lastmod: now,
      changefreq: 'monthly' as const,
      priority: 0.75,
    })),
    {
      loc: `${SITE_URL}/teste-vocacional/metodologia`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.8,
    },
  ]
}

async function buildCoursesSitemap(): Promise<SitemapEntry[]> {
  const now = BUILD_TIME
  try {
    const courses = await withTimeout(
      prisma.featuredCourse.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true, trendScore: true },
        orderBy: { trendScore: 'desc' },
      }),
      8_000,
      'courses'
    )
    console.log(`[sitemap:courses] ${courses.length} cursos`)
    return courses.map(({ slug, updatedAt, trendScore }) => ({
      loc: `${SITE_URL}/cursos/${slug}`,
      lastmod: updatedAt.toISOString(),
      changefreq: 'daily' as const,
      priority: Math.round((0.50 + (trendScore ?? 0) / 100 * 0.35) * 100) / 100,
    }))
  } catch (e) {
    console.error('[sitemap:courses] erro, usando fallback:', e)
    return FALLBACK_COURSE_SLUGS.map((slug) => ({
      loc: `${SITE_URL}/cursos/${slug}`,
      lastmod: now,
      changefreq: 'daily' as const,
      priority: 0.7,
    }))
  }
}

async function buildCourseCitiesSitemap(): Promise<SitemapEntry[]> {
  // Threshold mínimo de cache populado por curso pra considerá-lo "auditado".
  // Abaixo disso, cai no fallback conservador (shouldEmitCityUrl). Baixado de
  // 20 → 5 pra que ~todos os cursos (cache ~61 cidades/curso) usem o branch
  // ciente de oferta em vez do fallback, cortando o flood de URLs sem oferta.
  const CACHE_AUDITED_THRESHOLD = 5

  try {
    const [courses, cacheRows] = await withTimeout(
      Promise.all([
        prisma.featuredCourse.findMany({
          where: { isActive: true, hasCityPages: true },
          select: { id: true, slug: true, updatedAt: true, trendScore: true },
          orderBy: { trendScore: 'desc' },
        }),
        prisma.cityCourseOfferCache.findMany({
          select: { featuredCourseId: true, citySlug: true, offerCount: true },
        }),
      ]),
      10_000,
      'course-cities',
    )
    console.log(
      `[sitemap:course-cities] ${courses.length} cursos com hasCityPages, ${cacheRows.length} linhas de cache`,
    )

    // Indexa cache por curso → mapa { citySlug → offerCount }
    const cacheByCourse = new Map<string, Map<string, number>>()
    for (const row of cacheRows) {
      let inner = cacheByCourse.get(row.featuredCourseId)
      if (!inner) {
        inner = new Map()
        cacheByCourse.set(row.featuredCourseId, inner)
      }
      inner.set(row.citySlug, row.offerCount)
    }

    return courses
      .flatMap(({ id, slug, updatedAt, trendScore }) => {
        const courseCache = cacheByCourse.get(id)
        const isAudited =
          courseCache !== undefined && courseCache.size >= CACHE_AUDITED_THRESHOLD
        const score = trendScore ?? 0

        return BRAZILIAN_CITIES
          .filter((city) => {
            // Sem cache auditado pro curso → mantém comportamento legado.
            if (!isAudited) return shouldEmitCityUrl(score, city.slug)

            // Com cache auditado: aplica o MESMO critério do shouldIndexCityPage
            // (gate runtime) — emitir só o que é indexável, nunca URL noindex.
            //   offerCount ≥ 2 → emit
            //   offerCount = 1 + trendScore ≥ 60 → emit (alta demanda + alguma oferta)
            //   offerCount = 0 → skip SEMPRE (era a fonte do flood: trend≥60 emitia
            //                    todas as cidades de curso popular sem oferta local).
            const offers = courseCache!.get(city.slug) ?? 0
            if (offers >= 2) return true
            if (score >= 60 && offers >= 1) return true
            return false
          })
          .map((city) => ({
            loc: `${SITE_URL}/cursos/${slug}/${city.slug}`,
            lastmod: updatedAt.toISOString(),
            changefreq: 'weekly' as const,
            priority: cityCoursePriority(score, city.slug),
          }))
      })
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
      .slice(0, MAX_URLS_PER_SITEMAP)
  } catch (e) {
    console.error('[sitemap:course-cities] erro, fallback:', e)
    const now = BUILD_TIME
    return FALLBACK_COURSE_SLUGS.flatMap((slug) =>
      BRAZILIAN_CITIES.slice(0, CITY_TIER_1_CUTOFF).map((city) => ({
        loc: `${SITE_URL}/cursos/${slug}/${city.slug}`,
        lastmod: now,
        changefreq: 'weekly' as const,
        priority: 0.65,
      })),
    )
  }
}

async function buildInstitutionsSitemap(): Promise<SitemapEntry[]> {
  try {
    const [institutions, localOffers] = await withTimeout(
      Promise.all([
        prisma.institution.findMany({
          where: { isActive: true },
          select: {
            slug: true,
            name: true,
            shortName: true,
            fullName: true,
            hasCityPages: true,
            updatedAt: true,
          },
        }),
        // Inventário marca×cidade ESTÁVEL (precompute-institution-city-offers).
        // Substitui a FaculdadeCurso legada, que nunca foi populada neste repo.
        prisma.institutionCityOfferCache.findMany({
          select: { brand: true, citySlug: true, offerCount: true, fetchedAt: true },
        }),
      ]),
      8_000,
      'institutions'
    )
    console.log(`[sitemap:institutions] ${institutions.length} ativas`)

    // Chave do cache: `${slug}|${citySlug}` (brand no cache já é o slug da marca).
    const localInventory = new Map<string, { offerCount: number; updatedAt: Date }>()
    for (const row of localOffers) {
      localInventory.set(`${row.brand}|${row.citySlug}`, {
        offerCount: row.offerCount,
        updatedAt: row.fetchedAt,
      })
    }

    const sortedByRecency = [...institutions].sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    )

    const compareUrls: SitemapEntry[] = []
    outer: for (let i = 0; i < sortedByRecency.length; i++) {
      for (let j = i + 1; j < sortedByRecency.length; j++) {
        const instA = sortedByRecency[i]
        const instB = sortedByRecency[j]
        const [a, b] = [instA.slug, instB.slug].sort()
        const newer = instA.updatedAt > instB.updatedAt ? instA.updatedAt : instB.updatedAt
        compareUrls.push({
          loc: `${SITE_URL}/comparar/${a}-vs-${b}`,
          lastmod: newer.toISOString(),
          changefreq: 'weekly' as const,
          priority: 0.75,
        })
        if (compareUrls.length >= MAX_COMPARE_URLS) break outer
      }
    }

    const institutionCityUrls = institutions.flatMap((institution) => {
      if (!institution.hasCityPages) return []

      return BRAZILIAN_CITIES.flatMap((city) => {
        const bestInventory = localInventory.get(`${institution.slug}|${city.slug}`)

        // Mesmo gate da página de marca (MIN_OFFERS_TO_INDEX_INSTITUTION=8) — o
        // sitemap NÃO pode emitir URL que a página marca como noindex.
        if (!bestInventory || !shouldIndexInstitutionCityPage(bestInventory.offerCount)) {
          return []
        }

        const lastmod =
          bestInventory.updatedAt > institution.updatedAt
            ? bestInventory.updatedAt
            : institution.updatedAt

        return [{
          loc: `${SITE_URL}/faculdades/${institution.slug}/em/${city.slug}`,
          lastmod: lastmod.toISOString(),
          changefreq: 'weekly' as const,
          priority: 0.65,
        }]
      })
    })

    console.log(
      `[sitemap:institutions] ${institutionCityUrls.length} URLs faculdade-cidade indexáveis`
    )

    return [
      ...institutions.map(({ slug, updatedAt }) => ({
        loc: `${SITE_URL}/faculdades/${slug}`,
        lastmod: updatedAt.toISOString(),
        changefreq: 'weekly' as const,
        priority: 0.8,
      })),
      ...institutionCityUrls,
      ...compareUrls,
    ].slice(0, MAX_URLS_PER_SITEMAP)
  } catch (e) {
    console.error('[sitemap:institutions] erro:', e)
    return []
  }
}

async function buildEditorialSitemap(): Promise<SitemapEntry[]> {
  try {
    const [blogPosts, blogCategories, helpArticles, vocacionalCourses] = await withTimeout(
      Promise.all([
        prisma.blogPost.findMany({
          where: { isActive: true, publishedAt: { not: null } },
          select: { slug: true, updatedAt: true },
        }),
        prisma.blogCategory.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true },
        }),
        prisma.helpArticle.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true, category: { select: { slug: true } } },
        }),
        prisma.featuredCourse.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true, trendScore: true },
          orderBy: { trendScore: 'desc' },
        }),
      ]),
      8_000,
      'editorial'
    )
    console.log(
      `[sitemap:editorial] ${blogPosts.length} posts, ${blogCategories.length} cats, ${helpArticles.length} ajuda, ${vocacionalCourses.length} vocacional`
    )
    return [
      // Posts off-topic marcados noindex não entram no sitemap (coerência com o
      // robots da página — sitemap nunca deve listar URL noindex).
      ...blogPosts
        .filter(({ slug }) => !isOffTopicNoindex(slug))
        .map(({ slug, updatedAt }) => ({
          loc: `${SITE_URL}/blog/${slug}`,
          lastmod: updatedAt.toISOString(),
          changefreq: 'weekly' as const,
          priority: 0.8,
        })),
      ...blogCategories.map(({ slug, updatedAt }) => ({
        loc: `${SITE_URL}/blog/categoria/${slug}`,
        lastmod: updatedAt.toISOString(),
        changefreq: 'weekly' as const,
        priority: 0.7,
      })),
      ...helpArticles.map(({ slug, updatedAt, category }) => ({
        loc: `${SITE_URL}/central-de-ajuda/${category.slug}/${slug}`,
        lastmod: updatedAt.toISOString(),
        changefreq: 'weekly' as const,
        priority: 0.7,
      })),
      // Só os slugs com perfil vocacional implementado (COURSE_PROFILES, 10
      // páginas reais). A lista do banco (177 slugs sufixados) não intersecta
      // o mapa — gerava 177 soft-404 no sitemap (auditoria 2026-07, Critical #1).
      ...Object.keys(COURSE_PROFILES).map((slug) => ({
        loc: `${SITE_URL}/teste-vocacional/${slug}`,
        lastmod: BUILD_TIME,
        changefreq: 'monthly' as const,
        priority: 0.7,
      })),
      ...vocacionalCourses.map(({ slug, updatedAt, trendScore }) => ({
        loc: `${SITE_URL}/carreiras/${slug}`,
        lastmod: updatedAt.toISOString(),
        changefreq: 'weekly' as const,
        priority: Math.round((0.75 + (trendScore ?? 0) / 100 * 0.10) * 100) / 100,
      })),
    ]
  } catch (e) {
    console.error('[sitemap:editorial] erro:', e)
    return []
  }
}

// ─────────────────────────────────────────────────────────────────────────
// SERIALIZAÇÃO XML
// ─────────────────────────────────────────────────────────────────────────

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function entriesToXml(entries: SitemapEntry[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map((e) => {
    const lines = [`  <url>`, `    <loc>${escapeXml(e.loc)}</loc>`]
    if (e.lastmod) lines.push(`    <lastmod>${e.lastmod}</lastmod>`)
    if (e.changefreq) lines.push(`    <changefreq>${e.changefreq}</changefreq>`)
    if (e.priority !== undefined) lines.push(`    <priority>${e.priority.toFixed(2)}</priority>`)
    lines.push(`  </url>`)
    return lines.join('\n')
  })
  .join('\n')}
</urlset>
`
}

// ─────────────────────────────────────────────────────────────────────────
// HANDLER
// ─────────────────────────────────────────────────────────────────────────

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  if (!seoSite.indexingEnabled) {
    return new NextResponse(entriesToXml([]), {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, follow',
      },
    })
  }
  const { id: rawId } = await params
  // Aceita "0", "1.xml", "0.xml" — normaliza pra inteiro
  const id = parseInt(rawId.replace(/\.xml$/, ''), 10)
  console.log(`[sitemap] dispatch id=${id}`)

  let entries: SitemapEntry[] = []
  switch (id) {
    case 0:
      entries = await buildStaticSitemap()
      break
    case 1:
      entries = await buildCoursesSitemap()
      break
    case 2:
      entries = await buildCourseCitiesSitemap()
      break
    case 3:
      entries = await buildInstitutionsSitemap()
      break
    case 4:
      entries = await buildEditorialSitemap()
      break
    default:
      return new NextResponse('Not Found', { status: 404 })
  }

  console.log(`[sitemap] id=${id} retornando ${entries.length} URLs`)
  return new NextResponse(entriesToXml(entries), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
