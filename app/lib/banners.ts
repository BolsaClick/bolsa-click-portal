import { prisma } from '@/app/lib/prisma'
import { seoSite, type SiteKey } from '@/app/lib/seo/site-config'

/** Sites que existem hoje pra segmentação de banner — ver `SiteKey`. */
export const BANNER_SITE_KEYS: SiteKey[] = ['bolsaclick', 'bolsamais', 'anhanguera']

export function isValidSiteKey(value: unknown): value is SiteKey {
  return typeof value === 'string' && (BANNER_SITE_KEYS as string[]).includes(value)
}

export interface PublicBanner {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  linkUrl: string | null
}

/**
 * Banners ativos, dentro do período de vigência e segmentados pro site atual
 * (`NEXT_PUBLIC_THEME` via `seoSite.key`).
 *
 * `targetSites` vazio = o banner aparece em QUALQUER site — é o comportamento
 * de todo banner cadastrado antes desse campo existir (nunca havia
 * segmentação) e também o padrão pra quem cadastra sem marcar nenhum site.
 * Isso é o que impede, por exemplo, um banner pensado pro Bolsa Click de
 * vazar sozinho pro tema Anhanguera: quem cadastra pra uma marca específica
 * marca o(s) site(s) e ele some dos outros.
 *
 * Usado tanto pelo Hero da home (query direta) quanto pelo endpoint público
 * `/api/banners` — mesma regra, um só lugar de verdade.
 */
export async function getActiveBanners(): Promise<PublicBanner[]> {
  const now = new Date()

  return prisma.banner.findMany({
    where: {
      isActive: true,
      OR: [{ targetSites: { isEmpty: true } }, { targetSites: { has: seoSite.key } }],
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      title: true,
      subtitle: true,
      imageUrl: true,
      linkUrl: true,
    },
  })
}
