'use client'

import { useEffect, useState } from 'react'
import { Loader2, ShieldCheck } from 'lucide-react'

/**
 * Resolve o link de pagamento e redireciona pra Cogna. Roda a mesma rota que a
 * tela de sucesso (`/api/checkout/payment-link`), que já tem cache + retry pra
 * corrida do businessKey. Aqui, em vez de mostrar um botão, redireciona sozinho.
 */

type State =
  | { kind: 'loading' }
  | { kind: 'already_paid' }
  | { kind: 'blocked'; message: string }
  | { kind: 'unavailable' }

const RETRY_DELAYS_MS = [1_500, 3_000, 5_000, 8_000]

export default function PagarRedirectClient({ inscriptionId }: { inscriptionId: string }) {
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
        if (cancelled) return
        try {
          const res = await fetch('/api/checkout/payment-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inscriptionId }),
          })
          const data = await res.json().catch(() => null)
          if (cancelled) return

          if (res.ok && data?.status === 'ok' && data.checkoutUrl) {
            // replace: não deixa o "voltar" cair de novo nesta página de espera.
            window.location.replace(data.checkoutUrl)
            return
          }
          if (data?.status === 'already_paid') {
            setState({ kind: 'already_paid' })
            return
          }
          // 502 com mensagem de negócio (ex.: débito em aberto → Vaiqtá):
          // repetir não resolve, e a pessoa precisa da orientação certa.
          if (res.status === 502 && typeof data?.message === 'string') {
            setState({ kind: 'blocked', message: data.message })
            return
          }
          // 202 pending → continua tentando
        } catch {
          // rede instável → retry
        }
        const delay = RETRY_DELAYS_MS[attempt]
        if (delay === undefined) break
        await new Promise((r) => setTimeout(r, delay))
      }
      if (!cancelled) setState({ kind: 'unavailable' })
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [inscriptionId])

  if (state.kind === 'already_paid') {
    return (
      <div className="max-w-sm text-center">
        <ShieldCheck className="h-10 w-10 text-green-600 mx-auto mb-3" aria-hidden="true" />
        <h1 className="text-lg font-semibold text-ink-900">Pagamento já confirmado</h1>
        <p className="text-sm text-ink-600 mt-1">
          Não há nada pendente — sua vaga está garantida.
        </p>
      </div>
    )
  }

  if (state.kind === 'blocked') {
    return (
      <div className="max-w-sm text-center">
        <h1 className="text-lg font-semibold text-ink-900">Não foi possível gerar o pagamento</h1>
        <p className="text-sm text-ink-600 mt-1">{state.message}</p>
      </div>
    )
  }

  if (state.kind === 'unavailable') {
    return (
      <div className="max-w-sm text-center">
        <h1 className="text-lg font-semibold text-ink-900">Estamos preparando seu pagamento</h1>
        <p className="text-sm text-ink-600 mt-1">
          Tente de novo em alguns minutos. Se persistir, fale com a gente pelo WhatsApp.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-sm text-center">
      <Loader2 className="h-8 w-8 text-bolsa-primary animate-spin mx-auto mb-3" aria-hidden="true" />
      <h1 className="text-lg font-semibold text-ink-900">Preparando seu pagamento…</h1>
      <p className="text-sm text-ink-600 mt-1">
        Você será direcionado para a página de pagamento em instantes.
      </p>
    </div>
  )
}
