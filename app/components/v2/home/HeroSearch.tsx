'use client'

/**
 * Home v2 — busca do hero (protótipo).
 *
 * Visual e validação são reais; a navegação é simulada: em vez de submeter,
 * o form mostra a URL de resultado que seria aberta no site real. A validação
 * do campo obrigatório (curso) é explícita — erro visível + foco no campo,
 * nunca fallback silencioso.
 */

import { Search } from 'lucide-react'
import { useRef, useState } from 'react'

import ReactiveCta from '../ui/ReactiveCta'

const LEVELS = [
  { value: 'GRADUACAO', label: 'Graduação' },
  { value: 'POS_GRADUACAO', label: 'Pós-graduação' },
  { value: 'CURSO_PROFISSIONALIZANTE', label: 'Profissionalizante' },
] as const

const MODALITIES = [
  { value: '', label: 'Todas as modalidades' },
  { value: 'EAD', label: 'EAD (100% online)' },
  { value: 'SEMIPRESENCIAL', label: 'Semipresencial' },
  { value: 'PRESENCIAL', label: 'Presencial' },
] as const

const fieldClass =
  'h-12 w-full rounded-lg border border-ink-100 bg-white px-3 text-[14px] text-ink-900 placeholder:text-ink-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolsa-primary'

export default function HeroSearch() {
  const [level, setLevel] = useState<string>('GRADUACAO')
  const [course, setCourse] = useState('')
  const [city, setCity] = useState('')
  const [modality, setModality] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const courseRef = useRef<HTMLInputElement>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Validação obrigatória e explícita: sem curso, sem busca.
    if (!course.trim()) {
      setPreviewUrl(null)
      setError('Digite o curso que você procura — é o único campo obrigatório.')
      courseRef.current?.focus()
      return
    }

    setError(null)
    const params = new URLSearchParams({ courseName: course.trim(), academicLevel: level })
    if (city.trim()) params.set('city', city.trim())
    if (modality) params.set('modality', modality)
    // Protótipo: exibe o destino em vez de navegar (o funil real não é tocado).
    setPreviewUrl(`/curso/resultado?${params.toString()}`)
  }

  return (
    <div id="busca" className="overflow-hidden rounded-2xl bg-white shadow-[0_24px_48px_-24px_rgba(1,21,37,0.5)]">
      {/* faixa cupom do card de busca */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-ink-300/70 bg-paper-warm px-5 py-3">
        <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-ink-700">
          Bolsas de até 80%
        </p>
        <span className="inline-flex items-center gap-1.5 bg-bolsa-secondary py-1 pl-3.5 pr-2.5 text-[12px] font-bold text-white [clip-path:polygon(9px_0,100%_0,100%_100%,9px_100%,0_50%)]">
          <span className="h-1.5 w-1.5 rounded-full bg-white/90" aria-hidden />
          a partir de R$ 99/mês
        </span>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="hero-level" className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-500">
            Nível
          </label>
          <select
            id="hero-level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className={fieldClass}
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="hero-modality" className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-500">
            Modalidade
          </label>
          <select
            id="hero-modality"
            value={modality}
            onChange={(e) => setModality(e.target.value)}
            className={fieldClass}
          >
            {MODALITIES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="hero-course" className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-500">
            Curso <span className="normal-case text-bolsa-primary">(obrigatório)</span>
          </label>
          <input
            ref={courseRef}
            id="hero-course"
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="Ex.: Administração, Enfermagem, Pedagogia…"
            aria-required="true"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'hero-course-error' : undefined}
            className={`${fieldClass} ${error ? 'border-red-600 focus-visible:ring-red-600' : ''}`}
          />
          {error && (
            <p id="hero-course-error" role="alert" className="text-[13px] font-semibold text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="hero-city" className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-500">
            Cidade <span className="normal-case text-ink-300">(opcional pra EAD)</span>
          </label>
          <input
            id="hero-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ex.: São Paulo"
            className={fieldClass}
          />
        </div>

        <ReactiveCta as="button" type="submit" fullWidth className="mt-1 sm:col-span-2">
          <Search size={18} aria-hidden />
          Buscar bolsas
        </ReactiveCta>

        <p aria-live="polite" className="text-[12px] leading-snug text-ink-500 sm:col-span-2">
          {previewUrl ? (
            <>
              Protótipo — no site real esta busca abriria:{' '}
              <code className="break-all rounded bg-ink-100/60 px-1 py-0.5 font-mono text-[11px]">{previewUrl}</code>
            </>
          ) : (
            'Buscar é grátis e não pede cadastro.'
          )}
        </p>
      </form>
    </div>
  )
}
