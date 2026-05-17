import Link from 'next/link'
import { Sparkles, ArrowRight, Award } from 'lucide-react'
import { TOP_CURSOS } from '@/app/cursos/_data/cursos'
import type { Recommendation } from '@/app/lib/teste-vocacional/openai'
import type { RiasecType, GardnerIntelligence } from '@/app/lib/teste-vocacional/methodology-profiles'

export interface ProfileResult {
  hollandCode: string
  primary: { code: RiasecType; name: string; short: string; description: string }
  secondary: { code: RiasecType; name: string; short: string }
  tertiary: { code: RiasecType; name: string; short: string }
  intelligences: Array<{ code: GardnerIntelligence; name: string; short: string }>
  recommendations: Recommendation[]
}

interface ResultCardsProps {
  profile: ProfileResult
}

export type { Recommendation }

export function ResultCards({ profile }: ResultCardsProps) {
  return (
    <div className="space-y-5 md:space-y-6">
      {/* Bloco "Seu perfil" */}
      <section className="bg-white border-l-4 border-bolsa-secondary p-5 md:p-6 rounded-r-lg shadow-sm">
        <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-3 inline-flex items-center gap-1.5">
          <Award size={11} className="text-bolsa-secondary" />
          Seu perfil vocacional
        </p>
        <div className="flex items-baseline gap-3 mb-3">
          <h3 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 tracking-tight">
            {profile.hollandCode}
          </h3>
          <p className="font-mono text-xs text-ink-500 tracking-wider">Holland Code</p>
        </div>
        <p className="text-base md:text-lg text-ink-900 mb-1">
          <strong className="font-display">{profile.primary.name}</strong>
          <span className="text-ink-500"> · {profile.secondary.name} · {profile.tertiary.name}</span>
        </p>
        <p className="text-ink-700 text-sm leading-relaxed mt-2">
          {profile.primary.description}
        </p>

        {profile.intelligences.length > 0 && (
          <div className="mt-4 pt-4 border-t border-hairline">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500 mb-2">
              Inteligências dominantes (Gardner)
            </p>
            <ul className="flex flex-wrap gap-2">
              {profile.intelligences.map(i => (
                <li
                  key={i.code}
                  className="px-2.5 py-1 text-xs font-mono uppercase tracking-wider text-ink-900 bg-paper border border-hairline rounded"
                >
                  {i.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-ink-500 text-[11px] mt-4 italic">
          Baseado em RIASEC (Holland, 1959) + Inteligências Múltiplas (Gardner, 1983).
        </p>
      </section>

      {/* Header da seção de cursos */}
      <div className="text-center pt-2">
        <Sparkles className="mx-auto text-bolsa-secondary mb-3 w-6 h-6 md:w-7 md:h-7" />
        <h2 className="font-display text-xl md:text-3xl font-semibold text-ink-900 mb-2 leading-tight">
          Sua trilha personalizada
        </h2>
        <p className="text-ink-700 text-xs md:text-sm">
          Os 3 cursos que mais combinam com seu perfil. Clique pra ver bolsas disponíveis.
        </p>
      </div>

      <ul className="space-y-3 md:space-y-4">
        {profile.recommendations.map((r, i) => {
          const curso = TOP_CURSOS.find(c => c.slug === r.courseSlug)
          const name = curso?.apiCourseName ?? r.courseSlug
          const description = curso?.description
          return (
            <li key={r.courseSlug}>
              <Link
                href={`/cursos/${r.courseSlug}`}
                className="group block bg-white border border-hairline rounded-lg p-4 md:p-5 hover:border-bolsa-secondary transition-colors"
              >
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">
                    Recomendação {i + 1}
                  </p>
                  <div className="shrink-0 px-2 py-0.5 bg-bolsa-secondary/10 text-bolsa-secondary font-mono text-[11px] md:text-xs font-semibold rounded">
                    {r.matchPercent}% match
                  </div>
                </div>
                <h3 className="font-display text-lg md:text-xl font-semibold text-ink-900 group-hover:text-bolsa-secondary leading-tight mb-2">
                  {name}
                </h3>
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

      <div className="bg-paper border border-hairline rounded-lg p-4 md:p-5 text-center">
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
