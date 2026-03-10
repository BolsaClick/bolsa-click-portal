import { Metadata } from 'next'
import ContatoClient from './ContatoClient'

export const metadata: Metadata = {
  title: 'Contato | Bolsa Click',
  description:
    'Entre em contato com o Bolsa Click. Tire suas dúvidas sobre bolsas de estudo, matrículas e descontos em faculdades de todo o Brasil.',
  keywords: [
    'contato bolsa click',
    'fale conosco',
    'dúvidas bolsa de estudo',
    'atendimento bolsa click',
    'suporte bolsa de estudo',
  ],
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/contato',
  },
}

export default function ContatoPage() {
  return <ContatoClient />
}
