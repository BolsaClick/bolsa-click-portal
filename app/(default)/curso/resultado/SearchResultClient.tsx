/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  MapPin,
  Building2,
  ArrowLeft,
  ListFilter,
  LayoutGrid,
  LayoutList,
  ArrowRight,
  X,
} from 'lucide-react';

import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation';
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import { usePostHogTracking } from '@/app/lib/hooks/usePostHogTracking'
import { normalizeAcademicLevel } from '@/app/lib/academic-level'
import { titleCasePtBr } from '@/app/lib/utils/title-case'

import CourseCardNew from '@/app/components/CourseCardNew';
import FiltersPanel from './FiltersPanel';
import { Course } from '@/app/interface/course';
import { isBot } from '@/app/lib/utils/is-bot';

const NIVEL_LABEL: Record<string, string> = {
  GRADUACAO: 'Graduação',
  POS_GRADUACAO: 'Pós-graduação',
  CURSO_PROFISSIONALIZANTE: 'Profissionalizante',
  CURSO_TECNICO: 'Técnico',
  TECNICO: 'Técnico',
  CURSO_LIVRE: 'Curso livre',
}



export default function SearchResultClient() {
  const { trackEvent } = usePostHogTracking()
  const searchParams = useSearchParams();
  
  // Ler parâmetros da URL com fallback para window.location.search
  // O fallback é necessário porque useSearchParams pode não ter os valores imediatamente
  // durante a primeira navegação client-side (ex: vindo de /cursos/[slug]/[city])
  const [resolvedParams, setResolvedParams] = useState(() => ({
    c: searchParams.get('c') ?? '',
    cn: searchParams.get('cn') ?? '',
    cidade: searchParams.get('cidade') ?? '',
    estado: searchParams.get('estado') ?? '',
    modalidade: searchParams.get('modalidade') ?? '',
    nivel: searchParams.get('nivel') ?? 'GRADUACAO',
  }))

  // Sincronizar params quando useSearchParams muda ou no mount (fallback para window.location.search)
  useEffect(() => {
    const fromSP = {
      c: searchParams.get('c') ?? '',
      cn: searchParams.get('cn') ?? '',
      cidade: searchParams.get('cidade') ?? '',
      estado: searchParams.get('estado') ?? '',
      modalidade: searchParams.get('modalidade') ?? '',
      nivel: searchParams.get('nivel') ?? 'GRADUACAO',
    }

    if (fromSP.cidade || fromSP.estado || fromSP.c) {
      setResolvedParams(fromSP)
      return
    }

    // Fallback: ler de window.location.search quando useSearchParams está vazio
    if (typeof window !== 'undefined') {
      const wp = new URLSearchParams(window.location.search)
      const fromWindow = {
        c: wp.get('c') ?? '',
        cn: wp.get('cn') ?? '',
        cidade: wp.get('cidade') ?? '',
        estado: wp.get('estado') ?? '',
        modalidade: wp.get('modalidade') ?? '',
        nivel: wp.get('nivel') ?? 'GRADUACAO',
      }
      if (fromWindow.cidade || fromWindow.estado || fromWindow.c) {
        setResolvedParams(fromWindow)
      }
    }
  }, [searchParams])

  const curso = resolvedParams.c
  const cursoNomeCompleto = resolvedParams.cn
  const cidade = resolvedParams.cidade
  const estado = resolvedParams.estado
  const modalidade = resolvedParams.modalidade
  const nivel = resolvedParams.nivel



  const router = useRouter()
  const { handleSubmit, setValue } = useForm()
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState<{
    city: string;
    modalidades: string[];
    montlyFeeToMin: [number, number];
    rating: number | null;
  }>({
    city: '',
    modalidades: [],
    montlyFeeToMin: [0, 2000],
    rating: null,
  });

  function formatModalidade(value: string): string {
    const upper = value.toUpperCase();
    switch (upper) {
      case 'EAD':
        return 'EAD';
      case 'PRESENCIAL':
        return 'Presencial';
      case 'SEMIPRESENCIAL':
        return 'Semipresencial';
      default:
        return value;
    }
  }


  // Função para atualizar URL com novos parâmetros
  const updateURL = useCallback((newParams: {
    c?: string
    cn?: string
    cidade?: string
    estado?: string
    modalidade?: string
    nivel?: string
  }) => {
    const params = new URLSearchParams()
    
    // Determinar o valor final de cada parâmetro
    const finalC = newParams.c !== undefined 
      ? (newParams.c && newParams.c.trim() ? newParams.c.trim() : '') 
      : (curso || '')
    
    const finalCn = newParams.cn !== undefined
      ? (newParams.cn && newParams.cn.trim() ? newParams.cn.trim() : '')
      : (cursoNomeCompleto || '')
    
    const finalCidade = newParams.cidade !== undefined
      ? (newParams.cidade && newParams.cidade.trim() ? newParams.cidade.trim() : '')
      : (cidade || '')
    
    const finalEstado = newParams.estado !== undefined
      ? (newParams.estado && newParams.estado.trim() ? newParams.estado.trim() : '')
      : (estado || '')
    
    const finalModalidade = newParams.modalidade !== undefined
      ? (newParams.modalidade && newParams.modalidade.trim() ? newParams.modalidade.trim() : '')
      : (modalidade || '')
    
    const finalNivel = newParams.nivel !== undefined
      ? newParams.nivel
      : (nivel || 'GRADUACAO')
    
    // Adicionar apenas parâmetros com valor
    if (finalC) {
      params.set('c', finalC)
      // Só adicionar cn se tiver valor e se c também tiver
      if (finalCn) {
        params.set('cn', finalCn)
      }
    }
    
    if (finalCidade) {
      params.set('cidade', finalCidade)
    }
    
    if (finalEstado) {
      params.set('estado', finalEstado)
    }
    
    if (finalModalidade) {
      params.set('modalidade', finalModalidade)
    }
    
    // Sempre adicionar o nível acadêmico
    params.set('nivel', finalNivel)
    
    router.push(`/curso/resultado?${params.toString()}`)
  }, [curso, cursoNomeCompleto, cidade, estado, modalidade, nivel, router])

  // Montar nome do curso para exibição: curso limpo + sufixo do cn (se houver),
  // com title case PT-BR pra não exibir "eletricista" em minúsculo na H1.
  const courseDisplayName = useMemo(() => {
    if (!curso) return ''

    // O cn agora contém apenas o sufixo (Bacharelado, Licenciatura, Tecnólogo).
    const raw = cursoNomeCompleto && cursoNomeCompleto.trim()
      ? `${curso} - ${cursoNomeCompleto}`
      : curso

    return titleCasePtBr(raw)
  }, [curso, cursoNomeCompleto])

  const [locationDetected, setLocationDetected] = useState(false)

  // Detectar localização por IP se não houver cidade na URL.
  // Com pequeno delay ao vir da home: evita rodar com searchParams ainda vazios (client nav)
  // e sobrescrever a URL perdendo curso/cidade/estado.
  // IMPORTANTE: Bots/crawlers NÃO executam geolocalização para evitar URLs com Mountain View, CA.
  // IMPORTANTE: Se já tem curso na URL, NÃO bloquear a busca esperando geolocalização —
  // a query roda nacional na hora, e o usuário pode filtrar cidade depois.
  useEffect(() => {
      if (cidade && estado) {
        setFilters((prev) => ({
          ...prev,
          city: cidade,
          modalidades: modalidade && modalidade.trim() ? [formatModalidade(modalidade)] : [],
        }));
        return;
      }

    if (curso && curso.trim()) {
      setFilters((prev) => ({
        ...prev,
        modalidades: modalidade && modalidade.trim() ? [formatModalidade(modalidade)] : [],
      }));
      setLocationDetected(true);
      return;
    }

    if (locationDetected) return;

    // Não executar geolocalização para bots/crawlers
    if (isBot()) {
      setLocationDetected(true)
      return
    }

    const timeoutId = setTimeout(async () => {
      if (locationDetected) return;
      // Revalidar URL atual (pode ter atualizado após navegação da home)
      if (typeof window !== 'undefined') {
        const current = new URLSearchParams(window.location.search)
        const currentCidade = current.get('cidade') ?? ''
        const currentEstado = current.get('estado') ?? ''
        if (currentCidade.trim() && currentEstado.trim()) {
          setFilters((prev) => ({
            ...prev,
            city: currentCidade,
            modalidades: (current.get('modalidade') ?? '').trim() ? [formatModalidade(current.get('modalidade')!)] : [],
          }));
          return;
        }
      }

      try {
        const { getCityFromOurAPIByIP } = await import('@/app/lib/api/get-city-from-api-by-ip')
        const location = await getCityFromOurAPIByIP()
        if (!location) return

        setLocationDetected(true)

        const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
        params.set('cidade', location.city)
        params.set('estado', location.state)
        if (!params.has('c') && curso) params.set('c', curso)
        if (!params.has('cn') && cursoNomeCompleto) params.set('cn', cursoNomeCompleto)
        if (!params.has('nivel')) params.set('nivel', nivel)
        if (!params.has('modalidade') && modalidade?.trim()) params.set('modalidade', modalidade)

        router.replace(`/curso/resultado?${params.toString()}`, { scroll: false })
      } catch (error) {
        console.error('Erro ao detectar localização:', error)
        setLocationDetected(true)
        const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
        params.set('cidade', 'São Paulo')
        params.set('estado', 'SP')
        if (!params.has('c') && curso) params.set('c', curso)
        if (!params.has('cn') && cursoNomeCompleto) params.set('cn', cursoNomeCompleto)
        if (!params.has('nivel')) params.set('nivel', nivel)
        if (!params.has('modalidade') && modalidade?.trim()) params.set('modalidade', modalidade)
        router.replace(`/curso/resultado?${params.toString()}`, { scroll: false })
      }
    }, 350)

    return () => clearTimeout(timeoutId)
  }, [cidade, estado, modalidade, nivel, curso, cursoNomeCompleto, router, locationDetected]);


  const courseNameForAPI = useMemo(() => {
    if (cursoNomeCompleto && curso) {
      // cn agora contém apenas o sufixo, então juntamos: c + cn
      return `${curso} - ${cursoNomeCompleto}`
    }
    return cursoNomeCompleto || curso || undefined
  }, [curso, cursoNomeCompleto])

  // Habilitar busca assim que tiver cidade e estado (da URL ou após detecção por IP),
  // OU quando já há curso definido — nesse caso buscamos nacional na hora, sem esperar geo.
  const canSearch = (!!cidade?.trim() && !!estado?.trim()) || !!curso?.trim() || !!cursoNomeCompleto?.trim();

  const normalizedNivel = normalizeAcademicLevel(nivel)
  const queryClient = useQueryClient()

  // Cache agressivo:
  // - staleTime 5 min: dados são considerados frescos por 5 min, sem refetch
  // - gcTime 30 min: cache permanece em memória 30 min após o último uso
  // - keepPreviousData: ao trocar filtro/página, mostra resultado antigo enquanto busca novo
  // - sem refetchOnMount/Focus/Reconnect: confiamos no cache até staleTime expirar
  const SEARCH_STALE_TIME = 5 * 60 * 1000
  const SEARCH_GC_TIME = 30 * 60 * 1000

  const buildQueryKey = useCallback(
    (page: number) =>
      ['courses', 'filter', courseNameForAPI, cidade, estado, modalidade, normalizedNivel, page] as const,
    [courseNameForAPI, cidade, estado, modalidade, normalizedNivel],
  )

  const { data: showCourses, isLoading, isFetching } = useQuery({
    queryFn: () => getShowFiltersCourses(
      courseNameForAPI,
      cidade || undefined,
      estado || undefined,
      modalidade && modalidade.trim() ? modalidade : undefined,
      normalizedNivel,
      1,
      20,
    ),
    queryKey: buildQueryKey(1),
    enabled: canSearch,
    staleTime: SEARCH_STALE_TIME,
    gcTime: SEARCH_GC_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    placeholderData: keepPreviousData,
  })

  // Fallback automático: quando a busca exata vier vazia mas o usuário pediu
  // curso + cidade + modalidade, refazemos a query SEM a modalidade. Assim
  // mostramos o mesmo curso disponível em outras modalidades em vez de
  // simplesmente dizer "não encontramos nada".
  const mainResultsCount = (showCourses?.data?.length ?? 0) as number
  const hasCourseFilter = !!(curso?.trim() || cursoNomeCompleto?.trim())
  const hasModalityFilter = !!(modalidade && modalidade.trim())
  const shouldFetchFallback =
    !!showCourses && mainResultsCount === 0 && hasCourseFilter && hasModalityFilter

  const { data: fallbackData, isLoading: fallbackLoading } = useQuery({
    queryFn: () => getShowFiltersCourses(
      courseNameForAPI,
      cidade || undefined,
      estado || undefined,
      undefined,
      normalizedNivel,
      1,
      12,
    ),
    queryKey: ['courses', 'fallback-no-modality', courseNameForAPI, cidade, estado, normalizedNivel] as const,
    enabled: shouldFetchFallback,
    staleTime: SEARCH_STALE_TIME,
    gcTime: SEARCH_GC_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  // Prefetch da próxima "página API" em background — backend só retorna 20 por chamada,
  // então enquanto o cliente pagina nos 20, já preparamos a próxima leva.
  useEffect(() => {
    if (!canSearch || !showCourses) return
    const nextKey = ['courses', 'filter', courseNameForAPI, cidade, estado, modalidade, normalizedNivel, 2] as const
    queryClient.prefetchQuery({
      queryKey: nextKey,
      queryFn: () =>
        getShowFiltersCourses(
          courseNameForAPI,
          cidade || undefined,
          estado || undefined,
          modalidade && modalidade.trim() ? modalidade : undefined,
          normalizedNivel,
          2,
          20,
        ),
      staleTime: SEARCH_STALE_TIME,
      gcTime: SEARCH_GC_TIME,
    })
  }, [canSearch, showCourses, courseNameForAPI, cidade, estado, modalidade, normalizedNivel, queryClient, SEARCH_STALE_TIME, SEARCH_GC_TIME])

  // Track search completion
  useEffect(() => {
    if (showCourses && !isLoading) {
      const coursesCount = Array.isArray(showCourses) ? showCourses.length : (showCourses?.data?.length || 0)
      trackEvent('course_search_completed', {
        course_name: courseNameForAPI,
        city: cidade,
        state: estado,
        modality: modalidade,
        academic_level: normalizedNivel,
        results_count: coursesCount,
        has_results: coursesCount > 0,
      })
    }
  }, [showCourses, isLoading, courseNameForAPI, cidade, estado, modalidade, nivel, trackEvent])


  // Filtrar por modalidade apenas se houver modalidade na URL
  const filteredByModality = useMemo(() => {
    // A nova API tartarus retorna os dados diretamente em um array
    // A estrutura pode ser: { data: [...], total: number } ou apenas array
    const coursesHere = showCourses?.data || showCourses || []
    
    if (!modalidade || !modalidade.trim()) {
      // Se não houver modalidade, retornar todos os cursos
      return coursesHere
    }
    
    // Se houver modalidade, filtrar por ela
    // Verificar tanto modality quanto commercialModality
    const modalidadeUpper = modalidade.toUpperCase()
    return coursesHere.filter((course: { modality?: string; commercialModality?: string }) => {
      const courseModality = (course.modality || '').toUpperCase()
      const courseCommercialModality = (course.commercialModality || '').toUpperCase()
      
      // Retornar true se qualquer um dos campos corresponder à modalidade buscada
      return courseModality === modalidadeUpper || courseCommercialModality === modalidadeUpper
    })
  }, [showCourses, modalidade])

  // Deduplicar por ID quando o usuário NÃO está buscando um curso específico.
  // - Com curso definido (c=...): mostra todas as unidades — usuário quer saber onde tem
  // - Sem curso (modo descoberta): deduplica por id pra mostrar variedade de cursos
  const deduplicatedCourses = useMemo(() => {
    const hasSpecificCourse = !!(curso?.trim() || cursoNomeCompleto?.trim())
    if (hasSpecificCourse) {
      return filteredByModality
    }

    const seenIds = new Set<string>()
    return filteredByModality.filter((course: { id?: string }) => {
      if (!course.id) return true
      if (seenIds.has(course.id)) {
        return false
      }
      seenIds.add(course.id)
      return true
    })
  }, [filteredByModality, curso, cursoNomeCompleto])

  const filteredByPrice = useMemo(() => {
    return deduplicatedCourses.filter((course: { minPrice?: number; montlyFeeToMin?: number; monthlyFee?: number; price?: number }) => {
      // Filtrar por preço se o campo existir
      const price = course.minPrice || course.montlyFeeToMin || course.monthlyFee || course.price || 0;
      return price >= filters.montlyFeeToMin[0] &&
        price <= filters.montlyFeeToMin[1];
    });
  }, [deduplicatedCourses, filters.montlyFeeToMin]);

  const paginatedCourses = filteredByPrice.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredByPrice.length / itemsPerPage);

  // Alternativas do fallback: dedup por id+modalidade pra mostrar variedade
  // (1 card por modalidade do mesmo curso) e descartar a modalidade que o
  // usuário buscou (que já retornou 0).
  const fallbackCourses = useMemo(() => {
    const list = (fallbackData?.data || []) as Array<{
      id?: string
      modality?: string
      commercialModality?: string
    }>
    const blockedModality = (modalidade || '').toUpperCase()
    const seen = new Set<string>()
    return list.filter((c) => {
      const mod = (c.commercialModality || c.modality || '').toUpperCase()
      if (blockedModality && mod === blockedModality) return false
      const key = `${c.id ?? ''}-${mod}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }).slice(0, 6)
  }, [fallbackData, modalidade])





// app/(default)/curso/resultado/SearchResultClient.tsx

const onSubmit = (data: any) => {
  // Construir URL com parâmetros essenciais
  const params = new URLSearchParams()
  
  // Parâmetros obrigatórios para buscar detalhes
  if (data.businessKey) params.set('groupId', data.businessKey)
  if (data.unitId) params.set('unitId', data.unitId)
  
  // Modalidade e turno
  const finalModality = data.modality || data.commercialModality || ''
  if (finalModality) params.set('modality', finalModality)
  
  const finalShift = data.classShift || data.shift || ''
  if (finalShift) params.set('shift', finalShift)
  
  // Parâmetros opcionais para exibição
  if (data.id) params.set('courseId', String(data.id))
  if (data.name) params.set('courseName', encodeURIComponent(data.name))
  if (data.unitCity) params.set('city', data.unitCity)
  if (data.unitState) params.set('state', data.unitState)
  if (data.brand) params.set('brand', data.brand)
  
  // Salvar no localStorage também (compatibilidade)
  localStorage.setItem('selectedCourse', JSON.stringify(data))
  
  // Redirecionar para matrícula com params na URL
  router.push(`/checkout/matricula?${params.toString()}`)
}

  // Handler para mudança de preço
  const handlePriceChange = useCallback((val: [number, number]) => {
    setFilters((prev) => ({ ...prev, montlyFeeToMin: val }))
    trackEvent('course_filter_price_changed', {
      price_min: val[0],
      price_max: val[1],
      course_name: courseNameForAPI,
      city: cidade,
      state: estado,
    })
  }, [trackEvent, courseNameForAPI, cidade, estado])

  // Handler para mudança de modalidade
  const handleModalityChange = useCallback((mode: string) => {
    updateURL({ modalidade: mode })
    trackEvent('course_filter_modality_changed', {
      modality: mode,
      course_name: courseNameForAPI,
      city: cidade,
      state: estado,
    })
  }, [updateURL, trackEvent, courseNameForAPI, cidade, estado])

  // Handler para seleção de curso
  const handleCourseSelect = useCallback((courseNameClean: string, courseNameFull: string) => {
    // Resetar página para 1 quando mudar o curso
    setCurrentPage(1)
    updateURL({
      c: courseNameClean,
      cn: courseNameFull,
    })
    trackEvent('course_search_initiated', {
      course_name: courseNameClean,
      course_name_full: courseNameFull,
      city: cidade,
      state: estado,
      academic_level: normalizedNivel,
    })
  }, [updateURL, trackEvent, cidade, estado, nivel])

  // Handler para seleção de cidade
  const handleCitySelect = useCallback((newCity: string, newState: string) => {
    updateURL({
      cidade: newCity,
      estado: newState,
    })
    trackEvent('course_search_location_changed', {
      city: newCity,
      state: newState,
      course_name: courseNameForAPI,
      academic_level: normalizedNivel,
    })
  }, [updateURL, trackEvent, courseNameForAPI, nivel])

  // Handler para mudança de nível acadêmico
  const handleAcademicLevelChange = useCallback((newLevel: string) => {
    // Resetar página para 1 quando mudar o nível
    setCurrentPage(1)
    updateURL({ nivel: newLevel })
    trackEvent('course_filter_academic_level_changed', {
      academic_level: newLevel,
      course_name: courseNameForAPI,
      city: cidade,
      state: estado,
      modality: modalidade,
    })
  }, [updateURL, trackEvent, courseNameForAPI, cidade, estado, modalidade])

  const nivelLabel = NIVEL_LABEL[normalizedNivel] ?? 'Cursos'
  const totalResults = filteredByPrice.length

  // "Não tenho dado ainda" → mostrar skeleton. Isso cobre:
  // - query desabilitada (esperando geolocalização ou filtros)
  // - primeira request em andamento (isLoading=true)
  // - hidratação client-side antes de useSearchParams resolver
  // O empty state só aparece quando temos uma resposta de fato com 0 itens.
  const awaitingResults = !showCourses || isLoading

  return (
    <div className="w-full bg-paper min-h-screen">
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
                      Bolsas de{' '}
                      <span className="italic text-white/85">{courseDisplayName}</span>
                    </>
                  ) : (
                    <>
                      Bolsas em{' '}
                      <span className="italic text-white/85">{nivelLabel}</span>
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
                  {!awaitingResults && totalResults > 0 && (
                    <>
                      <span className="text-white/30">·</span>
                      <span className="inline-flex items-center gap-1.5 num-tabular">
                        {totalResults} {totalResults === 1 ? 'oferta' : 'ofertas'}
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
          {/* SIDEBAR FILTROS — sticky desktop */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24">
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
                priceRange={filters.montlyFeeToMin}
                onPriceChange={handlePriceChange}
                onCourseSelect={handleCourseSelect}
                onClose={() => setShowMobileFilters(false)}
              />
            </div>
          </aside>

          {/* MOBILE FILTROS DRAWER */}
          {showMobileFilters && (
            <div
              className="fixed inset-0 z-[60] lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Filtros"
            >
              <button
                type="button"
                aria-label="Fechar filtros"
                className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
                onClick={() => setShowMobileFilters(false)}
              />
              <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-paper shadow-2xl overflow-y-auto">
                <div className="flex items-center justify-between px-5 h-[60px] border-b border-hairline bg-white sticky top-0 z-10">
                  <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
                    Filtros
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    aria-label="Fechar"
                    className="p-2 -mr-2 text-ink-700 hover:text-ink-900"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-4">
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
                    priceRange={filters.montlyFeeToMin}
                    onPriceChange={handlePriceChange}
                    onCourseSelect={handleCourseSelect}
                    onClose={() => setShowMobileFilters(false)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* RESULTADOS */}
          <div className="lg:col-span-8 xl:col-span-9 min-w-0">
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

            {awaitingResults ? (
              <div
                className={`grid ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5'
                    : 'grid-cols-1 gap-4'
                }`}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white border border-hairline rounded-2xl p-5 md:p-6 animate-pulse"
                  >
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
                        {cidade && (
                          <span className="text-ink-500"> em {cidade}</span>
                        )}
                      </h3>
                      <p className="text-ink-500 text-[14px] mt-2 leading-relaxed">
                        Não encontramos ofertas com essa combinação exata de filtros.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Alternativas em outras modalidades */}
                {shouldFetchFallback && fallbackLoading ? (
                  <div
                    className={`grid ${
                      viewMode === 'grid'
                        ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5'
                        : 'grid-cols-1 gap-4'
                    }`}
                  >
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white border border-hairline rounded-2xl p-5 md:p-6 animate-pulse"
                      >
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
                        <li key={`fb-${(course as Course).id ?? index}-${index}`} className="h-full">
                          <CourseCardNew
                            courseName={courseDisplayName || (course as Course).name || ''}
                            course={course as Course}
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
                            modalidade === 'PRESENCIAL'
                              ? 'SEMIPRESENCIAL'
                              : modalidade === 'SEMIPRESENCIAL'
                              ? 'EAD'
                              : 'PRESENCIAL'
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
              <nav
                aria-label="Paginação"
                className="mt-10 flex items-center justify-between gap-4 hairline-t pt-6"
              >
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
                            active
                              ? 'bg-ink-900 text-white'
                              : 'text-ink-700 hover:bg-paper-warm'
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
          </div>
        </div>
      </section>
    </div>
  )
}

