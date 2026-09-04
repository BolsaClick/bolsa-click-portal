import 'server-only'

import { BRANDS, type BrandId, type RemoteBrandConfig } from './brands'

/**
 * Camada de chamada do painel multimarca — SÓ SERVIDOR (`import 'server-only'`
 * acima quebra o build se algum componente cliente importar este arquivo).
 *
 * A chave de serviço (`X-Admin-Api-Key`) é de servidor e não pode, em
 * hipótese alguma, chegar ao navegador. Por isso esta função só deve ser
 * chamada de dentro de route handlers ou server actions — nunca passada pra
 * um client component, nunca usada pra montar uma URL que o browser chame
 * diretamente.
 *
 * Duas marcas, dois jeitos de resolver a chamada:
 *   - Bolsa Click (`local`): roda neste mesmo processo. Repassamos o
 *     `Authorization: Bearer <token>` que a própria requisição do admin já
 *     trouxe (o mesmo token que a UI sempre usou) — chama o próprio handler
 *     via HTTP interno, sem inventar um segundo caminho de autenticação. Só
 *     cai pra `ADMIN_PANEL_API_KEY` local se não houver token pra repassar
 *     (ex.: uma chamada servidor-a-servidor futura, sem sessão de browser).
 *   - Bolsa Mais (`remote`): banco e deploy diferentes — HTTP de verdade pra
 *     `https://www.bolsamais.com.br`, com a chave de serviço dela.
 */

export type BrandCallFailureKind =
  | 'unavailable' // marca mal configurada (sem chave) — nunca falha silenciosa
  | 'network' // DNS/timeout/conexão recusada
  | 'unauthorized' // 401/403 — chave rejeitada ou ainda não propagou
  | 'not_found' // 404 — rota não existe naquela marca
  | 'http_error' // qualquer outro status de erro

export interface BrandCallSuccess<T> {
  ok: true
  status: number
  data: T
}

export interface BrandCallFailure {
  ok: false
  kind: BrandCallFailureKind
  message: string
  status?: number
}

export type BrandCallResult<T = unknown> = BrandCallSuccess<T> | BrandCallFailure

export interface BrandStatus {
  available: boolean
  /** Motivo legível de indisponibilidade — sempre presente quando `available` é false. */
  reason?: string
}

const TIMEOUT_MS = 10_000

/**
 * Diz se a marca está pronta pra receber chamadas AGORA (chave configurada
 * neste processo). Marca local está sempre disponível — quem depende dela é
 * este mesmo servidor, não uma variável externa.
 */
export function getBrandStatus(brand: BrandId): BrandStatus {
  const config = BRANDS[brand]
  if (config.kind === 'local') return { available: true }

  const remote = config as RemoteBrandConfig
  const key = process.env[remote.apiKeyEnvVar]
  if (!key) {
    return {
      available: false,
      reason: `Marca remota "${remote.label}" sem chave configurada (env var ${remote.apiKeyEnvVar} ausente neste servidor).`,
    }
  }
  return { available: true }
}

export function listBrandStatuses(): Record<BrandId, BrandStatus> {
  return {
    bolsaclick: getBrandStatus('bolsaclick'),
    bolsamais: getBrandStatus('bolsamais'),
  }
}

export interface CallBrandApiOptions {
  brand: BrandId
  /** Caminho completo da API, ex.: `/api/admin/dashboard/stats?page=2`. Precisa começar com `/api/admin`. */
  path: string
  method?: string
  /** Corpo já desserializado — é re-serializado como JSON aqui dentro. */
  body?: unknown
  /**
   * Origem (`request.nextUrl.origin`) usada só quando a marca é local, pra
   * montar a URL de auto-chamada (loopback pro próprio processo).
   */
  originForLocal: string
  /**
   * Header `Authorization` original da requisição do admin (ex.: `Bearer
   * <token Firebase>`) — repassado tal e qual na chamada local. Nunca usado
   * na chamada remota (a marca remota não conhece os usuários Firebase
   * deste site; ela só aceita a chave de serviço).
   */
  authHeaderForLocal?: string | null
}

/**
 * Origem da auto-chamada da marca LOCAL.
 *
 * Não pode ser a origem pública. Em produção `request.nextUrl.origin` é
 * `https://www.bolsaclick.com.br`, então o servidor sairia pro Cloudflare e
 * voltaria pro próprio container pra falar consigo mesmo — caro no melhor caso
 * e, medido em 04/09, quebrado no pior: o proxy devolvia 502 com corpo HTML do
 * edge enquanto a rota direta devolvia 200. Localmente nunca aparece, porque lá
 * a origem já é `http://localhost:PORT` — foi por isso que passou nos testes.
 *
 * Com `PORT` definido (Railway define), fala com 127.0.0.1 e não sai do
 * container. O middleware não atrapalha: todos os desvios dele são
 * condicionados a hostnames específicos, e 127.0.0.1 não casa com nenhum.
 */
function localOrigin(fallback: string): string {
  const port = process.env.PORT
  return port ? `http://127.0.0.1:${port}` : fallback
}

export async function callBrandApi<T = unknown>(
  options: CallBrandApiOptions
): Promise<BrandCallResult<T>> {
  const { brand, path, method = 'GET', body, originForLocal, authHeaderForLocal } = options

  if (!path.startsWith('/api/admin')) {
    return {
      ok: false,
      kind: 'http_error',
      status: 400,
      message: `Caminho inválido para chamada de marca: "${path}" precisa começar com /api/admin.`,
    }
  }

  const config = BRANDS[brand]
  const status = getBrandStatus(brand)
  if (!status.available) {
    return { ok: false, kind: 'unavailable', message: status.reason ?? `Marca "${brand}" indisponível.` }
  }

  let url: string
  const headers: Record<string, string> = {}

  if (config.kind === 'local') {
    url = `${localOrigin(originForLocal)}${path}`
    if (authHeaderForLocal) {
      headers.Authorization = authHeaderForLocal
    } else if (process.env.ADMIN_PANEL_API_KEY) {
      headers['X-Admin-Api-Key'] = process.env.ADMIN_PANEL_API_KEY
    } else {
      return {
        ok: false,
        kind: 'unavailable',
        message:
          'Marca local sem credencial pra auto-chamada: nem Authorization foi repassado, nem ADMIN_PANEL_API_KEY está configurada neste servidor.',
      }
    }
  } else {
    const remote = config as RemoteBrandConfig
    url = `${remote.baseUrl}${path}`
    // `status.available` já garantiu que a env var existe.
    headers['X-Admin-Api-Key'] = process.env[remote.apiKeyEnvVar] as string
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache: 'no-store',
    })

    const text = await res.text()
    let data: unknown = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = text
      }
    }

    if (res.status === 401 || res.status === 403) {
      return {
        ok: false,
        kind: 'unauthorized',
        status: res.status,
        message: `Marca "${brand}" rejeitou a chave de serviço (HTTP ${res.status}). Se a chave acabou de ser criada/rotacionada no Railway, o redeploy pode ainda não ter terminado — tente de novo em alguns instantes.`,
      }
    }

    if (res.status === 404) {
      return {
        ok: false,
        kind: 'not_found',
        status: 404,
        message: `A rota "${path}" não existe na marca "${brand}" (HTTP 404) — confira o nome da rota no repo daquela marca.`,
      }
    }

    if (!res.ok) {
      return {
        ok: false,
        kind: 'http_error',
        status: res.status,
        message: `Marca "${brand}" respondeu HTTP ${res.status} para ${path}.`,
      }
    }

    return { ok: true, status: res.status, data: data as T }
  } catch (err) {
    const isAbort = err instanceof Error && err.name === 'AbortError'
    return {
      ok: false,
      kind: 'network',
      message: isAbort
        ? `Timeout (${TIMEOUT_MS}ms) chamando a marca "${brand}" em ${url}.`
        : `Falha de rede chamando a marca "${brand}" em ${url}: ${err instanceof Error ? err.message : String(err)}`,
    }
  } finally {
    clearTimeout(timeout)
  }
}
