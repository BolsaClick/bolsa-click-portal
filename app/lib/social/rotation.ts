import { prisma } from '@/app/lib/prisma'
import {
  getShowcaseOffers,
  type ShowcaseOffer,
} from '@/app/lib/api/get-showcase-offers'
import { sourceRefForOffer } from '@/app/lib/social/slides'

/**
 * Rotação dos slots de "oferta da semana".
 *
 * O catálogo devolve três ofertas fixas (Pedagogia BH, Administração Curitiba,
 * ADS Recife). Sem memória, "oferta da semana" publicaria o primeiro card toda
 * segunda e o formato morreria de repetição.
 *
 * A memória é a própria fila: a escolha é "o slot que ficou mais tempo sem ir
 * ao ar". Sorteio não serve — sorteio repete, e repete logo: com 3 slots a
 * chance de cair o mesmo card duas semanas seguidas é 1 em 3. Rodízio por
 * histórico garante que os três passem antes de qualquer um repetir.
 *
 * Conta como "uso" tudo que já saiu do rascunho (APPROVED, PUBLISHED e até
 * FAILED), não só o publicado: um card aprovado e esperando a segunda-feira já
 * ocupou o slot, e um que falhou na publicação já foi visto e revisado. Contar
 * só PUBLISHED faria a fila gerar o mesmo card de novo enquanto o anterior
 * ainda não tinha ido ao ar.
 */

export type OfferRotationPick = {
  offer: ShowcaseOffer
  sourceRef: string
  /** Quando este slot foi usado pela última vez. Null = nunca. */
  lastUsedAt: Date | null
  /** Quantos slots reais o catálogo devolveu nesta rodada. */
  totalDisponiveis: number
}

export class SemOfertaRealError extends Error {
  constructor() {
    super('O catálogo não devolveu nenhuma oferta com De/Por honesto agora.')
    this.name = 'SemOfertaRealError'
  }
}

/**
 * Escolhe a próxima oferta a virar post.
 *
 * Nunca inventa: se o catálogo não devolver oferta real, lança em vez de cair
 * num card de exemplo.
 */
export async function pickNextOffer(): Promise<OfferRotationPick> {
  const offers = await getShowcaseOffers()
  if (offers.length === 0) throw new SemOfertaRealError()

  const refs = offers.map(sourceRefForOffer)

  // Um registro por slot: o mais recente que já saiu de DRAFT. Ordenado por
  // `createdAt` porque é o único carimbo que todo status tem — `publishedAt`
  // é null em APPROVED, e ordenar por ele jogaria os aprovados pro fim.
  const usos = await prisma.socialPost.findMany({
    where: {
      format: 'OFERTA',
      sourceRef: { in: refs },
      status: { in: ['APPROVED', 'PUBLISHED', 'FAILED'] },
    },
    select: { sourceRef: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  const ultimoUso = new Map<string, Date>()
  for (const uso of usos) {
    if (uso.sourceRef && !ultimoUso.has(uso.sourceRef)) {
      ultimoUso.set(uso.sourceRef, uso.createdAt)
    }
  }

  // Nunca usado vem primeiro (slot novo entra na roda na frente); depois, o
  // mais antigo. Empate desempatado pela ordem do catálogo, que é estável.
  let escolhidoIdx = 0
  let melhor: number | null = null
  offers.forEach((_, i) => {
    const usado = ultimoUso.get(refs[i])
    const peso = usado ? usado.getTime() : -1
    if (melhor === null || peso < melhor) {
      melhor = peso
      escolhidoIdx = i
    }
  })

  const ref = refs[escolhidoIdx]
  return {
    offer: offers[escolhidoIdx],
    sourceRef: ref,
    lastUsedAt: ultimoUso.get(ref) ?? null,
    totalDisponiveis: offers.length,
  }
}
