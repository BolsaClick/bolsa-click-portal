import { Metadata } from 'next'
import { Suspense } from 'react'
import MatriculaSuccessClient from './MatriculaSuccessClient'

export const metadata: Metadata = {
  title: 'Inscrição Realizada com Sucesso',
}

export default function MatriculaSuccessPage() {
  return (
    <Suspense fallback={<div className="pb-10 pt-24 text-center text-gray-500">Carregando...</div>}>
      <MatriculaSuccessClient />
    </Suspense>
  )
}

