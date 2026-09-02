/**
 * Vitrine da home — loaders server-side compartilhados entre a home real
 * (app/(default)/page.tsx) e o preview (app/dev/home-v2/page.tsx).
 *
 * Extraído do preview quando a home v3 foi aprovada. Regras:
 * - Falha de API nunca derruba a página: cada loader degrada pra [].
 * - Dedupe por nome-base de curso: a vitrine mostra VARIEDADE de cursos,
 *   não o mesmo curso em 8 polos.
 * - Nenhum dado inventado: quem consome decide esconder a prateleira ou
 *   mostrar empty state honesto.
 */

import type { CourseOffer } from '@/app/components/v2/course-offer'
import { balanceByBrand } from '@/app/components/v2/home/balance-by-brand'
import { toCourseOffer } from '@/app/components/v2/home/featured-offers'
import type { BlogTeaserPost } from '@/app/components/v2/home/BlogTeaser'
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import { capturePostHogServerEvent } from '@/app/lib/analytics/posthog-server'
import { normalizeBrand } from '@/app/lib/utils/brand'
import { prisma } from '@/app/lib/prisma'

// Orçamento da corrida (Promise.race) entre o fetch combinado (Cogna + Athena)
// e o timeout de sanidade. Com city, getShowFiltersCourses pode encadear DUAS
// chamadas SEQUENCIAIS ao Tartarus (most-searched, e se ele não tiver nenhum
// resultado no nível pedido — ex.: most-searched só devolve POS_GRADUACAO pra
// SAO PAULO — cai pro fallback cogna/courses/search): medido em produção,
// ~5s + ~2s = ~7s só nessas duas chamadas, quase batendo no teto antigo de
// 8000ms. Cada chamada individual (Tartarus e Athena) já tem timeout próprio
// de 15_000ms (SOURCE_TIMEOUT_MS em get-courses-filter.ts) — um orçamento
// externo MENOR que os internos garante estourar sempre que o encadeamento
// sequencial passa de 8s, mesmo com as chamadas individuais saudáveis. Causa
// raiz do sumiço da vitrine "Mais procurados" em 2026-09-02: a race perdia
// pro timeout, loadShelf caía no catch e devolvia [] em silêncio, e a home
// escondia a seção inteira sem log nem alerta visível.
const SHELF_TIMEOUT_MS = 16_000

const shelfTimeout = (ms: number) =>
  new Promise<never>((_, reject) => setTimeout(() => reject(new Error('shelf timeout')), ms))

/**
 * Best-effort: avisa quando uma prateleira da home vem vazia (erro OU
 * legitimamente sem oferta) — sem isso, a home "falha parecendo normal"
 * (o card CONDICIONAL em page.tsx some sem deixar rastro nenhum, nem no
 * console). Nunca bloqueia nem atrasa o render: dispara e esquece.
 */
function reportEmptyShelf(shelfName: string, params: Record<string, unknown>, reason: string) {
  console.error(`[home vitrine] prateleira "${shelfName}" veio vazia (${reason}):`, params)
  capturePostHogServerEvent({
    event: 'home_shelf_empty',
    distinctId: 'server-home-vitrine',
    properties: { shelfName, reason, ...params },
  }).catch((err) => {
    console.error('[home vitrine] falha ao reportar prateleira vazia pro PostHog:', err)
  })
}

/**
 * Ofertas Estácio (Athena) direto no server: o fetchAthenaOffers do funil só
 * roda no browser (guard typeof window), então a vitrine server-side chama a
 * rota interna com URL absoluta (NEXT_PUBLIC_SITE_URL existe em prod).
 * TODO(sistema de vitrine): extrair pra um service compartilhado em vez de
 * self-fetch.
 */
export async function loadAthenaOffersServer(params: {
  modality?: string
  city?: string
  state?: string
}): Promise<unknown[]> {
  try {
    const qs = new URLSearchParams({ academicLevel: 'GRADUACAO' })
    if (params.modality) qs.set('modality', params.modality)
    if (params.city) qs.set('city', params.city)
    if (params.state) qs.set('state', params.state)
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    // NUNCA 'no-store' aqui: um fetch no-store durante o render opta a rota
    // inteira pra renderização dinâmica e mata o ISR da home (regressão
    // 2026-07-16: home caiu pra DYNAMIC e passou a levar ~7s por request).
    const res = await fetch(`${base}/api/athena-offers?${qs.toString()}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json?.data) ? json.data : []
  } catch {
    return []
  }
}

/**
 * Prateleira: fetch server-side real (Cogna + Estácio em paralelo), com
 * dedupe por nome de curso + marca e balanceamento pra não deixar uma marca
 * dominar (achado: dedupe só por nome colapsava marcas diferentes com o
 * mesmo curso — Anhanguera, que quase sempre chega primeiro do Tartarus,
 * vencia a colisão mesmo quando havia oferta real de outra marca). Falha -> [].
 */
export async function loadShelf(
  params: {
    modality?: string
    city?: string
    state?: string
  },
  /** Nome só pra log/telemetria (reportEmptyShelf) — não afeta a busca. */
  shelfName: string = 'unnamed',
): Promise<CourseOffer[]> {
  try {
    const [cognaResult, athenaRaw] = (await Promise.race([
      Promise.all([
        getShowFiltersCourses(
          undefined,
          params.city,
          params.state,
          params.modality,
          'GRADUACAO',
          1,
          50,
        ),
        loadAthenaOffersServer(params),
      ]),
      shelfTimeout(SHELF_TIMEOUT_MS),
    ])) as [{ data?: unknown[] }, unknown[]]

    const all = [
      ...(Array.isArray(cognaResult?.data) ? cognaResult.data : []),
      ...athenaRaw,
    ]
      .map(toCourseOffer)
      .filter((offer): offer is CourseOffer => offer !== null)

    // Dedupe por nome-base do curso + marca: preserva "Pedagogia" da
    // Anhanguera E da Unopar como ofertas distintas (só colapsa polos
    // repetidos DA MESMA marca).
    const seen = new Set<string>()
    const deduped: CourseOffer[] = []
    for (const offer of all) {
      const baseName = offer.name
        .replace(/ - (Bacharelado|Licenciatura|Tecn[oó]logo)$/i, '')
        .trim()
        .toUpperCase()
      const key = `${baseName}|${normalizeBrand(offer.brand)}`
      if (seen.has(key)) continue
      seen.add(key)
      deduped.push(offer)
    }
    const result = balanceByBrand(deduped, 8)
    if (result.length === 0) {
      reportEmptyShelf(shelfName, params, 'sem-ofertas-apos-filtro')
    }
    return result
  } catch (error) {
    reportEmptyShelf(
      shelfName,
      params,
      error instanceof Error ? error.message : 'erro-desconhecido',
    )
    return []
  }
}

/** Blog: últimos posts publicados (mesma query da home desde sempre); falha -> []. */
export async function loadBlogPosts(): Promise<BlogTeaserPost[]> {
  try {
    const latest = await prisma.blogPost.findMany({
      where: { isActive: true, publishedAt: { not: null, lte: new Date() } },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      select: {
        slug: true,
        title: true,
        featuredImage: true,
        imageAlt: true,
        readingTime: true,
        publishedAt: true,
        categories: { select: { title: true } },
      },
    })
    return latest.map((post: (typeof latest)[number]) => ({
      slug: post.slug,
      title: post.title,
      featuredImage: post.featuredImage,
      imageAlt: post.imageAlt,
      readingTime: post.readingTime,
      publishedAt: post.publishedAt!.toISOString(),
      category: post.categories[0]?.title ?? null,
    }))
  } catch (error) {
    console.error('[home vitrine] blog indisponível:', error)
    return []
  }
}
