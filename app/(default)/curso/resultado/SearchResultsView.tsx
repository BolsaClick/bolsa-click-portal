/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import Mascot from '@/app/components/v2/mascot/Mascot'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, RefreshCw, TriangleAlert, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import { usePostHogTracking } from '@/app/lib/hooks/usePostHogTracking'
import { trackFbqDual } from '@/app/lib/analytics/fbq'
import { normalizeAcademicLevel } from '@/app/lib/academic-level'
import { titleCasePtBr } from '@/app/lib/utils/title-case'
import { normalizeBrand } from '@/app/lib/utils/brand'
import CourseCardNew from '@/app/components/CourseCardNew'
import { Course } from '@/app/interface/course'
import { useResultsFilter } from './ResultsFilterContext'
import { buildCourseNameForAPI } from './course-name'
import type { ResultsCurrent } from './ResultsShell'

export interface ShowCoursesResult {
  data?: Course[]
  totalItems?: number
  totalPages?: number
  failedSources?: string[]
}

const ITEMS_PER_PAGE = 6

function formatModalidade(value: string): string {
  const upper = value.toUpperCase()
  switch (upper) {
    case 'EAD':
      return 'EAD'
    case 'PRESENCIAL':
      return 'Presencial'
    case 'SEMIPRESENCIAL':
      return 'Semipresencial'
    default:
      return value
  }
}

/** Dedup por id+modalidade, descartando a modalidade que o usuário já buscou (retornou 0). */
function dedupeFallback(list: ShowCoursesResult | undefined, blockedModality: string): Course[] {
  const items = (list?.data || []) as Array<Course & { commercialModality?: string | null }>
  const blocked = blockedModality.toUpperCase()
  const seen = new Set<string>()
  return items
    .filter((c) => {
      const mod = (c.commercialModality || c.modality || '').toUpperCase()
      if (blocked && mod === blocked) return false
      const key = `${c.id ?? ''}-${mod}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 6)
}

export default function SearchResultsView({
  current,
  initialShowCourses,
  initialIsError,
  initialFallbackCourses,
}: {
  current: ResultsCurrent
  initialShowCourses: ShowCoursesResult | undefined
  initialIsError: boolean
  initialFallbackCourses: ShowCoursesResult | undefined
}) {
  const { curso, cursoNomeCompleto, cidade, estado, modalidade, nivel } = current
  const { trackEvent } = usePostHogTracking()
  const router = useRouter()
  const { handleSubmit, setValue } = useForm()
  const { viewMode, priceRange, selectedBrands, setAvailableBrands } = useResultsFilter()

  const [currentPage, setCurrentPage] = useState(1)
  const [showCourses, setShowCourses] = useState(initialShowCourses)
  const [isError, setIsError] = useState(initialIsError)
  const [isFetching, setIsFetching] = useState(false)
  const [fallbackData, setFallbackData] = useState(initialFallbackCourses)
  const [fallbackLoading, setFallbackLoading] = useState(false)

  const courseNameForAPI = useMemo(() => buildCourseNameForAPI(curso, cursoNomeCompleto), [curso, cursoNomeCompleto])
  const courseDisplayName = useMemo(() => {
    if (!curso) return ''
    const raw = cursoNomeCompleto && cursoNomeCompleto.trim() ? `${curso} - ${cursoNomeCompleto}` : curso
    return titleCasePtBr(raw)
  }, [curso, cursoNomeCompleto])
  const normalizedNivel = normalizeAcademicLevel(nivel)
  const hasCourseFilter = !!(curso?.trim() || cursoNomeCompleto?.trim())
  const hasModalityFilter = !!(modalidade && modalidade.trim())

  const refetch = useCallback(async () => {
    setIsFetching(true)
    setIsError(false)
    try {
      const data = (await getShowFiltersCourses(
        courseNameForAPI,
        cidade || undefined,
        estado || undefined,
        modalidade && modalidade.trim() ? modalidade : undefined,
        normalizedNivel,
        1,
        20,
      )) as ShowCoursesResult
      setShowCourses(data)

      const count = data?.data?.length ?? 0
      if (count === 0 && hasCourseFilter && hasModalityFilter) {
        setFallbackLoading(true)
        try {
          const fb = (await getShowFiltersCourses(
            courseNameForAPI,
            cidade || undefined,
            estado || undefined,
            undefined,
            normalizedNivel,
            1,
            12,
          )) as ShowCoursesResult
          setFallbackData(fb)
        } catch {
          /* mantém o fallback anterior (se houver) */
        } finally {
          setFallbackLoading(false)
        }
      }
    } catch (error) {
      console.error('Erro ao rebuscar cursos (resultado):', error)
      setIsError(true)
    } finally {
      setIsFetching(false)
    }
  }, [courseNameForAPI, cidade, estado, modalidade, normalizedNivel, hasCourseFilter, hasModalityFilter])

  // Track de conclusão/falha da busca — dispara no mount (dado já veio do
  // servidor) e de novo a cada retry bem-sucedido/malsucedido.
  useEffect(() => {
    if (isError) {
      trackEvent('course_search_failed', {
        course_name: courseNameForAPI,
        city: cidade,
        state: estado,
        modality: modalidade,
        academic_level: normalizedNivel,
      })
      return
    }
    if (!showCourses) return
    const coursesCount = showCourses.data?.length ?? 0
    trackEvent('course_search_completed', {
      course_name: courseNameForAPI,
      city: cidade,
      state: estado,
      modality: modalidade,
      academic_level: normalizedNivel,
      results_count: coursesCount,
      has_results: coursesCount > 0,
    })
    if (courseNameForAPI) {
      void trackFbqDual('Search', {
        search_string: courseNameForAPI,
        content_category: normalizedNivel || undefined,
        city: cidade || undefined,
        state: estado || undefined,
        results_count: coursesCount,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCourses, isError])

  const failedSources = useMemo<string[]>(
    () => (Array.isArray(showCourses?.failedSources) ? showCourses!.failedSources! : []),
    [showCourses],
  )

  const filteredByModality = useMemo(() => {
    const coursesHere = showCourses?.data || []
    if (!modalidade || !modalidade.trim()) return coursesHere
    const modalidadeUpper = modalidade.toUpperCase()
    return coursesHere.filter((course: Course) => {
      const courseModality = (course.modality || '').toUpperCase()
      const courseCommercialModality = (course.commercialModality || '').toUpperCase()
      return courseModality === modalidadeUpper || courseCommercialModality === modalidadeUpper
    })
  }, [showCourses, modalidade])

  // Dedup por ID só no modo descoberta (sem curso definido) — com curso
  // definido, mostrar todas as unidades.
  const deduplicatedCourses = useMemo(() => {
    if (hasCourseFilter) return filteredByModality
    const seenIds = new Set<string>()
    return filteredByModality.filter((course: Course) => {
      if (!course.id) return true
      const key = String(course.id)
      if (seenIds.has(key)) return false
      seenIds.add(key)
      return true
    })
  }, [filteredByModality, hasCourseFilter])

  const availableBrands = useMemo(() => {
    const set = new Set<string>()
    for (const course of deduplicatedCourses) {
      const b = normalizeBrand(course.brand)
      if (b) set.add(b)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [deduplicatedCourses])

  // Publica as marcas disponíveis pro FiltersPanel (que mora no shell, fora
  // deste Suspense boundary) via contexto.
  useEffect(() => {
    setAvailableBrands(availableBrands)
  }, [availableBrands, setAvailableBrands])

  const filteredByBrand = useMemo(() => {
    if (selectedBrands.length === 0) return deduplicatedCourses
    return deduplicatedCourses.filter((course: Course) => selectedBrands.includes(normalizeBrand(course.brand)))
  }, [deduplicatedCourses, selectedBrands])

  const filteredByPrice = useMemo(() => {
    return filteredByBrand.filter((course: Course) => {
      const price = course.minPrice || 0
      return price >= priceRange[0] && price <= priceRange[1]
    })
  }, [filteredByBrand, priceRange])

  // Reseta a página quando o filtro de marca ou preço muda (mudanças de
  // curso/cidade/modalidade/nível já remontam este componente via `key`).
  useEffect(() => {
    setCurrentPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrands.join(','), priceRange[0], priceRange[1]])

  const paginatedCourses = filteredByPrice.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const totalPages = Math.ceil(filteredByPrice.length / ITEMS_PER_PAGE)

  const fallbackCourses = useMemo(() => dedupeFallback(fallbackData, modalidade || ''), [fallbackData, modalidade])

  const onSubmit = (data: any) => {
    const params = new URLSearchParams()
    if (data.businessKey) params.set('groupId', data.businessKey)
    if (data.unitId) params.set('unitId', data.unitId)
    const finalModality = data.modality || data.commercialModality || ''
    if (finalModality) params.set('modality', finalModality)
    const finalShift = data.classShift || data.shift || ''
    if (finalShift) params.set('shift', finalShift)
    if (data.id) params.set('courseId', String(data.id))
    if (data.name) params.set('courseName', encodeURIComponent(data.name))
    if (data.unitCity) params.set('city', data.unitCity)
    if (data.unitState) params.set('state', data.unitState)
    if (data.brand) params.set('brand', data.brand)
    localStorage.setItem('selectedCourse', JSON.stringify(data))
    router.push(`/checkout/matricula?${params.toString()}`)
  }

  const totalResults = filteredByPrice.length
  const awaitingResults = isFetching && !showCourses

  return (
    <>
      {/* Aviso discreto: resultado PARCIAL (uma das fontes de oferta falhou,
          mas a outra respondeu — mostramos o que veio em vez de esconder tudo) */}
      {!isError && !awaitingResults && failedSources.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6">
          <TriangleAlert size={16} className="flex-shrink-0 text-amber-600 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-amber-900 leading-relaxed">
              Parte das ofertas não carregou agora — algumas instituições podem estar faltando na lista.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-1.5 mt-1 font-mono text-[10px] tracking-[0.18em] uppercase text-amber-700 hover:text-amber-900 transition-colors"
            >
              <RefreshCw size={11} />
              Recarregar
            </button>
          </div>
        </div>
      )}

      {/* Toolbar de resultados */}
      {!awaitingResults && totalResults > 0 && (
        <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
          <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
            {totalResults === 1 ? 'oferta encontrada' : 'ofertas encontradas'}
            {isFetching && <span className="ml-2 text-ink-300 normal-case">atualizando…</span>}
          </h2>
          <span className="font-mono num-tabular text-[11px] text-ink-500">
            Página {currentPage} / {Math.max(totalPages, 1)}
          </span>
        </div>
      )}

      {isError ? (
        <div className="bg-white border border-hairline rounded-2xl p-8 md:p-10 text-center">
          <div className="flex justify-center mb-5">
            <Mascot pose="confuso" size={120} alt="Bob, o mascote do Bolsa Click, confuso" />
          </div>
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-red-500">Erro na busca</span>
          <h2 className="font-display text-xl md:text-2xl text-ink-900 mt-2">
            Não conseguimos carregar as ofertas agora
          </h2>
          <p className="text-ink-500 text-[14px] mt-2 mb-6 max-w-md mx-auto leading-relaxed">
            Pode ter sido uma instabilidade momentânea. Seus filtros foram preservados — tente de novo em alguns
            segundos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-bolsa-secondary text-white font-semibold rounded-full text-[14px] hover:bg-bolsa-secondary/90 transition-colors"
            >
              <RefreshCw size={15} />
              Tentar de novo
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-700 hover:text-ink-900 transition-colors"
            >
              Voltar pra home
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : awaitingResults ? (
        <div
          className={`grid ${
            viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5' : 'grid-cols-1 gap-4'
          }`}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-hairline rounded-2xl p-5 md:p-6 animate-pulse">
              <div className="flex items-start justify-between mb-5">
                <div className="h-9 w-24 bg-paper-warm rounded" />
                <div className="h-6 w-12 bg-paper-warm rounded-full" />
              </div>
              <div className="h-5 bg-paper-warm rounded w-3/4 mb-2" />
              <div className="h-5 bg-paper-warm rounded w-1/2 mb-5" />
              <div className="h-px bg-hairline mb-4" />
              <div className="flex items-end justify-between">
                <div>
                  <div className="h-3 w-20 bg-paper-warm rounded mb-2" />
                  <div className="h-7 w-24 bg-paper-warm rounded" />
                </div>
                <div className="h-10 w-10 bg-paper-warm rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : totalResults === 0 ? (
        <div className="space-y-6">
          {/* Banner: combinação indisponível */}
          <div className="bg-white border border-hairline rounded-2xl p-6 md:p-8">
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-500">
                <X size={18} strokeWidth={2.5} />
              </span>
              <div className="min-w-0 flex-1">
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-red-500 inline-flex items-center gap-2 mb-2">
                  Indisponível
                </span>
                <h3 className="font-display text-xl md:text-2xl text-ink-900 leading-tight">
                  {courseDisplayName || 'Cursos'}
                  {modalidade && (
                    <>
                      {' '}
                      <span className="text-ink-500 line-through decoration-red-300">
                        {formatModalidade(modalidade)}
                      </span>
                    </>
                  )}
                  {cidade && <span className="text-ink-500"> em {cidade}</span>}
                </h3>
                <p className="text-ink-500 text-[14px] mt-2 leading-relaxed">
                  Não encontramos ofertas com essa combinação exata de filtros.
                </p>
                <div className="mt-4 flex justify-center">
                  <Mascot pose="surpreso" size={104} alt="Bob, o mascote do Bolsa Click, surpreso" />
                </div>
              </div>
            </div>
          </div>

          {/* Alternativas em outras modalidades */}
          {hasModalityFilter && fallbackLoading ? (
            <div
              className={`grid ${
                viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5' : 'grid-cols-1 gap-4'
              }`}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white border border-hairline rounded-2xl p-5 md:p-6 animate-pulse">
                  <div className="h-9 w-24 bg-paper-warm rounded mb-5" />
                  <div className="h-5 bg-paper-warm rounded w-3/4 mb-2" />
                  <div className="h-5 bg-paper-warm rounded w-1/2 mb-5" />
                  <div className="h-7 w-24 bg-paper-warm rounded" />
                </div>
              ))}
            </div>
          ) : fallbackCourses.length > 0 ? (
            <div>
              <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
                <h4 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
                  Disponível em outras modalidades
                </h4>
                <span className="font-mono num-tabular text-[11px] text-ink-500">
                  {fallbackCourses.length} {fallbackCourses.length === 1 ? 'opção' : 'opções'}
                </span>
              </div>
              <ul
                className={`grid stagger-rise ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 items-stretch'
                    : 'grid-cols-1 gap-4'
                }`}
              >
                {fallbackCourses.map((course, index) => (
                  <li key={`fb-${course.id ?? index}-${index}`} className="h-full">
                    <CourseCardNew
                      courseName={courseDisplayName || course.name || ''}
                      course={course}
                      setFormData={(name: string, value: unknown) => setValue(name, value)}
                      viewMode={viewMode}
                      triggerSubmit={handleSubmit(onSubmit)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-white border border-hairline rounded-2xl p-8 md:p-10 text-center">
              <p className="text-ink-500 text-[15px] leading-relaxed max-w-md mx-auto mb-6">
                Tente ampliar a faixa de preço, trocar a cidade ou buscar outro curso.
              </p>
              {modalidade && (
                <button
                  type="button"
                  onClick={() => {
                    const other =
                      modalidade === 'PRESENCIAL' ? 'SEMIPRESENCIAL' : modalidade === 'SEMIPRESENCIAL' ? 'EAD' : 'PRESENCIAL'
                    const params = new URLSearchParams()
                    if (curso) params.set('c', curso)
                    params.set('cidade', cidade)
                    params.set('estado', estado)
                    params.set('modalidade', other)
                    params.set('nivel', normalizedNivel)
                    router.push(`/curso/resultado?${params.toString()}`)
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-bolsa-secondary text-white font-semibold rounded-full text-[14px] hover:bg-bolsa-secondary/90 transition-colors"
                >
                  Buscar em outra modalidade
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <ul
          key={`page-${currentPage}-${courseNameForAPI}-${cidade}-${modalidade}`}
          className={`grid stagger-rise ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 items-stretch'
              : 'grid-cols-1 gap-4'
          }`}
        >
          {paginatedCourses.map((course: Course, index: number) => (
            <li key={`${course.id ?? index}-${index}`} className="h-full">
              <CourseCardNew
                courseName={courseDisplayName || course.name || ''}
                course={course}
                setFormData={(name: string, value: unknown) => setValue(name, value)}
                viewMode={viewMode}
                triggerSubmit={handleSubmit(onSubmit)}
              />
            </li>
          ))}
        </ul>
      )}

      {/* PAGINATION */}
      {!awaitingResults && totalPages > 1 && (
        <nav aria-label="Paginação" className="mt-10 flex items-center justify-between gap-4 hairline-t pt-6">
          <button
            type="button"
            onClick={() => {
              setCurrentPage((prev) => {
                const newPage = Math.max(prev - 1, 1)
                trackEvent('course_search_page_changed', {
                  page: newPage,
                  direction: 'previous',
                  course_name: courseNameForAPI,
                  city: cidade,
                  state: estado,
                })
                return newPage
              })
            }}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-2 px-4 py-2 font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700 hover:text-ink-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft size={14} />
            Anterior
          </button>

          <ol className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1
              const active = currentPage === page
              return (
                <li key={page}>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPage(page)
                      trackEvent('course_search_page_changed', {
                        page,
                        direction: 'direct',
                        course_name: courseNameForAPI,
                        city: cidade,
                        state: estado,
                      })
                    }}
                    className={`min-w-[36px] h-9 px-3 font-mono num-tabular text-[12px] rounded-full transition-colors ${
                      active ? 'bg-ink-900 text-white' : 'text-ink-700 hover:bg-paper-warm'
                    }`}
                  >
                    {page}
                  </button>
                </li>
              )
            })}
          </ol>

          <button
            type="button"
            onClick={() => {
              setCurrentPage((prev) => {
                const newPage = Math.min(prev + 1, totalPages)
                trackEvent('course_search_page_changed', {
                  page: newPage,
                  direction: 'next',
                  course_name: courseNameForAPI,
                  city: cidade,
                  state: estado,
                })
                return newPage
              })
            }}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-2 px-4 py-2 font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700 hover:text-ink-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Próxima
            <ArrowRight size={14} />
          </button>
        </nav>
      )}
    </>
  )
}
