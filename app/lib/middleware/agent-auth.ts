import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'

/**
 * Auth middleware pra agentes externos (bots/scripts de IA) que precisam
 * publicar conteúdo no portal sem Firebase ID Token.
 *
 * Setup: definir env var AGENT_BLOG_API_KEY com chave gerada via:
 *   openssl rand -hex 32
 *
 * Uso pelo agente:
 *   curl -X POST https://www.bolsaclick.com.br/api/agents/blog/posts \
 *     -H "X-Agent-Key: <chave-do-env>" \
 *     -H "Content-Type: application/json" \
 *     -d '{...payload...}'
 *
 * Trade-off vs Firebase Bearer:
 *   - + token estático de longa duração (sem refresh)
 *   - + sem dependência de Firebase Admin SDK no agente
 *   - − não há audit log de quem publicou (todos posts vêm de "agent:blog")
 *   - − rotação é manual (mudar env var + reiniciar app)
 *
 * Pra MVP/curto prazo: OK. Pra produção de longa duração: migrar pra
 * service account Firebase com customClaims['blog'].
 */

export interface AgentAuthResult {
  agentName: string
}

const HEADER_NAMES = ['x-agent-key', 'X-Agent-Key', 'authorization'] as const

function extractKey(request: NextRequest): string | null {
  for (const name of HEADER_NAMES) {
    const value = request.headers.get(name)
    if (!value) continue
    if (name === 'authorization') {
      // Aceita "Bearer <key>" pra compatibilidade com clientes HTTP padrão
      if (value.startsWith('Bearer ')) return value.slice(7).trim()
    } else {
      return value.trim()
    }
  }
  return null
}

/**
 * Compara duas strings em constant-time pra evitar timing attacks.
 * Strings de tamanhos diferentes retornam false imediatamente.
 */
function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'utf8')
  const bBuf = Buffer.from(b, 'utf8')
  if (aBuf.length !== bBuf.length) return false
  return timingSafeEqual(aBuf, bBuf)
}

export async function withAgentAuth(
  request: NextRequest,
): Promise<AgentAuthResult | NextResponse> {
  const expectedKey = process.env.AGENT_BLOG_API_KEY?.trim()

  if (!expectedKey || expectedKey.length < 32) {
    // Fail-safe: se a env não está configurada com chave forte (≥32 chars),
    // negar TODAS as requisições pra evitar bypass acidental.
    return NextResponse.json(
      { error: 'Agent auth not configured on server' },
      { status: 503 },
    )
  }

  const providedKey = extractKey(request)
  if (!providedKey) {
    return NextResponse.json(
      { error: 'Unauthorized — missing X-Agent-Key header' },
      { status: 401 },
    )
  }

  if (!safeCompare(providedKey, expectedKey)) {
    return NextResponse.json(
      { error: 'Forbidden — invalid agent key' },
      { status: 403 },
    )
  }

  return { agentName: 'agent:blog' }
}

export function isAgentAuthError(
  result: AgentAuthResult | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse
}
