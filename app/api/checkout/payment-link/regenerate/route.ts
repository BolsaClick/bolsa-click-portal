import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import {
  createPaymentLink,
  resolvePaymentLink,
} from '@/app/lib/api/cogna-payment-link'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Regenera o link de pagamento da Cogna para a régua de recuperação (n8n).
 *
 * Existe porque o `checkoutUrl` expira em ~30 minutos: não dá para guardar a URL
 * e disparar horas depois — o candidato cairia num link morto. A régua guarda a
 * `businessKey` (imutável) e chama isto no momento do envio para obter uma URL
 * fresca. Ver [[project_passo7_payment_link_cogna]].
 *
 * Auth por chave estática (N8N_API_KEY), no mesmo modelo do agent-auth do blog.
 *
 * Body (um dos dois):
 *   { "businessKey": "CPF_..._OFFER_..._TIMESTAMP_..." }   ← via principal
 *   { "inscriptionId": "29647476", "cpf": "12345678900" }  ← fallback
 *
 * Resposta:
 *   200 { checkoutUrl }              link fresco (Pix/cartão/boleto)
 *   200 { status: "already_paid" }   nada a cobrar
 *   202 { status: "pending" }        chave ainda não existe (tentar depois)
 *   4xx/5xx { error }
 */

const HEADER_NAMES = ['x-agent-key', 'authorization'] as const

function extractKey(request: NextRequest): string | null {
  for (const name of HEADER_NAMES) {
    const value = request.headers.get(name)
    if (!value) continue
    if (name === 'authorization') {
      if (value.startsWith('Bearer ')) return value.slice(7).trim()
    } else {
      return value.trim()
    }
  }
  return null
}

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'utf8')
  const bBuf = Buffer.from(b, 'utf8')
  if (aBuf.length !== bBuf.length) return false
  return timingSafeEqual(aBuf, bBuf)
}

/** Fail-closed: sem chave forte no ambiente, nega tudo. */
function authorize(request: NextRequest): NextResponse | null {
  const expected = process.env.N8N_API_KEY?.trim()
  if (!expected || expected.length < 32) {
    return NextResponse.json(
      { error: 'N8N_API_KEY não configurada no servidor' },
      { status: 503 },
    )
  }
  const provided = extractKey(request)
  if (!provided) {
    return NextResponse.json(
      { error: 'Unauthorized — falta o header X-Agent-Key' },
      { status: 401 },
    )
  }
  if (!safeCompare(provided, expected)) {
    return NextResponse.json({ error: 'Forbidden — chave inválida' }, { status: 403 })
  }
  return null
}

export async function POST(request: NextRequest) {
  const denied = authorize(request)
  if (denied) return denied

  let body: { businessKey?: unknown; inscriptionId?: unknown; cpf?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const businessKey =
    typeof body.businessKey === 'string' && body.businessKey.trim()
      ? body.businessKey.trim()
      : undefined
  const inscriptionId =
    body.inscriptionId != null && /^\d+$/.test(String(body.inscriptionId))
      ? String(body.inscriptionId)
      : undefined
  const cpf = typeof body.cpf === 'string' ? body.cpf : undefined

  if (!businessKey && !inscriptionId) {
    return NextResponse.json(
      { error: 'Informe businessKey ou inscriptionId' },
      { status: 400 },
    )
  }

  try {
    // Via principal: com a businessKey em mãos, gera direto — sem cache, porque
    // a régua quer sempre uma URL nova (a anterior pode já ter expirado).
    const result = businessKey
      ? await createPaymentLink(businessKey)
      : await resolvePaymentLink(inscriptionId!, { cpf })

    if (result.status === 'ok') {
      return NextResponse.json({
        checkoutUrl: result.checkoutUrl,
        checkoutId: result.checkoutId,
        businessKey: result.businessKey,
      })
    }
    if (result.status === 'already_paid') {
      return NextResponse.json({ status: 'already_paid' })
    }
    if (result.status === 'pending') {
      return NextResponse.json({ status: 'pending' }, { status: 202 })
    }
    return NextResponse.json({ error: result.message }, { status: 502 })
  } catch (error) {
    console.error('❌ regenerate payment-link falhou:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
