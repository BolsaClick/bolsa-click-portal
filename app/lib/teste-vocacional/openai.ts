// Wrapper de OpenAI Chat Completions via fetch (sem SDK, consistente com Notealy/Resend).
// 2 modos:
//   - streamChat: streaming pra UI do quiz (server-sent events parseados)
//   - getStructuredRecommendations: call final com response_format JSON schema

import {
  buildRefinementPrompt,
  buildFinalRecommendationsPrompt,
  RECOMMENDATIONS_SCHEMA,
} from './system-prompt'
import type { UserProfile } from './matching'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL = 'gpt-4o-mini'

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export type Recommendation = {
  courseSlug: string
  matchPercent: number
  reasoning: string
}

/**
 * Chama OpenAI em modo streaming pro refinamento de 2-3 turnos.
 * Recebe o perfil (já calculado deterministicamente) + histórico da conversa.
 *
 * É async de propósito: o handshake com a OpenAI acontece ANTES de devolver o
 * stream. Se a chamada falhasse dentro do `start()` do ReadableStream, a rota
 * já teria retornado a Response e enviado os headers — o `controller.error()`
 * só conseguiria cortar a conexão, e o try/catch da rota nunca veria o erro.
 * O usuário recebia socket cortado (e página de erro do Cloudflare) em vez do
 * 502 JSON que a UI já trata. Aguardando aqui, a falha ainda é capturável.
 */
export async function streamChat(
  profile: UserProfile,
  messages: ChatMessage[]
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY ausente')
  }

  const payload = {
    model: MODEL,
    stream: true,
    temperature: 0.7,
    messages: [
      { role: 'system', content: buildRefinementPrompt(profile) },
      ...messages,
    ],
  }

  const encoder = new TextEncoder()

  // Handshake ANTES de comprometer a Response — erro aqui vira exceção que a
  // rota captura e transforma em 502 JSON.
  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok || !response.body) {
    const errBody = await response.text().catch(() => '')
    console.error('OpenAI erro', response.status, errBody)
    throw new Error(`OpenAI ${response.status}`)
  }

  const body = response.body

  return new ReadableStream({
    async start(controller) {
      try {
        const reader = body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith('data:')) continue
            const data = trimmed.slice(5).trim()
            if (data === '[DONE]') {
              controller.close()
              return
            }
            try {
              const json = JSON.parse(data) as {
                choices?: { delta?: { content?: string } }[]
              }
              const piece = json.choices?.[0]?.delta?.content
              if (piece) controller.enqueue(encoder.encode(piece))
            } catch {
              // Ignora frames parciais
            }
          }
        }

        controller.close()
      } catch (error) {
        console.error('streamChat falhou:', error)
        controller.error(error)
      }
    },
  })
}

/**
 * Call final pra refinar matchPercent + reasoning dos top 3 cursos pré-selecionados.
 * Recebe perfil, histórico da conversa e top 3 slugs do matching determinístico.
 */
export async function getStructuredRecommendations(
  profile: UserProfile,
  messages: ChatMessage[],
  topCourseSlugs: string[]
): Promise<Recommendation[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY ausente')
  }

  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.4,
      response_format: RECOMMENDATIONS_SCHEMA,
      messages: [
        { role: 'system', content: buildRefinementPrompt(profile) },
        ...messages,
        { role: 'user', content: buildFinalRecommendationsPrompt(profile, topCourseSlugs) },
      ],
    }),
  })

  if (!response.ok) {
    const errBody = await response.text().catch(() => '')
    throw new Error(`OpenAI structured ${response.status}: ${errBody}`)
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('OpenAI não retornou conteúdo')

  const parsed = JSON.parse(content) as { recommendations: Recommendation[] }
  return parsed.recommendations ?? []
}
