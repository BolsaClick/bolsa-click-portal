import Link from 'next/link'
import {
  CALENDARIO_2026,
  classifyEvents,
  type CalendarBucket,
  type ClassifiedEvent,
} from '../_data/calendario-2026'

const BUCKET_LABELS: Record<CalendarBucket, { label: string; subtitle: string }> = {
  ABERTAS: {
    label: 'Inscrições abertas agora',
    subtitle: 'janela ativa neste momento',
  },
  PROXIMAS_90_DIAS: {
    label: 'Próximos 90 dias',
    subtitle: 'planeje a inscrição com antecedência',
  },
  FUTURAS: {
    label: 'Mais à frente em 2026',
    subtitle: 'datas confirmadas no calendário oficial',
  },
}

const DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
})

function formatDateRange(startDate: string, endDate: string) {
  const start = DATE_FORMATTER.format(new Date(startDate + 'T12:00:00Z'))
  if (startDate === endDate) return start
  const end = DATE_FORMATTER.format(new Date(endDate + 'T12:00:00Z'))
  return `${start} – ${end}`
}

interface CalendarioBolsas2026Props {
  referenceDate?: Date
}

export default function CalendarioBolsas2026({ referenceDate }: CalendarioBolsas2026Props = {}) {
  const events = classifyEvents(CALENDARIO_2026, referenceDate)

  if (events.length === 0) return null

  const grouped = events.reduce<Record<CalendarBucket, ClassifiedEvent[]>>(
    (acc, ev) => {
      acc[ev.bucket].push(ev)
      return acc
    },
    { ABERTAS: [], PROXIMAS_90_DIAS: [], FUTURAS: [] },
  )

  const orderedBuckets: CalendarBucket[] = ['ABERTAS', 'PROXIMAS_90_DIAS', 'FUTURAS']
  const visibleBuckets = orderedBuckets.filter(b => grouped[b].length > 0)

  return (
    <section
      id="calendario-2026"
      aria-label="Calendário de programas de bolsa 2026"
      className="bg-white py-12 md:py-16 border-b border-hairline"
      data-speakable="calendario"
    >
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900">
            Calendário de bolsas 2026 — o que está aberto agora
          </h2>
          <span className="font-mono num-tabular text-[11px] text-ink-500">
            ({String(events.length).padStart(2, '0')})
          </span>
        </div>
        <p className="text-ink-700 leading-relaxed mb-8 max-w-3xl">
          As principais janelas de inscrição em programas federais e oportunidades de bolsa em
          faculdades parceiras durante 2026. Datas confirmadas com base em editais oficiais do
          MEC, INEP e FNDE — quando o edital ainda não foi publicado, marcamos a janela como
          prevista.
        </p>

        {visibleBuckets.map(bucket => {
          const meta = BUCKET_LABELS[bucket]
          const items = grouped[bucket]
          return (
            <div key={bucket} className="mb-10 last:mb-0">
              <div className="hairline-b pb-2 mb-4 flex items-baseline justify-between">
                <h3 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
                  {meta.label}
                </h3>
                <span className="font-mono text-[10px] text-ink-500 hidden sm:inline">
                  {meta.subtitle}
                </span>
              </div>
              <ul className="space-y-px bg-hairline">
                {items.map(ev => {
                  const statusBadge = ev.status === 'CONFIRMADO' ? 'Confirmado' : 'Previsto'
                  return (
                    <li
                      key={ev.id}
                      className="bg-white p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-[140px_1fr_auto] gap-3 sm:gap-6 items-baseline"
                    >
                      <time
                        dateTime={ev.startDate}
                        className="font-mono num-tabular text-sm tracking-wide text-ink-900 font-medium"
                      >
                        {formatDateRange(ev.startDate, ev.endDate)}
                      </time>
                      <div>
                        <span className="block font-display text-base sm:text-lg text-ink-900">
                          <Link
                            href={`/${ev.programaSlug}`}
                            className="hover:underline decoration-1 underline-offset-4"
                          >
                            {ev.programa}
                          </Link>{' '}
                          <span className="text-ink-700 font-normal">— {ev.faseLabel}</span>
                        </span>
                        {ev.notes && (
                          <span className="block text-ink-500 text-xs mt-1 leading-relaxed">
                            {ev.notes}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500 justify-self-start sm:justify-self-end">
                        {statusBadge} · {ev.organizer}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}

        <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500 mt-8">
          Fontes: <a href="https://acessounico.mec.gov.br" rel="nofollow noopener" target="_blank" className="underline decoration-1 underline-offset-4">acessounico.mec.gov.br</a>
          {' · '}
          <a href="https://www.gov.br/inep" rel="nofollow noopener" target="_blank" className="underline decoration-1 underline-offset-4">gov.br/inep</a>
          {' · '}
          <a href="https://www.gov.br/fnde" rel="nofollow noopener" target="_blank" className="underline decoration-1 underline-offset-4">gov.br/fnde</a>
        </p>
      </div>
    </section>
  )
}
