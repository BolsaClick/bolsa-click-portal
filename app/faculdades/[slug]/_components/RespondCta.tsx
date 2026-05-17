'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { Loader2, MessageSquare, CheckCircle2, X } from 'lucide-react'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

interface RespondCtaProps {
  reviewId: string
  institutionName: string
}

export function RespondCta({ reviewId, institutionName }: RespondCtaProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!open || !TURNSTILE_SITE_KEY) return
    const tryRender = () => {
      if (!window.turnstile || !turnstileRef.current || widgetIdRef.current) return
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (t) => setTurnstileToken(t),
        'expired-callback': () => setTurnstileToken(''),
        'error-callback': () => setTurnstileToken(''),
      })
    }
    tryRender()
    const interval = setInterval(tryRender, 250)
    return () => clearInterval(interval)
  }, [open])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || (!turnstileToken && TURNSTILE_SITE_KEY)) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/reviews/${reviewId}/respond/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Erro ao solicitar')
      } else {
        setSent(true)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-ink-500 hover:text-ink-900"
      >
        <MessageSquare size={12} />
        Sou da {institutionName} e quero responder
      </button>
    )
  }

  return (
    <div className="mt-4 bg-paper border border-hairline rounded-md p-4">
      {TURNSTILE_SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="lazyOnload"
        />
      )}

      {sent ? (
        <div className="flex items-start gap-2 text-sm text-ink-800">
          <CheckCircle2 size={16} className="text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Pedido enviado.</p>
            <p className="text-xs text-ink-500 mt-0.5">
              Se esse email estiver cadastrado como autorizado para responder pela{' '}
              {institutionName}, enviaremos um link de acesso. Verifique a caixa de
              entrada e spam.
            </p>
          </div>
          <button
            onClick={() => {
              setOpen(false)
              setSent(false)
              setEmail('')
              setTurnstileToken('')
            }}
            className="ml-auto text-ink-400 hover:text-ink-900"
            aria-label="Fechar"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-ink-800 font-medium">
                Responder pela {institutionName}
              </p>
              <p className="text-xs text-ink-500 mt-0.5">
                Informe um email institucional cadastrado como autorizado. Enviamos um
                link único pra você acessar o formulário de resposta.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-ink-400 hover:text-ink-900"
              aria-label="Fechar"
            >
              <X size={14} />
            </button>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@faculdade.com.br"
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-bolsa-secondary focus:border-transparent bg-white"
            required
          />
          <div ref={turnstileRef} />
          {error && <p className="text-xs text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !email || (!turnstileToken && !!TURNSTILE_SITE_KEY)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bolsa-secondary text-white text-xs font-medium rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {submitting && <Loader2 size={12} className="animate-spin" />}
            Enviar link
          </button>
        </form>
      )}
    </div>
  )
}
