'use client'

/**
 * Painel do chat de suporte (Bob) — carregado sob demanda pelo ChatWidget.
 *
 * Fluxo chat-first (sem formulário na frente):
 * 1. Abre já conversando: saudação do Bob + chips de FAQ + input liberado.
 * 2. Chips respondem NA HORA com respostas locais (sem API, sem pedir dados).
 * 3. Quando o visitante manda uma dúvida livre, o Bob guarda a pergunta e
 *    captura o lead DENTRO da conversa, um passo por vez (nome → WhatsApp).
 * 4. Lead completo → a dúvida pendente vai DIRETO pro Hermes webchat
 *    (sessão via token; ver chat-types.ts) e a conversa segue normal.
 *    Qualquer falha → fallback honesto do Bob, nunca quebra.
 *
 * Histórico + lead + etapa da captura persistem em sessionStorage;
 * o session_token do Hermes persiste em localStorage (7 dias, sem PII).
 */

import Link from 'next/link'
import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import Mascot from '../v2/mascot/Mascot'
import {
  BOB_GREETING,
  captureChatEvent,
  CHAT_FAQ,
  type ChatLead,
  type ChatMessage,
  clearHermesToken,
  HERMES_WEBCHAT_URL,
  type LeadStep,
  loadChatState,
  loadHermesToken,
  newChatId,
  saveChatState,
  saveHermesToken,
} from './chat-types'

const LOCAL_FALLBACK_REPLY =
  'Opa, tive um probleminha aqui pra consultar as bolsas agora 😅 Nossa equipe já foi avisada e te responde pelo WhatsApp que você deixou. Enquanto isso, que tal buscar sua bolsa?'
const LOCAL_FALLBACK_CTA = { label: 'Buscar minha bolsa', href: '/descubra-sua-bolsa' }

const RATE_LIMIT_REPLY =
  'Calma lá 😅 Chegaram muitas mensagens de uma vez! Me dá uns segundinhos e a gente continua, combinado?'

/** Delay curtinho pra resposta local do Bob parecer digitada, não instantânea. */
const LOCAL_REPLY_DELAY_MS = 700

// A resposta do agente leva 10–30s: timeout generoso + "digitando…" o tempo todo.
const HERMES_MESSAGE_TIMEOUT_MS = 60_000
const HERMES_SESSION_TIMEOUT_MS = 10_000

function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  return fetch(url, { ...init, signal: controller.signal }).finally(() =>
    window.clearTimeout(timer),
  )
}

/** Garante um session_token do Hermes (cache em localStorage, 7 dias). */
async function ensureHermesSession(): Promise<string | null> {
  const cached = loadHermesToken()
  if (cached) return cached
  try {
    const res = await fetchWithTimeout(
      `${HERMES_WEBCHAT_URL}/session`,
      { method: 'POST' },
      HERMES_SESSION_TIMEOUT_MS,
    )
    if (!res.ok) return null
    const data = (await res.json().catch(() => null)) as { session_token?: unknown } | null
    if (data && typeof data.session_token === 'string' && data.session_token) {
      saveHermesToken(data.session_token)
      return data.session_token
    }
    return null
  } catch {
    return null
  }
}

function sendHermesMessage(token: string, message: string): Promise<Response> {
  return fetchWithTimeout(
    `${HERMES_WEBCHAT_URL}/message`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_token: token, message }),
    },
    HERMES_MESSAGE_TIMEOUT_MS,
  )
}

/** Só URLs https do próprio Hermes viram cartão de oferta no chat. */
function sanitizeOfferImages(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const urls = value.filter(
    (u): u is string => typeof u === 'string' && u.startsWith('https://'),
  )
  return urls.length > 0 ? urls.slice(0, 6) : undefined
}

/** Máscara BR progressiva: (11) 99999-9999 / (11) 9999-9999. */
function formatPhoneBR(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function firstNameOf(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? ''
}

function BobAvatar({ size = 28 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-end justify-center overflow-hidden rounded-full bg-bolsa-primary/10"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Mascot pose="chat" size={size - 2} className="pt-0.5" />
    </span>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <BobAvatar />
      <div className="rounded-2xl rounded-bl-md border border-ink-100 bg-white px-3.5 py-2.5 shadow-sm">
        <span className="sr-only">Bob está digitando…</span>
        <span className="flex items-center gap-1" aria-hidden="true">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-300 [animation-delay:0ms] motion-reduce:animate-none" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-300 [animation-delay:150ms] motion-reduce:animate-none" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-300 [animation-delay:300ms] motion-reduce:animate-none" />
        </span>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-bolsa-primary px-3.5 py-2.5 text-sm leading-relaxed text-white shadow-sm">
          {message.content}
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-end gap-2">
      <BobAvatar />
      <div className="max-w-[85%]">
        <div className="whitespace-pre-wrap break-words rounded-2xl rounded-bl-md border border-ink-100 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-ink-900 shadow-sm">
          {message.content}
        </div>
        {message.images && message.images.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.images.map((src) => (
              <a
                key={src}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm transition-opacity hover:opacity-95 motion-reduce:transition-none"
              >
                {/* Cartão de oferta gerado pelo Hermes (host externo, proporção
                    variável) — <img> nativo de propósito, sem otimizador. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt="Cartão de oferta de bolsa"
                  loading="lazy"
                  className="block h-auto w-full"
                />
              </a>
            ))}
          </div>
        )}
        {message.cta && (
          <Link
            href={message.cta.href}
            className="mt-2 inline-flex items-center rounded-full bg-bolsa-secondary px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 motion-reduce:transition-none"
          >
            {message.cta.label}
          </Link>
        )}
      </div>
    </div>
  )
}

interface ChatPanelProps {
  onClose: () => void
}

export default function ChatPanel({ onClose }: ChatPanelProps) {
  // ---- estado persistido -------------------------------------------------
  const initial = useMemo(() => {
    const stored = loadChatState()
    const base = stored ?? {
      sessionId: newChatId(),
      lead: null,
      messages: [] as ChatMessage[],
      leadStep: 'idle' as LeadStep,
      pendingQuestion: null,
      draftName: null,
    }
    // Saudação vira a primeira bolha da conversa (uma vez só).
    if (base.messages.length === 0) {
      base.messages = [{ id: newChatId(), role: 'assistant', content: BOB_GREETING }]
    }
    return base
  }, [])

  const [sessionId] = useState(initial.sessionId)
  const [lead, setLead] = useState<ChatLead | null>(initial.lead)
  const [messages, setMessages] = useState<ChatMessage[]>(initial.messages)
  const [leadStep, setLeadStep] = useState<LeadStep>(initial.leadStep)
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(initial.pendingQuestion)
  const [draftName, setDraftName] = useState<string | null>(initial.draftName)
  const [typing, setTyping] = useState(false)
  const [draft, setDraft] = useState('')

  const [entered, setEntered] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const localReplyTimer = useRef<number | null>(null)

  // Animação de entrada (sobe + fade). motion-reduce desativa via CSS.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // Foco vai pro input ao abrir; Esc fecha; limpa timer pendente ao fechar.
  useEffect(() => {
    inputRef.current?.focus()
    return () => {
      if (localReplyTimer.current !== null) window.clearTimeout(localReplyTimer.current)
    }
  }, [])

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // Persistência em sessionStorage a cada mudança relevante.
  useEffect(() => {
    saveChatState({ sessionId, lead, messages, leadStep, pendingQuestion, draftName })
  }, [sessionId, lead, messages, leadStep, pendingQuestion, draftName])

  // Auto-scroll pro fim quando chega mensagem ou o Bob digita.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing])

  const appendMessage = useCallback((message: Omit<ChatMessage, 'id'>) => {
    setMessages((prev) => [...prev, { ...message, id: newChatId() }])
  }, [])

  /** Resposta local do Bob com "digitando…" simulado. */
  const replyLocally = useCallback(
    (message: Omit<ChatMessage, 'id'>) => {
      setTyping(true)
      localReplyTimer.current = window.setTimeout(() => {
        setTyping(false)
        appendMessage(message)
      }, LOCAL_REPLY_DELAY_MS)
    },
    [appendMessage],
  )

  /**
   * Envia a mensagem DIRETO pro Hermes (a sessão do agente vive no servidor
   * dele — não precisamos mandar histórico). Mensagem do usuário JÁ na tela.
   * Qualquer falha (sessão, timeout, payload) → fallback honesto do Bob.
   */
  const requestBobReply = useCallback(
    async (content: string) => {
      setTyping(true)
      try {
        let token = await ensureHermesSession()
        let res = token ? await sendHermesMessage(token, content) : null

        // Sessão expirada/inexistente no servidor → recria UMA vez e reenvia.
        if (res?.status === 404) {
          clearHermesToken()
          token = await ensureHermesSession()
          res = token ? await sendHermesMessage(token, content) : null
        }

        if (res?.status === 429) {
          appendMessage({ role: 'assistant', content: RATE_LIMIT_REPLY })
          return
        }

        if (res?.ok) {
          const data = (await res.json().catch(() => null)) as {
            reply?: unknown
            images?: unknown
          } | null
          if (data && typeof data.reply === 'string' && data.reply.trim()) {
            appendMessage({
              role: 'assistant',
              content: data.reply,
              images: sanitizeOfferImages(data.images),
            })
            return
          }
        }

        appendMessage({ role: 'assistant', content: LOCAL_FALLBACK_REPLY, cta: LOCAL_FALLBACK_CTA })
      } catch {
        appendMessage({ role: 'assistant', content: LOCAL_FALLBACK_REPLY, cta: LOCAL_FALLBACK_CTA })
      } finally {
        setTyping(false)
      }
    },
    [appendMessage],
  )

  // ---- chips de FAQ (resposta local, sem pedir dados) ----------------------
  function handleFaq(question: string) {
    if (typing) return
    const entry = CHAT_FAQ.find((f) => f.question === question)
    if (!entry) return
    appendMessage({ role: 'user', content: entry.question })
    captureChatEvent('chat_faq_clicked', { question: entry.question })
    replyLocally({ role: 'assistant', content: entry.answer, cta: entry.cta })
  }

  // ---- input: envia dúvida livre ou responde à captura de lead -------------
  function handleSend() {
    if (typing) return
    const text = draft.trim()
    if (!text) return
    setDraft('')

    // Lead completo → conversa normal com o agente.
    if (leadStep === 'done' && lead) {
      appendMessage({ role: 'user', content: text })
      captureChatEvent('chat_message_sent')
      void requestBobReply(text)
      return
    }

    // Primeira dúvida livre → guarda e inicia a captura conversacional.
    if (leadStep === 'idle') {
      appendMessage({ role: 'user', content: text.slice(0, 2000) })
      setPendingQuestion(text.slice(0, 2000))
      captureChatEvent('chat_question_asked')
      setLeadStep('awaiting_name')
      replyLocally({
        role: 'assistant',
        content:
          'Boa pergunta! 🙌 Vou acionar nossa equipe pra te responder certinho. Antes, me fala rapidinho: como você se chama?',
      })
      return
    }

    // Etapa: nome.
    if (leadStep === 'awaiting_name') {
      const name = text.slice(0, 120)
      appendMessage({ role: 'user', content: name })
      if (name.replace(/[^\p{L}]/gu, '').length < 2) {
        replyLocally({
          role: 'assistant',
          content: 'Acho que não peguei seu nome direito 😅 Me fala de novo?',
        })
        return
      }
      setDraftName(name)
      setLeadStep('awaiting_phone')
      replyLocally({
        role: 'assistant',
        content: `Prazer, ${firstNameOf(name)}! 😊 Agora me passa seu WhatsApp com DDD pra nossa equipe falar com você:`,
      })
      return
    }

    // Etapa: WhatsApp.
    if (leadStep === 'awaiting_phone') {
      const digits = text.replace(/\D/g, '')
      appendMessage({ role: 'user', content: text })
      if (digits.length < 10 || digits.length > 11) {
        replyLocally({
          role: 'assistant',
          content: 'Hmm, esse número não parece completo 😅 Me manda com DDD, tipo (11) 99999-9999:',
        })
        return
      }
      const newLead: ChatLead = { name: draftName ?? 'Visitante', phone: formatPhoneBR(text) }
      setLead(newLead)
      setLeadStep('done')
      captureChatEvent('chat_lead_submitted')

      // Agora sim: a dúvida original vai pro Hermes (ou fallback honesto).
      const question = pendingQuestion ?? 'Quero ajuda pra encontrar uma bolsa.'
      setPendingQuestion(null)
      void requestBobReply(question)
    }
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  function handleDraftChange(value: string) {
    setDraft(leadStep === 'awaiting_phone' ? formatPhoneBR(value) : value)
  }

  // Chips visíveis enquanto a conversa é "aberta" (sem captura em andamento),
  // escondendo as perguntas que a pessoa já fez.
  const visibleFaq =
    leadStep === 'idle'
      ? CHAT_FAQ.filter((f) => !messages.some((m) => m.role === 'user' && m.content === f.question))
      : []

  const inputPlaceholder =
    leadStep === 'awaiting_name'
      ? 'Seu nome…'
      : leadStep === 'awaiting_phone'
        ? '(11) 99999-9999'
        : 'Escreva sua dúvida…'

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Chat de suporte com o Bob, assistente do Bolsa Click"
      tabIndex={-1}
      className={`fixed inset-0 z-[80] flex flex-col bg-white shadow-2xl outline-none transition-all duration-300 ease-out motion-reduce:transition-none sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[600px] sm:max-h-[calc(100vh-7.5rem)] sm:w-[380px] sm:overflow-hidden sm:rounded-2xl sm:border sm:border-ink-100 ${
        entered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      {/* Header — Bob de headset: atendente em escuta ativa */}
      <header className="flex items-center gap-3 bg-bolsa-primary px-4 py-3">
        <span className="flex h-10 w-10 items-end justify-center overflow-hidden rounded-full bg-white/95">
          <Mascot pose="headset" size={36} className="pt-0.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-semibold text-white">
            Bob · Assistente Bolsa Click
          </p>
          <p className="flex items-center gap-1.5 text-xs text-white/80">
            <span className="h-2 w-2 rounded-full bg-green-400" aria-hidden="true" />
            Online agora
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar chat"
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white motion-reduce:transition-none"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* Corpo — conversa desde o primeiro segundo */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4" aria-live="polite">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {typing && <TypingIndicator />}
        {visibleFaq.length > 0 && !typing && (
          <div className="flex flex-wrap gap-2 pl-9">
            {visibleFaq.map((entry) => (
              <button
                key={entry.question}
                type="button"
                onClick={() => handleFaq(entry.question)}
                className="rounded-full border border-bolsa-primary/30 bg-white px-3 py-1.5 text-xs font-medium text-bolsa-primary transition-colors hover:bg-bolsa-primary/5 motion-reduce:transition-none"
              >
                {entry.question}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input fixo — sempre disponível */}
      <div className="border-t border-ink-100 bg-white p-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type={leadStep === 'awaiting_phone' ? 'tel' : 'text'}
            inputMode={leadStep === 'awaiting_phone' ? 'numeric' : 'text'}
            autoComplete={
              leadStep === 'awaiting_name'
                ? 'name'
                : leadStep === 'awaiting_phone'
                  ? 'tel-national'
                  : 'off'
            }
            value={draft}
            onChange={(e) => handleDraftChange(e.target.value)}
            onKeyDown={handleInputKeyDown}
            maxLength={2000}
            placeholder={inputPlaceholder}
            aria-label="Mensagem para o Bob"
            className="flex-1 rounded-full border border-ink-100 bg-slate-50 px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:border-bolsa-primary focus:outline-none focus:ring-1 focus:ring-bolsa-primary"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={typing || !draft.trim()}
            aria-label="Enviar mensagem"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bolsa-primary text-white transition-opacity hover:opacity-90 disabled:opacity-40 motion-reduce:transition-none"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M1.5 8L14.5 1.5 10 14.5 7.5 8.5 1.5 8z" fill="currentColor" />
            </svg>
          </button>
        </div>
        {leadStep === 'awaiting_name' && (
          <p className="mt-2 text-[11px] leading-snug text-ink-500">
            Seus dados são usados só para este atendimento.{' '}
            <Link
              href="/central-de-ajuda/seguranca-dados-privacidade/politica-de-privacidade"
              className="underline hover:text-bolsa-primary"
            >
              Política de privacidade
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
