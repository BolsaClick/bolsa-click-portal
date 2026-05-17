import { Star, ThumbsUp, ThumbsDown } from 'lucide-react'
import { InstitutionReviewSummary } from '@/app/lib/reviews'
import { RespondCta } from './RespondCta'

interface ReviewListProps {
  institutionName: string
  summary: InstitutionReviewSummary
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${value} de 5 estrelas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < value ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}
        />
      ))}
    </div>
  )
}

export function ReviewList({ institutionName, summary }: ReviewListProps) {
  if (summary.count === 0) {
    return (
      <div className="text-center py-8 text-sm text-ink-500">
        Nenhuma avaliação publicada ainda. Seja a primeira pessoa a avaliar a
        {' '}{institutionName} no formulário abaixo.
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-4 mb-6 pb-3 hairline-b">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-4xl font-semibold text-ink-900 num-tabular">
              {summary.averageRating.toFixed(1)}
            </span>
            <Stars value={Math.round(summary.averageRating)} />
          </div>
          <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-ink-500 mt-1">
            {summary.count} {summary.count === 1 ? 'avaliação' : 'avaliações'}
            {' · '}
            {summary.recommendPercent}% recomendam
          </p>
        </div>
      </div>

      <ul className="space-y-6">
        {summary.reviews.map((r) => (
          <li key={r.id} className="border-b border-hairline pb-6 last:border-b-0">
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg text-ink-900">{r.authorName}</span>
                <Stars value={r.rating} />
              </div>
              <span className="font-mono text-[11px] text-ink-500">
                {new Date(r.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </span>
            </div>
            <div
              className={`inline-flex items-center gap-1 text-xs mb-3 ${
                r.recommends ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {r.recommends ? <ThumbsUp size={12} /> : <ThumbsDown size={12} />}
              {r.recommends ? 'Recomenda' : 'Não recomenda'}
            </div>
            <p className="text-ink-800 leading-relaxed whitespace-pre-wrap">{r.body}</p>

            {r.response && (
              <div className="mt-4 pl-4 border-l-2 border-bolsa-secondary/40 bg-paper rounded-r-md py-3 pr-3">
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-bolsa-secondary mb-1">
                  Resposta da {institutionName}
                  {r.respondedAt && (
                    <> · {new Date(r.respondedAt).toLocaleDateString('pt-BR')}</>
                  )}
                </div>
                <p className="text-ink-800 leading-relaxed whitespace-pre-wrap">{r.response}</p>
              </div>
            )}

            {!r.response && (
              <RespondCta reviewId={r.id} institutionName={institutionName} />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
