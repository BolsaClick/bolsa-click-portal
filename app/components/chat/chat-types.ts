/**
 * Tipos e utilitários compartilhados do widget de chat de suporte (Bob).
 *
 * Persistência: sessionStorage (chave CHAT_STORAGE_KEY) — sobrevive à
 * navegação entre páginas, morre ao fechar a aba (adequado pra LGPD:
 * dados do lead não ficam em localStorage indefinidamente).
 */

export interface ChatLead {
  name: string
  phone: string
  /** Email é opcional — a captura conversacional pede só nome + WhatsApp. */
  email?: string
}

export interface ChatCta {
  label: string
  href: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  /** CTA opcional renderizado abaixo da bolha (ex.: fallback "buscar bolsa"). */
  cta?: ChatCta
  /** Cartões de oferta do Hermes — URLs de imagem renderizadas abaixo do texto. */
  images?: string[]
}

/**
 * Etapas da captura conversacional de lead (sem formulário):
 * - idle: visitante ainda não mandou dúvida livre (chips respondem local).
 * - awaiting_name / awaiting_phone: Bob pedindo os dados dentro do chat.
 * - done: lead completo — mensagens vão pro /api/chat.
 */
export type LeadStep = 'idle' | 'awaiting_name' | 'awaiting_phone' | 'done'

export interface StoredChatState {
  sessionId: string
  lead: ChatLead | null
  messages: ChatMessage[]
  leadStep: LeadStep
  /** Primeira dúvida livre, guardada até o lead completar pra ir pro Hermes. */
  pendingQuestion: string | null
  /** Nome já informado enquanto o telefone ainda não veio. */
  draftName: string | null
}

export const CHAT_STORAGE_KEY = 'bolsaclick_chat'
export const CHAT_TEASER_DISMISS_KEY = 'bolsaclick_chat_teaser_dismissed'

// ---------------------------------------------------------------------------
// Hermes webchat — API chamada DIRETO do browser (CORS liberado pro domínio;
// rate limit é por IP do visitante, então proxy server-side afunilaria tudo
// num IP só).
//
//   POST {base}/session → { session_token }           (token vale 7 dias)
//   POST {base}/message { session_token, message } → { reply, images: [...] }
// ---------------------------------------------------------------------------

export const HERMES_WEBCHAT_URL =
  process.env.NEXT_PUBLIC_HERMES_WEBCHAT_URL ?? 'https://hermes.bolsamais.com.br/webchat'

/** Token em localStorage (sem PII) pra conversa sobreviver a reload — 7 dias. */
const HERMES_TOKEN_KEY = 'bolsaclick_hermes_session'
const HERMES_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

export function loadHermesToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(HERMES_TOKEN_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { token?: string; createdAt?: number }
    if (typeof parsed?.token !== 'string' || !parsed.token) return null
    if (typeof parsed.createdAt !== 'number' || Date.now() - parsed.createdAt > HERMES_TOKEN_TTL_MS) {
      window.localStorage.removeItem(HERMES_TOKEN_KEY)
      return null
    }
    return parsed.token
  } catch {
    return null
  }
}

export function saveHermesToken(token: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(HERMES_TOKEN_KEY, JSON.stringify({ token, createdAt: Date.now() }))
  } catch {
    // storage indisponível — sessão vira per-pageview, sem quebrar
  }
}

export function clearHermesToken(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(HERMES_TOKEN_KEY)
  } catch {
    // no-op
  }
}

/** Saudação do Bob — convite direto pra dúvida, sem pedir dados antes. */
export const BOB_GREETING =
  'Oi! Eu sou o Bob 🤗 Me manda sua dúvida que eu te ajudo a achar sua bolsa — ou toca numa pergunta rápida aqui embaixo:'

/**
 * FAQ local do Bob: os chips respondem na hora, sem API e sem pedir dados.
 * Copy segue as regras editoriais (resposta direta, claims verificáveis,
 * nunca citar agregadores concorrentes).
 */
export interface ChatFaqEntry {
  question: string
  answer: string
  cta?: ChatCta
}

export const CHAT_FAQ: ChatFaqEntry[] = [
  {
    question: 'Como funciona a bolsa?',
    answer:
      'Você busca o curso, escolhe a oferta com desconto — as bolsas chegam a 80% — e se inscreve 100% online, sem fila e sem sorteio. O desconto vale até o fim do curso. 😉',
    cta: { label: 'Buscar minha bolsa', href: '/descubra-sua-bolsa' },
  },
  {
    question: 'Quais faculdades são parceiras?',
    answer:
      'Trabalhamos com as maiores redes de ensino do Brasil — Anhanguera, Estácio, Unopar, Pitágoras e Unime, entre outras — todas reconhecidas pelo MEC, com polos em mais de 280 cidades.',
    cta: { label: 'Ver faculdades parceiras', href: '/faculdades' },
  },
  {
    question: 'Preciso de ENEM?',
    answer:
      'Não precisa! 🎉 A maioria das nossas bolsas dispensa nota do ENEM e vestibular tradicional — o processo seletivo é online e simplificado. E se você tiver nota do ENEM, também pode aproveitar.',
    cta: { label: 'Buscar minha bolsa', href: '/descubra-sua-bolsa' },
  },
  {
    question: 'Como faço minha matrícula?',
    answer:
      'É 100% online: você escolhe o curso e a bolsa, preenche seus dados, conclui o processo seletivo simplificado e garante a matrícula com o desconto aplicado direto na mensalidade.',
    cta: { label: 'Começar agora', href: '/descubra-sua-bolsa' },
  },
]

export function newChatId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function loadChatState(): StoredChatState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(CHAT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredChatState>
    if (!parsed || typeof parsed.sessionId !== 'string') return null
    return {
      sessionId: parsed.sessionId,
      lead: parsed.lead ?? null,
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      leadStep: parsed.leadStep ?? (parsed.lead ? 'done' : 'idle'),
      pendingQuestion: parsed.pendingQuestion ?? null,
      draftName: parsed.draftName ?? null,
    }
  } catch {
    return null
  }
}

export function saveChatState(state: StoredChatState): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage cheio/indisponível (Safari private mode) — segue sem persistir
  }
}

type PostHogLike = {
  capture?: (event: string, properties?: Record<string, unknown>) => void
}

/**
 * Captura evento no PostHog se ele existir no window (snippet ou init do
 * PostHogProvider). Nunca lança — analytics jamais quebra o widget.
 */
export function captureChatEvent(
  event:
    | 'chat_widget_opened'
    | 'chat_faq_clicked'
    | 'chat_question_asked'
    | 'chat_lead_submitted'
    | 'chat_message_sent',
  properties?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return
  try {
    const ph = (window as Window & { posthog?: PostHogLike }).posthog
    ph?.capture?.(event, properties)
  } catch {
    // no-op
  }
}
