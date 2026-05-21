import type { Metadata } from 'next'
import Link from 'next/link'
import { Home, Search } from 'lucide-react'
import HeaderNew from './components/molecules/Header/New'
import Footer from './components/molecules/Footer'

export const metadata: Metadata = {
  title: 'Página não encontrada (404) | Bolsa Click',
  description: 'A página que você procura não existe ou foi movida.',
  robots: 'noindex, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br',
  },
}

export default function Custom404() {
  return (
    <>
      <HeaderNew />
      <main className="flex-1 flex bg-[#d0e0f5] items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl w-full text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="relative">
                <div className="w-16 h-16 bg-yellow-200 rounded-full mx-auto mb-2 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                    <div className="w-3 h-1 bg-gray-700 rounded-full"></div>
                  </div>
                </div>

                <div className="w-12 h-16 bg-blue-500 rounded-lg mx-auto mb-2 relative">
                  <div className="absolute -left-3 top-2 w-6 h-2 bg-yellow-200 rounded-full transform rotate-45"></div>
                  <div className="absolute -right-3 top-2 w-6 h-2 bg-yellow-200 rounded-full transform -rotate-45"></div>
                </div>

                <div className="flex justify-center space-x-2">
                  <div className="w-2 h-8 bg-blue-800 rounded-full"></div>
                  <div className="w-2 h-8 bg-blue-800 rounded-full"></div>
                </div>

                <div className="absolute top-16 left-1/2 transform w-6 h-8 bg-red-500 rounded-lg"></div>
              </div>

              <div className="absolute -right-20 top-4 transform rotate-12">
                <div className="relative">
                  <div className="w-1 h-16 bg-gray-600 mx-auto"></div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-10 bg-white border-2 border-gray-400 rounded-lg shadow-md">
                    <div className="flex items-center justify-center h-full">
                      <span className="text-red-500 font-bold text-lg">404</span>
                    </div>
                    <div className="absolute top-2 left-2 w-8 h-px bg-gray-400 transform rotate-45"></div>
                    <div className="absolute bottom-2 right-2 w-6 h-px bg-gray-400 transform -rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <span className="text-2xl mr-2" aria-hidden="true">😕</span>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
                Ops! Página não encontrada
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Parece que você tentou acessar um link que não existe ou foi removido.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              href="/"
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Voltar para a página inicial</span>
            </Link>
            <Link
              href="/cursos"
              className="border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>Buscar um curso</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
