import type { FeaturedCourseData } from '../../../_data/types'
import { buildCityContext } from './buildCityContext'

interface CityContextBlockProps {
  curso: FeaturedCourseData
  cityName: string
  cityState: string
  offerCount: number
}

/**
 * Bloco editorial único por combinação curso × cidade. Renderiza 2-3
 * parágrafos derivados de campos do FeaturedCourse + cidade/estado, mais
 * uma lista "Por que o Bolsa Click". Pensado para combater thin content
 * nas 33k city pages sem precisar de conteúdo curado manual.
 *
 * Aparece sempre, mesmo quando não há oferta local (Tartarus vazio):
 * é o conteúdo evergreen que justifica indexação dessa URL.
 */
export default function CityContextBlock({
  curso,
  cityName,
  cityState,
  offerCount,
}: CityContextBlockProps) {
  const ctx = buildCityContext(curso, cityName, cityState)

  return (
    <section className="bg-white py-14 md:py-20 border-b border-hairline">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 max-w-6xl mx-auto">
          <div className="md:col-span-7">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-ink-300" />
              {curso.name} em {cityName}
            </span>
            <h2 className="font-display text-2xl md:text-[32px] text-ink-900 leading-tight mb-6">
              Por que cursar {curso.name}{' '}
              <span className="italic text-ink-700">em {cityName}?</span>
            </h2>
            <div className="space-y-4">
              {ctx.paragraphs.map((p, i) => (
                <p key={i} className="text-ink-700 leading-relaxed text-[15px]">
                  {p}
                </p>
              ))}
            </div>
          </div>

          <aside className="md:col-span-5 md:pl-4 md:border-l md:border-hairline">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 block mb-4">
              Em números
            </span>
            <dl className="grid grid-cols-2 gap-y-5 mb-6">
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-ink-500 mb-1">
                  Salário médio
                </dt>
                <dd className="font-display num-tabular text-[18px] text-ink-900 leading-snug">
                  {curso.averageSalary}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-ink-500 mb-1">
                  Duração
                </dt>
                <dd className="font-display num-tabular text-[18px] text-ink-900 leading-snug">
                  {curso.duration}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-ink-500 mb-1">
                  Demanda
                </dt>
                <dd className="font-display text-[18px] text-ink-900 leading-snug">
                  {curso.marketDemand === 'ALTA' ? 'Alta' : curso.marketDemand === 'MEDIA' ? 'Média' : 'Baixa'}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-ink-500 mb-1">
                  Ofertas em {cityName}
                </dt>
                <dd className="font-display num-tabular text-[18px] text-ink-900 leading-snug">
                  {offerCount > 0 ? `${offerCount}+` : '—'}
                </dd>
              </div>
            </dl>

            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 block mb-3">
              Vantagens
            </span>
            <ul className="space-y-2.5">
              {ctx.whyHere.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[14px] text-ink-700 leading-snug">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-bolsa-secondary mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  )
}
