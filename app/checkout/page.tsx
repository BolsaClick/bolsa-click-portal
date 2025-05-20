// app/graduacao/page.tsx
import { Metadata } from 'next'
import CheckoutClient from './CheckoutClient'

export const metadata: Metadata = {
  title: 'Matrícula',
  description: 'Realize sua matrícula com segurança e aproveite seu desconto.',
}

export default function Page() {
  return <CheckoutClient />
}
