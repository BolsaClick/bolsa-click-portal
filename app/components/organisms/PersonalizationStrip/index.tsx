'use client'

import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import Container from '../../atoms/Container'
import { useLastSearch, useVisitedCourses } from '@/app/lib/personalization/hooks'

const buildResultadoUrl = (s: {
  course?: string
  city?: string
  state?: string
  modality?: string
  level?: string
}) => {
  const params = new URLSearchParams()
  if (s.course) params.set('c', s.course)
  if (s.city) params.set('cidade', s.city)
  if (s.state) params.set('estado', s.state)
  if (s.modality) params.set('modalidade', s.modality)
  params.set('nivel', s.level ?? 'GRADUACAO')
  return `/curso/resultado?${params.toString()}`
}

const formatLastSearchLabel = (s: {
  course?: string
  city?: string
  state?: string
}) => {
  const courseLabel = s.course
    ? s.course.charAt(0).toUpperCase() + s.course.slice(1)
    : 'Bolsas'
  const locationLabel = s.city
    ? ` em ${s.city}${s.state ? ` — ${s.state}` : ''}`
    : ''
  return `${courseLabel}${locationLabel}`
}

export default function PersonalizationStrip() {
  const { lastSearch, enabled: searchEnabled } = useLastSearch()
  const { visited, enabled: visitedEnabled } = useVisitedCourses()

  if (!searchEnabled && !visitedEnabled) return null
  if (!lastSearch && visited.length === 0) return null

  return (
    <section
      aria-labelledby="personalization-title"
      className="bg-paper-warm border-y border-hairline py-10 md:py-12"
    >
      <Container>
        <h2 id="personalization-title" className="sr-only">
          Sua atividade recente
        </h2>

        {lastSearch && (
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 hairline-b pb-6 mb-6">
            <div className="min-w-0">
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-2 mb-2">
                <Clock size={12} />
                Continue sua busca
              </p>
              <p className="font-display text-2xl md:text-[28px] text-ink-900 leading-tight truncate">
                {formatLastSearchLabel(lastSearch)}
              </p>
            </div>
            <Link
              href={buildResultadoUrl(lastSearch)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-ink-900 text-white rounded-full text-[13px] font-semibold hover:bg-bolsa-secondary transition-colors flex-shrink-0"
            >
              Voltar pra busca
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {visited.length > 0 && (
          <div>
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-2 mb-4">
              <span className="h-px w-6 bg-ink-300" />
              Visto recentemente
            </p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-hairline border border-hairline">
              {visited.slice(0, 6).map((c) => (
                <li key={c.slug} className="bg-white">
                  <Link
                    href={`/cursos/${c.slug}`}
                    className="group flex flex-col px-4 py-4 transition-colors duration-200 hover:bg-paper"
                  >
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-1">
                      Curso
                    </span>
                    <span className="font-display text-[15px] text-ink-900 leading-tight group-hover:italic transition-all duration-200 line-clamp-2">
                      {c.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>
    </section>
  )
}
