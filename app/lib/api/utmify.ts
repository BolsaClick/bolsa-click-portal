// Integração server-only com a UTMify (https://utmify.com.br).
// Envia eventos de pedido (waiting_payment / paid / refused / refunded /
// chargedback) para a Orders API. Token de API é segredo de servidor.
//
// Docs: painel UTMify → Integrações → API (header `x-api-token`).

const UTMIFY_API_URL =
  process.env.UTMIFY_API_URL || 'https://api.utmify.com.br/api-credentials/orders'
const UTMIFY_API_TOKEN = process.env.UTMIFY_API_TOKEN

export type UtmifyStatus =
  | 'waiting_payment'
  | 'paid'
  | 'refused'
  | 'refunded'
  | 'chargedback'

export type UtmifyPaymentMethod =
  | 'pix'
  | 'credit_card'
  | 'billet'
  | 'boleto'
  | 'free_price'

interface UtmifyOrderInput {
  orderId: string
  platform?: string // default: "BolsaClick"
  paymentMethod: UtmifyPaymentMethod
  status: UtmifyStatus
  createdAt: Date
  approvedDate?: Date | null
  refundedAt?: Date | null
  isTest?: boolean

  customer: {
    name: string
    email: string
    phone?: string | null
    document: string // CPF apenas dígitos
    country?: string // default "BR"
    ip?: string | null
  }

  products: Array<{
    id: string
    name: string
    planId?: string | null
    planName?: string | null
    quantity: number
    priceInCents: number
  }>

  trackingParameters?: {
    src?: string | null
    sck?: string | null
    utm_source?: string | null
    utm_campaign?: string | null
    utm_medium?: string | null
    utm_content?: string | null
    utm_term?: string | null
  }

  commission?: {
    totalPriceInCents: number
    gatewayFeeInCents?: number
    userCommissionInCents?: number
  }
}

// UTMify exige createdAt/approvedDate no formato "YYYY-MM-DD HH:mm:ss" em UTC.
function formatUtmifyDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ` +
    `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
  )
}

/**
 * Envia um evento de pedido à UTMify. Não joga erro — falhas de tracking
 * nunca devem derrubar o fluxo de checkout. Retorna boolean de sucesso.
 */
export async function sendUtmifyOrder(input: UtmifyOrderInput): Promise<boolean> {
  if (!UTMIFY_API_TOKEN) {
    console.warn('⚠️ UTMIFY_API_TOKEN não configurado — webhook ignorado')
    return false
  }

  const payload = {
    orderId: input.orderId,
    platform: input.platform || 'BolsaClick',
    paymentMethod: input.paymentMethod,
    status: input.status,
    createdAt: formatUtmifyDate(input.createdAt),
    approvedDate: input.approvedDate ? formatUtmifyDate(input.approvedDate) : null,
    refundedAt: input.refundedAt ? formatUtmifyDate(input.refundedAt) : null,
    customer: {
      name: input.customer.name,
      email: input.customer.email,
      phone: input.customer.phone || null,
      document: input.customer.document,
      country: input.customer.country || 'BR',
      ip: input.customer.ip || null,
    },
    products: input.products.map((p) => ({
      id: p.id,
      name: p.name,
      planId: p.planId ?? null,
      planName: p.planName ?? null,
      quantity: p.quantity,
      priceInCents: p.priceInCents,
    })),
    trackingParameters: {
      src: input.trackingParameters?.src ?? null,
      sck: input.trackingParameters?.sck ?? null,
      utm_source: input.trackingParameters?.utm_source ?? null,
      utm_campaign: input.trackingParameters?.utm_campaign ?? null,
      utm_medium: input.trackingParameters?.utm_medium ?? null,
      utm_content: input.trackingParameters?.utm_content ?? null,
      utm_term: input.trackingParameters?.utm_term ?? null,
    },
    commission: {
      totalPriceInCents: input.commission?.totalPriceInCents ?? 0,
      gatewayFeeInCents: input.commission?.gatewayFeeInCents ?? 0,
      userCommissionInCents:
        input.commission?.userCommissionInCents ??
        input.commission?.totalPriceInCents ??
        0,
    },
    isTest: input.isTest ?? false,
  }

  try {
    const response = await fetch(UTMIFY_API_URL, {
      method: 'POST',
      headers: {
        'x-api-token': UTMIFY_API_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      console.error(
        `❌ UTMify ${input.status} falhou (${response.status}) para order ${input.orderId}:`,
        data
      )
      return false
    }

    console.log(`✅ UTMify ${input.status} enviado: ${input.orderId}`)
    return true
  } catch (error) {
    console.error(`❌ UTMify ${input.status} erro de rede para order ${input.orderId}:`, error)
    return false
  }
}

// Helpers de conversão pra evitar duplicação nos callsites.

export function paymentMethodToUtmify(method: string): UtmifyPaymentMethod {
  const normalized = method?.toLowerCase()
  if (normalized === 'card' || normalized === 'credit_card') return 'credit_card'
  if (normalized === 'boleto' || normalized === 'billet') return 'boleto'
  return 'pix'
}
