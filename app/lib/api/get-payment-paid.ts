import { api } from "./axios"


interface PaymentStatus {
  status: string
}

interface GetPaymentStatusResponse {
  updates: { data: PaymentStatus }[]
}

export async function getPaymentStatus(id?: string) {
  const url = `payment/get-payment-paid?id=${id}`

  const response = await api.get<GetPaymentStatusResponse>(url)

  return response.data.updates.map((update) => update.data)
}
