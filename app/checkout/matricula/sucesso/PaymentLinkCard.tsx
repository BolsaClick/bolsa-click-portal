'use client'

import { useEffect, useRef, useState } from 'react'
import { CreditCard, Loader2, QrCode, ShieldCheck } from 'lucide-react'

/**
 * Passo 7 da integração com a Cogna: apresentar o pagamento na tela de sucesso.
 *
 * Até 2026-08-24 o candidato terminava a inscrição e caía aqui sem NENHUM
 * caminho de pagamento — e matrícula só vira receita quando é paga. Este card
 * é a metade que faltava do funil.
 *
 * O link abre em nova aba em vez de iframe: a Cogna autorizou o embed
 * comercialmente, mas o `pay.anhanguera.com` responde com
 * `Content-Security-Policy: frame-ancestors 'self'`, que bloqueia. Quando eles
 * liberarem nosso domínio, trocar o botão por um <iframe> aqui é suficiente.
 */

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; url: string }
  | { kind: 'already_paid' }
  | { kind: 'unavailable' }

/** Espera crescente: o businessKey é gerado pela Cogna depois da inscrição. */
const RETRY_DELAYS_MS = [1_500, 3_000, 5_000, 8_000]

export default function PaymentLinkCard({
  inscriptionId,
  onEvent,
}: {
  inscriptionId: string
  onEvent?: (name: string, props?: Record<string, string | number | boolean | null | undefined>) => void
}) {
  const [state, setState] = useState<State>({ kind: 'loading' })
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  // Sem useCallback/ref-guard: um efeito simples, atrelado só ao id, com
  // cancelamento. Em dev o StrictMode monta duas vezes e dispara duas
  // requisições — inofensivo (a chamada é idempotente do lado da Cogna) e
  // garante que quem escreve o estado é sempre a instância montada.
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
            setState({ kind: 'ready', url: data.checkoutUrl })
            onEventRef.current?.('payment_link_ready', { attempt })
            return
          }
          if (data?.status === 'already_paid') {
            setState({ kind: 'already_paid' })
            onEventRef.current?.('payment_link_already_paid')
            return
          }
          // 202: a chave ainda não foi gerada pela Cogna. Vale repetir.
        } catch {
          // rede instável: cai no retry
        }

        const delay = RETRY_DELAYS_MS[attempt]
        if (delay === undefined) break
        await new Promise((r) => setTimeout(r, delay))
      }

      if (cancelled) return
      setState({ kind: 'unavailable' })
      onEventRef.current?.('payment_link_unavailable')
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [inscriptionId])

  if (state.kind === 'already_paid') {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 shrink-0 text-green-700 mt-0.5" aria-hidden="true" />
        <div className="text-sm">
          <p className="font-medium text-green-900">Pagamento já confirmado</p>
          <p className="text-green-800 mt-0.5">
            Não há nada pendente — sua vaga está garantida.
          </p>
        </div>
      </div>
    )
  }

  if (state.kind === 'unavailable') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-900">
          Estamos preparando seu pagamento
        </p>
        <p className="text-sm text-amber-800 mt-1">
          Assim que ficar pronto enviamos por e-mail e WhatsApp. Sua inscrição já
          está registrada — nada se perde.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border-2 border-bolsa-primary/30 bg-bolsa-primary/[0.04] p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-semibold text-gray-900">Falta só o pagamento</h3>
          <p className="text-sm text-gray-600 mt-1">
            Sua vaga fica garantida quando a taxa é paga. Dá pra pagar por Pix,
            cartão ou boleto.
          </p>
        </div>
        <div className="flex items-center gap-3 text-gray-400" aria-hidden="true">
          <QrCode className="h-5 w-5" />
          <CreditCard className="h-5 w-5" />
        </div>
      </div>

      {state.kind === 'loading' ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>Gerando seu pagamento…</span>
        </div>
      ) : (
        <a
          href={state.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onEvent?.('payment_link_clicked')}
          className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-bolsa-primary px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-bolsa-primary focus-visible:ring-offset-2 sm:w-auto"
        >
          Pagar agora
        </a>
      )}

      <p className="mt-3 text-xs text-gray-500">
        Pagamento processado diretamente pela instituição.
      </p>
    </div>
  )
}
