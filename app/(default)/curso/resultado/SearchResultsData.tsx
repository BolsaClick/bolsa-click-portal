import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import { normalizeAcademicLevel } from '@/app/lib/academic-level'
import SearchResultsView, { type ShowCoursesResult } from './SearchResultsView'
import ResultsSkeleton from './ResultsSkeleton'
import { buildCourseNameForAPI } from './course-name'
import type { ResultsCurrent } from './ResultsShell'

// ─── Cache em memória da busca (só servidor) ─────────────────────────────────
// Query fria contra Tartarus+Athena chegou a 30s+ de SSR (medido 2026-07-27);
// com cache o segundo visitante da mesma busca recebe em ~0. Em memória de
// propósito (processo Railway é longevo): controle fino da política — só entra
// resultado SAUDÁVEL (com ofertas e sem fonte caída), pra nunca pinar um
// "INDISPONÍVEL" transitório nem uma lista parcial por 5 minutos.
const SEARCH_CACHE_TTL_MS = 5 * 60_000
const SEARCH_CACHE_MAX = 300
const searchCache = new Map<string, { value: ShowCoursesResult; expires: number }>()

async function getShowFiltersCoursesCached(
  ...args: Parameters<typeof getShowFiltersCourses>
): Promise<ShowCoursesResult> {
  const key = JSON.stringify(args)
  const hit = searchCache.get(key)
  if (hit && hit.expires > Date.now()) return hit.value

  const value = (await getShowFiltersCourses(...args)) as ShowCoursesResult
  const healthy =
    (value?.data?.length ?? 0) > 0 &&
    !(value as { failedSources?: unknown[] }).failedSources?.length
  if (healthy) {
    if (searchCache.size >= SEARCH_CACHE_MAX) {
      const oldest = searchCache.keys().next().value
      if (oldest !== undefined) searchCache.delete(oldest)
    }
    searchCache.set(key, { value, expires: Date.now() + SEARCH_CACHE_TTL_MS })
  }
  return value
}

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
    showCourses = await getShowFiltersCoursesCached(
      courseNameForAPI,
      cidade || undefined,
      estado || undefined,
      modalidade && modalidade.trim() ? modalidade : undefined,
      normalizedNivel,
      1,
      20,
    )
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
      fallbackCourses = await getShowFiltersCoursesCached(
        courseNameForAPI,
        cidade || undefined,
        estado || undefined,
        undefined,
        normalizedNivel,
        1,
        12,
      )
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
