import { unstable_cache } from 'next/cache'
import probe from 'probe-image-size'
import { prisma } from '@/app/lib/prisma'
import { seoSite, type SiteKey } from '@/app/lib/seo/site-config'
import { capturePostHogServerEvent } from '@/app/lib/analytics/posthog-server'

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

// Teto de tempo pra sondagem de UMA imagem. Investigação em node_modules
// (probe-image-size 7.4.0):
// - `http.js` repassa `options` direto pro `needle` (via lodash.merge com
//   defaults próprios: open_timeout 10_000ms, response_timeout 60_000ms,
//   read_timeout 60_000ms) — a lib ACEITA timeout, mas o default é alto
//   demais pro caminho de renderização da home.
// - Em `needle/lib/needle.js` (`set_timeout`), só o timeout tipo 'read'
//   chama `done(new Error(...))` explicitamente pra rejeitar a promise; os
//   tipos 'open' e 'response' só chamam `request.abort()` e dependem do
//   request emitir 'error' (via `request.on('error', had_error)`) — Node
//   historicamente tem inconsistências em quando `abort()` emite 'error'
//   (comportamento mudou entre versões, é sinalizado como legado desde o
//   Node 14). Ou seja: mesmo configurando os timeouts da lib, não há garantia
//   formal de rejeição em todo caminho.
// Por isso: (1) reduzimos os timeouts internos pra esse mesmo teto — defesa
// em profundidade, quando o mecanismo interno funciona — e (2) corremos a
// chamada contra um `Promise.race` com timer próprio, que É a única garantia
// real: não depende de nenhum comportamento interno de `probe-image-size`
// nem do `needle`.
const PROBE_TIMEOUT_MS = 2000

async function probeWithTimeout(imageUrl: string): Promise<{ width: number; height: number }> {
  const result = await Promise.race([
    probe(imageUrl, {
      open_timeout: PROBE_TIMEOUT_MS,
      response_timeout: PROBE_TIMEOUT_MS,
      read_timeout: PROBE_TIMEOUT_MS,
    }),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`probe-image-size timeout (${PROBE_TIMEOUT_MS}ms)`)), PROBE_TIMEOUT_MS)
    }),
  ])

  if (result.width > 0 && result.height > 0) {
    return { width: result.width, height: result.height }
  }
  throw new Error('probe-image-size devolveu dimensões inválidas')
}

/**
 * Best-effort: avisa quando a sondagem de um banner falha (erro OU timeout)
 * — mesmo padrão de `reportEmptyShelf` em `app/lib/home/vitrine.ts`. Nunca
 * bloqueia nem atrasa o render: dispara e esquece.
 */
function reportBannerProbeFailure(imageUrl: string, error: unknown) {
  const reason = error instanceof Error ? error.message : String(error)
  console.error(`[banners] sondagem de dimensões falhou pra "${imageUrl}":`, reason)
  capturePostHogServerEvent({
    event: 'banner_probe_failed',
    distinctId: 'server-banners',
    properties: { imageUrl, reason },
  }).catch((err) => {
    console.error('[banners] falha ao reportar sondagem pro PostHog:', err)
  })
}

/**
 * Lê só o cabeçalho da imagem (via `probe-image-size`, que aborta a conexão
 * assim que extrai width/height — não baixa o arquivo inteiro) pra descobrir
 * a proporção REAL de cada banner. Não depende de o admin preencher nada:
 * funciona pra qualquer arte, de qualquer proporção, sem migração no Prisma
 * (o model `Banner` não guarda dimensões — ver decisão no relatório da
 * task).
 *
 * Sucesso é cacheado 24h por URL via `unstable_cache` (mesmo padrão de
 * `getInstitutionCourses`/`getCourseReviewsAggregate`): cada upload no admin
 * gera uma URL nova no Tigris, então a mesma URL sempre tem a mesma imagem —
 * cache por tempo longo é seguro e evita sondar de novo a cada request.
 *
 * Falha (erro OU timeout) NUNCA é cacheada: a função interna passada pro
 * `unstable_cache` propaga o erro (throw), e o `unstable_cache` do Next só
 * grava no cache depois que essa promise resolve — se ela rejeita, nada é
 * persistido (confirmado lendo `unstable-cache.js` do Next instalado: o
 * `cacheNewResult` só roda após o `await` da callback, nunca num `.catch`).
 * O catch que decide o fallback fica FORA do `unstable_cache`, então uma
 * falha passageira (storage lento, DNS, socket travado) não congela a
 * proporção errada por 24h — a próxima request tenta sondar de novo, com o
 * mesmo teto de 2s.
 */
async function probeBannerDimensions(imageUrl: string): Promise<{ width: number; height: number }> {
  try {
    return await unstable_cache(() => probeWithTimeout(imageUrl), ['banner-dimensions', imageUrl], {
      revalidate: 86400,
    })()
  } catch (error) {
    reportBannerProbeFailure(imageUrl, error)
    return { width: FALLBACK_WIDTH, height: FALLBACK_HEIGHT }
  }
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

  // `banners.map(async ...)` dispara todas as sondagens ANTES do `Promise.all`
  // esperar qualquer uma — elas rodam em paralelo, não em fila. Pior caso
  // total é ~PROBE_TIMEOUT_MS (2s), não N×PROBE_TIMEOUT_MS, então um teto
  // global adicional não é necessário aqui (a quantidade de banners ativos é
  // pequena — cadastro manual no admin, não conteúdo gerado em volume).
  return Promise.all(
    banners.map(async (banner) => ({
      ...banner,
      ...(await probeBannerDimensions(banner.imageUrl)),
    }))
  )
}
