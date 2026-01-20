import { Metadata } from 'next'
import { Suspense } from 'react'
import FavoritesClient from './FavoritesClient'

export const metadata: Metadata = {
  title: 'Meus Favoritos | Bolsa Click',
  description: 'Veja todos os cursos que você favoritou. Compare bolsas e encontre as melhores ofertas.',
  robots: 'noindex, nofollow', // Página privada do usuário
}

export default function FavoritosPage() {
  return (
    <Suspense fallback={<div className="p-4 text-gray-500">Carregando favoritos...</div>}>
      <FavoritesClient />
    </Suspense>
  )
}

