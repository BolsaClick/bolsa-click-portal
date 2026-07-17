'use client'

/**
 * CourseShelf — "prateleira" horizontal de CourseCardV2 (padrão vitrine:
 * scroll horizontal com snap no touch + setas no desktop).
 *
 * Ao clicar num CTA "Garantir bolsa", o mascote-joinha pipoca no canto da
 * tela em paralelo à navegação (feedback não bloqueante).
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState } from 'react'

import CourseCardV2 from '../CourseCardV2'
import CourseCardV2Skeleton from '../CourseCardV2Skeleton'
import { offerResultHref, type CourseOffer } from '../course-offer'
import Mascot from '../mascot/Mascot'
import MascotPop from '../mascot/MascotPop'
import styles from '../ui/reactive.module.css'

export interface CourseShelfProps {
  eyebrow?: string
  title: string
  subtitle?: string
  offers: CourseOffer[]
  /**
   * Destino fixo do CTA (ex.: preview). Omitido -> cada card linka pro
   * resultado real do próprio curso (offerResultHref).
   */
  cardHref?: string
  emptyMessage?: string
  /** id pro aria-labelledby da section */
  headingId: string
}

export default function CourseShelf({
  eyebrow,
  title,
  subtitle,
  offers,
  cardHref,
  emptyMessage = 'Nenhuma oferta carregada agora — use a busca lá em cima.',
  headingId,
}: CourseShelfProps) {
  const scrollerRef = useRef<HTMLUListElement>(null)
  const [popCount, setPopCount] = useState(0)

  const scrollByCards = (direction: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.85), behavior: 'smooth' })
  }

  return (
    <section aria-labelledby={headingId} className="py-8">
      <div className="mx-auto w-full max-w-screen-lg px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-bolsa-secondary">
                {eyebrow}
              </p>
            )}
            <h2 id={headingId} className="mt-1 font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-[13px] text-ink-500">{subtitle}</p>}
          </div>

          {offers.length > 0 && (
            <div className="hidden shrink-0 gap-2 md:flex">
              <button
                type="button"
                onClick={() => scrollByCards(-1)}
                aria-label={`Rolar ${title} para trás`}
                className={`flex h-11 w-11 items-center justify-center rounded-full border border-ink-100 bg-white text-ink-700 hover:border-bolsa-primary hover:text-bolsa-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolsa-primary ${styles.soft}`}
              >
                <ChevronLeft size={20} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => scrollByCards(1)}
                aria-label={`Rolar ${title} para frente`}
                className={`flex h-11 w-11 items-center justify-center rounded-full border border-ink-100 bg-white text-ink-700 hover:border-bolsa-primary hover:text-bolsa-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolsa-primary ${styles.soft}`}
              >
                <ChevronRight size={20} aria-hidden />
              </button>
            </div>
          )}
        </div>

        {offers.length > 0 ? (
          <ul
            ref={scrollerRef}
            className="-mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [scrollbar-width:thin]"
          >
            {offers.map((offer, index) => (
              <li
                key={`${offer.name}-${offer.brand}-${offer.unitName ?? ''}-${index}`}
                className="w-[290px] shrink-0 snap-start sm:w-[320px]"
              >
                <CourseCardV2
                  offer={offer}
                  href={cardHref ?? offerResultHref(offer)}
                  onCtaClick={() => setPopCount((c) => c + 1)}
                />
              </li>
            ))}
          </ul>
        ) : (
          /* Empty state honesto — mascote-paz, sem oferta inventada */
          <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-300/70 bg-white px-6 py-10 text-center">
            <Mascot pose="surpreso" size={96} alt="Mascote do Bolsa Click surpreso" />
            <p className="max-w-sm text-[14px] text-ink-700">{emptyMessage}</p>
          </div>
        )}
      </div>

      {/* Feedback do CTA: joinha pipoca no canto, em paralelo à navegação.
          Deslocado pra esquerda pra não ficar embaixo do launcher do chat (bottom-5 right-4/6). */}
      <MascotPop pose="comemorando" trigger={popCount} size={104} className="fixed bottom-5 right-24 z-50" />
    </section>
  )
}

/**
 * Versão de loading da prateleira — mesmo header/layout, cards em skeleton.
 * Usada pelas prateleiras client-side (geo/personalizada) enquanto contexto
 * ou fetch carregam.
 */
export function CourseShelfSkeleton({
  eyebrow,
  title,
  headingId,
  cards = 4,
}: {
  eyebrow?: string
  title: string
  headingId: string
  cards?: number
}) {
  return (
    <section aria-labelledby={headingId} aria-busy="true" className="py-8">
      <div className="mx-auto w-full max-w-screen-lg px-4 sm:px-6 lg:px-8">
        <div>
          {eyebrow && (
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-bolsa-secondary">
              {eyebrow}
            </p>
          )}
          <h2 id={headingId} className="mt-1 font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
            {title}
          </h2>
        </div>
        <ul className="-mx-4 mt-5 flex gap-4 overflow-x-hidden px-4 pb-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {Array.from({ length: cards }, (_, index) => (
            <li key={index} className="w-[290px] shrink-0 sm:w-[320px]">
              <CourseCardV2Skeleton />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
