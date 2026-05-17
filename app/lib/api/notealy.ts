// Integração com o CRM Notealy (https://docs.notealy.com).
// Módulo server-only: usa NOTEALY_API_TOKEN, que é segredo de servidor.

const NOTEALY_API_URL = process.env.NOTEALY_API_URL || 'https://thanos.notealy.com/v1'
const NOTEALY_API_TOKEN = process.env.NOTEALY_API_TOKEN

interface UpsertContactInput {
  name: string
  email?: string
  phone?: string
  cpf?: string
  tagId?: string
}

interface SendEmailInput {
  contactId: string
  templateId: string
  vars?: Record<string, unknown>
}

// Notealy aceita 10–15 dígitos com "+" opcional. Telefones BR chegam com 10–11
// dígitos (sem DDI), então prefixamos 55.
function normalizePhone(phone?: string): string | undefined {
  if (!phone) return undefined
  const digits = phone.replace(/\D/g, '')
  if (!digits) return undefined
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`
  return `+${digits}`
}

async function notealyRequest<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${NOTEALY_API_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTEALY_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      `Notealy ${path} respondeu ${response.status}: ${JSON.stringify(data)}`
    )
  }

  return data as T
}

/**
 * Cria ou atualiza (upsert) um contato no Notealy. O upsert casa por
 * telefone → email → externalId, então enviamos email + externalId (CPF) como
 * chaves estáveis entre os dois estágios do fluxo de cadastro.
 * Retorna o contactId, ou null se a config estiver ausente.
 */
export async function upsertNotealyContact(
  input: UpsertContactInput
): Promise<string | null> {
  if (!NOTEALY_API_TOKEN) {
    console.warn('⚠️ NOTEALY_API_TOKEN não configurado — upsert ignorado')
    return null
  }

  const payload: Record<string, unknown> = {
    name: input.name,
    channel: 'WEB',
  }

  if (input.email) payload.email = input.email
  const phone = normalizePhone(input.phone)
  if (phone) payload.phone = phone
  if (input.cpf) payload.externalId = input.cpf
  if (input.tagId) payload.tagIds = [input.tagId]

  const data = await notealyRequest<Record<string, unknown>>('/people', payload)

  // A doc não fixa o shape da resposta — lemos o id de forma defensiva.
  const person = (data?.person ?? data?.data ?? data) as Record<string, unknown> | null
  const id = person?.id
  return typeof id === 'string' ? id : null
}

/**
 * Envia um email transacional com template para um contato existente no Notealy.
 */
export async function sendNotealyEmail(input: SendEmailInput): Promise<void> {
  if (!NOTEALY_API_TOKEN) {
    console.warn('⚠️ NOTEALY_API_TOKEN não configurado — envio de email ignorado')
    return
  }

  await notealyRequest('/email/send', {
    contactId: input.contactId,
    templateId: input.templateId,
    vars: input.vars ?? {},
  })
}

interface SendExternalEmailInput {
  email: string
  templateId: string
  vars?: Record<string, unknown>
}

/**
 * Envia um email transacional com template para um endereço arbitrário.
 * Diferente de sendNotealyEmail: NÃO requer contato no CRM (não cria poluição).
 * Usado para magic links de fluxos públicos (verificação de review, etc).
 * Scope necessário no token: email:send:to
 */
export async function sendNotealyEmailExternal(input: SendExternalEmailInput): Promise<void> {
  if (!NOTEALY_API_TOKEN) {
    console.warn('⚠️ NOTEALY_API_TOKEN não configurado — envio de email externo ignorado')
    return
  }

  await notealyRequest('/email/send/external', {
    email: input.email,
    templateId: input.templateId,
    vars: input.vars ?? {},
  })
}
