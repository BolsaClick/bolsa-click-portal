'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

interface LeadFormProps {
  partner: string
  partnerName: string
  courses: string[]
  accentColor?: string
  /** Curso pré-selecionado (landing de curso). Deve existir em `courses`. */
  defaultCurso?: string
}

function formatPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid']

export function LeadForm({ partner, partnerName, courses, accentColor = '#023e73', defaultCurso = '' }: LeadFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [curso, setCurso] = useState(defaultCurso)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [utm, setUtm] = useState<Record<string, string>>({})

  // Captura UTMs/click-ids da URL (tráfego pago) uma vez no mount.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const found: Record<string, string> = {}
    for (const k of UTM_KEYS) {
      const v = sp.get(k)
      if (v) found[k] = v
    }
    setUtm(found)
  }, [])

  const canSubmit =
    !submitting && name.trim().length >= 2 && phone.replace(/\D/g, '').length >= 10

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    // eventID único compartilhado entre o Pixel (browser) e o CAPI (server) →
    // o Meta deduplica o Lead (não conta a conversão em dobro).
    const eventId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `ing_${Date.now()}_${Math.round(Math.random() * 1e9)}`
    try {
      await fetch('/api/ingressa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.replace(/\D/g, ''),
          partner,
          partnerName,
          curso: curso || null,
          utm,
          eventId,
        }),
      })
      // Pixel do browser com o MESMO eventID → dedup com o CAPI server.
      const w = window as unknown as {
        fbq?: (...a: unknown[]) => void
        dataLayer?: Record<string, unknown>[]
      }
      if (typeof w.fbq === 'function') {
        w.fbq('track', 'Lead', { content_name: partner }, { eventID: eventId })
      }
      // GA4 (dataLayer/GTM) — mídia paga por parceiro era invisível no Google.
      // Push direto (sem helper) porque a LP não importa o bundle de analytics.
      w.dataLayer = w.dataLayer ?? []
      w.dataLayer.push({
        event: 'generate_lead',
        lead_source: `ingressa-${partner}`,
        ...(curso ? { course_name: curso } : {}),
      })
    } catch {
      // best-effort: mostra sucesso mesmo se o registro falhar (não travar o lead)
    } finally {
      setDone(true)
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
        <CheckCircle2 className="mx-auto text-emerald-600 mb-3" size={32} />
        <h3 className="font-display text-xl font-semibold text-ink-900 mb-1">Recebemos seu contato!</h3>
        <p className="text-ink-700 text-sm">
          Em breve nosso time entra em contato pra garantir sua bolsa na {partnerName}. Fique de olho no WhatsApp.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-hairline shadow-lg p-6 md:p-7 space-y-3">
      <div>
        <label htmlFor="lf-name" className="block text-xs font-mono uppercase tracking-wider text-ink-500 mb-1">
          Seu nome
        </label>
        <input
          id="lf-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          required
          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-bolsa-secondary focus:border-transparent"
        />
      </div>
      <div>
        <label htmlFor="lf-phone" className="block text-xs font-mono uppercase tracking-wider text-ink-500 mb-1">
          WhatsApp
        </label>
        <input
          id="lf-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          placeholder="(11) 99999-9999"
          required
          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-bolsa-secondary focus:border-transparent"
        />
      </div>
      {courses.length > 0 && (
        <div>
          <label htmlFor="lf-curso" className="block text-xs font-mono uppercase tracking-wider text-ink-500 mb-1">
            Curso de interesse <span className="normal-case tracking-normal text-ink-400">(opcional)</span>
          </label>
          <select
            id="lf-curso"
            value={curso}
            onChange={(e) => setCurso(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-bolsa-secondary focus:border-transparent"
          >
            <option value="">Escolher depois</option>
            {courses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}
      <button
        type="submit"
        disabled={!canSubmit}
        style={{ backgroundColor: accentColor }}
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-white text-base font-semibold rounded-md hover:opacity-90 disabled:opacity-40"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
        Quero minha bolsa na {partnerName}
      </button>
      <p className="text-[11px] text-ink-500 text-center">
        Grátis e sem compromisso. Ao enviar, você concorda em ser contatado pelo Bolsa Click.
      </p>
    </form>
  )
}
