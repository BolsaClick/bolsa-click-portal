'use client'

import { useCallback, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Building2, ArrowLeft, ListFilter, LayoutGrid, LayoutList, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePostHogTracking } from '@/app/lib/hooks/usePostHogTracking'
import { useIsDesktopViewport } from '@/app/lib/hooks/useIsDesktopViewport'
import { normalizeAcademicLevel } from '@/app/lib/academic-level'
import { brazilCityStateOrNull } from '@/app/lib/geo/brazil-location'
import { titleCasePtBr } from '@/app/lib/utils/title-case'
import GeoRedirect from './GeoRedirect'
import { useResultsFilter } from './ResultsFilterContext'
import { buildCourseNameForAPI } from './course-name'

// Import dinâmico (chunk separado) — não só o MOUNT do FiltersPanel é
// condicional a `isDesktop`/`showMobileFilters`, o próprio módulo (2
// useQuery do react-query, PriceRangeSlider, vários useEffect) só é
// baixado/parseado quando alguém realmente vai renderizá-lo. Com import
// estático, o código entrava no bundle de qualquer forma e pagava parse+eval
// na hidratação mesmo sem nunca montar o componente. `ssr: true` (padrão)
// mantém o HTML do desktop idêntico a antes — o servidor ainda pode
// renderizá-lo quando `isDesktop` vem `true` do palpite por User-Agent.
const FiltersPanel = dynamic(() => import('./FiltersPanel'))

const NIVEL_LABEL: Record<string, string> = {
  GRADUACAO: 'Graduação',
  POS_GRADUACAO: 'Pós-graduação',
  CURSO_PROFISSIONALIZANTE: 'Profissionalizante',
  CURSO_TECNICO: 'Técnico',
  TECNICO: 'Técnico',
  CURSO_LIVRE: 'Curso livre',
}

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

export interface ResultsCurrent {
  curso: string
  cursoNomeCompleto: string
  cidade: string
  estado: string
  modalidade: string
  nivel: string
  /** Labels de marca selecionados (separados por vírgula) — filtro server-side. */
  marcas?: string
}

/**
 * Shell instantâneo da busca — hero, filtros e os toggles não dependem da
 * busca de ofertas, então renderizam na hora enquanto `children` (a busca em
 * si, atrás de Suspense) ainda está resolvendo no servidor.
 */
export default function ResultsShell({
  current,
  children,
  initialIsDesktop,
}: {
  current: ResultsCurrent
  children: React.ReactNode
  /**
   * Palpite server-side (por User-Agent) de "é desktop?" — ver `page.tsx` e
   * `isMobileUserAgent`. Decide se o <aside> já nasce com o FiltersPanel
   * montado (desktop, igual sempre foi) ou vazio (celular: painel só monta
   * quando o usuário abre o drawer). `useIsDesktopViewport` confirma via
   * matchMedia no cliente e corrige o raro caso de UA ambíguo.
   */
  initialIsDesktop: boolean
}) {
  const { curso, cursoNomeCompleto, cidade, estado, modalidade, nivel } = current
  const router = useRouter()
  const { trackEvent } = usePostHogTracking()
  const isDesktop = useIsDesktopViewport(initialIsDesktop)
  const { viewMode, setViewMode, priceRange, setPriceRange, availableBrands, selectedBrands, toggleBrand } =
    useResultsFilter()
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const updateURL = useCallback(
    (newParams: {
      c?: string
      cn?: string
      cidade?: string
      estado?: string
      modalidade?: string
      nivel?: string
      /** Só entra na URL quando passado explicitamente — qualquer outra
       *  mudança de busca derruba o filtro de marca (mesma regra do reset
       *  client-side por searchKey). */
      marcas?: string
    }) => {
      const params = new URLSearchParams()

      const finalC =
        newParams.c !== undefined ? (newParams.c && newParams.c.trim() ? newParams.c.trim() : '') : curso || ''
      const finalCn =
        newParams.cn !== undefined
          ? newParams.cn && newParams.cn.trim()
            ? newParams.cn.trim()
            : ''
          : cursoNomeCompleto || ''
      const finalCidade =
        newParams.cidade !== undefined
          ? newParams.cidade && newParams.cidade.trim()
            ? newParams.cidade.trim()
            : ''
          : cidade || ''
      const finalEstado =
        newParams.estado !== undefined
          ? newParams.estado && newParams.estado.trim()
            ? newParams.estado.trim()
            : ''
          : estado || ''
      const allowed = brazilCityStateOrNull(finalCidade, finalEstado)
      const safeCidade = allowed?.city ?? ''
      const safeEstado = allowed?.state ?? ''
      const finalModalidade =
        newParams.modalidade !== undefined
          ? newParams.modalidade && newParams.modalidade.trim()
            ? newParams.modalidade.trim()
            : ''
          : modalidade || ''
      const finalNivel = newParams.nivel !== undefined ? newParams.nivel : nivel || 'GRADUACAO'

      if (finalC) {
        params.set('c', finalC)
        if (finalCn) params.set('cn', finalCn)
      }
      if (safeCidade) params.set('cidade', safeCidade)
      if (safeEstado) params.set('estado', safeEstado)
      if (finalModalidade) params.set('modalidade', finalModalidade)
      params.set('nivel', finalNivel)
      if (newParams.marcas) params.set('marcas', newParams.marcas)

      router.push(`/curso/resultado?${params.toString()}`, { scroll: false })
    },
    [curso, cursoNomeCompleto, cidade, estado, modalidade, nivel, router],
  )

  const courseNameForAPI = useMemo(
    () => buildCourseNameForAPI(curso, cursoNomeCompleto),
    [curso, cursoNomeCompleto],
  )

  const courseDisplayName = useMemo(() => {
    if (!curso) return ''
    const raw = cursoNomeCompleto && cursoNomeCompleto.trim() ? `${curso} - ${cursoNomeCompleto}` : curso
    return titleCasePtBr(raw)
  }, [curso, cursoNomeCompleto])

  const handlePriceChange = useCallback(
    (val: [number, number]) => {
      setPriceRange(val)
      trackEvent('course_filter_price_changed', {
        price_min: val[0],
        price_max: val[1],
        course_name: courseNameForAPI,
        city: cidade,
        state: estado,
      })
    },
    [setPriceRange, trackEvent, courseNameForAPI, cidade, estado],
  )

  const handleBrandToggle = useCallback(
    (brand: string) => {
      toggleBrand(brand)
      // Leva a seleção pra URL: a busca server-side restringe as FONTES por
      // marca (Tartarus `brands`/Athena `brand`), senão marcas caras/pequenas
      // (IBMEC, Wyden) nunca aparecem — a ordenação por preço as deixa fora
      // da página 1 e o filtro client-side não tem o que mostrar.
      const next = selectedBrands.includes(brand)
        ? selectedBrands.filter((b) => b !== brand)
        : [...selectedBrands, brand]
      updateURL({ marcas: next.join(',') })
      trackEvent('course_filter_brand_changed', {
        brand,
        course_name: courseNameForAPI,
        city: cidade,
        state: estado,
      })
    },
    [toggleBrand, selectedBrands, updateURL, trackEvent, courseNameForAPI, cidade, estado],
  )

  const handleModalityChange = useCallback(
    (mode: string) => {
      updateURL({ modalidade: mode })
      trackEvent('course_filter_modality_changed', {
        modality: mode,
        course_name: courseNameForAPI,
        city: cidade,
        state: estado,
      })
    },
    [updateURL, trackEvent, courseNameForAPI, cidade, estado],
  )

  const handleCourseSelect = useCallback(
    (courseNameClean: string, courseNameFull: string) => {
      updateURL({ c: courseNameClean, cn: courseNameFull })
      trackEvent('course_search_initiated', {
        course_name: courseNameClean,
        course_name_full: courseNameFull,
        city: cidade,
        state: estado,
        academic_level: normalizeAcademicLevel(nivel),
      })
    },
    [updateURL, trackEvent, cidade, estado, nivel],
  )

  const handleCitySelect = useCallback(
    (newCity: string, newState: string) => {
      updateURL({ cidade: newCity, estado: newState })
      trackEvent('course_search_location_changed', {
        city: newCity,
        state: newState,
        course_name: courseNameForAPI,
        academic_level: normalizeAcademicLevel(nivel),
      })
    },
    [updateURL, trackEvent, courseNameForAPI, nivel],
  )

  const handleAcademicLevelChange = useCallback(
    (newLevel: string) => {
      updateURL({ nivel: newLevel })
      trackEvent('course_filter_academic_level_changed', {
        academic_level: newLevel,
        course_name: courseNameForAPI,
        city: cidade,
        state: estado,
        modality: modalidade,
      })
    },
    [updateURL, trackEvent, courseNameForAPI, cidade, estado, modalidade],
  )

  const nivelLabel = NIVEL_LABEL[normalizeAcademicLevel(nivel)] ?? 'Cursos'

  const filtersPanel = (onClose?: () => void) => (
    <FiltersPanel
      city={cidade}
      state={estado}
      modality={modalidade}
      academicLevel={nivel}
      courseName={curso}
      courseSuffix={cursoNomeCompleto}
      onModalityChange={handleModalityChange}
      onCitySelect={handleCitySelect}
      onAcademicLevelChange={handleAcademicLevelChange}
      priceRange={priceRange}
      onPriceChange={handlePriceChange}
      onCourseSelect={handleCourseSelect}
      onClose={onClose}
      availableBrands={availableBrands}
      selectedBrands={selectedBrands}
      onBrandToggle={handleBrandToggle}
    />
  )

  return (
    <div className="w-full bg-paper min-h-screen">
      <GeoRedirect
        curso={curso}
        cursoNomeCompleto={cursoNomeCompleto}
        cidade={cidade}
        estado={estado}
        modalidade={modalidade}
        nivel={nivel}
      />

      {/* HERO compacto navy editorial */}
      <section className="relative bg-bolsa-primary overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-32 w-[28rem] h-[28rem] rounded-full bg-bolsa-secondary/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-blue-400/15 blur-3xl"
        />
        <div className="container mx-auto px-4 pt-20 pb-12 md:pt-24 md:pb-14 relative">
          <div className="max-w-6xl mx-auto">
            <button
              type="button"
              onClick={router.back}
              className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-white/60 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft size={12} />
              Voltar
            </button>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="min-w-0">
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/60 inline-flex items-center gap-2 mb-3">
                  <span className="h-px w-8 bg-white/30" />
                  {nivelLabel} · Resultados da busca
                </span>
                <h1 className="font-display text-3xl md:text-4xl lg:text-[48px] font-semibold text-white leading-[1.05]">
                  {courseDisplayName ? (
                    <>
                      Bolsas de <span className="italic text-white/85">{courseDisplayName}</span>
                    </>
                  ) : (
                    <>
                      Bolsas em <span className="italic text-white/85">{nivelLabel}</span>
                    </>
                  )}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] tracking-[0.18em] uppercase text-white/70">
                  {cidade && estado && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={13} />
                      {cidade} — {estado}
                    </span>
                  )}
                  {modalidade && modalidade.trim() && (
                    <>
                      <span className="text-white/30">·</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 size={13} />
                        {formatModalidade(modalidade)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* View mode + filtros mobile */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="hidden sm:inline-flex items-center bg-white/10 backdrop-blur border border-white/20 rounded-full p-1">
                  <button
                    type="button"
                    aria-label="Visualizar em grade"
                    onClick={() => {
                      setViewMode('grid')
                      trackEvent('course_search_view_changed', {
                        view_mode: 'grid',
                        course_name: courseNameForAPI,
                        city: cidade,
                        state: estado,
                      })
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      viewMode === 'grid' ? 'bg-white text-ink-900' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Visualizar em lista"
                    onClick={() => {
                      setViewMode('list')
                      trackEvent('course_search_view_changed', {
                        view_mode: 'list',
                        course_name: courseNameForAPI,
                        city: cidade,
                        state: estado,
                      })
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      viewMode === 'list' ? 'bg-white text-ink-900' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <LayoutList size={16} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-bolsa-secondary text-white font-semibold rounded-full text-[13px] hover:bg-bolsa-secondary/90 transition-colors"
                >
                  <ListFilter size={14} />
                  Filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTEÚDO */}
      <section className="container mx-auto px-4 py-10 md:py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* SIDEBAR FILTROS — sticky desktop. `isDesktop` (não a classe CSS
              `hidden lg:block`, que só afeta pintura) decide se o
              FiltersPanel é montado: no celular ele nunca existe aqui, então
              a hidratação não paga o custo de um painel invisível — e o
              drawer mobile abaixo vira a ÚNICA cópia possível. */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24">{isDesktop && filtersPanel()}</div>
          </aside>

          {/* MOBILE FILTROS DRAWER */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
              <button
                type="button"
                aria-label="Fechar filtros"
                className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
                onClick={() => setShowMobileFilters(false)}
              />
              <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-paper shadow-2xl overflow-y-auto">
                <div className="flex items-center justify-between px-5 h-[60px] border-b border-hairline bg-white sticky top-0 z-10">
                  <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">Filtros</span>
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    aria-label="Fechar"
                    className="p-2 -mr-2 text-ink-700 hover:text-ink-900"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-4">{filtersPanel(() => setShowMobileFilters(false))}</div>
              </div>
            </div>
          )}

          {/* RESULTADOS */}
          <div className="lg:col-span-8 xl:col-span-9 min-w-0">{children}</div>
        </div>
      </section>
    </div>
  )
}
