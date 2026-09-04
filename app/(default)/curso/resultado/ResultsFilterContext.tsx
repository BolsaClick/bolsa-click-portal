'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

interface ResultsFilterState {
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
  /** Marcas presentes no resultado atual — publicado pelo componente que tem os dados. */
  availableBrands: string[]
  setAvailableBrands: (brands: string[]) => void
  selectedBrands: string[]
  toggleBrand: (brand: string) => void
  priceRange: [number, number]
  setPriceRange: (range: [number, number]) => void
}

const ResultsFilterCtx = createContext<ResultsFilterState | null>(null)

/**
 * Estado de UI client-side compartilhado entre o shell instantâneo (Hero +
 * FiltersPanel, fora do Suspense) e a busca de ofertas (dentro do Suspense,
 * atrás de um Server Component) — ex.: `availableBrands` só existe depois que
 * os dados chegam, mas o filtro de instituição mora no shell.
 */
export function ResultsFilterProvider({
  searchKey,
  initialBrands,
  children,
}: {
  /** Muda a cada busca nova (curso/cidade/modalidade/nível) — reseta o filtro de marca. */
  searchKey: string
  /** Marcas vindas da URL (?marcas=) — deep-link/refresh chega com o filtro já aplicado. */
  initialBrands?: string[]
  children: React.ReactNode
}) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrands ?? [])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000])

  // Resetar marcas selecionadas quando a busca muda (curso/cidade/modalidade/nível).
  // Pula o primeiro render: no deep-link o estado inicial já veio da URL e o
  // efeito não pode apagá-lo.
  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    setSelectedBrands([])
  }, [searchKey])

  const toggleBrand = useCallback((brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    )
  }, [])

  const value = useMemo<ResultsFilterState>(
    () => ({
      viewMode,
      setViewMode,
      availableBrands,
      setAvailableBrands,
      selectedBrands,
      toggleBrand,
      priceRange,
      setPriceRange,
    }),
    [viewMode, availableBrands, selectedBrands, toggleBrand, priceRange],
  )

  return <ResultsFilterCtx.Provider value={value}>{children}</ResultsFilterCtx.Provider>
}

export function useResultsFilter(): ResultsFilterState {
  const ctx = useContext(ResultsFilterCtx)
  if (!ctx) throw new Error('useResultsFilter deve ser usado dentro de ResultsFilterProvider')
  return ctx
}
