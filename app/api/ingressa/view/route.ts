import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { capturePostHogServerEvent } from '@/app/lib/analytics/posthog-server'

/**
 * Espelho server-side de "checkout_viewed" (etapa 1 do funil unificado — ver
 * app/lib/analytics/checkout-funnel.ts) pras landings do ingressa.
 *
 * Por que não emitir isso na Server Component (`app/lp/[partner]/page.tsx`):
 * aquela página é ISR (`revalidate = 3600`) — um capture() no render só
 * rodaria a cada regeneração de cache, não a cada visita real. Por que não
 * confiar só no client (`usePostHogTracking` → PostHog do browser): o
 * PostHog só carrega sob consentimento de analytics, que quase ninguém dá
 * (ver PostHogProvider). Este endpoint é chamado direto do mount do
 * LeadForm, sem depender do SDK do PostHog nem de consentimento — é o
 * "espelhe server-side tudo que importa" pra etapa de visualização.
 *
 * Best-effort: nunca deve derrubar a página (fetch sem await no chamador).
 */

// Rate-limit generoso (visualização não é ação sensível, mas evita abuso/custo
// de flood) — mesmo padrão de app/api/ingressa/route.ts, janela maior.
const viewsByIp = new Map<string, { count: number; resetAt: number }>()
const VIEW_WINDOW_MS = 60 * 60 * 1000
const VIEW_MAX = 120

function checkViewLimit(ip: string): boolean {
  const now = Date.now()
  const entry = viewsByIp.get(ip)
  if (!entry || entry.resetAt < now) {
    viewsByIp.set(ip, { count: 1, resetAt: now + VIEW_WINDOW_MS })
    return true
  }
  if (entry.count >= VIEW_MAX) return false
  entry.count += 1
  return true
}

interface ViewBody {
  partner?: string
  partnerName?: string
  courseName?: string | null
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkViewLimit(ip)) {
    return NextResponse.json({ ok: false }, { status: 429 })
  }

  let body: ViewBody
  try {
    body = (await request.json()) as ViewBody
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const partnerSlug = typeof body.partner === 'string' ? body.partner.slice(0, 40) : 'desconhecido'
  const brand = typeof body.partnerName === 'string' ? body.partnerName : partnerSlug
  const flow = partnerSlug === 'estacio' ? 'estacio' : 'matricula'

  try {
    await capturePostHogServerEvent({
      event: 'checkout_viewed',
      // Sem identidade ainda (pré-formulário) — um id anônimo por visita é
      // suficiente pra contar volume/queda por marca no funil; a etapa
      // seguinte (checkout_identified, no submit) é que casa com o telefone.
      distinctId: `ingressa_anon_${randomUUID()}`,
      properties: {
        flow,
        brand,
        course_name: typeof body.courseName === 'string' && body.courseName ? body.courseName : null,
        source: 'ingressa',
      },
    })
  } catch (error) {
    console.error('⚠️ PostHog checkout_viewed (ingressa) falhou:', error)
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
