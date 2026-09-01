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

// A doc da Cogna ("Atualização de API — Parceiros.Agosto") documenta 4
// respostas para POST /api/v1/offers/validate-voucher — exclusivo de ofertas
// Cosmos (pós-graduação e curso profissionalizante):
//   200 -> voucher válido, corpo com os planos/descontos
//   204 -> nenhum voucher disponível para o CPF (sem corpo)
//   400 -> voucher inválido ou expirado
//   500 -> erro interno
// 200/204/400 são respostas do fluxo de negócio, não exceções — só 500 e
// falha de rede devem virar `catch()` pra quem chama.
export interface ValidateVoucherResult {
  status: number
  data: ValidateVoucherResponse | null
}

/**
 * Valida um código de voucher no Tartarus (exclusivo de ofertas Cosmos).
 *
 * Retorna `status` + `data` em vez de lançar pra 200/204/400 — cada um
 * significa algo diferente pra quem chama (aplicado / sem voucher / inválido)
 * e não deve ser colapsado num "erro" genérico. Erros de rede e 5xx seguem
 * lançando (ver `validateStatus`), tratados no `catch` do chamador.
 */
export async function validateVoucher(
  voucher: string,
  cpf: string,
  paymentPlanId: string
): Promise<ValidateVoucherResult> {
  try {
    const response = await tartarus.post<ValidateVoucherResponse>(
      'cogna/courses/validate-voucher',
      { voucher, cpf, paymentPlanId },
      { validateStatus: (status) => status < 500 }
    )
    return {
      status: response.status,
      // 204 não tem corpo — normaliza pra `null` em vez de deixar `data`
      // como string vazia/undefined inconsistente entre ambientes.
      data: response.status === 204 ? null : response.data,
    }
  } catch (error: unknown) {
    console.error('Erro ao validar voucher:', error)
    throw error
  }
}
