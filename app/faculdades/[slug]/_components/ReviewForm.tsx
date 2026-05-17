'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { Star, Loader2, CheckCircle2, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react'

interface ReviewFormProps {
  institutionSlug: string
  institutionName: string
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

export function ReviewForm({ institutionSlug, institutionName }: ReviewFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [recommends, setRecommends] = useState<boolean | null>(null)
  const [body, setBody] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return
    const tryRender = () => {
      if (!window.turnstile || !turnstileRef.current || widgetIdRef.current) return
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token) => setTurnstileToken(token),
        'expired-callback': () => setTurnstileToken(''),
        'error-callback': () => setTurnstileToken(''),
      })
    }
    tryRender()
    const interval = setInterval(tryRender, 250)
    return () => clearInterval(interval)
  }, [])

  const canSubmit =
    !submitting &&
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    rating >= 1 &&
    recommends !== null &&
    body.trim().length >= 30 &&
    (turnstileToken || !TURNSTILE_SITE_KEY)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionSlug,
          authorName: name,
          authorEmail: email,
          rating,
          recommends,
          body,
          turnstileToken,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Erro ao enviar avaliação')
        if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current)
        setTurnstileToken('')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Erro de rede')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle2 className="mx-auto text-green-600 mb-3" size={32} />
        <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">
          Avaliação enviada
        </h3>
        <p className="text-sm text-gray-700">
          Sua avaliação foi recebida e está aguardando moderação. Em breve
          aparece publicamente nesta página — só rejeitamos spam, abuso ou
          dados pessoais expostos.
        </p>
      </div>
    )
  }

  return (
    <>
      {TURNSTILE_SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="lazyOnload"
        />
      )}

      <form onSubmit={submit} className="space-y-4">
        <h3 className="font-display text-xl font-semibold text-ink-900">
          Avalie a {institutionName}
        </h3>
        <p className="text-sm text-ink-700">
          Sua opinião ajuda outros candidatos a escolher. Mostramos avaliações positivas e
          negativas — a faculdade pode responder. Email não aparece publicamente.
        </p>

        <div>
          <label className="block text-sm font-medium text-ink-900 mb-2">
            Sua nota
          </label>
          <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
            {Array.from({ length: 5 }).map((_, i) => {
              const v = i + 1
              const active = (hoverRating || rating) >= v
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setRating(v)}
                  onMouseEnter={() => setHoverRating(v)}
                  className="p-1"
                  aria-label={`${v} estrelas`}
                >
                  <Star
                    size={28}
                    className={active ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}
                  />
                </button>
              )
            })}
            {rating > 0 && (
              <span className="ml-2 self-center font-mono text-sm text-ink-700">
                {rating}/5
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-900 mb-2">
            Você recomenda essa faculdade?
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRecommends(true)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium border ${
                recommends === true
                  ? 'bg-green-50 border-green-300 text-green-800'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ThumbsUp size={14} /> Sim
            </button>
            <button
              type="button"
              onClick={() => setRecommends(false)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium border ${
                recommends === false
                  ? 'bg-red-50 border-red-300 text-red-800'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ThumbsDown size={14} /> Não
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="review-body" className="block text-sm font-medium text-ink-900 mb-2">
            Conte sua experiência (mín. 30 caracteres)
          </label>
          <textarea
            id="review-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
            rows={5}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-bolsa-secondary focus:border-transparent"
            placeholder="O que foi bom, o que poderia melhorar, como foi o atendimento, professores, infraestrutura..."
            required
          />
          <p className="mt-1 text-xs text-ink-500 font-mono num-tabular">
            {body.trim().length}/2000
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="review-name" className="block text-sm font-medium text-ink-900 mb-2">
              Seu nome
            </label>
            <input
              id="review-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-bolsa-secondary focus:border-transparent"
              required
            />
          </div>
          <div>
            <label htmlFor="review-email" className="block text-sm font-medium text-ink-900 mb-2">
              Seu email (não aparece publicamente)
            </label>
            <input
              id="review-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-bolsa-secondary focus:border-transparent"
              required
            />
          </div>
        </div>

        <div ref={turnstileRef} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-md p-3 flex items-center gap-2">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-bolsa-secondary text-white text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          Enviar avaliação
        </button>
      </form>
    </>
  )
}
