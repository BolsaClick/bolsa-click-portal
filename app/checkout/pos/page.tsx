// app/graduacao/page.tsx
import { Metadata } from 'next'
import { Suspense } from 'react'
import PosCheckout from './PosClient'


export const metadata: Metadata = {
  title: '🎉 Parabéns | Bolsa Click',
  description: 'Sua matricula foi realizada com sucesso, fique atento ao seu e-mail para mais informações.',
}

export default function Page() {
  return <Suspense fallback={<div className="pb-10 pt-24 text-center text-gray-500">Carregando confirmação...</div>}>
    <PosCheckout />
  </Suspense>
}
