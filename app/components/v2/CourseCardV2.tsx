'use client'

/**
 * CourseCard v2 — protótipo de redesign (não integrado ao funil).
 *
 * Hierarquia: instituição -> curso -> modalidade + local -> condição da
 * bolsa -> preço final (+ De/desconto calculado) -> turno -> CTA.
 *
 * Regras de honestidade:
 * - Desconto sempre Math.round((1 - min/max) * 100), só quando max > min.
 * - Nada de nota, avaliação ou escassez inventada. "Nota MEC" é um slot
 *   opcional que só renderiza se o campo existir no payload.
 * - CTA é <a> real; microcopy final depende do fluxo por fornecedor.
 */

import { Building2, Clock, MapPin, MonitorPlay, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import Mascot from './mascot/Mascot'
import styles from './ui/reactive.module.css'

import {
  academicLevelLabel,
  brandLogoSrc,
  computeDiscount,
  degreeLabel,
  formatBRL,
  hasInstallmentPlan,
  modalityLabel,
  parseCourseName,
  shiftLabel,
  titleCase,
  type CourseOffer,
} from './course-offer'

export interface CourseCardV2Props {
  offer: CourseOffer
  /** Destino real do CTA (o funil decide; o card só navega). */
  href: string
  ctaLabel?: string
  /**
   * Disparado no clique do CTA (quando não bloqueado), em paralelo à
   * navegação — nunca a atrasa nem bloqueia (ex.: MascotPop de feedback).
   */
  onCtaClick?: React.MouseEventHandler<HTMLAnchorElement>
}

export default function CourseCardV2({ offer, href, ctaLabel = 'Garantir bolsa', onCtaClick }: CourseCardV2Props) {
  const [selectedShift, setSelectedShift] = useState<string | null>(null)

  const parsed = parseCourseName(offer.name)
  const discount = computeDiscount(offer)
  const installments = hasInstallmentPlan(offer)
  const modality = modalityLabel(offer)
  const isOnline = (offer.commercialModality || offer.modality || '').toUpperCase() === 'EAD'

  const selectableShifts = (offer.shiftOptions ?? []).filter(
    (shift) => shift.toUpperCase() !== 'VIRTUAL',
  )
  const needsShiftChoice = selectableShifts.length > 1
  const ctaBlocked = needsShiftChoice && !selectedShift

  const degree = degreeLabel(offer.academicDegree) ?? parsed.degreeFromName ?? null
  const level = academicLevelLabel(offer.academicLevel)

  const monthlySavings =
    discount !== null && typeof offer.maxPrice === 'number'
      ? offer.maxPrice - offer.minPrice
      : null

  const finalHref = selectedShift
    ? `${href}${href.includes('?') ? '&' : '?'}shift=${encodeURIComponent(selectedShift)}`
    : href

  const locationLine = [
    offer.city ? titleCase(offer.city) : null,
    offer.uf ?? null,
  ]
    .filter(Boolean)
    .join('/')

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-[0_1px_2px_rgba(11,31,60,0.06)] transition-shadow duration-200 hover:shadow-[0_16px_36px_-16px_rgba(2,62,115,0.35)]">
      {/* Instituição + modalidade */}
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <Image
          src={brandLogoSrc(offer.brand)}
          alt={`Logo da instituição ${titleCase(offer.brand)}`}
          width={96}
          height={28}
          className="h-7 w-auto object-contain"
        />
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-ink-100 bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-700">
          {isOnline ? <MonitorPlay size={13} aria-hidden /> : <Building2 size={13} aria-hidden />}
          {modality}
        </span>
      </div>

      {/* Curso */}
      <div className="px-5 pt-3.5">
        <h3 className="min-h-[2.85rem] text-[17px] font-bold leading-snug text-ink-900 line-clamp-2">
          {parsed.title}
        </h3>
        <p className="mt-1 text-[13px] font-medium text-ink-500">
          {[degree, level].filter(Boolean).join(' · ')}
        </p>
      </div>

      {/* Local + duração + slot Nota MEC (só com dado real) */}
      <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-5 text-[13px] text-ink-700">
        {typeof offer.durationInMonths === 'number' && offer.durationInMonths > 0 && (
          <li className="inline-flex items-center gap-1.5">
            <Clock size={14} className="text-ink-300" aria-hidden />
            {offer.durationInMonths} meses
          </li>
        )}
        {locationLine && (
          <li className="inline-flex items-center gap-1.5">
            <MapPin size={14} className="text-ink-300" aria-hidden />
            {locationLine}
            {offer.unitName && !isOnline && ` · ${titleCase(offer.unitName)}`}
          </li>
        )}
        {typeof offer.notaMec === 'number' && (
          <li className="inline-flex items-center gap-1 rounded-full border border-bolsa-primary/20 bg-bolsa-primary/5 px-2 py-0.5 text-[11px] font-bold text-bolsa-primary">
            <ShieldCheck size={12} aria-hidden />
            Nota MEC {offer.notaMec}
          </li>
        )}
      </ul>

      {/* Faixa cupom — condição da bolsa + preço (assinatura do card) */}
      <div className="relative mt-auto border-t border-dashed border-ink-300/70 bg-paper-warm px-5 pb-4 pt-4">
        {/* Oferta boa (desconto real >= 50%): Bob aprova — sinal calculado do payload, nunca inventado */}
        {discount !== null && discount >= 50 && (
          <span aria-hidden className="pointer-events-none absolute -top-9 right-2 rotate-6">
            <Mascot pose="joinha" size={52} />
          </span>
        )}
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-500">
            {installments ? 'Parcelamento' : discount !== null ? 'Mensalidade com bolsa' : 'Mensalidade'}
          </p>
          {discount !== null && (
            <span
              className={`inline-flex items-center gap-1.5 bg-bolsa-secondary py-1 pl-3.5 pr-2.5 text-xs font-bold text-white [clip-path:polygon(9px_0,100%_0,100%_100%,9px_100%,0_50%)] ${styles.discountTag}`}
              aria-label={`Bolsa de ${discount} por cento`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white/90" aria-hidden />
              -{discount}%
            </span>
          )}
        </div>

        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
          {installments ? (
            <>
              <span className="text-[13px] text-ink-500">até</span>
              <span className="font-display text-[26px] font-semibold leading-none text-bolsa-primary">
                {offer.totalInstallment}x de {formatBRL(offer.minInstallmentValue as number)}
              </span>
            </>
          ) : (
            <>
              <span className="font-display text-[30px] font-semibold leading-none text-bolsa-primary">
                {formatBRL(offer.minPrice)}
              </span>
              <span className="text-[13px] font-medium text-ink-500">/mês</span>
              {discount !== null && typeof offer.maxPrice === 'number' && (
                <s className="text-[13px] text-ink-500">De {formatBRL(offer.maxPrice)}</s>
              )}
            </>
          )}
        </div>

        {monthlySavings !== null && (
          <p className="mt-1 text-[12px] font-semibold text-bolsa-secondary">
            Você economiza {formatBRL(monthlySavings)} por mês
          </p>
        )}
      </div>

      {/* Turno — antes do CTA, só quando há escolha real */}
      {needsShiftChoice && (
        <fieldset className="px-5 pt-3.5">
          <legend className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-500">
            Escolha o turno
          </legend>
          <div className="mt-1.5 grid auto-cols-fr grid-flow-col gap-1.5" role="radiogroup" aria-label="Turno">
            {selectableShifts.map((shift) => {
              const active = selectedShift === shift
              return (
                <button
                  key={shift}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelectedShift(shift)}
                  className={`min-h-[44px] rounded-lg border text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolsa-primary focus-visible:ring-offset-1 ${
                    active
                      ? 'border-bolsa-primary bg-bolsa-primary/5 text-bolsa-primary'
                      : 'border-ink-100 bg-white text-ink-700 hover:border-ink-300'
                  }`}
                >
                  {shiftLabel(shift)}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      {/* CTA — <a> real, nunca div clicável; mascote espia por trás do botão */}
      <div className="px-5 pb-5 pt-3.5">
        <span className={`${styles.ctaWrap} w-full`}>
          {!ctaBlocked && (
            <span aria-hidden="true" className={styles.buttonPeek}>
              <Mascot pose="comemorando" size={56} />
            </span>
          )}
          <a
            href={finalHref}
            aria-disabled={ctaBlocked || undefined}
            tabIndex={ctaBlocked ? -1 : undefined}
            onClick={(event) => {
              if (ctaBlocked) {
                event.preventDefault()
                return
              }
              onCtaClick?.(event)
            }}
            className={`relative z-[1] flex min-h-[48px] w-full items-center justify-center rounded-xl px-4 text-[15px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolsa-primary focus-visible:ring-offset-2 ${
              ctaBlocked
                ? 'pointer-events-none cursor-not-allowed bg-ink-100 text-ink-500 transition-colors'
                : `bg-bolsa-primary text-white hover:bg-bolsa-primary/90 ${styles.cta}`
            }`}
          >
            {ctaBlocked ? 'Escolha o turno acima' : ctaLabel}
          </a>
        </span>
        <p className="mt-2 text-center text-[12px] text-ink-500">
          Inscrição online · sem cobrança agora*
        </p>
      </div>
    </article>
  )
}
