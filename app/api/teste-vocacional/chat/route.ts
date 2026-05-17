import { NextRequest } from 'next/server'
import { streamChat, ChatMessage } from '@/app/lib/teste-vocacional/openai'

// Rate limit simples em memória (1 instância serverless). Suficiente pra MVP
// — não bloqueia bot determinado mas filtra abuso casual.
const recentByIp = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 min
const RATE_LIMIT_MAX = 10           // 10 msgs/min por IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = recentByIp.get(ip)
  if (!entry || entry.resetAt < now) {
    recentByIp.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count += 1
  return true
}

interface ChatBody {
  messages: ChatMessage[]
}

const MAX_MESSAGES = 25
const MAX_CONTENT_CHARS = 1000

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Muitas mensagens. Aguarde um minuto.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: ChatBody
  try {
    body = (await request.json()) as ChatBody
  } catch {
    return new Response(JSON.stringify({ error: 'Body inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages obrigatório' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (body.messages.length > MAX_MESSAGES) {
    return new Response(JSON.stringify({ error: 'Conversa muito longa' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  for (const m of body.messages) {
    if (!['user', 'assistant'].includes(m.role)) {
      return new Response(JSON.stringify({ error: 'role inválida' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    if (typeof m.content !== 'string' || m.content.length === 0) {
      return new Response(JSON.stringify({ error: 'content vazio' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    if (m.content.length > MAX_CONTENT_CHARS) {
      return new Response(JSON.stringify({ error: 'Mensagem muito longa' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  try {
    const stream = streamChat(body.messages)
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Erro no chat:', error)
    return new Response(JSON.stringify({ error: 'Erro temporário, tente em alguns segundos' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
