/**
 * POST /api/chat — adapter server-side para o hermes-agent.
 *
 * ⚠️ LEGADO: o widget (ChatPanel) agora fala DIRETO com o Hermes webchat
 * (https://hermes.bolsamais.com.br/webchat) porque o rate limit de lá é por
 * IP do visitante — proxy server-side afunilaria todo o site num IP só.
 * Esta rota fica como fallback/base pra futuro logging de lead no CRM.
 *
 * ============================================================================
 * CONTRATO ASSUMIDO DO HERMES (ainda NÃO confirmado — ajustar só callHermes()):
 *
 *   POST {HERMES_AGENT_URL}/chat
 *   Headers:
 *     Authorization: Bearer {HERMES_AGENT_API_KEY}
 *     Content-Type: application/json
 *   Body:
 *     {
 *       sessionId: string,
 *       message:   string,
 *       lead:      { name: string, email?: string, phone: string },
 *       history:   { role: 'user' | 'assistant', content: string }[]
 *     }
 *   Resposta 200:
 *     { reply: string }
 *
 * Quando o contrato real da API do hermes chegar, TODA a adaptação fica
 * dentro de callHermes() — o resto da rota não muda.
 * ============================================================================
 *
 * Garantias pro widget:
 * - Nunca 500: sem HERMES_AGENT_URL, timeout ou erro upstream → 200 com
 *   { reply: <fallback honesto do Bob>, fallback: true, cta }.
 * - Rate limit em memória por sessionId (10 msg/min) → 200 com reply educado.
 * - Input sanitizado: message ≤ 2000 chars, history ≤ 20 itens (zod).
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'nodejs'

// ---------------------------------------------------------------------------
// Validação (zod — já é dependência do repo)
// ---------------------------------------------------------------------------

const MAX_MESSAGE_CHARS = 2000
const MAX_HISTORY_ITEMS = 20

const historyItemSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(MAX_MESSAGE_CHARS),
})

const bodySchema = z.object({
  sessionId: z.string().min(8).max(80),
  lead: z.object({
    name: z.string().trim().min(1).max(120),
    // Email é opcional: a captura conversacional pede só nome + WhatsApp.
    email: z.string().trim().email().max(200).optional(),
    phone: z.string().trim().min(10).max(25),
  }),
  message: z.string().min(1).max(MAX_MESSAGE_CHARS),
  history: z.array(historyItemSchema).max(MAX_HISTORY_ITEMS).optional(),
})

type ChatBody = z.infer<typeof bodySchema>

/** Clampa campos de texto ANTES do zod pra nunca rejeitar por excesso de tamanho. */
function sanitizeRawBody(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null) return raw
  const body = { ...(raw as Record<string, unknown>) }
  if (typeof body.message === 'string') {
    body.message = body.message.slice(0, MAX_MESSAGE_CHARS)
  }
  if (Array.isArray(body.history)) {
    body.history = body.history.slice(-MAX_HISTORY_ITEMS).map((item) => {
      if (typeof item !== 'object' || item === null) return item
      const entry = { ...(item as Record<string, unknown>) }
      if (typeof entry.content === 'string') {
        entry.content = entry.content.slice(0, MAX_MESSAGE_CHARS)
      }
      return entry
    })
  }
  return body
}

// ---------------------------------------------------------------------------
// Rate limit simples em memória por sessionId (10 msg/min).
// Nota: por instância — em serverless com várias instâncias é "best effort",
// suficiente pra conter abuso casual do widget.
// ---------------------------------------------------------------------------

const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60_000
const MAX_TRACKED_SESSIONS = 5000

const hitsBySession = new Map<string, number[]>()

function isRateLimited(sessionId: string): boolean {
  const now = Date.now()
  const recent = (hitsBySession.get(sessionId) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  )
  if (recent.length >= RATE_LIMIT_MAX) {
    hitsBySession.set(sessionId, recent)
    return true
  }
  recent.push(now)
  hitsBySession.set(sessionId, recent)

  // Poda pra não crescer sem limite em processos de vida longa.
  if (hitsBySession.size > MAX_TRACKED_SESSIONS) {
    for (const [key, timestamps] of hitsBySession) {
      const last = timestamps[timestamps.length - 1] ?? 0
      if (now - last >= RATE_LIMIT_WINDOW_MS) hitsBySession.delete(key)
    }
  }
  return false
}

// ---------------------------------------------------------------------------
// callHermes — ÚNICO ponto de integração com o hermes-agent
// ---------------------------------------------------------------------------

const HERMES_TIMEOUT_MS = 15_000

/**
 * Encaminha a mensagem pro hermes-agent seguindo o contrato assumido no topo
 * do arquivo. Retorna a resposta do agente ou null (env ausente, erro HTTP,
 * timeout ou payload inesperado) — null aciona o fallback honesto do Bob.
 */
async function callHermes(input: ChatBody): Promise<string | null> {
  const baseUrl = process.env.HERMES_AGENT_URL
  const apiKey = process.env.HERMES_AGENT_API_KEY
  if (!baseUrl) return null

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), HERMES_TIMEOUT_MS)

  try {
    const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        sessionId: input.sessionId,
        message: input.message,
        lead: input.lead,
        history: input.history ?? [],
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      console.error(`[chat] hermes-agent respondeu ${res.status}`)
      return null
    }

    const data = (await res.json().catch(() => null)) as { reply?: unknown } | null
    if (data && typeof data.reply === 'string' && data.reply.trim()) {
      return data.reply
    }
    console.error('[chat] hermes-agent retornou payload sem reply string')
    return null
  } catch (error) {
    console.error('[chat] falha ao chamar hermes-agent:', error)
    return null
  } finally {
    clearTimeout(timeout)
  }
}

// ---------------------------------------------------------------------------
// Respostas prontas do Bob
// ---------------------------------------------------------------------------

const FALLBACK_REPLY =
  'Recebi sua mensagem! 🙌 Nossa equipe já foi avisada e te responde em instantes pelo WhatsApp que você deixou. Enquanto isso, que tal buscar sua bolsa?'

const FALLBACK_CTA = { label: 'Buscar minha bolsa', href: '/descubra-sua-bolsa' }

const RATE_LIMIT_REPLY =
  'Calma lá 😅 Chegaram muitas mensagens de uma vez! Me dá uns segundinhos e a gente continua, combinado?'

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(sanitizeRawBody(raw))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Payload inválido', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const body = parsed.data

  if (isRateLimited(body.sessionId)) {
    return NextResponse.json({ reply: RATE_LIMIT_REPLY, fallback: false, rateLimited: true })
  }

  const reply = await callHermes(body)

  if (reply) {
    return NextResponse.json({ reply, fallback: false })
  }

  // Fallback honesto: nunca 500 pro widget.
  return NextResponse.json({ reply: FALLBACK_REPLY, fallback: true, cta: FALLBACK_CTA })
}
