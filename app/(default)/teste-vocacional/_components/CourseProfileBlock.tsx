import { Award } from 'lucide-react'
import {
  COURSE_PROFILES,
  RIASEC_DESCRIPTIONS,
  GARDNER_DESCRIPTIONS,
} from '@/app/lib/teste-vocacional/methodology-profiles'

interface CourseProfileBlockProps {
  slug: string
  courseName: string
}

// Bloco reusável que mostra o perfil RIASEC + Gardner de um curso específico.
// Usado em /teste-vocacional/[curso] e potencialmente em outras páginas SEO.
export function CourseProfileBlock({ slug, courseName }: CourseProfileBlockProps) {
  const profile = COURSE_PROFILES[slug]
  if (!profile) return null

  const primary = RIASEC_DESCRIPTIONS[profile.riasec.primary]
  const secondary = RIASEC_DESCRIPTIONS[profile.riasec.secondary]
  const tertiary = RIASEC_DESCRIPTIONS[profile.riasec.tertiary]
  const hollandCode = `${profile.riasec.primary}${profile.riasec.secondary}${profile.riasec.tertiary}`
  const intelligences = profile.gardner.map(i => GARDNER_DESCRIPTIONS[i])

  return (
    <section className="bg-white border-l-4 border-bolsa-secondary p-5 md:p-6 rounded-r-lg my-6 not-prose">
      <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-3 inline-flex items-center gap-1.5">
        <Award size={11} className="text-bolsa-secondary" />
        Perfil RIASEC para {courseName}
      </p>
      <div className="flex items-baseline gap-3 mb-3">
        <h3 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
          {hollandCode}
        </h3>
        <p className="font-mono text-xs text-ink-500 tracking-wider">Holland Code</p>
      </div>
      <p className="text-base text-ink-900 mb-1">
        <strong className="font-display">{primary.name}</strong>
        <span className="text-ink-500"> · {secondary.name} · {tertiary.name}</span>
      </p>
      <p className="text-ink-700 text-sm leading-relaxed mt-2">
        {primary.description}
      </p>

      <div className="mt-4 pt-4 border-t border-hairline">
        <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500 mb-2">
          Inteligências dominantes (Gardner)
        </p>
        <ul className="flex flex-wrap gap-2">
          {intelligences.map(i => (
            <li
              key={i.name}
              className="px-2.5 py-1 text-xs font-mono uppercase tracking-wider text-ink-900 bg-paper border border-hairline rounded"
              title={i.description}
            >
              {i.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
