import { Metadata } from 'next'
import { Suspense } from 'react'
import EstacioCheckoutClient from './EstacioCheckoutClient'

export const metadata: Metadata = {
  title: 'Inscrição',
  robots: 'noindex, nofollow',
}

// Dinâmica de propósito: o formulário depende de query params da oferta e não
// deve ser servido de cache estático.
export const dynamic = 'force-dynamic'

export default function EstacioCheckoutPage() {
  return (
    <Suspense fallback={<div className="pb-10 pt-24 text-center text-gray-500">Carregando...</div>}>
      <EstacioCheckoutClient />
    </Suspense>
  )
}
