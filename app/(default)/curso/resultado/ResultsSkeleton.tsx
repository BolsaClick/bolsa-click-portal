'use client'

import { useResultsFilter } from './ResultsFilterContext'

/**
 * Fallback do Suspense enquanto `SearchResultsData` busca as ofertas — evita a
 * tela em branco que a busca 100% client-side causava antes. Lê `viewMode` do
 * contexto pra combinar com o grid/lista que o usuário já tinha escolhido.
 */
export default function ResultsSkeleton() {
  const { viewMode } = useResultsFilter()

  return (
    <div
      aria-hidden
      className={`grid ${
        viewMode === 'grid'
          ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5'
          : 'grid-cols-1 gap-4'
      }`}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-hairline rounded-2xl p-5 md:p-6 animate-pulse"
        >
          <div className="flex items-start justify-between mb-5">
            <div className="h-9 w-24 bg-paper-warm rounded" />
            <div className="h-6 w-12 bg-paper-warm rounded-full" />
          </div>
          <div className="h-5 bg-paper-warm rounded w-3/4 mb-2" />
          <div className="h-5 bg-paper-warm rounded w-1/2 mb-5" />
          <div className="h-px bg-hairline mb-4" />
          <div className="flex items-end justify-between">
            <div>
              <div className="h-3 w-20 bg-paper-warm rounded mb-2" />
              <div className="h-7 w-24 bg-paper-warm rounded" />
            </div>
            <div className="h-10 w-10 bg-paper-warm rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
