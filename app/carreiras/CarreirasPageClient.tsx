'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { FeaturedCourseData } from '../cursos/_data/types'
import { courseTypeLabel } from '../lib/courseTypeLabel'

interface Props {
  careers: FeaturedCourseData[]
}

type DemandKey = 'TODAS' | 'ALTA' | 'MEDIA' | 'BAIXA'

const DEMAND_LABEL: Record<Exclude<DemandKey, 'TODAS'>, string> = {
  ALTA: 'Alta',
  MEDIA: 'Média',
  BAIXA: 'Baixa',
}

const DEMAND_DOT: Record<Exclude<DemandKey, 'TODAS'>, string> = {
  ALTA: 'bg-emerald-500',
  MEDIA: 'bg-amber-500',
  BAIXA: 'bg-ink-300',
}

export default function CarreirasPageClient({ careers }: Props) {
  const [demand, setDemand] = useState<DemandKey>('TODAS')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return careers.filter((c) => {
      if (demand !== 'TODAS' && c.marketDemand !== demand) return false
      if (q && !c.name.toLowerCase().includes(q) && !c.fullName.toLowerCase().includes(q)) return false
      return true
    })
  }, [careers, demand, query])

  const highDemandCount = careers.filter((c) => c.marketDemand === 'ALTA').length

  return (
    <main className="bg-paper">
      {/* Hero */}
      <section className="bg-white border-b border-hairline">
        <div className="container mx-auto px-4 py-14 md:py-20">
          <div className="max-w-4xl">
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-500 mb-4">
              Carreiras · {String(careers.length).padStart(2, '0')} profissões
            </p>
            <h1 className="font-display text-4xl md:text-6xl text-ink-900 leading-[1.05] tracking-tight">
              Qual carreira combina com você?
            </h1>
            <p className="mt-6 text-lg md:text-xl text-ink-700 max-w-3xl leading-relaxed">
              Salário médio, mercado de trabalho, o que faz cada profissional e qual graduação seguir.
              Dados das principais profissões brasileiras — com bolsa de até 80% pra começar.
            </p>

            <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-px bg-hairline border border-hairline">
              <div className="bg-white px-5 py-4">
                <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">Profissões</dt>
                <dd className="mt-1 font-display num-tabular text-2xl text-ink-900">{careers.length}</dd>
              </div>
              <div className="bg-white px-5 py-4">
                <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">Alta demanda</dt>
                <dd className="mt-1 font-display num-tabular text-2xl text-ink-900">{highDemandCount}</dd>
              </div>
              <div className="bg-white px-5 py-4">
                <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">Bolsa até</dt>
                <dd className="mt-1 font-display num-tabular text-2xl text-bolsa-secondary">80%</dd>
              </div>
              <div className="bg-white px-5 py-4">
                <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">Faculdades</dt>
                <dd className="mt-1 font-display num-tabular text-2xl text-ink-900">30k+</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="border-b border-hairline bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {(['TODAS', 'ALTA', 'MEDIA', 'BAIXA'] as DemandKey[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDemand(d)}
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 font-mono text-[11px] tracking-[0.16em] uppercase transition-colors ${
                  demand === d
                    ? 'border-ink-900 bg-ink-900 text-white'
                    : 'border-hairline bg-white text-ink-700 hover:border-ink-700'
                }`}
              >
                {d === 'TODAS' ? 'Todas' : `Demanda ${DEMAND_LABEL[d]}`}
              </button>
            ))}
          </div>
          <div className="md:ml-auto md:w-72">
            <label className="sr-only" htmlFor="busca-carreira">Buscar profissão</label>
            <input
              id="busca-carreira"
              type="search"
              placeholder="Buscar profissão…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border border-hairline bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-500 focus:border-ink-900 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          {filtered.length === 0 ? (
            <p className="text-ink-700">Nenhuma profissão encontrada com esses filtros.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline border border-hairline">
              {filtered.map((c) => (
                <li key={c.slug} className="bg-white">
                  <Link
                    href={`/carreiras/${c.slug}`}
                    className="group flex h-full flex-col px-6 py-6 transition-colors hover:bg-paper"
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-3">
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">
                        {courseTypeLabel(c.type)} · {c.duration}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase text-ink-700">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${DEMAND_DOT[c.marketDemand]}`} aria-hidden="true" />
                        {DEMAND_LABEL[c.marketDemand]}
                      </span>
                    </div>
                    <h2 className="font-display text-2xl text-ink-900 group-hover:italic transition-all">
                      {c.name}
                    </h2>
                    <p className="mt-2 text-sm text-ink-700 line-clamp-3">
                      {c.description}
                    </p>
                    <div className="mt-auto pt-5 hairline-t">
                      <dl className="flex items-baseline justify-between">
                        <div>
                          <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">Salário médio</dt>
                          <dd className="font-display num-tabular text-lg text-ink-900 mt-0.5">
                            {c.averageSalary}
                          </dd>
                        </div>
                        <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-bolsa-secondary group-hover:text-ink-900 transition-colors">
                          Ver carreira →
                        </span>
                      </dl>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* CTA pra cursos */}
      <section className="border-t border-hairline bg-white py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl text-ink-900">
            Já sabe o que quer cursar?
          </h2>
          <p className="mt-3 text-ink-700">
            Compare bolsas, modalidades e preços em mais de 30.000 faculdades parceiras.
          </p>
          <Link
            href="/cursos"
            className="mt-6 inline-flex items-center gap-2 border border-ink-900 bg-ink-900 px-6 py-3 font-mono text-[11px] tracking-[0.18em] uppercase text-white hover:bg-bolsa-secondary hover:border-bolsa-secondary transition-colors"
          >
            Ver catálogo de cursos →
          </Link>
        </div>
      </section>
    </main>
  )
}
