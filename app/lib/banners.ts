import { unstable_cache } from 'next/cache'
import probe from 'probe-image-size'
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
  // Dimensões REAIS do arquivo (não as do card/design), pra caixa do
  // carrossel seguir a proporção de cada imagem sem cortar — ver
  // `probeBannerDimensions` e o comentário no topo do HeroBannerSlider.
  width: number
  height: number
}

// Fallback só usado se a sondagem da imagem falhar (URL fora do ar, formato
// não suportado, timeout). Proporção da arte de referência cadastrada hoje
// (1734x907) — não é usada pra chumbar layout, só evita que a seção quebre
// enquanto o problema real (imagem inacessível) não é corrigido no admin.
const FALLBACK_WIDTH = 1734
const FALLBACK_HEIGHT = 907

/**
 * Lê só o cabeçalho da imagem (via `probe-image-size`, que aborta a conexão
 * assim que extrai width/height — não baixa o arquivo inteiro) pra descobrir
 * a proporção REAL de cada banner. Não depende de o admin preencher nada:
 * funciona pra qualquer arte, de qualquer proporção, sem migração no Prisma
 * (o model `Banner` não guarda dimensões — ver decisão no relatório da
 * task).
 *
 * Cacheado 24h por URL via `unstable_cache` (mesmo padrão de
 * `getInstitutionCourses`/`getCourseReviewsAggregate`): cada upload no admin
 * gera uma URL nova no Tigris, então a mesma URL sempre tem a mesma imagem —
 * cache por tempo longo é seguro e evita sondar de novo a cada request.
 */
async function probeBannerDimensions(imageUrl: string): Promise<{ width: number; height: number }> {
  return unstable_cache(
    async () => {
      try {
        const result = await probe(imageUrl)
        if (result.width > 0 && result.height > 0) {
          return { width: result.width, height: result.height }
        }
      } catch {
        // Sondagem falhou — cai no fallback abaixo, sem derrubar a home.
      }
      return { width: FALLBACK_WIDTH, height: FALLBACK_HEIGHT }
    },
    ['banner-dimensions', imageUrl],
    { revalidate: 86400 }
  )()
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

  const banners = await prisma.banner.findMany({
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

  return Promise.all(
    banners.map(async (banner) => ({
      ...banner,
      ...(await probeBannerDimensions(banner.imageUrl)),
    }))
  )
}
