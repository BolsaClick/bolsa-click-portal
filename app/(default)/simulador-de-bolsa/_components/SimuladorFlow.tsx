'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, GraduationCap, MapPin, FileText, Wallet, Sparkles } from 'lucide-react'
import { TOP_CURSOS } from '@/app/cursos/_data/cursos'
import { computeElegibilidade, type ElegibilidadeResultado, type SimuladorInput } from '@/app/lib/simulador/eligibility'
import { fetchOfertas, type SimuladorOferta } from '@/app/lib/simulador/offers'
import { MODALIDADES, UFS, type Modalidade } from '@/app/lib/simulador/types'
import { ResultView } from './ResultView'

interface Answers {
  curso: string
  modalidade: Modalidade | ''
  cidade: string
  estado: string
  semEnem: boolean
  enemScore: string
  redacaoZerada: boolean
  rendaFamiliar: number
  pessoas: number
}

const INITIAL: Answers = {
  curso: '',
  modalidade: '',
  cidade: '',
  estado: '',
  semEnem: false,
  enemScore: '',
  redacaoZerada: false,
  rendaFamiliar: 0,
  pessoas: 1,
}

const STEPS = [
  { id: 0, title: 'Curso', Icon: GraduationCap },
  { id: 1, title: 'Localização', Icon: MapPin },
  { id: 2, title: 'ENEM', Icon: FileText },
  { id: 3, title: 'Renda', Icon: Wallet },
]

// Cursos únicos por apiCourseName pro datalist de autocomplete.
const CURSO_OPTIONS = Array.from(
  new Map(TOP_CURSOS.map((c) => [c.apiCourseName, c.name])).entries()
).map(([apiCourseName, name]) => ({ apiCourseName, name }))

export function SimuladorFlow() {
  const [phase, setPhase] = useState<'form' | 'result'>('form')
  const [step, setStep] = useState(0)
  const [a, setA] = useState<Answers>(INITIAL)

  const [elegibilidade, setElegibilidade] = useState<ElegibilidadeResultado | null>(null)
  const [ofertas, setOfertas] = useState<SimuladorOferta[]>([])
  const [ofertasLoading, setOfertasLoading] = useState(false)
  const [leadSubmitted, setLeadSubmitted] = useState(false)

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) =>
    setA((prev) => ({ ...prev, [key]: value }))

  const canAdvance = useMemo(() => {
    switch (step) {
      case 0:
        return a.curso.trim().length >= 2 && a.modalidade !== ''
      case 1:
        return a.estado !== ''
      case 2:
        return a.semEnem || (a.enemScore !== '' && Number(a.enemScore) >= 0 && Number(a.enemScore) <= 1000)
      case 3:
        return a.rendaFamiliar > 0 && a.pessoas >= 1
      default:
        return false
    }
  }, [step, a])

  const handleFinish = () => {
    const input: SimuladorInput = {
      enemScore: a.semEnem ? null : Number(a.enemScore),
      redacaoZerada: a.redacaoZerada,
      rendaFamiliar: a.rendaFamiliar,
      pessoasNaFamilia: a.pessoas,
    }
    setElegibilidade(computeElegibilidade(input))
    setPhase('result')

    // Busca ofertas reais em paralelo — prontas quando o lead liberar.
    setOfertasLoading(true)
    fetchOfertas({
      courseName: a.curso,
      city: a.cidade || undefined,
      state: a.estado || undefined,
      modality: a.modalidade || undefined,
      limit: 8,
    })
      .then(setOfertas)
      .finally(() => setOfertasLoading(false))
  }

  const handleNext = () => {
    if (!canAdvance) return
    if (step === STEPS.length - 1) handleFinish()
    else setStep((s) => s + 1)
  }

  const handleLeadSubmit = async (data: { name: string; email: string; phone: string }) => {
    try {
      await fetch('/api/simulador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          curso: a.curso,
          modalidade: a.modalidade,
          cidade: a.cidade,
          estado: a.estado,
          enemScore: a.semEnem ? null : Number(a.enemScore),
          semEnem: a.semEnem,
          rendaFamiliar: a.rendaFamiliar,
          pessoas: a.pessoas,
          elegibilidade: elegibilidade
            ? {
                headline: elegibilidade.headline,
                rendaPerCapitaSM: elegibilidade.rendaPerCapitaSM,
                programas: elegibilidade.programas.map((p) => ({ id: p.id, status: p.status })),
              }
            : null,
        }),
      })
    } catch (error) {
      console.error('Falha ao registrar lead do simulador:', error)
    } finally {
      // Best-effort: libera as ofertas mesmo se o registro falhar.
      setLeadSubmitted(true)
    }
  }

  const handleRestart = () => {
    setA(INITIAL)
    setStep(0)
    setPhase('form')
    setElegibilidade(null)
    setOfertas([])
    setLeadSubmitted(false)
  }

  if (phase === 'result' && elegibilidade) {
    return (
      <ResultView
        elegibilidade={elegibilidade}
        cursoLabel={a.curso.trim()}
        ofertas={ofertas}
        ofertasLoading={ofertasLoading}
        leadSubmitted={leadSubmitted}
        onLeadSubmit={handleLeadSubmit}
        onRestart={handleRestart}
      />
    )
  }

  const current = STEPS[step]

  return (
    <div className="bg-white border border-hairline rounded-lg overflow-hidden">
      {/* Cabeçalho com passos */}
      <div className="px-5 md:px-8 py-4 border-b border-hairline bg-paper">
        <ul className="flex gap-1.5 mb-3">
          {STEPS.map((s) => (
            <li
              key={s.id}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s.id < step ? 'bg-bolsa-secondary' : s.id === step ? 'bg-bolsa-secondary/50' : 'bg-ink-300/40'
              }`}
              aria-label={`Passo ${s.id + 1}: ${s.title}`}
            />
          ))}
        </ul>
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 inline-flex items-center gap-1.5">
            <current.Icon size={12} /> {current.title}
          </p>
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">
            {step + 1}/{STEPS.length}
          </p>
        </div>
      </div>

      {/* Corpo do passo */}
      <div className="px-5 md:px-8 py-8 md:py-10">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-bolsa-secondary mb-3 inline-flex items-center gap-1.5">
          <Sparkles size={11} /> Passo {step + 1}
        </p>

        {step === 0 && (
          <StepCurso a={a} set={set} />
        )}
        {step === 1 && <StepLocalizacao a={a} set={set} />}
        {step === 2 && <StepEnem a={a} set={set} />}
        {step === 3 && <StepRenda a={a} set={set} />}
      </div>

      {/* Rodapé de navegação */}
      <div className="px-5 md:px-8 py-4 border-t border-hairline bg-paper flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={14} /> Voltar
        </button>
        <button
          onClick={handleNext}
          disabled={!canAdvance}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-bolsa-secondary text-white text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-40"
        >
          {step === STEPS.length - 1 ? 'Ver resultado' : 'Próximo'} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}

type StepProps = {
  a: Answers
  set: <K extends keyof Answers>(key: K, value: Answers[K]) => void
}

const LABEL = 'block text-xs font-mono uppercase tracking-wider text-ink-500 mb-1.5'
const INPUT =
  'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-ink-900 focus:ring-2 focus:ring-bolsa-secondary focus:border-transparent'

function StepCurso({ a, set }: StepProps) {
  return (
    <div className="space-y-6">
      <h3 className="font-display text-xl md:text-2xl font-semibold text-ink-900 leading-snug">
        Qual curso você quer fazer?
      </h3>
      <div>
        <label htmlFor="sim-curso" className={LABEL}>
          Curso
        </label>
        <input
          id="sim-curso"
          list="sim-curso-options"
          value={a.curso}
          onChange={(e) => set('curso', e.target.value)}
          placeholder="Ex: Administração, Enfermagem, Direito…"
          className={INPUT}
          autoComplete="off"
        />
        <datalist id="sim-curso-options">
          {CURSO_OPTIONS.map((c) => (
            <option key={c.apiCourseName} value={c.apiCourseName}>
              {c.name}
            </option>
          ))}
        </datalist>
      </div>
      <div>
        <span className={LABEL}>Modalidade</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {MODALIDADES.map((m) => {
            const selected = a.modalidade === m.value
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => set('modalidade', m.value)}
                className={`px-3 py-2.5 border rounded-md text-sm transition-all ${
                  selected
                    ? 'bg-bolsa-secondary border-bolsa-secondary text-white'
                    : 'bg-white border-hairline text-ink-700 hover:border-bolsa-secondary hover:bg-paper'
                }`}
                aria-pressed={selected}
              >
                {m.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StepLocalizacao({ a, set }: StepProps) {
  return (
    <div className="space-y-6">
      <h3 className="font-display text-xl md:text-2xl font-semibold text-ink-900 leading-snug">
        Onde você quer estudar?
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="sim-cidade" className={LABEL}>
            Cidade <span className="text-ink-400 normal-case tracking-normal">(opcional)</span>
          </label>
          <input
            id="sim-cidade"
            value={a.cidade}
            onChange={(e) => set('cidade', e.target.value)}
            placeholder="Ex: São Paulo"
            className={INPUT}
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="sim-estado" className={LABEL}>
            Estado
          </label>
          <select
            id="sim-estado"
            value={a.estado}
            onChange={(e) => set('estado', e.target.value)}
            className={INPUT}
          >
            <option value="">UF</option>
            {UFS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </div>
      </div>
      {a.modalidade === 'EAD' && (
        <p className="text-xs text-ink-500">
          No EAD a localização ajuda a encontrar o polo mais perto de você.
        </p>
      )}
    </div>
  )
}

function StepEnem({ a, set }: StepProps) {
  return (
    <div className="space-y-6">
      <h3 className="font-display text-xl md:text-2xl font-semibold text-ink-900 leading-snug">
        Qual foi sua nota no ENEM?
      </h3>
      <p className="text-sm text-ink-700 -mt-2">
        A média das 5 áreas (linguagens, humanas, natureza, matemática e redação).
        Usamos pra estimar ProUni, FIES e SISU.
      </p>
      <div>
        <label htmlFor="sim-enem" className={LABEL}>
          Média do ENEM
        </label>
        <input
          id="sim-enem"
          type="number"
          inputMode="numeric"
          min={0}
          max={1000}
          value={a.enemScore}
          disabled={a.semEnem}
          onChange={(e) => set('enemScore', e.target.value)}
          placeholder="Ex: 620"
          className={`${INPUT} disabled:opacity-40`}
        />
      </div>
      <div className="space-y-2">
        <label className="inline-flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
          <input
            type="checkbox"
            checked={a.semEnem}
            onChange={(e) => {
              set('semEnem', e.target.checked)
              if (e.target.checked) set('enemScore', '')
            }}
            className="rounded border-gray-300 text-bolsa-secondary focus:ring-bolsa-secondary"
          />
          Não fiz o ENEM
        </label>
        {!a.semEnem && (
          <label className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
            <input
              type="checkbox"
              checked={a.redacaoZerada}
              onChange={(e) => set('redacaoZerada', e.target.checked)}
              className="rounded border-gray-300 text-bolsa-secondary focus:ring-bolsa-secondary"
            />
            Zerei a redação
          </label>
        )}
      </div>
    </div>
  )
}

function formatMoney(value: number): string {
  return value ? value.toLocaleString('pt-BR') : ''
}

function StepRenda({ a, set }: StepProps) {
  return (
    <div className="space-y-6">
      <h3 className="font-display text-xl md:text-2xl font-semibold text-ink-900 leading-snug">
        Qual a renda da sua família?
      </h3>
      <p className="text-sm text-ink-700 -mt-2">
        A soma da renda bruta mensal de todos que moram com você. Usamos pra estimar
        a renda por pessoa — critério do ProUni e do FIES.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="sim-renda" className={LABEL}>
            Renda mensal da família
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-500">R$</span>
            <input
              id="sim-renda"
              inputMode="numeric"
              value={formatMoney(a.rendaFamiliar)}
              onChange={(e) => set('rendaFamiliar', Number(e.target.value.replace(/\D/g, '')))}
              placeholder="3.000"
              className={`${INPUT} pl-9`}
            />
          </div>
        </div>
        <div>
          <label htmlFor="sim-pessoas" className={LABEL}>
            Pessoas na família
          </label>
          <input
            id="sim-pessoas"
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            value={a.pessoas}
            onChange={(e) => set('pessoas', Math.max(1, Number(e.target.value.replace(/\D/g, '')) || 1))}
            className={INPUT}
          />
        </div>
      </div>
    </div>
  )
}
