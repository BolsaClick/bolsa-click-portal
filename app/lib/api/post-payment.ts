import { api } from "./axios"

interface Phone {
  mobile_phone: {
    country_code: string
    area_code: string
    number: string
  }
}

interface Customer {
  name: string
  email: string
  type: string
  document: string
  phones: Phone
}

interface Address {
  line_1: string
  city: string
  state: string
  country: string
  zip_code: string
}

interface Shipping {
  address: Address
  amount: number
  description: string
  recipient_name: string
  recipient_phone: string
}

interface Item {
  amount: number
  description: string
  quantity: number
  code: string
}

interface BillingAddress {
  line_1: string
  zip_code: string
  city: string
  state: string
  country: string
}

interface Card {
  number: string
  holder_name: string
  exp_month: number
  exp_year: number
  cvv: string
  billing_address: BillingAddress
}

interface CreditCardPayment {
  recurrence: boolean
  installments: number
  statement_descriptor: string
  card: Card
}
interface PixPayment {
  expires_in: string
  additional_information: {
    name: string
    value: string
  }[]
}
interface Payment {
  payment_method: string
  credit_card?: CreditCardPayment
  pix?: PixPayment
}

interface Payload {
  customer: Customer
  shipping: Shipping
  items: Item[]
  payments: Payment[]
}

export async function createPayment(paymentData: Payload) {
  try {
    const response = await api.post('/checkout/payment', paymentData)
    return response.data
  } catch (error) {
    console.error('Error creating payment:', error)
    throw error
  }
}
