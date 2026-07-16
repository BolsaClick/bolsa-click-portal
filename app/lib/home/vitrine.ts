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
import { toCourseOffer } from '@/app/components/v2/home/featured-offers'
import type { BlogTeaserPost } from '@/app/components/v2/home/BlogTeaser'
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import { prisma } from '@/app/lib/prisma'

const shelfTimeout = (ms: number) =>
  new Promise<never>((_, reject) => setTimeout(() => reject(new Error('shelf timeout')), ms))

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
    const res = await fetch(`${base}/api/athena-offers?${qs.toString()}`, {
      cache: 'no-store',
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
 * dedupe por nome de curso. Falha -> [].
 */
export async function loadShelf(params: {
  modality?: string
  city?: string
  state?: string
}): Promise<CourseOffer[]> {
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
          24,
        ),
        loadAthenaOffersServer(params),
      ]),
      shelfTimeout(8000),
    ])) as [{ data?: unknown[] }, unknown[]]

    const all = [
      ...(Array.isArray(cognaResult?.data) ? cognaResult.data : []),
      ...athenaRaw,
    ]
      .map(toCourseOffer)
      .filter((offer): offer is CourseOffer => offer !== null)

    // Dedupe por nome-base do curso, intercalando marcas quando possível
    const seen = new Set<string>()
    const deduped: CourseOffer[] = []
    for (const offer of all) {
      const key = offer.name
        .replace(/ - (Bacharelado|Licenciatura|Tecn[oó]logo)$/i, '')
        .trim()
        .toUpperCase()
      if (seen.has(key)) continue
      seen.add(key)
      deduped.push(offer)
      if (deduped.length >= 8) break
    }
    return deduped
  } catch (error) {
    console.error('[home vitrine] prateleira falhou:', params, error)
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
