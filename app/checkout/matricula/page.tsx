import { Suspense } from 'react'
import Skeleton from '@/app/components/atoms/Skeleton'
import MatriculaCheckoutClient from './MatriculaCheckoutClient'
import { TAXA_MATRICULA_COGNA_CENTAVOS } from '@/app/lib/checkout/taxa-cogna'

// Dinâmica de propósito: o formulário depende de query params da oferta e não
// deve ser servido de cache estático.
export const dynamic = 'force-dynamic'

export default function MatriculaPage() {
  // A taxa é resolvida NO SERVIDOR e desce por prop: `TAXA_MATRICULA_COGNA_CENTAVOS`
  // vem de env var sem NEXT_PUBLIC_, então importá-la no componente client
  // exibiria o default mesmo com a env configurada — a tela mostraria um valor
  // diferente do que /api/checkout/matricula/charge cobra de verdade.
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      }
    >
      <MatriculaCheckoutClient taxaEmCentavos={TAXA_MATRICULA_COGNA_CENTAVOS} />
    </Suspense>
  )
}
