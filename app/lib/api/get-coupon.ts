import { elysium } from './axios'

export interface CouponResponse {
  id: string
  code: string
  description: string
  discount: number
  type: 'PERCENT' | 'AMOUNT'
  maxUses: number
  usedCount: number
  validUntil: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ValidateCouponParams {
  code: string
  amount: number // valor em centavos
}

export interface CouponValidationResult {
  valid: boolean
  coupon?: CouponResponse
  discountAmount?: number // desconto aplicado em centavos
  finalAmount?: number // valor final em centavos
  error?: string
}

/**
 * Valida um cupom de desconto
 * @param code - Código do cupom
 * @param amount - Valor total em centavos para calcular o desconto
 * @returns Resultado da validação com informações do cupom e desconto aplicado
 */
export async function validateCoupon(
  code: string,
  amount: number
): Promise<CouponValidationResult> {
  try {
    if (!code || !code.trim()) {
      return {
        valid: false,
        error: 'Código do cupom é obrigatório',
      }
    }

    const response = await elysium.get<CouponResponse>(
      `coupons/code/${encodeURIComponent(code.trim().toUpperCase())}`
    )

    const coupon = response.data

    // Verificar se o cupom está válido
    const now = new Date()
    const validUntil = new Date(coupon.validUntil)

    if (validUntil < now) {
      return {
        valid: false,
        error: 'Cupom expirado',
      }
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return {
        valid: false,
        error: 'Cupom esgotado',
      }
    }

    // Calcular desconto
    let discountAmount = 0
    let finalAmount = amount

    if (coupon.type === 'PERCENT') {
      // Desconto percentual
      discountAmount = Math.round((amount * coupon.discount) / 100)
      finalAmount = amount - discountAmount
    } else if (coupon.type === 'AMOUNT') {
      // Desconto em valor fixo
      // Assumindo que discount vem em reais, converter para centavos
      discountAmount = Math.round(coupon.discount * 100)
      finalAmount = Math.max(0, amount - discountAmount)
    }

    return {
      valid: true,
      coupon,
      discountAmount,
      finalAmount,
    }
  } catch (error: unknown) {
    console.error('Erro ao validar cupom:', error)
    
    const axiosError = error as { response?: { status?: number; data?: { message?: string; error?: string } }; message?: string }
    
    if (axiosError.response?.status === 404) {
      return {
        valid: false,
        error: 'Cupom não encontrado',
      }
    }

    if (axiosError.response?.status === 400) {
      return {
        valid: false,
        error: axiosError.response?.data?.message || 'Cupom inválido',
      }
    }

    return {
      valid: false,
      error: axiosError.response?.data?.error || axiosError.message || 'Erro ao validar cupom',
    }
  }
}

