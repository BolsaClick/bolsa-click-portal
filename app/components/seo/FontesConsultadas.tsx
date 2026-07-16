import type { ReactNode } from 'react'

export interface FonteConsultada {
  label: string
  url: string
  descricao: ReactNode
  linkLabel?: string
}

interface FontesConsultadasProps {
  fontes: FonteConsultada[]
  introducao: ReactNode
  dateTime: string
  dateLabel: string
  observacao?: ReactNode
}

export function FontesConsultadas({
  fontes,
  introducao,
  dateTime,
  dateLabel,
  observacao,
}: FontesConsultadasProps) {
  return (
    <section
      id="fontes"
      aria-label="Fontes consultadas"
      className="bg-paper py-10 md:py-12 border-t border-hairline"
    >
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
          <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
            Fontes consultadas
          </h2>
          <span className="font-mono num-tabular text-[11px] text-ink-500">
            ({String(fontes.length).padStart(2, '0')})
          </span>
        </div>
        <p className="text-ink-700 leading-relaxed mb-6 text-sm">
          {introducao} Última revisão editorial em{' '}
          <time dateTime={dateTime} className="text-ink-900 font-medium">
            {dateLabel}
          </time>
          .
        </p>
        <ul className="space-y-3 text-sm text-ink-700">
          {fontes.map((fonte) => (
            <li key={fonte.url}>
              <strong className="text-ink-900">{fonte.label}</strong> — {fonte.descricao}{' '}
              <a
                href={fonte.url}
                rel="nofollow noopener"
                target="_blank"
                className="underline decoration-1 underline-offset-4"
              >
                {fonte.linkLabel ?? fonte.url.replace(/^https?:\/\/(?:www\.)?/, '')}
              </a>
            </li>
          ))}
        </ul>
        {observacao ? (
          <p className="text-ink-500 text-xs leading-relaxed mt-6">{observacao}</p>
        ) : null}
      </div>
    </section>
  )
}
