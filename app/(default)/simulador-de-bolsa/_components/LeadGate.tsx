'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, Lock } from 'lucide-react'

interface LeadGateProps {
  onSubmit: (data: { name: string; email: string; phone: string }) => Promise<void>
  /** Nº de ofertas já encontradas, pra dar prova de valor no CTA. */
  ofertasCount: number
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function LeadGate({ onSubmit, ofertasCount }: LeadGateProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit =
    !submitting &&
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    phone.replace(/\D/g, '').length >= 10

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.replace(/\D/g, ''),
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-paper border border-hairline rounded-lg p-6 md:p-8">
      <div className="flex items-center gap-2 mb-3">
        <Lock className="text-bolsa-secondary" size={20} />
        <h3 className="font-display text-xl font-semibold text-ink-900">
          {ofertasCount > 0
            ? `Encontramos ${ofertasCount} ${ofertasCount === 1 ? 'oferta' : 'ofertas'} com bolsa pra você`
            : 'Veja as ofertas com bolsa pro seu curso'}
        </h3>
      </div>
      <p className="text-ink-700 text-sm mb-5">
        Preencha pra liberar a lista com mensalidades, descontos e faculdades.
        Enviamos as ofertas por email e te avisamos quando aparecer bolsa nova no
        seu curso.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="lead-name" className="block text-xs font-mono uppercase tracking-wider text-ink-500 mb-1">
            Seu nome
          </label>
          <input
            id="lead-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-bolsa-secondary focus:border-transparent"
            required
          />
        </div>
        <div>
          <label htmlFor="lead-email" className="block text-xs font-mono uppercase tracking-wider text-ink-500 mb-1">
            Email
          </label>
          <input
            id="lead-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-bolsa-secondary focus:border-transparent"
            required
          />
        </div>
        <div>
          <label htmlFor="lead-phone" className="block text-xs font-mono uppercase tracking-wider text-ink-500 mb-1">
            WhatsApp
          </label>
          <input
            id="lead-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="(11) 99999-9999"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-bolsa-secondary focus:border-transparent"
            required
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-bolsa-secondary text-white text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-40 mt-2"
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
          Liberar minhas ofertas
        </button>
        <p className="text-[11px] text-ink-500 text-center">
          Sem custo e sem CPF. Você pode descadastrar quando quiser.
        </p>
      </form>
    </div>
  )
}
