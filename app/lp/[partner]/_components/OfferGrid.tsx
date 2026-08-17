'use client'

import { useMemo, useState } from 'react'
import { OfferCard, type OfferCardData } from './OfferCard'

const TYPE_LABEL: Record<string, string> = {
  BACHARELADO: 'Bacharelado',
  LICENCIATURA: 'Licenciatura',
  TECNOLOGO: 'Tecnólogo',
  OUTROS: 'Outros cursos',
}

/** Ordem de exibição do filtro quando o tipo existir na lista de ofertas. */
const TYPE_ORDER = ['TECNOLOGO', 'BACHARELADO', 'LICENCIATURA', 'OUTROS']

interface OfferGridProps {
  offers: OfferCardData[]
  partner: string
  partnerName: string
  brandColor: string
  /** Link "confira a lista completa" — página de marca no bolsaclick.com.br. */
  fullListHref?: string
}

export function OfferGrid({ offers, partner, partnerName, brandColor, fullListHref }: OfferGridProps) {
  const [filter, setFilter] = useState<string>('TODOS')

  const availableTypes = useMemo(() => {
    const present = new Set<string>(offers.map((o) => o.courseType ?? 'OUTROS'))
    return TYPE_ORDER.filter((t) => present.has(t))
  }, [offers])

  const filtered = useMemo(() => {
    if (filter === 'TODOS') return offers
    return offers.filter((o) => (o.courseType ?? 'OUTROS') === filter)
  }, [offers, filter])

  if (offers.length === 0) return null

  return (
    <div className="grid lg:grid-cols-[200px_1fr] gap-8">
      {/* Sidebar de filtro — só aparece quando há mais de 1 tipo pra filtrar. */}
      {availableTypes.length > 1 && (
        <aside className="lg:sticky lg:top-24 h-fit">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-3">
            Tipo de curso
          </p>
          <fieldset className="flex lg:flex-col flex-wrap gap-2">
            <legend className="sr-only">Filtrar por tipo de curso</legend>
            <label className="inline-flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
              <input
                type="radio"
                name="course-type"
                value="TODOS"
                checked={filter === 'TODOS'}
                onChange={() => setFilter('TODOS')}
                style={{ accentColor: brandColor }}
              />
              Todos
            </label>
            {availableTypes.map((t) => (
              <label key={t} className="inline-flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
                <input
                  type="radio"
                  name="course-type"
                  value={t}
                  checked={filter === t}
                  onChange={() => setFilter(t)}
                  style={{ accentColor: brandColor }}
                />
                {TYPE_LABEL[t]}
              </label>
            ))}
          </fieldset>
          {fullListHref && (
            <a
              href={fullListHref}
              className="mt-5 inline-block font-mono text-[11px] tracking-[0.16em] uppercase hover:underline"
              style={{ color: brandColor }}
            >
              Confira a lista completa →
            </a>
          )}
        </aside>
      )}

      <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((offer) => (
          <OfferCard key={offer.id} offer={offer} partner={partner} brandColor={brandColor} />
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="text-ink-500 text-sm">
          Nenhum curso encontrado nesse filtro. Fale com a gente pra ver outras opções na {partnerName}.
        </p>
      )}
    </div>
  )
}
