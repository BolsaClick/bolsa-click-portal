// app/graduacao/page.tsx
import { Metadata } from 'next'
import SuccessClient from './SuccessClient'
import { Suspense } from 'react'


export const metadata: Metadata = {
  title: '🎉 Parabéns | Bolsa Click',
  description: 'Sua matricula foi realizada com sucesso, fique atento ao seu e-mail para mais informações.',
}

export default function Page() {
  return <Suspense fallback={<div className="p-10 text-center text-gray-500">Carregando confirmação...</div>}>
    <SuccessClient />
  </Suspense>
}
