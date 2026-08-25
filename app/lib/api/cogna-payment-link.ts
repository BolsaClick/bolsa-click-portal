import { isAxiosError } from 'axios'
import { tartarus } from './axios'

/**
 * Link de pagamento da Cogna — o passo 7 do fluxo de integração ("descida de
 * inscrição"), que nunca tinha sido implementado.
 *
 * Contexto (respostas da Cogna em 2026-08-24):
 *  - `method: PIX` e `method: CARD` ainda retornam 400 "não suportado".
 *  - `method: BOLETO` devolve o PDF, não uma URL.
 *  - **Sem `method`** a API devolve `{ checkoutUrl, checkoutId }` com as três
 *    opções (PIX, cartão e boleto) na mesma página. É a única forma de o
 *    candidato ver o QR do PIX, então é sempre assim que chamamos.
 *
 * ⚠️ **O `checkoutUrl` expira em ~30 minutos** (a própria tela mostra um
 * contador de sessão; links de 1h atrás respondem `400 Link expirado ou
 * inválido`). Nunca persistir essa URL para uso posterior — guardar a
 * `businessKey` e REGERAR o link no momento do envio.
 *
 * O `businessKey` da INSCRIÇÃO (`CPF_..._OFFER_..._TIMESTAMP_...`) não é o mesmo
 * que o da OFERTA e **não volta na criação** — a Cogna gera depois. Por isso a
 * resolução tem retry: entre criar a inscrição e a chave existir há uma corrida.
 */

/** Inscrição como o parceiro devolve (só o que consumimos). */
export interface PartnerInscription {
  inscription?: {
    id?: number | string
    businessKey?: string | null
  }
  enrollment?: {
    payment?: { paid?: boolean; exempt?: boolean }
  }
  personalData?: {
    name?: string
    cpf?: string
    email?: string
    phone?: string
  }
}

export interface PaymentLinkOk {
  status: 'ok'
  /** URL do checkout da Cogna com PIX, cartão e boleto. */
  checkoutUrl: string
  checkoutId?: string
  businessKey: string
  personalData?: PartnerInscription['personalData']
}

export type PaymentLinkResult =
  | PaymentLinkOk
  /** A matrícula já está paga — não há o que cobrar. */
  | { status: 'already_paid'; businessKey?: string }
  /** A chave ainda não existe do lado da Cogna. Vale tentar de novo depois. */
  | { status: 'pending' }
  | { status: 'error'; message: string; retryable: boolean }

/** Detalhe da inscrição no parceiro. É daqui que sai o `businessKey`. */
export async function getPartnerInscription(
  inscriptionId: string | number
): Promise<PartnerInscription | null> {
  try {
    const { data } = await tartarus.get<PartnerInscription>(
      `cogna/courses/inscriptions/${encodeURIComponent(String(inscriptionId))}`,
      { timeout: 20_000 }
    )
    return data ?? null
  } catch {
    return null
  }
}

/** Mensagem de erro real vinda da Cogna (o Tartarus repassa em `cognaError`). */
function cognaMessage(error: unknown): string | undefined {
  if (!isAxiosError(error)) return undefined
  const data = error.response?.data as
    | { cognaError?: { message?: string }; message?: string }
    | undefined
  return data?.cognaError?.message ?? data?.message
}

/**
 * Vale repetir?
 *
 * O endpoint da Cogna é lento e instável: medimos respostas entre 0,8s e 31s, e
 * um `500 Internal server error` intermitente na mesma chave que funciona na
 * tentativa seguinte. Timeout, falha de rede e 5xx são repetíveis; um 400 com
 * regra de negócio ("já foi paga", "método não suportado") nunca melhora.
 */
function isRetryable(error: unknown): boolean {
  if (!isAxiosError(error)) return false
  const status = error.response?.status
  if (status === undefined) return true // timeout ou rede
  return status >= 500
}

/**
 * Gera o link de pagamento. Chamado SEM `method` de propósito — ver o bloco de
 * contexto no topo do arquivo.
 */
export async function createPaymentLink(
  businessKey: string
): Promise<PaymentLinkResult> {
  try {
    const { data } = await tartarus.post<{ checkoutUrl?: string; checkoutId?: string }>(
      'cogna/courses/payment-link',
      { businessKey },
      { timeout: 45_000 }
    )
    if (!data?.checkoutUrl) {
      return { status: 'error', message: 'Resposta sem checkoutUrl', retryable: true }
    }
    return {
      status: 'ok',
      checkoutUrl: data.checkoutUrl,
      checkoutId: data.checkoutId,
      businessKey,
    }
  } catch (error) {
    const message = cognaMessage(error) ?? 'Falha ao gerar link de pagamento'
    // A Cogna responde 400 com esta mensagem quando não há o que cobrar.
    if (/já foi paga/i.test(message)) {
      return { status: 'already_paid', businessKey }
    }
    return { status: 'error', message, retryable: isRetryable(error) }
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Resolve o link de pagamento a partir do id da inscrição no parceiro.
 *
 * Faz retry porque o `businessKey` é gerado DEPOIS da criação: numa fração dos
 * casos ele ainda não existe quando o candidato chega na tela de sucesso.
 * Devolve `pending` em vez de erro nesse caso — quem chama decide se tenta de
 * novo ou promete o link por outro canal.
 */
export async function resolvePaymentLink(
  inscriptionId: string | number,
  { attempts = 3, baseDelayMs = 900 }: { attempts?: number; baseDelayMs?: number } = {}
): Promise<PaymentLinkResult> {
  let last: PaymentLinkResult = { status: 'pending' }

  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) await sleep(baseDelayMs * 2 ** (attempt - 1))

    const inscription = await getPartnerInscription(inscriptionId)
    const businessKey = inscription?.inscription?.businessKey

    // Ainda sem chave: é a corrida da geração, não um erro.
    if (!businessKey) {
      last = { status: 'pending' }
      continue
    }

    if (inscription?.enrollment?.payment?.paid) {
      return { status: 'already_paid', businessKey }
    }

    const result = await createPaymentLink(businessKey)
    if (result.status === 'ok') {
      return { ...result, personalData: inscription?.personalData }
    }
    last = result
    // Regra de negócio da Cogna: repetir não muda a resposta.
    if (result.status === 'error' && !result.retryable) return last
  }

  return last
}

/**
 * Cache de resolução em memória, por inscrição.
 *
 * Existe por causa da latência medida no endpoint da Cogna: de 0,9s a **37s**.
 * Sem isto, cada tentativa do cliente dispara uma nova descida de 37s, e o
 * candidato fica olhando "gerando pagamento" enquanto a gente refaz o mesmo
 * trabalho em paralelo.
 *
 * Guarda a PROMESSA, não o resultado: chamadas concorrentes para a mesma
 * inscrição compartilham a mesma descida em vez de multiplicá-la.
 *
 * É por instância (o Railway pode ter mais de uma) — o cache é otimização, não
 * fonte de verdade. Um miss só significa refazer o trabalho, nunca resultado
 * errado.
 */
const CACHE_TTL_MS = 10 * 60_000
const cache = new Map<string, { promise: Promise<PaymentLinkResult>; expiresAt: number }>()

function pruneCache(now: number) {
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key)
  }
}

/** Igual a `resolvePaymentLink`, mas reaproveitando descidas em andamento. */
export function resolvePaymentLinkCached(
  inscriptionId: string | number
): Promise<PaymentLinkResult> {
  const key = String(inscriptionId)
  const now = Date.now()
  pruneCache(now)

  const cached = cache.get(key)
  if (cached) return cached.promise

  const promise = resolvePaymentLink(inscriptionId).then((result) => {
    // Só vale guardar desfecho definitivo. `pending` é a corrida da geração da
    // chave e `error` pode ser o 500 intermitente — nos dois casos a próxima
    // tentativa precisa refazer, senão o cache congela a falha.
    if (result.status !== 'ok' && result.status !== 'already_paid') {
      cache.delete(key)
    }
    return result
  }).catch((error) => {
    cache.delete(key)
    throw error
  })

  cache.set(key, { promise, expiresAt: now + CACHE_TTL_MS })
  return promise
}

/**
 * Começa a gerar o link assim que a inscrição é criada, sem bloquear ninguém.
 *
 * O ganho é de tempo de parede: a descida de até 37s roda enquanto o candidato
 * ainda está sendo redirecionado, em vez de começar só quando ele chega na tela
 * de sucesso e encara o "gerando".
 */
export function prewarmPaymentLink(inscriptionId: string | number): void {
  void resolvePaymentLinkCached(inscriptionId).catch(() => {
    // best-effort: o erro reaparece (e é tratado) na chamada de verdade
  })
}
