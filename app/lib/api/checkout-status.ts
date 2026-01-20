import { elysium } from './axios'

export interface CheckoutStatusResponse {
  id?: string
  transactionId: string
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED'
  amountInCents?: number
  amount?: number
  paidAt?: string
  paid?: boolean
  [key: string]: unknown
}

/**
 * Verifica o status de um checkout na API Elysium
 * @param transactionId - ID da transação
 * @returns Status do checkout
 */
export async function getCheckoutStatus(
  transactionId: string
): Promise<CheckoutStatusResponse> {
  try {
    const response = await elysium.get<CheckoutStatusResponse>(
      `/checkout/status/${transactionId}`
    )
    return response.data
  } catch (error: unknown) {
    console.error('Erro ao verificar status do checkout:', error)
    throw error
  }
}

