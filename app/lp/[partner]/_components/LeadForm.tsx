'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { usePostHogTracking } from '@/app/lib/hooks/usePostHogTracking'
import { trackCheckoutViewed, trackCheckoutIdentified, trackCheckoutSubmitted } from '@/app/lib/analytics/checkout-funnel'
import { trackFbqDual } from '@/app/lib/analytics/fbq'
import { trackTikTokDual } from '@/app/lib/analytics/ttq'
import { pushDataLayerEvent } from '@/app/lib/analytics/gtag'
import Mascot from '@/app/components/v2/mascot/Mascot'
import { getVisitorId } from '../../_shared/visitor-id'

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

// Estácio já sai pelo trilho de checkout por inscrição (EstacioCheckoutClient);
// as demais marcas hoje passam pela matrícula Cogna. O lead do ingressa é
// anterior aos dois, mas o `flow` precisa apontar pro funil que a pessoa
// eventualmente vai completar — é isso que torna o funil comparável ao do
// bolsaclick.com.br (mesmo vocabulário de app/lib/analytics/checkout-funnel.ts).
function flowFor(partner: string): 'estacio' | 'matricula' {
  return partner === 'estacio' ? 'estacio' : 'matricula'
}

export function LeadForm({ partner, partnerName, courses, accentColor = '#023e73', defaultCurso = '' }: LeadFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [curso, setCurso] = useState(defaultCurso)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [utm, setUtm] = useState<Record<string, string>>({})
  const { trackEvent, setUserProperties, identifyUser } = usePostHogTracking()

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

  // Funil unificado — etapa 1 (mesmo vocabulário do checkout principal).
  // Client-side (posthog-js) só dispara sob consentimento de analytics (ver
  // PostHogProvider) — quase ninguém aceita. Por isso o beacon abaixo espelha
  // a mesma etapa no servidor, sem depender de consentimento nem do SDK do
  // PostHog (ver app/api/ingressa/view/route.ts) — best-effort, nunca bloqueia
  // a página.
  useEffect(() => {
    trackCheckoutViewed(trackEvent, {
      flow: flowFor(partner),
      brand: partnerName,
      courseName: curso || defaultCurso || undefined,
      source: 'ingressa',
    })

    fetch('/api/ingressa/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        partner,
        partnerName,
        courseName: defaultCurso || null,
        // Id estável do navegador: sem ele o servidor inventaria um id por
        // requisição e o funil viewed→submitted nunca conectaria.
        visitorId: getVisitorId(),
      }),
    }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canSubmit =
    !submitting && name.trim().length >= 2 && phone.replace(/\D/g, '').length >= 10

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)

    const cleanPhone = phone.replace(/\D/g, '')

    // Etapa 2 do funil — contato identificável. Promove a pessoa de anônima
    // pra identificada (distinct_id = telefone, único id presente neste
    // fluxo) pra habilitar retargeting de quem não converteu.
    trackCheckoutIdentified(
      trackEvent,
      { flow: flowFor(partner), brand: partnerName, courseName: curso || undefined, source: 'ingressa', name: name.trim(), phone: cleanPhone },
      setUserProperties,
      identifyUser,
    )

    // eventID único compartilhado entre Pixel/TikTok (browser) e CAPI/Events
    // API (server) → dedup, não conta a conversão em dobro.
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
          phone: cleanPhone,
          partner,
          partnerName,
          curso: curso || null,
          utm,
          eventId,
          // Mesmo id da visita: o servidor usa pra fundir a pessoa anônima
          // (checkout_viewed) com a identificada, senão as duas etapas do
          // funil ficam em pessoas diferentes e a conversão não fecha.
          visitorId: getVisitorId(),
        }),
      })

      // Meta Pixel + CAPI (dual, com dedup por eventId — gated por consent de marketing).
      void trackFbqDual('Lead', { content_name: partner, content_category: 'ingressa-landing' }, { phone: cleanPhone }, eventId)

      // TikTok Pixel + Events API (dual — mesmo padrão do checkout principal).
      void trackTikTokDual('SubmitForm', { content_name: partner }, { phone: cleanPhone })

      // GA4 ecommerce (dataLayer/GTM) — generate_lead é o evento que a
      // conversão "Lead - Inscricao Estacio" do Google Ads já escuta (ver
      // docs/GOOGLE-TRACKING.md). `brand` fica no payload pra poder segmentar
      // a campanha por marca no GA4/Ads — sem isso o Ads otimiza no escuro.
      pushDataLayerEvent('generate_lead', {
        lead_source: `ingressa-${partner}`,
        brand: partnerName,
        currency: 'BRL',
        value: 0,
        ...(curso ? { course_name: curso } : {}),
      })

      // Etapa 3 do funil — lead enviado.
      trackCheckoutSubmitted(trackEvent, {
        flow: flowFor(partner),
        brand: partnerName,
        courseName: curso || undefined,
        source: 'ingressa',
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
        <Mascot pose="comemorando" size={96} className="mx-auto mb-2" />
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
      <p className="text-[11px] text-ink-500 text-center flex items-center justify-center gap-1">
        <CheckCircle2 size={12} className="text-emerald-600" />
        Grátis e sem compromisso. Ao enviar, você concorda em ser contatado pelo Bolsa Click.
      </p>
    </form>
  )
}
