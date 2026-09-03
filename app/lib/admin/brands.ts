// Registro de marcas administráveis pelo painel único.
//
// Este arquivo é seguro pra importar tanto de código server quanto de
// componentes `'use client'` — não lê `process.env` nem faz I/O (isso vive em
// `brand-client.ts`, marcado `server-only`). Aqui só existe metadado estático:
// rótulo, cor de identidade e "onde mora" cada marca.
//
// Bolsa Click roda NESTE mesmo processo (Prisma local, banco Railway Postgres).
// Bolsa Mais roda em outro serviço, outro banco (Neon) — por isso NÃO há um
// segundo PrismaClient aqui: o painel fala com ela por HTTP, autenticado pela
// chave de serviço (`X-Admin-Api-Key`, ver `app/lib/middleware/admin-auth.ts`).

export type BrandId = 'bolsaclick' | 'bolsamais'

interface BrandConfigBase {
  id: BrandId
  /** Nome exibido no seletor e nos badges de "marca ativa". */
  label: string
  /** Cor de identidade da marca (hex), usada pra diferenciar visualmente qual está selecionada. */
  color: string
}

export interface LocalBrandConfig extends BrandConfigBase {
  kind: 'local'
}

export interface RemoteBrandConfig extends BrandConfigBase {
  kind: 'remote'
  /** Origem pública da marca remota — as rotas `/api/admin/*` dela vivem aqui. */
  baseUrl: string
  /**
   * Nome da env var (neste processo, o do Bolsa Click) que guarda a chave de
   * serviço aceita pela marca remota. NUNCA o valor — só o nome da variável.
   */
  apiKeyEnvVar: string
}

export type BrandConfig = LocalBrandConfig | RemoteBrandConfig

export const DEFAULT_BRAND: BrandId = 'bolsaclick'

/** Cookie de servidor que guarda a marca selecionada no painel — ver `app/admin/_lib/actions.ts`. */
export const BRAND_COOKIE_NAME = 'bc_admin_brand'

export const BRANDS: Record<BrandId, BrandConfig> = {
  bolsaclick: {
    id: 'bolsaclick',
    label: 'Bolsa Click',
    kind: 'local',
    color: '#023e73',
  },
  bolsamais: {
    id: 'bolsamais',
    label: 'Bolsa Mais',
    kind: 'remote',
    baseUrl: 'https://www.bolsamais.com.br',
    apiKeyEnvVar: 'BOLSAMAIS_ADMIN_PANEL_API_KEY',
    color: '#00B050',
  },
}

export const BRAND_IDS: BrandId[] = ['bolsaclick', 'bolsamais']

export function isBrandId(value: unknown): value is BrandId {
  return typeof value === 'string' && (BRAND_IDS as string[]).includes(value)
}

export function getBrandConfig(brand: BrandId): BrandConfig {
  return BRANDS[brand]
}

export function listBrandConfigs(): BrandConfig[] {
  return BRAND_IDS.map((id) => BRANDS[id])
}
