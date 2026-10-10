import { isAxiosError } from 'axios'

/**
 * Desfecho de inscrição em parceiro, gravado no NOSSO banco
 * (`PartnerInscriptionOutcome`, uma linha por chamada).
 *
 * Até out/2026 o resultado de uma inscrição só existia no PostHog, no Attio e
 * no log da função. Consequência: uma recusa MS002 da Estácio numa inscrição
 * gratuita (pagamentos desligados → sem Transaction) não deixava rastro que o
 * checkout-watchdog conseguisse ler — e a primeira inscrição real depois do
 * formulário único é, na prática, o teste de ponta a ponta dele.
 *
 * REGRA DE OURO: gravar o desfecho NUNCA pode derrubar a inscrição.
 * `recordInscriptionOutcome` não lança, tem teto de tempo e só loga quando o
 * banco falha. A inscrição no parceiro é o que importa; isto é telemetria.
 *
 * Server-only (importa o Prisma sob demanda). As funções de classificação são
 * puras para serem testadas sem banco.
 */

export type InscriptionPartner = 'cogna' | 'estacio'
export type InscriptionChannel = 'tartarus-inscription' | 'tartarus-marketplace' | 'athena'
export type InscriptionFlow =
  | 'checkout-direto'
  | 'confirm-matricula'
  | 'confirm-campanha'
  | 'confirm-estacio'
export type InscriptionResult = 'SUCCESS' | 'REFUSED' | 'ERROR'

/** De onde veio a chamada — o que o ponto de chamada sabe e o parceiro não devolve. */
export interface InscriptionContext {
  flow: InscriptionFlow
  cpf?: string | null
  offerId?: string | null
  courseName?: string | null
  transactionId?: string | null
}

/** O que a resposta do parceiro diz. */
export interface InscriptionVerdict {
  outcome: InscriptionResult
  errorCode?: string | null
  errorMessage?: string | null
  httpStatus?: number | null
  partnerInscriptionId?: string | null
  alreadyEnrolled?: boolean
}

export interface InscriptionOutcomeRecord extends InscriptionVerdict, InscriptionContext {
  partner: InscriptionPartner
  channel: InscriptionChannel
  durationMs?: number | null
}

/** Mensagem do parceiro pode trazer o payload inteiro; a coluna não precisa. */
const MAX_MESSAGE = 1000

/**
 * Teto para a gravação. Com o banco lento, o candidato não pode ficar
 * esperando a telemetria para ver a tela de sucesso.
 */
export const RECORD_TIMEOUT_MS = 2500

type Writer = (data: Record<string, unknown>) => Promise<unknown>

const prismaWriter: Writer = async (data) => {
  const { prisma } = await import('@/app/lib/prisma')
  return prisma.partnerInscriptionOutcome.create({
    data: data as Parameters<typeof prisma.partnerInscriptionOutcome.create>[0]['data'],
  })
}

/** Normaliza o registro para a linha da tabela (CPF só dígitos, texto truncado). */
export function toOutcomeRow(r: InscriptionOutcomeRecord): Record<string, unknown> {
  const cpf = r.cpf ? r.cpf.replace(/\D/g, '') : ''
  return {
    partner: r.partner,
    channel: r.channel,
    flow: r.flow,
    outcome: r.outcome,
    errorCode: r.errorCode ? r.errorCode.toUpperCase() : null,
    errorMessage: r.errorMessage ? r.errorMessage.slice(0, MAX_MESSAGE) : null,
    httpStatus: typeof r.httpStatus === 'number' ? r.httpStatus : null,
    partnerInscriptionId: r.partnerInscriptionId ? String(r.partnerInscriptionId) : null,
    alreadyEnrolled: Boolean(r.alreadyEnrolled),
    cpf: cpf || null,
    offerId: r.offerId ? String(r.offerId) : null,
    courseName: r.courseName || null,
    transactionId: r.transactionId || null,
    durationMs: typeof r.durationMs === 'number' ? Math.round(r.durationMs) : null,
  }
}

/**
 * Grava o desfecho. Nunca lança; devolve `true` se gravou.
 *
 * Falha de banco vira `console.error` e segue — inclusive tabela inexistente
 * (deploy antes da migration): a inscrição continua funcionando, só fica sem
 * rastro até a migration subir.
 */
export async function recordInscriptionOutcome(
  record: InscriptionOutcomeRecord,
  opts: { write?: Writer; timeoutMs?: number } = {},
): Promise<boolean> {
  const write = opts.write ?? prismaWriter
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    const row = toOutcomeRow(record)
    await Promise.race([
      write(row),
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error('timeout gravando desfecho da inscrição')),
          opts.timeoutMs ?? RECORD_TIMEOUT_MS,
        )
      }),
    ])
    return true
  } catch (e) {
    console.error('⚠️ inscription-outcome: falha ao gravar desfecho (inscrição segue)', {
      partner: record.partner,
      flow: record.flow,
      outcome: record.outcome,
      errorCode: record.errorCode ?? null,
      erro: e instanceof Error ? e.message : String(e),
    })
    return false
  } finally {
    if (timer) clearTimeout(timer)
  }
}

// ─── Classificação: Cogna (Tartarus) ─────────────────────────────────────────

/**
 * "CPF já inscrito nesta oferta" NÃO é falha: é a resposta esperada quando uma
 * segunda confirmação (webhook em retry, claim órfão reassumido) refaz a
 * inscrição que já existe. Tratar como recusa em confirm-matricula estornaria
 * a taxa de alguém que ESTÁ inscrito; aqui, contaria como recusa no watchdog.
 *
 * A Cogna não expõe código de erro estável para isso — o que chega é a
 * mensagem. Por isso o casamento é por texto, conservador: qualquer coisa que
 * não bata cai no caminho de recusa (que estorna), nunca o contrário.
 *
 * (Movida de confirm-matricula.ts sem alteração, para ser a mesma regra lá e
 * na classificação do desfecho.)
 */
export function isJaInscritoNaCogna(mensagem: string | null | undefined): boolean {
  if (!mensagem) return false
  const normalizada = mensagem
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
  return (
    normalizada.includes('ja possui inscricao') ||
    normalizada.includes('ja esta inscrito') ||
    normalizada.includes('ja inscrito') ||
    normalizada.includes('inscricao ja existe') ||
    normalizada.includes('inscricao existente')
  )
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

/** Resposta 2xx do create-inscription da Cogna. */
export function cognaVerdictFromResponse(r: { id?: unknown; success?: boolean } | null | undefined): InscriptionVerdict {
  if (r && (r.success || r.id)) {
    return { outcome: 'SUCCESS', partnerInscriptionId: r.id != null ? String(r.id) : null }
  }
  return { outcome: 'REFUSED', errorMessage: 'Resposta da Cogna não indicou sucesso na inscrição.' }
}

/**
 * Exceção do create-inscription da Cogna.
 *
 * O parceiro respondeu (4xx) → REFUSED. Sem resposta, timeout ou 5xx → ERROR:
 * é infraestrutura (Tartarus/Cogna fora), não o parceiro dizendo "não".
 */
export function cognaVerdictFromError(error: unknown): InscriptionVerdict {
  if (isAxiosError(error)) {
    const status = error.response?.status ?? null
    const data = (error.response?.data ?? {}) as {
      cognaError?: { message?: unknown; code?: unknown; errorCode?: unknown }
      message?: unknown
      code?: unknown
      errorCode?: unknown
    }
    const message = str(data.cognaError?.message) ?? str(data.message) ?? error.message
    if (isJaInscritoNaCogna(message)) {
      return { outcome: 'SUCCESS', alreadyEnrolled: true, httpStatus: status, errorMessage: message }
    }
    const errorCode =
      str(data.cognaError?.code) ?? str(data.cognaError?.errorCode) ?? str(data.errorCode) ?? str(data.code)
    return {
      outcome: status !== null && status < 500 ? 'REFUSED' : 'ERROR',
      httpStatus: status,
      errorCode,
      errorMessage: message,
    }
  }
  return { outcome: 'ERROR', errorMessage: error instanceof Error ? error.message : String(error) }
}

/** Retorno de `createMarketplaceInscription` (já captura as próprias exceções). */
export function marketplaceVerdict(r: { success: boolean; data?: unknown; error?: string } | null | undefined): InscriptionVerdict {
  if (r?.success) {
    const data = (r.data ?? {}) as Record<string, unknown>
    const id = data.id ?? data.numeroInscricao ?? data.inscricaoId
    return { outcome: 'SUCCESS', partnerInscriptionId: id != null ? String(id) : null }
  }
  return { outcome: 'REFUSED', errorMessage: r?.error ?? 'Marketplace ATHENAS não confirmou a inscrição.' }
}
