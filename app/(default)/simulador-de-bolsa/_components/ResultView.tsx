'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, Info, Loader2, MinusCircle, RotateCcw, XCircle } from 'lucide-react'
import type { ElegibilidadeResultado, ProgramaResultado, ProgramaStatus } from '@/app/lib/simulador/eligibility'
import { DISCLAIMER } from '@/app/lib/simulador/eligibility'
import type { SimuladorOferta } from '@/app/lib/simulador/offers'
import { LeadGate } from './LeadGate'

interface ResultViewProps {
  elegibilidade: ElegibilidadeResultado
  cursoLabel: string
  ofertas: SimuladorOferta[]
  ofertasLoading: boolean
  leadSubmitted: boolean
  onLeadSubmit: (data: { name: string; email: string; phone: string }) => Promise<void>
  onRestart: () => void
}

const STATUS_META: Record<
  ProgramaStatus,
  { label: string; Icon: typeof CheckCircle2; badge: string; iconClass: string }
> = {
  provavel: {
    label: 'Provável',
    Icon: CheckCircle2,
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconClass: 'text-emerald-600',
  },
  talvez: {
    label: 'Talvez',
    Icon: MinusCircle,
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    iconClass: 'text-amber-500',
  },
  nao: {
    label: 'Não elegível',
    Icon: XCircle,
    badge: 'bg-ink-100 text-ink-500 border-ink-300/40',
    iconClass: 'text-ink-400',
  },
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function ProgramaCard({ p }: { p: ProgramaResultado }) {
  const meta = STATUS_META[p.status]
  const { Icon } = meta
  return (
    <li
      className={`bg-white border rounded-lg p-4 md:p-5 ${
        p.status === 'provavel' ? 'border-emerald-200' : 'border-hairline'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-2.5">
          <Icon size={18} className={`mt-0.5 shrink-0 ${meta.iconClass}`} />
          <h4 className="font-display text-base md:text-lg font-semibold text-ink-900 leading-tight">
            {p.nome}
          </h4>
        </div>
        <span
          className={`shrink-0 font-mono text-[10px] tracking-[0.14em] uppercase px-2 py-0.5 rounded-full border ${meta.badge}`}
        >
          {meta.label}
        </span>
      </div>
      <p className="text-sm text-ink-700 leading-relaxed mb-3">{p.resumo}</p>
      <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-500 mb-3">
        {p.criterio}
      </p>
      <Link
        href={p.href}
        className="inline-flex items-center gap-1 text-sm text-bolsa-secondary hover:underline"
      >
        Entender {p.nome.split('—')[0].trim()} <ArrowRight size={13} />
      </Link>
    </li>
  )
}

function OfertaCard({ o }: { o: SimuladorOferta }) {
  return (
    <li className="bg-white border border-hairline rounded-lg p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
      <div className="min-w-0 flex-1">
        <h4 className="font-display text-base font-semibold text-ink-900 leading-tight truncate">
          {o.name}
        </h4>
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-ink-500 mt-1">
          {[o.brand, o.modality, [o.city, o.state].filter(Boolean).join(' · ')]
            .filter(Boolean)
            .join('  •  ')}
        </p>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        {o.discountPct > 0 && (
          <span className="font-mono text-[11px] tracking-[0.1em] uppercase bg-bolsa-secondary/10 text-bolsa-secondary px-2 py-1 rounded-md">
            -{o.discountPct}%
          </span>
        )}
        <div className="text-right">
          {o.maxPrice > o.minPrice && (
            <p className="text-xs text-ink-500 line-through leading-none">
              {formatBRL(o.maxPrice)}
            </p>
          )}
          <p className="font-display text-lg font-semibold text-ink-900 leading-tight">
            {formatBRL(o.minPrice)}
            <span className="text-xs font-normal text-ink-500">/mês</span>
          </p>
        </div>
      </div>
    </li>
  )
}

export function ResultView({
  elegibilidade,
  cursoLabel,
  ofertas,
  ofertasLoading,
  leadSubmitted,
  onLeadSubmit,
  onRestart,
}: ResultViewProps) {
  return (
    <div className="space-y-8">
      {/* Veredito de elegibilidade — sempre visível (valor primeiro) */}
      <div className="bg-paper border-l-4 border-bolsa-secondary rounded-r-md p-5 md:p-7">
        <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-bolsa-secondary mb-2">
          Sua simulação
        </p>
        <h2 className="font-display text-xl md:text-2xl font-semibold text-ink-900 leading-snug">
          {elegibilidade.headline}
        </h2>
      </div>

      {/* Programas */}
      <div>
        <h3 className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink-500 mb-3">
          Programas e bolsas estimados
        </h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {elegibilidade.programas.map((p) => (
            <ProgramaCard key={p.id} p={p} />
          ))}
        </ul>
        <div className="mt-4 flex items-start gap-2 text-xs text-ink-500 leading-relaxed">
          <Info size={14} className="mt-0.5 shrink-0" />
          <p>{DISCLAIMER}</p>
        </div>
      </div>

      {/* Ofertas reais — gateadas por lead */}
      <div>
        <h3 className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink-500 mb-3">
          Ofertas reais {cursoLabel ? `de ${cursoLabel}` : ''}
        </h3>

        {leadSubmitted ? (
          ofertasLoading ? (
            <div className="flex items-center gap-2 text-ink-500 text-sm py-8 justify-center">
              <Loader2 size={16} className="animate-spin" /> Buscando ofertas reais…
            </div>
          ) : ofertas.length > 0 ? (
            <>
              <ul className="space-y-2.5">
                {ofertas.map((o, i) => (
                  <OfertaCard key={`${o.name}-${o.brand}-${i}`} o={o} />
                ))}
              </ul>
              <Link
                href={`/curso/resultado?c=${encodeURIComponent(cursoLabel)}`}
                className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 bg-bolsa-secondary text-white text-sm font-medium rounded-md hover:opacity-90"
              >
                Ver todas as ofertas e se matricular <ArrowRight size={14} />
              </Link>
            </>
          ) : (
            <p className="text-sm text-ink-700 bg-paper border border-hairline rounded-lg p-5">
              Não encontramos ofertas ativas com esses filtros agora. Tente outra
              modalidade ou{' '}
              <Link href="/bolsas-de-estudo" className="text-bolsa-secondary hover:underline">
                explore o catálogo completo
              </Link>
              .
            </p>
          )
        ) : (
          <LeadGate onSubmit={onLeadSubmit} ofertasCount={ofertasLoading ? 0 : ofertas.length} />
        )}
      </div>

      <button
        onClick={onRestart}
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
      >
        <RotateCcw size={14} /> Refazer simulação
      </button>
    </div>
  )
}
