// app/graduacao/page.tsx
import { Metadata } from 'next'
import CheckoutClient from './CheckoutClient'

export const metadata: Metadata = {
  title: 'Matrícula | Bolsa Click',
  description: 'Realize sua matrícula com segurança e aproveite seu desconto.',
}

export default function Page() {
  return <CheckoutClient />
}
