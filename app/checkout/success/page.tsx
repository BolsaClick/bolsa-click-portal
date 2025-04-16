// app/graduacao/page.tsx
import { Metadata } from 'next'
import SuccessClient from './SuccessClient'


export const metadata: Metadata = {
  title: '🎉 Parabéns | Bolsa Click',
  description: 'Sua matricula foi realizada com sucesso, fique atento ao seu e-mail para mais informações.',
}

export default function Page() {
  return <SuccessClient />
}
