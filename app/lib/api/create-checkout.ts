import { elysium } from './axios'

export interface CreateCheckoutRequest {
  name: string
  cpf: string
  email: string
  phone: string
  amountInCents: number
  description: string
  /** Método de pagamento no Elysium: 'pix' ou 'card' (Stripe) */
  paymentMethod?: 'pix' | 'card'
  couponCode?: string
  brand?: string
  metadata?: Record<string, unknown>
}

export interface CreateCheckoutResponse {
  success: boolean
  transactionId: string
  /** Presente quando paymentMethod === 'pix' */
  pixQrCode?: {
    id: string
    amount: number
    status: string
    devMode?: boolean
    brCode: string
    brCodeBase64: string
    platformFee?: number
    createdAt: string
    updatedAt: string
    expiresAt: string
  }
  /** Presente quando paymentMethod === 'card' (Stripe) */
  clientSecret?: string
  paymentIntentId?: string
  amount: number
  originalAmount?: number
  discountApplied?: number
}

/**
 * Cria um checkout na API Elysium
 * @param checkoutData - Dados do checkout
 * @returns Resposta da API com transactionId
 */
export async function createCheckout(
  checkoutData: CreateCheckoutRequest
): Promise<CreateCheckoutResponse> {
  try {
    const response = await elysium.post<CreateCheckoutResponse>('/checkout', checkoutData)
    return response.data
  } catch (error: unknown) {
    console.error('Erro ao criar checkout:', error)
    throw error
  }
}

