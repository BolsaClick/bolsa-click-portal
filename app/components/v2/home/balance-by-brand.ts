/**
 * Balanceamento por marca pras prateleiras de DESCOBERTA da home (Mais
 * procurados, Bolsas EAD, Presencial perto de você) — não usar em prateleiras
 * personalizadas (RelatedShelf), que devem refletir a busca real do usuário.
 *
 * Round-robin por marca normalizada respeitando um teto (default 40% do
 * tamanho final); se não houver oferta suficiente de outras marcas pra
 * preencher, relaxa o teto em vez de devolver menos cards que o pedido —
 * "marca sem oferta não quebra a prateleira" (degradação graciosa), mas
 * também não inventamos diversidade que o catálogo não tem.
 */

import { normalizeBrand } from '@/app/lib/utils/brand'
import type { CourseOffer } from '../course-offer'

export function balanceByBrand(
  offers: CourseOffer[],
  take: number,
  maxSharePerBrand = 0.4,
): CourseOffer[] {
  if (offers.length <= take) return offers.slice(0, take)

  const buckets = new Map<string, CourseOffer[]>()
  const brandOrder: string[] = []
  for (const offer of offers) {
    const key = normalizeBrand(offer.brand) || '—'
    if (!buckets.has(key)) {
      buckets.set(key, [])
      brandOrder.push(key)
    }
    buckets.get(key)!.push(offer)
  }

  const cap = Math.max(1, Math.floor(take * maxSharePerBrand))
  const countByBrand = new Map<string, number>()
  const result: CourseOffer[] = []

  // Passo 1: round-robin respeitando o teto por marca.
  let pushedSomething = true
  while (pushedSomething && result.length < take) {
    pushedSomething = false
    for (const key of brandOrder) {
      if (result.length >= take) break
      const arr = buckets.get(key)!
      const count = countByBrand.get(key) ?? 0
      if (arr.length > 0 && count < cap) {
        result.push(arr.shift()!)
        countByBrand.set(key, count + 1)
        pushedSomething = true
      }
    }
  }

  // Passo 2: faltou pra completar `take` (diversidade real insuficiente) —
  // relaxa o teto e preenche com o que sobrou, ainda alternando marcas.
  if (result.length < take) {
    pushedSomething = true
    while (pushedSomething && result.length < take) {
      pushedSomething = false
      for (const key of brandOrder) {
        if (result.length >= take) break
        const arr = buckets.get(key)!
        if (arr.length > 0) {
          result.push(arr.shift()!)
          pushedSomething = true
        }
      }
    }
  }

  return result
}
