import { tartarus } from './axios'

export interface VoucherInstallment {
  number: number
  installmentValue: number
  discountPercentage: number
  originalInstallmentValue: number
  totalValue: number
}

export interface VoucherPaymentMethod {
  type: string
  totalDiscont: number
  discountPercentage: number
  totalInstallmentNumber: number
  totalValueWithDiscount: number
  installments: VoucherInstallment[]
}

export interface ValidateVoucherResponse {
  id?: number
  code?: string
  isValid?: boolean
  paymentMethods?: VoucherPaymentMethod[]
  message?: string
}

/**
 * Valida um código de voucher no Tartarus
 */
export async function validateVoucher(
  voucher: string,
  cpf: string,
  paymentPlanId: string
): Promise<ValidateVoucherResponse> {
  try {
    const response = await tartarus.post<ValidateVoucherResponse>(
      'cogna/courses/validate-voucher',
      { voucher, cpf, paymentPlanId }
    )
    return response.data
  } catch (error: unknown) {
    console.error('Erro ao validar voucher:', error)
    throw error
  }
}
