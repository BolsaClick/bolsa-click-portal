'use client'

import { Suspense } from 'react'
import BuscarCursos from './BuscarCursosContent'

export default function BuscarCursosPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><p className="text-gray-600">Carregando busca...</p></div>}>
      <BuscarCursos />
    </Suspense>
  )
}
