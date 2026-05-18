import { BookOpen } from 'lucide-react'
import { FeaturedCourseData } from '../../_data/types'

interface Props {
  curso: FeaturedCourseData
}

export default function CoreSubjectsBlock({ curso }: Props) {
  const subjects = curso.coreSubjects ?? []
  if (subjects.length === 0) return null

  return (
    <section className="bg-paper py-12 md:py-16 border-t border-hairline">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="hairline-b pb-3 mb-6 flex items-baseline justify-between">
          <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700 inline-flex items-center gap-2">
            <BookOpen size={12} className="text-bolsa-secondary" />
            O que você vai estudar
          </h2>
          <span className="font-mono num-tabular text-[11px] text-ink-500">
            ({String(subjects.length).padStart(2, '0')})
          </span>
        </div>

        <p className="text-ink-700 leading-relaxed mb-6">
          Disciplinas principais da grade curricular de <strong>{curso.fullName}</strong>.
          A grade exata pode variar por faculdade e modalidade — consulte a unidade escolhida
          pra detalhes.
        </p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-hairline">
          {subjects.map((subject, i) => (
            <li
              key={subject}
              className="bg-white px-4 py-3 flex items-baseline gap-3"
            >
              <span className="font-mono text-[10px] tracking-wider text-ink-500 shrink-0 w-6">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-ink-900 text-sm">{subject}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
