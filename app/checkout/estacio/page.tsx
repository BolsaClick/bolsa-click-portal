import { Metadata } from 'next'
import { Suspense } from 'react'
import EstacioCheckoutClient from './EstacioCheckoutClient'
import { TAXA_MATRICULA_ESTACIO_CENTAVOS } from '@/app/lib/checkout/taxa-estacio'

export const metadata: Metadata = {
  title: 'Inscrição',
  robots: 'noindex, nofollow',
}

// Dinâmica de propósito: o formulário depende de query params da oferta e não
// deve ser servido de cache estático.
export const dynamic = 'force-dynamic'

export default function EstacioCheckoutPage() {
  // A taxa é resolvida NO SERVIDOR e desce por prop: `TAXA_MATRICULA_ESTACIO_CENTAVOS`
  // vem de env var sem NEXT_PUBLIC_, então importá-la num componente client
  // exibiria o default mesmo quando a env estivesse configurada — a tela
  // mostraria um valor diferente do que o /api/athena-checkout/charge cobra.
  return (
    <Suspense fallback={<div className="pb-10 pt-24 text-center text-gray-500">Carregando...</div>}>
      <EstacioCheckoutClient taxaEmCentavos={TAXA_MATRICULA_ESTACIO_CENTAVOS} />
    </Suspense>
  )
}
