'use client'

import { createContext, useContext, useMemo, useState, useTransition, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { BRANDS, type BrandId } from '@/app/lib/admin/brands'
import type { BrandStatus } from '@/app/lib/admin/brand-client'
import { setAdminBrand } from '../_lib/actions'

interface BrandContextValue {
  brand: BrandId
  config: (typeof BRANDS)[BrandId]
  statuses: Record<BrandId, BrandStatus>
  /** true enquanto a troca de marca está em voo (cookie sendo gravado + refresh do server). */
  switching: boolean
  switchBrand: (brand: BrandId) => void
}

const BrandContext = createContext<BrandContextValue | undefined>(undefined)

export function BrandProvider({
  initialBrand,
  statuses,
  children,
}: {
  initialBrand: BrandId
  statuses: Record<BrandId, BrandStatus>
  children: ReactNode
}) {
  const router = useRouter()
  const [brand, setBrand] = useState<BrandId>(initialBrand)
  const [isPending, startTransition] = useTransition()

  const switchBrand = (next: BrandId) => {
    if (next === brand) return
    startTransition(async () => {
      // Ordem importa: só troca o `brand` visível (e, com ele, o que as
      // telas buscam) DEPOIS que o cookie de servidor foi gravado. Trocar
      // antes cria uma corrida — a tela dispara o fetch pra nova marca
      // enquanto o servidor ainda lê o cookie antigo, e o resultado (dados
      // da marca ERRADA) fica preso na tela porque o efeito não roda de
      // novo (a dependência `brand` já "mudou" pro valor certo).
      await setAdminBrand(next)
      setBrand(next)
      router.refresh()
    })
  }

  const value = useMemo<BrandContextValue>(
    () => ({ brand, config: BRANDS[brand], statuses, switching: isPending, switchBrand }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [brand, statuses, isPending]
  )

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
}

export function useBrand() {
  const ctx = useContext(BrandContext)
  if (!ctx) throw new Error('useBrand precisa estar dentro de <BrandProvider>')
  return ctx
}
