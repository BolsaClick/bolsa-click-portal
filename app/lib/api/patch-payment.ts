import { api } from "./axios"

export interface UpdateTransaction {
  transactionId: string
  status: 'paid' | 'pending' | 'failed'
}

export async function updateTransactionStatus(data: UpdateTransaction) {
  try {
    const response = await api.patch('/payment/transaction', data)
    return response.data
  } catch (error) {
    console.error('Erro ao atualizar transação:', error)
    throw error
  }
}
