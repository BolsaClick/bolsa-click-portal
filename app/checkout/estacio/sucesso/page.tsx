import { Metadata } from 'next'
import { Suspense } from 'react'
import EstacioSuccessClient from './EstacioSuccessClient'

export const metadata: Metadata = {
  title: 'Inscrição Realizada com Sucesso',
  robots: 'noindex, nofollow',
}

export default function EstacioSuccessPage() {
  return (
    <Suspense fallback={<div className="pb-10 pt-24 text-center text-gray-500">Carregando...</div>}>
      <EstacioSuccessClient />
    </Suspense>
  )
}
