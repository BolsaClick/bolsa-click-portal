import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import { normalizeAcademicLevel } from '@/app/lib/academic-level'
import SearchResultsView, { type ShowCoursesResult } from './SearchResultsView'
import ResultsSkeleton from './ResultsSkeleton'
import { buildCourseNameForAPI } from './course-name'
import type { ResultsCurrent } from './ResultsShell'

/**
 * Server Component isolado só pra busca de ofertas — envolto em `<Suspense>`
 * por `page.tsx`, assim hero/filtros renderizam na hora e só este pedaço
 * espera as APIs (Tartarus/Athena), que podem levar vários segundos.
 */
export default async function SearchResultsData({ current }: { current: ResultsCurrent }) {
  const { curso, cursoNomeCompleto, cidade, estado, modalidade, nivel } = current

  const courseNameForAPI = buildCourseNameForAPI(curso, cursoNomeCompleto)
  const normalizedNivel = normalizeAcademicLevel(nivel)

  // Mesma condição do client de antes: busca nacional imediata com curso
  // definido, OU cidade+estado (da URL ou já resolvidos pelo GeoRedirect).
  // Sem nenhum dos dois, ainda esperamos a geolocalização client-side —
  // mostrar o skeleton parado em vez de bater na API à toa.
  const canSearch = (!!cidade?.trim() && !!estado?.trim()) || !!curso?.trim() || !!cursoNomeCompleto?.trim()
  if (!canSearch) {
    return <ResultsSkeleton />
  }

  let showCourses: ShowCoursesResult | undefined
  let isError = false

  try {
    showCourses = (await getShowFiltersCourses(
      courseNameForAPI,
      cidade || undefined,
      estado || undefined,
      modalidade && modalidade.trim() ? modalidade : undefined,
      normalizedNivel,
      1,
      20,
    )) as ShowCoursesResult
  } catch (error) {
    console.error('Erro ao buscar cursos (resultado):', error)
    isError = true
  }

  // Fallback automático: quando a busca exata vier vazia mas o usuário pediu
  // curso + cidade + modalidade, refazemos SEM a modalidade — mostra o mesmo
  // curso disponível em outras modalidades em vez de só dizer "não encontramos nada".
  const mainResultsCount = showCourses?.data?.length ?? 0
  const hasCourseFilter = !!(curso?.trim() || cursoNomeCompleto?.trim())
  const hasModalityFilter = !!(modalidade && modalidade.trim())
  const shouldFetchFallback = !isError && mainResultsCount === 0 && hasCourseFilter && hasModalityFilter

  let fallbackCourses: ShowCoursesResult | undefined
  if (shouldFetchFallback) {
    try {
      fallbackCourses = (await getShowFiltersCourses(
        courseNameForAPI,
        cidade || undefined,
        estado || undefined,
        undefined,
        normalizedNivel,
        1,
        12,
      )) as ShowCoursesResult
    } catch (error) {
      console.error('Erro ao buscar fallback de modalidade (resultado):', error)
    }
  }

  return (
    <SearchResultsView
      // Remonta (reseta paginação/estado local) a cada busca nova.
      key={`${courseNameForAPI ?? ''}|${cidade}|${estado}|${modalidade}|${normalizedNivel}`}
      current={current}
      initialShowCourses={showCourses}
      initialIsError={isError}
      initialFallbackCourses={fallbackCourses}
    />
  )
}
