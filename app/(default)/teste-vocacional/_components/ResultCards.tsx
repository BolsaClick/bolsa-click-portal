import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'
import { TOP_CURSOS } from '@/app/cursos/_data/cursos'

export type Recommendation = {
  courseSlug: string
  matchPercent: number
  reasoning: string
}

interface ResultCardsProps {
  recommendations: Recommendation[]
}

export function ResultCards({ recommendations }: ResultCardsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Sparkles className="mx-auto text-bolsa-secondary mb-3" size={28} />
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-2">
          Sua trilha personalizada
        </h2>
        <p className="text-ink-700 text-sm">
          Esses são os 3 cursos que mais combinam com você. Clique pra ver bolsas disponíveis.
        </p>
      </div>

      <ul className="space-y-4">
        {recommendations.map((r, i) => {
          const curso = TOP_CURSOS.find(c => c.slug === r.courseSlug)
          const name = curso?.apiCourseName ?? r.courseSlug
          const description = curso?.description
          return (
            <li key={r.courseSlug}>
              <Link
                href={`/cursos/${r.courseSlug}`}
                className="group block bg-white border border-hairline rounded-lg p-5 hover:border-bolsa-secondary transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500 mb-1">
                      Recomendação {i + 1}
                    </p>
                    <h3 className="font-display text-xl font-semibold text-ink-900 group-hover:text-bolsa-secondary">
                      {name}
                    </h3>
                  </div>
                  <div className="shrink-0 px-2.5 py-1 bg-bolsa-secondary/10 text-bolsa-secondary font-mono text-xs font-semibold rounded">
                    {r.matchPercent}% match
                  </div>
                </div>
                {description && (
                  <p className="text-ink-500 text-xs mb-2">{description}</p>
                )}
                <p className="text-ink-800 leading-relaxed text-sm">{r.reasoning}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-bolsa-secondary text-sm font-medium">
                  Ver bolsas disponíveis <ArrowRight size={14} />
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="bg-paper border border-hairline rounded-lg p-5 text-center">
        <p className="text-ink-700 text-sm mb-3">
          Quer explorar outras opções? Veja todas as bolsas disponíveis.
        </p>
        <Link
          href="/bolsas-de-estudo"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-bolsa-secondary text-white text-sm font-medium rounded-md hover:opacity-90"
        >
          Ver todas as bolsas
        </Link>
      </div>
    </div>
  )
}
