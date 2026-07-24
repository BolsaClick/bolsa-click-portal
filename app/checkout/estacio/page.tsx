import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import EstacioCheckoutClient from './EstacioCheckoutClient'
import Mascot from '@/app/components/v2/mascot/Mascot'
import { isServerFlagEnabled } from '@/app/lib/analytics/server-flags'

export const metadata: Metadata = {
  title: 'Inscrição',
  robots: 'noindex, nofollow',
}

// Sem isso a página é prerenderizada estaticamente no build — a checagem da
// flag roda em build time (sem contexto real de request/usuário), sempre cai
// no fallback `false`, e fica CONGELADA como indisponível pra sempre, mesmo
// com a flag em 100% em produção. Mesmo padrão já usado em
// app/(default)/curso/resultado/page.tsx pelo mesmo motivo.
export const dynamic = 'force-dynamic'

/**
 * Mesmo kill switch de `searchAthenaOffers` (flag `estacio_enabled`): a busca some
 * da listagem, mas sem checar aqui também a página do formulário continuava
 * acessível por link direto (antigo/indexado) mesmo com a Estácio escondida.
 */
export default async function EstacioCheckoutPage() {
  const estacioEnabled = await isServerFlagEnabled('estacio_enabled', false)

  if (!estacioEnabled) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 pt-20 text-center">
        <Mascot pose="surpreso" size={120} alt="Bob, o mascote do Bolsa Click, surpreso" />
        <h1 className="font-display text-2xl text-ink-900">
          Inscrições Estácio temporariamente indisponíveis
        </h1>
        <p className="max-w-md text-sm text-ink-500">
          Estamos com essa opção pausada no momento. Enquanto isso, dá uma olhada nas outras
          bolsas disponíveis no Bolsa Click.
        </p>
        <Link
          href="/curso/resultado"
          className="mt-2 inline-flex items-center justify-center rounded-full bg-bolsa-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-bolsa-primary/90"
        >
          Ver outras bolsas
        </Link>
      </div>
    )
  }

  return (
    <Suspense fallback={<div className="pb-10 pt-24 text-center text-gray-500">Carregando...</div>}>
      <EstacioCheckoutClient />
    </Suspense>
  )
}
