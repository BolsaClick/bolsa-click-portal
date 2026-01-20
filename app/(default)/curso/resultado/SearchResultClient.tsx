/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin,
  Building2, ArrowLeft,
  ListFilter, LayoutGrid, LayoutList,
  ArrowRight
} from 'lucide-react';

import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation';
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'

import CourseCardNew from '@/app/components/CourseCardNew';
import FiltersPanel from './FiltersPanel';
import Breadcrumbs from '@/app/components/molecules/Breadcrumbs';
import { Course } from '@/app/interface/course';



export default function SearchResultClient() {

  const searchParams = useSearchParams();
  
  // Ler parâmetros da nova estrutura de URL
  const curso = searchParams.get('c') ?? '';  // Nome do curso limpo (para exibição)
  const cursoNomeCompleto = searchParams.get('cn') ?? '';  // Nome completo com sufixo (para busca exata)
  const cidade = searchParams.get('cidade') ?? '';
  const estado = searchParams.get('estado') ?? '';
  const modalidade = searchParams.get('modalidade') ?? '';
  const nivel = searchParams.get('nivel') ?? 'GRADUACAO';  // GRADUACAO, POS_GRADUACAO, TECNICO



  const router = useRouter()
  const { handleSubmit, setValue } = useForm()
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isReady, setIsReady] = useState(false);

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

  // Montar nome do curso para exibição: curso limpo + sufixo do cn (se houver)
  const courseDisplayName = useMemo(() => {
    if (!curso) return ''
    
    // O cn agora contém apenas o sufixo (Bacharelado, Licenciatura, Tecnólogo)
    // Se tiver cn, juntar com o curso limpo
    if (cursoNomeCompleto && cursoNomeCompleto.trim()) {
      return `${curso} - ${cursoNomeCompleto}`
    }
    
    // Caso contrário, retornar apenas o curso limpo
    return curso
  }, [curso, cursoNomeCompleto])

  const [locationDetected, setLocationDetected] = useState(false)

  // Detectar localização por IP se não houver cidade na URL
  useEffect(() => {
    const detectLocation = async () => {
      // Se já tiver cidade e estado na URL, usar eles
      if (cidade && estado) {
        setFilters((prev) => ({
          ...prev,
          city: cidade,
          modalidades: modalidade && modalidade.trim() ? [formatModalidade(modalidade)] : [],
        }));
        setIsReady(true);
        return;
      }

      // Se já detectou localização, não detectar novamente
      if (locationDetected) {
        return;
      }

      // Se não tiver cidade, detectar por IP
      try {
        const { getLocationByIP } = await import('@/app/lib/api/get-location-by-ip')
        const location = await getLocationByIP()
        
        if (location) {
          setLocationDetected(true)
          
          // Atualizar URL com a cidade detectada
          const params = new URLSearchParams()
          if (curso) params.set('c', curso)
          if (cursoNomeCompleto) params.set('cn', cursoNomeCompleto)
          params.set('cidade', location.city)
          params.set('estado', location.region)
          // Só adicionar modalidade se tiver valor
          if (modalidade && modalidade.trim()) {
            params.set('modalidade', modalidade)
          }
          params.set('nivel', nivel)
          
          // Atualizar URL sem recarregar a página
          router.replace(`/curso/resultado?${params.toString()}`, { scroll: false })
        }
      } catch (error) {
        console.error('Erro ao detectar localização:', error)
        setLocationDetected(true)
        
        // Em caso de erro, usar valores padrão
        const params = new URLSearchParams()
        if (curso) params.set('c', curso)
        if (cursoNomeCompleto) params.set('cn', cursoNomeCompleto)
        params.set('cidade', 'São Paulo')
        params.set('estado', 'SP')
        // Só adicionar modalidade se tiver valor
        if (modalidade && modalidade.trim()) {
          params.set('modalidade', modalidade)
        }
        params.set('nivel', nivel)
        
        router.replace(`/curso/resultado?${params.toString()}`, { scroll: false })
      }
    };

    detectLocation();
  }, [cidade, estado, modalidade, nivel, curso, cursoNomeCompleto, router, locationDetected]);


  const courseNameForAPI = useMemo(() => {
    if (cursoNomeCompleto && curso) {
      // cn agora contém apenas o sufixo, então juntamos: c + cn
      return `${curso} - ${cursoNomeCompleto}`
    }
    return cursoNomeCompleto || curso || undefined
  }, [curso, cursoNomeCompleto])

  const { data: showCourses, isLoading } = useQuery({
    queryFn: () => getShowFiltersCourses(
      courseNameForAPI,  
      cidade || undefined, // city
      estado || undefined, // state
      modalidade && modalidade.trim() ? modalidade : undefined, // Só passar se tiver valor
      nivel || 'GRADUACAO', // academicLevel
      1, // page
      20 // size (20 itens por página)
    ),
    queryKey: ['courses', 'filter', courseNameForAPI, cidade, estado, modalidade, nivel],
    enabled: isReady && !!cidade && !!estado,
    staleTime: 0, // Permitir refetch quando os parâmetros mudarem
    refetchOnWindowFocus: false, // Não refetch quando a janela ganha foco
    refetchOnMount: true, // Refetch quando o componente monta novamente (quando URL muda)
    refetchOnReconnect: false, // Não refetch quando reconecta
  });


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
    const modalidadeUpper = modalidade.toUpperCase()
    return coursesHere.filter((course: { modality?: string; commercialModality?: string }) => {
      const courseModality = (course.modality || course.commercialModality || '').toUpperCase()
      return courseModality === modalidadeUpper
    })
  }, [showCourses, modalidade])

  const filteredByPrice = filteredByModality.filter((course: { minPrice?: number; montlyFeeToMin?: number; monthlyFee?: number; price?: number }) => {
    // Filtrar por preço se o campo existir
    const price = course.minPrice || course.montlyFeeToMin || course.monthlyFee || course.price || 0;
    return price >= filters.montlyFeeToMin[0] &&
      price <= filters.montlyFeeToMin[1];
  });

  const paginatedCourses = filteredByPrice.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredByPrice.length / itemsPerPage);





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
  }, [])

  // Handler para mudança de modalidade
  const handleModalityChange = useCallback((mode: string) => {
    updateURL({ modalidade: mode })
  }, [updateURL])

  // Handler para seleção de curso
  const handleCourseSelect = useCallback((courseNameClean: string, courseNameFull: string) => {
    // Resetar página para 1 quando mudar o curso
    setCurrentPage(1)
    updateURL({
      c: courseNameClean,
      cn: courseNameFull,
    })
  }, [updateURL])

  // Handler para seleção de cidade
  const handleCitySelect = useCallback((newCity: string, newState: string) => {
    updateURL({
      cidade: newCity,
      estado: newState,
    })
  }, [updateURL])

  return (
    <div className="w-full  bg-neutral-50">
      {/* Enhanced Header */}
      <header className="w-full bg-bolsa-primary shadow-sm z-50">
        <div className='pt-24 pb-6'>
          <div className="p-4 mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4">
              <button onClick={router.back} className="hidden sm:inline-flex items-center justify-center rounded-md py-2.5 px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-bolsa-secondary text-neutral-50 hover:bg-slate-600 focus:ring-bolsa-secondary/20">
                <ArrowLeft size={20} className="mr-2" />
                <span className="hidden sm:inline">Voltar para Busca</span>
              </button>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="hidden sm:flex items-center space-x-2 bg-white rounded-lg border border-neutral-200 p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-emerald-50 text-bolsa-secondary' : 'text-neutral-500 hover:bg-neutral-50'}`}
                  >
                    <LayoutGrid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-emerald-50 text-bolsa-secondary' : 'text-neutral-500 hover:bg-neutral-50'}`}
                  >
                    <LayoutList size={20} />
                  </button>
                </div>

              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                {/* Só mostrar título se tiver curso */}
                {courseDisplayName && (
                  <div className="flex items-center space-x-2">
                    <Search size={20} className="text-emerald-100" />
                    <h1 className="text-xl font-bold text-emerald-50">
                      Resultados para: <span className="text-emerald-200">{courseDisplayName}</span>
                    </h1>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 sm:gap-3 text-sm text-emerald-50">
                  {cidade && estado && (
                    <>
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-1 text-bolsa-secondary" />
                        {cidade} - {estado}
                      </div>
                      {/* Só mostrar separador se tiver modalidade */}
                      {modalidade && modalidade.trim() && <span className="hidden sm:inline">•</span>}
                    </>
                  )}
                  {/* Só mostrar modalidade se tiver valor */}
                  {modalidade && modalidade.trim() && (
                    <div className="flex items-center">
                      <Building2 size={16} className="mr-1 text-bolsa-secondary" />
                      {formatModalidade(modalidade)}
                    </div>
                  )}
                  
                </div>
                <div className="mx-auto flex justify-start ">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            ...(courseDisplayName
              ? [
                  { label: 'Cursos', href: '/curso' },
                  { 
                    label: courseDisplayName, 
                    href: `/curso/resultado?${new URLSearchParams({ 
                      ...(curso ? { c: curso } : {}),
                      ...(cursoNomeCompleto ? { cn: cursoNomeCompleto } : {}),
                      ...(cidade ? { cidade } : {}),
                      ...(estado ? { estado } : {}),
                      ...(modalidade ? { modalidade } : {}),
                      ...(nivel ? { nivel } : {})
                    }).toString()}` 
                  }
                ]
              : [{ label: 'Cursos', href: '/curso' }])
          ]}
        />
      </div>
              </div>
            </div>
          </div>
        </div>
        
      </header>

     

      <div className="mx-auto max-w-7xl pt-8 pb-16">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <AnimatePresence>
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="hidden lg:block w-80 flex-shrink-0"
            >
              <FiltersPanel
                city={cidade}
                state={estado}
                modality={modalidade}
                academicLevel={nivel}
                courseName={curso}
                courseSuffix={cursoNomeCompleto}
                onModalityChange={handleModalityChange}
                onCitySelect={handleCitySelect}
                priceRange={filters.montlyFeeToMin}
                onPriceChange={handlePriceChange}
                onCourseSelect={handleCourseSelect}
                onClose={() => setShowMobileFilters(false)}
              />
            </motion.aside>
          </AnimatePresence>

          {/* Mobile Filters Modal */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
                onClick={() => setShowMobileFilters(false)}
              >
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  className="absolute right-0 top-0 h-full w-full max-w-sm bg-neutral-50 p-4"
                  onClick={e => e.stopPropagation()}
                >
                  <FiltersPanel
                city={cidade}
                state={estado}
                modality={modalidade}
                academicLevel={nivel}
                courseName={curso}
                courseSuffix={cursoNomeCompleto}
                onModalityChange={handleModalityChange}
                onCitySelect={handleCitySelect}
                priceRange={filters.montlyFeeToMin}
                onPriceChange={handlePriceChange}
                onCourseSelect={handleCourseSelect}
                onClose={() => setShowMobileFilters(false)}
              />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Results Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 px-6">



              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden bg-bolsa-secondary px-3 py-2 items-center flex rounded-md text-zinc-100"
              >
                <ListFilter size={18} className="mr-2" />
                Filtros
              </button>
            </div>

            {isLoading ? (
              <div
                className={`grid ${viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'
                  : 'grid-cols-1 gap-4'
                  }`}
              >
                {Array.from({ length: 6 }).map((_, i) => (


                  <div key={i} className="bg-white rounded-xl shadow-card p-6 animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mt-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mt-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-full mt-6"></div>
                  </div>

                ))}
              </div>
            ) : (
              <div className={`grid ${viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'
                : 'grid-cols-1 gap-4'
                }`}>
                {filteredByPrice.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-lg text-neutral-600 mb-6">
                      Nenhuma oferta encontrada para essa modalidade nessa cidade. 😢
                    </p>
                    <button
                      onClick={() => {
                        const other = modalidade === 'PRESENCIAL'
                          ? 'SEMIPRESENCIAL'
                          : modalidade === 'SEMIPRESENCIAL'
                            ? 'EAD'
                            : 'PRESENCIAL';

                        const params = new URLSearchParams();
                        if (curso) params.set('c', curso);
                        params.set('cidade', cidade);
                        params.set('estado', estado);
                        params.set('modalidade', other);
                        router.push(`/curso/resultado?${params.toString()}`);
                      }}
                      className="inline-flex items-center px-6 py-3 bg-bolsa-secondary text-white font-semibold rounded hover:bg-emerald-700 transition"
                    >
                      Buscar em outra modalidade
                      <ArrowRight className="ml-2" size={18} />
                    </button>
                  </div>
                ) : (
                  paginatedCourses.map((course: Course, index: number) => {
                    return (
                      <CourseCardNew
                        key={index}
                        courseName={courseDisplayName || course.name || ''}
                        course={course}
                        setFormData={(name: string, value: unknown) => setValue(name, value)}
                        viewMode={viewMode}
                        triggerSubmit={handleSubmit(onSubmit)}
                      />
                    )
                  })
                )}

              </div>
            )}

            {!isLoading && (
              <div className="mt-8 flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:text-bolsa-secondary disabled:hover:text-neutral-800"
                >
                  <ArrowLeft size={20} />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded ${currentPage === i + 1 ? 'bg-bolsa-secondary text-white' : 'bg-white border text-neutral-800'}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:text-bolsa-secondary disabled:hover:text-neutral-800"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

