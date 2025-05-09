'use client'

import { Suspense } from 'react'
import BuscarCursos from './BuscarCursosContent'
import Head from 'next/head'

export default function BuscarCursosPage() {
  return (
    <>
    <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><p className="text-gray-600">Carregando busca...</p></div>}>
      <BuscarCursos />
    </Suspense>
    </>
  )
}
