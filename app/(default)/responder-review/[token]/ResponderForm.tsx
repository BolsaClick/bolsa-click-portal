'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface ResponderFormProps {
  reviewId: string
  token: string
}

export function ResponderForm({ reviewId, token }: ResponderFormProps) {
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (body.trim().length < 20) {
      setError('Escreva pelo menos 20 caracteres')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/reviews/${reviewId}/respond/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, body }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Erro ao enviar resposta')
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
      <div className="bg-green-50 border border-green-200 rounded-md p-5 flex items-start gap-3">
        <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={20} />
        <div>
          <h2 className="font-display text-lg font-semibold text-ink-900 mb-1">
            Resposta publicada
          </h2>
          <p className="text-sm text-ink-700">
            Sua resposta já está visível na página da faculdade. O link de acesso foi
            consumido — para responder outra avaliação, solicite um novo link pelo
            botão de resposta na própria página da faculdade.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label htmlFor="responder-body" className="block text-sm font-medium text-ink-900">
        Sua resposta
      </label>
      <textarea
        id="responder-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={6}
        maxLength={2000}
        placeholder="Agradeça o feedback, esclareça pontos, conte o que a faculdade está fazendo a respeito..."
        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-bolsa-secondary focus:border-transparent bg-white"
        required
      />
      <p className="text-xs text-ink-500 font-mono num-tabular">{body.trim().length}/2000</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-md p-3 flex items-center gap-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-bolsa-secondary text-white text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50"
      >
        {submitting && <Loader2 size={14} className="animate-spin" />}
        Publicar resposta
      </button>
    </form>
  )
}
