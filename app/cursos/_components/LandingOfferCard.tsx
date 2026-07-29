'use client'

import Image from 'next/image'
import { useState } from 'react'
import { MapPin, Star, Clock } from 'lucide-react'
import { Course } from '@/app/interface/course'
import { getBrandLogo } from '@/app/lib/brand-logos'
import {
  courseNeedsShiftSelection,
  shiftLabel,
} from '@/app/lib/checkout/course-destination'
import { useCourseSelection } from '@/app/lib/hooks/useCourseSelection'

const modalityLabel = (m: string) => {
  const upper = (m || '').toUpperCase()
  if (upper === 'EAD') return 'EAD'
  if (upper === 'SEMIPRESENCIAL') return 'Semipresencial'
  if (upper === 'PRESENCIAL') return 'Presencial'
  return m
}

const formatPrice = (n: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

interface LandingOfferCardProps {
  offer: Course
  /** Título exibido no card (nome completo do curso da landing). */
  courseTitle: string
  /** Nota MEC da marca (1-5). Sem o dado, o selo não aparece. */
  mecRating?: number
  /** Texto de localidade quando a oferta não traz cidade/UF. */
  locationFallback?: string
  /** Propriedades extras de tracking da superfície (page_type, course_slug, city…). */
  trackingProps?: Record<string, string | number | boolean | null | undefined>
}

/**
 * Card de oferta das landings de SEO (/cursos/[slug] e /cursos/[slug]/[city]).
 *
 * Antes ele levava a pessoa pra /curso/resultado DESCARTANDO a oferta clicada
 * (instituição, unidade, preço, turno) — ela caía numa lista genérica e tinha
 * que reencontrar e reclicar o que já tinha escolhido. Era o maior vazamento
 * único do funil: 348 course_viewed → 66 course_selected em 13 dias.
 *
 * Agora o clique vai DIRETO pro checkout da oferta clicada, pelo mesmo
 * useCourseSelection do card de resultados (mesmo destino, mesma guarda de
 * turno, mesmo tracking — só a apresentação é própria da landing).
 */
export default function LandingOfferCard({
  offer,
  courseTitle,
  mecRating,
  locationFallback,
  trackingProps,
}: LandingOfferCardProps) {
  const { selectCourse } = useCourseSelection('landing_seo')
  const [selectedShift, setSelectedShift] = useState('')

  const hasPrice = offer.minPrice && offer.minPrice > 0
  const brandLogo = getBrandLogo(offer.brand)
  // ~10% das ofertas das landings (19,6% das de graduação, medido 29/07/2026):
  // sem escolher turno o checkout Cogna não sabe em qual turma inscrever.
  const needsShift = courseNeedsShiftSelection(offer)
  const blocked = needsShift && !selectedShift

  const handleClick = () => {
    void selectCourse(offer, { selectedShift, extraProps: trackingProps })
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        // Ignora cliques no seletor de turno (e em qualquer controle interno).
        if ((e.target as HTMLElement).closest('select, button, a, input, label')) return
        handleClick()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      className="card-lift group flex flex-col h-full w-full cursor-pointer text-left bg-white border border-hairline rounded-2xl p-5 md:p-6 hover:shadow-[0_20px_50px_-25px_rgba(11,31,60,0.25)] hover:border-ink-300"
    >
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="h-9 flex items-center min-w-0">
          {brandLogo ? (
            <Image
              src={brandLogo}
              alt={offer.brand || 'Faculdade Parceira'}
              width={120}
              height={36}
              className="h-9 w-auto object-contain"
              unoptimized
            />
          ) : (
            <span className="text-[14px] font-bold text-ink-900 line-clamp-2 leading-tight">
              {offer.brand || 'Faculdade Parceira'}
            </span>
          )}
        </div>
        <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-bolsa-primary/5 text-bolsa-primary text-[11px] font-bold tracking-wide uppercase">
          {modalityLabel(offer.modality)}
        </span>
      </div>

      {mecRating != null && (
        <div
          className="-mt-3 mb-4 inline-flex items-center gap-1.5"
          title={`Nota MEC: ${mecRating} de 5`}
        >
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">
            MEC
          </span>
          <span className="inline-flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={11}
                className={
                  i <= mecRating
                    ? 'fill-bolsa-secondary text-bolsa-secondary'
                    : 'text-ink-300'
                }
              />
            ))}
          </span>
        </div>
      )}

      <h3 className="text-[17px] font-bold text-ink-900 leading-snug mb-3 group-hover:text-bolsa-secondary transition-colors line-clamp-2 min-h-[2.6em]">
        {courseTitle}
      </h3>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-500 mb-5">
        <span className="inline-flex items-center gap-1">
          <MapPin size={14} />
          {offer.unitCity && offer.unitState
            ? `${offer.unitCity} — ${offer.unitState}`
            : locationFallback || 'Várias localidades'}
        </span>
        {offer.unitName && (
          <span className="line-clamp-1">Campus {offer.unitName}</span>
        )}
      </div>

      {/* Seletor de turno — só nas ofertas com mais de um turno possível.
          Sem ele, mandar direto pro checkout trocaria um vazamento por um erro. */}
      {needsShift && offer.shiftOptions && (
        <div className="mb-4">
          <label
            htmlFor={`turno-${offer.id}-${offer.unitId}`}
            className="block font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500 mb-1.5"
          >
            Escolha o turno
          </label>
          <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors ${
              blocked ? 'border-bolsa-secondary/40 bg-bolsa-secondary/5' : 'border-hairline bg-paper'
            }`}
          >
            <Clock size={14} className="flex-shrink-0 text-ink-500" />
            <select
              id={`turno-${offer.id}-${offer.unitId}`}
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full cursor-pointer bg-transparent text-[13px] font-medium text-ink-900 outline-none"
            >
              <option value="" disabled>
                Selecione
              </option>
              {offer.shiftOptions.map((shift) => (
                <option key={shift} value={shift}>
                  {shiftLabel(shift)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="mt-auto border-t border-hairline pt-4 flex items-end justify-between">
        <div>
          {hasPrice ? (
            <>
              <div className="text-[11px] text-ink-500 uppercase tracking-wide font-medium">
                A partir de
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-[13px] text-ink-700 font-medium">R$</span>
                <span className="font-display num-tabular text-3xl font-bold text-bolsa-secondary leading-none">
                  {formatPrice(offer.minPrice)}
                </span>
                <span className="text-[12px] text-ink-500">/mês</span>
              </div>
            </>
          ) : (
            <span className="text-[13px] text-ink-500">Consulte valores</span>
          )}
        </div>
        <span
          aria-hidden="true"
          className={`flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full text-white transition-colors ${
            blocked ? 'bg-ink-300' : 'bg-ink-900 group-hover:bg-bolsa-secondary'
          }`}
        >
          →
        </span>
      </div>

      <p className="mt-3 text-[11px] text-ink-500">
        {blocked ? 'Escolha o turno pra continuar' : 'Inscrição sem taxa — leva ao formulário de matrícula'}
      </p>
    </div>
  )
}
