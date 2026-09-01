/**
 * Busca de curso (`FeaturedCourse`) e faixa de preço, extraídas de `page.tsx`
 * pra um módulo comum — reaproveitadas por `page.tsx`, `opengraph-image.tsx`
 * (deste segmento e de `[city]`) e pela página de cidade.
 *
 * Por que não deixar como função privada de `page.tsx` e importar de lá:
 * Next.js restringe o que um `page.tsx`/`layout.tsx` pode exportar (só os
 * nomes de route segment config reconhecidos pelo framework) — o plugin de
 * TypeScript do Next rejeita import de outros nomes vindos desses arquivos
 * (`tsc` acusa "no exported member" mesmo com `export` presente). Um módulo
 * comum sem essa restrição é o jeito suportado de compartilhar isso.
 */
import { prisma } from '@/app/lib/prisma'
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import { FeaturedCourseData } from '../../_data/types'

export async function getCourseBySlug(slug: string): Promise<FeaturedCourseData | null> {
  try {
    const course = await prisma.featuredCourse.findUnique({
      where: {
        slug,
        isActive: true,
      },
    })
    return course as FeaturedCourseData | null
  } catch (error) {
    console.error('Erro ao buscar curso do banco de dados:', error)
    return null
  }
}

export async function getCoursePriceRange(apiCourseName: string, nivel: string) {
  try {
    const apiResponse = await getShowFiltersCourses(
      apiCourseName,
      undefined,
      undefined,
      undefined,
      nivel,
      1,
      20
    )
    const offers = apiResponse?.data || []
    if (offers.length === 0) return { lowPrice: 0, highPrice: 0, offerCount: 0 }

    const prices = offers
      .map((o: { minPrice?: number; prices?: { withDiscount?: number; withoutDiscount?: number } }) =>
        o.minPrice || o.prices?.withDiscount || 0
      )
      .filter((p: number) => p > 0)
    const maxPrices = offers
      .map((o: { maxPrice?: number; prices?: { withoutDiscount?: number } }) =>
        o.maxPrice || o.prices?.withoutDiscount || 0
      )
      .filter((p: number) => p > 0)

    return {
      lowPrice: prices.length > 0 ? Math.min(...prices) : 0,
      highPrice: maxPrices.length > 0 ? Math.max(...maxPrices) : 0,
      offerCount: offers.length,
    }
  } catch {
    return { lowPrice: 0, highPrice: 0, offerCount: 0 }
  }
}
