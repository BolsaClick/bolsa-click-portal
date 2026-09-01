// Módulo server-only: usa `node:dns/promises`, que não existe no browser.
// Importar isto de um Client Component quebra o build — só chame a partir de
// Route Handlers (`app/api/**/route.ts`) ou de outro código server-only.
import { resolveMx } from 'node:dns/promises'

const TIMEOUT_MS = 2_000
const CACHE_TTL_MS = 60 * 60 * 1_000 // 1h — sobra tempo pra maioria (gmail/hotmail) nunca bater DNS de novo.

type CacheEntry = { value: boolean; expiresAt: number }
const cache = new Map<string, CacheEntry>()

/**
 * Códigos de erro do Node que PROVAM, sem ambiguidade, que o domínio não tem
 * MX: o domínio não existe (`ENOTFOUND`/`ENOENT`) ou existe mas não anuncia
 * nenhum registro de e-mail (`ENODATA`). Qualquer outro código — timeout,
 * servidor de DNS fora do ar, rede instável, `ESERVFAIL`, `EREFUSED` — é
 * inconclusivo: não prova nada sobre o domínio, só que a consulta falhou.
 */
const ERROS_CONCLUSIVOS = new Set(['ENOTFOUND', 'ENODATA', 'ENOENT'])

/** Erro sintético usado só para o timeout local — nunca é um código de DNS real. */
const TIMEOUT_CODE = 'BC_MX_LOOKUP_TIMEOUT'

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(Object.assign(new Error('Consulta MX excedeu o timeout'), { code: TIMEOUT_CODE }))
    }, ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

/**
 * Verifica se um domínio de e-mail tem registro MX.
 *
 * FALHA ABERTO SEMPRE que o resultado não é conclusivo: timeout (2s), erro
 * de rede, servidor de DNS fora do ar, ou qualquer coisa que não seja uma
 * prova de que o domínio não recebe e-mail. Este é o caminho de conversão de
 * um checkout que cobra dinheiro — instabilidade de DNS jamais pode derrubar
 * um cadastro legítimo. Só devolve `false` quando a resposta PROVA que o
 * domínio não tem MX (domínio inexistente ou sem registro de e-mail).
 *
 * Cache em memória por domínio (1h): a esmagadora maioria dos cadastros usa
 * gmail/hotmail/outlook — sem cache, cada envio de formulário repetiria a
 * mesma consulta DNS pro mesmo punhado de domínios.
 *
 * Resultados INCONCLUSIVOS nunca são cacheados — cachear um "sem resposta"
 * faria a próxima pessoa com o MESMO provedor de e-mail (ex.: duas pessoas
 * no Gmail) herdar um fail-open que talvez nem precisasse, em vez de cada
 * consulta ter sua própria chance de resolver de verdade.
 */
export async function domainHasMx(domainRaw: string): Promise<boolean> {
  const domain = domainRaw.trim().toLowerCase()
  if (!domain) return true // sem domínio pra checar — validação de formato já cuida disso

  const cached = cache.get(domain)
  if (cached && cached.expiresAt > Date.now()) return cached.value

  try {
    const records = await withTimeout(resolveMx(domain), TIMEOUT_MS)
    const temMx = Array.isArray(records) && records.length > 0
    cache.set(domain, { value: temMx, expiresAt: Date.now() + CACHE_TTL_MS })
    return temMx
  } catch (error) {
    const code = (error as { code?: string } | undefined)?.code

    if (code && ERROS_CONCLUSIVOS.has(code)) {
      cache.set(domain, { value: false, expiresAt: Date.now() + CACHE_TTL_MS })
      return false
    }

    // Timeout, ESERVFAIL, ECONNREFUSED, rede instável etc. — inconclusivo.
    // Fail-open: aceita o e-mail e segue.
    console.warn(`⚠️ Consulta MX inconclusiva para "${domain}" (${code ?? 'erro desconhecido'}) — aceitando por fail-open`)
    return true
  }
}

/**
 * Extrai o domínio de um e-mail já validado em formato (tem exatamente um
 * `@`, com algo antes e depois). Devolve `null` quando o formato não permite
 * nem tentar — nesse caso a checagem de MX não se aplica, é problema de
 * formato mesmo (já coberto pelo zod/regex no client).
 */
export function extractEmailDomain(email: string): string | null {
  const trimmed = email.trim()
  const at = trimmed.lastIndexOf('@')
  if (at <= 0 || at === trimmed.length - 1) return null
  const domain = trimmed.slice(at + 1)
  return domain.includes('.') ? domain : null
}

/** Mensagem exibida ao usuário quando o domínio comprovadamente não recebe e-mail. */
export const MX_REJECTION_MESSAGE = 'Não conseguimos validar esse e-mail. Confira se está correto.'

/**
 * Valida a capacidade de um e-mail receber mensagens (registro MX do
 * domínio). Devolve `null` quando está tudo certo (ou o resultado foi
 * inconclusivo — fail-open) e uma mensagem pronta para o usuário quando o
 * domínio comprovadamente não tem MX.
 */
export async function getEmailMxRejectionMessage(email: string): Promise<string | null> {
  const domain = extractEmailDomain(email)
  if (!domain) return null // formato inválido não é problema desta checagem

  const ok = await domainHasMx(domain)
  return ok ? null : MX_REJECTION_MESSAGE
}
