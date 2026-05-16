import Link from 'next/link'
import { Course } from '@/app/interface/course'
import { FeaturedCourseData } from '../../_data/types'
import { BRAZILIAN_CITIES } from '@/app/lib/constants/brazilian-cities'

interface OffersTableProps {
  offers: Course[]
  courseName: string
}

const formatBRL = (n: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const modalityLabel = (m: string) => {
  const upper = (m || '').toUpperCase()
  if (upper === 'EAD') return 'EAD'
  if (upper === 'SEMIPRESENCIAL') return 'Semipresencial'
  if (upper === 'PRESENCIAL') return 'Presencial'
  return m || '—'
}

function discountPct(min: number, max?: number) {
  if (!max || max <= min) return null
  return Math.round(((max - min) / max) * 100)
}

export function OffersComparisonTable({ offers, courseName }: OffersTableProps) {
  if (!offers || offers.length === 0) return null

  const rows = offers.slice(0, 12)

  return (
    <section className="bg-white py-12 md:py-16 border-t border-hairline">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              Comparativo de faculdades — {courseName}
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              ({String(rows.length).padStart(2, '0')})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <caption className="sr-only">
                Faculdades parceiras que oferecem {courseName}, com modalidade, cidade, mensalidade com bolsa e desconto aplicado.
              </caption>
              <thead>
                <tr className="border-b border-hairline">
                  <th scope="col" className="text-left py-3 px-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">
                    Faculdade
                  </th>
                  <th scope="col" className="text-left py-3 px-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">
                    Modalidade
                  </th>
                  <th scope="col" className="text-left py-3 px-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">
                    Cidade
                  </th>
                  <th scope="col" className="text-right py-3 px-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">
                    Mensalidade c/ bolsa
                  </th>
                  <th scope="col" className="text-right py-3 px-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">
                    Desconto
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o, i) => {
                  const min = o.minPrice || 0
                  const max = o.maxPrice
                  const pct = discountPct(min, max)
                  const cityLabel = o.unitCity || o.city || '—'
                  const stateLabel = o.unitState || o.uf || ''
                  return (
                    <tr key={`${o.id}-${i}`} className="border-b border-hairline/60 hover:bg-paper">
                      <td className="py-3 px-3 text-ink-900">{o.brand || '—'}</td>
                      <td className="py-3 px-3 text-ink-700">{modalityLabel(o.modality)}</td>
                      <td className="py-3 px-3 text-ink-700">
                        {cityLabel}{stateLabel ? `, ${stateLabel}` : ''}
                      </td>
                      <td className="py-3 px-3 text-right num-tabular text-ink-900">
                        {min > 0 ? `R$ ${formatBRL(min)}` : '—'}
                      </td>
                      <td className="py-3 px-3 text-right num-tabular text-bolsa-secondary">
                        {pct ? `${pct}%` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {offers.length > rows.length && (
            <p className="mt-4 font-mono text-[11px] text-ink-500">
              Mostrando {rows.length} de {offers.length} ofertas. Veja a lista completa abaixo.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

interface FaqItem {
  question: string
  answer: string
}

interface VisibleFaqProps {
  items: FaqItem[]
  heading: string
}

export function VisibleFaq({ items, heading }: VisibleFaqProps) {
  if (!items || items.length === 0) return null
  return (
    <section className="bg-paper py-12 md:py-16 border-t border-hairline">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 mb-8">
            {heading}
          </h2>
          <div className="divide-y divide-hairline border-y border-hairline">
            {items.map((it, i) => (
              <details key={i} className="group py-5">
                <summary className="flex items-baseline justify-between cursor-pointer list-none gap-6">
                  <h3 className="font-display text-lg md:text-xl text-ink-900 group-open:italic">
                    {it.question}
                  </h3>
                  <span className="font-mono text-xs text-ink-500 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-ink-700 leading-relaxed">{it.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

interface CitiesGridProps {
  courseSlug: string
  courseName: string
  currentCitySlug?: string
}

export function CitiesGrid({ courseSlug, courseName, currentCitySlug }: CitiesGridProps) {
  // Com 100 cidades na base, mostrar todas no grid de uma vez fica ruim de
  // escanear. Limitamos a 30 destaques (top por relevância na lista) + um link
  // pro hub geral pra preservar crawl path.
  const allOthers = BRAZILIAN_CITIES.filter(c => c.slug !== currentCitySlug)
  const cities = allOthers.slice(0, 30)
  return (
    <section className="bg-white py-12 md:py-16 border-t border-hairline">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              {courseName} em outras cidades
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              ({String(cities.length).padStart(2, '0')} de {String(allOthers.length).padStart(2, '0')})
            </span>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-hairline">
            {cities.map((c) => (
              <li key={c.slug} className="bg-white">
                <Link
                  href={`/cursos/${courseSlug}/${c.slug}`}
                  className="block px-4 py-3 transition-colors hover:bg-paper"
                >
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">
                    {c.state}
                  </span>
                  <span className="block font-display text-base text-ink-900">
                    {c.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {allOthers.length > cities.length && (
            <div className="mt-6 text-center">
              <Link
                href="/bolsas-de-estudo"
                className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink-700 hover:text-ink-900 border-b border-ink-700 hover:border-ink-900 pb-1"
              >
                Ver todas as cidades →
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export function buildCourseFaqItems(curso: FeaturedCourseData, lowPrice: number): FaqItem[] {
  return [
    {
      question: `O que é o curso de ${curso.name}?`,
      answer: curso.longDescription,
    },
    {
      question: `Quanto tempo dura o curso de ${curso.name}?`,
      answer: `O curso de ${curso.fullName} tem duração de ${curso.duration}.`,
    },
    {
      question: `Quanto custa o curso de ${curso.name} com bolsa?`,
      answer: lowPrice > 0
        ? `Com bolsa pelo Bolsa Click, o curso de ${curso.name} pode ser encontrado a partir de R$ ${formatBRL(lowPrice)} por mês, com descontos de até 80%.`
        : `O Bolsa Click oferece bolsas de até 80% de desconto para o curso de ${curso.name}. Cadastre-se grátis para ver as ofertas.`,
    },
    {
      question: `Qual o salário médio de quem faz ${curso.name}?`,
      answer: `O salário médio para profissionais formados em ${curso.name} é de ${curso.averageSalary}.`,
    },
  ]
}

export function buildCityFaqItems(curso: FeaturedCourseData, cityName: string, cityState: string, lowPrice: number): FaqItem[] {
  return [
    {
      question: `Quanto custa ${curso.name} em ${cityName}?`,
      answer: lowPrice > 0
        ? `Em ${cityName}-${cityState}, o curso de ${curso.name} pode ser encontrado a partir de R$ ${formatBRL(lowPrice)} por mês com bolsa pelo Bolsa Click, com descontos de até 80%.`
        : `O Bolsa Click oferece bolsas de até 80% de desconto para ${curso.name} em ${cityName}. Cadastre-se grátis para ver as ofertas.`,
    },
    {
      question: `Quais faculdades oferecem ${curso.name} em ${cityName}?`,
      answer: `Temos diversas faculdades parceiras que oferecem ${curso.name} em ${cityName} e região. Compare preços e encontre a melhor bolsa pelo Bolsa Click.`,
    },
    {
      question: `${curso.name} em ${cityName} é EAD ou presencial?`,
      answer: `O curso de ${curso.name} em ${cityName} está disponível nas modalidades EAD, semipresencial e presencial — você escolhe o formato que melhor se encaixa na sua rotina.`,
    },
    {
      question: `Quanto tempo dura ${curso.name}?`,
      answer: `O curso de ${curso.fullName} tem duração de ${curso.duration}.`,
    },
  ]
}
