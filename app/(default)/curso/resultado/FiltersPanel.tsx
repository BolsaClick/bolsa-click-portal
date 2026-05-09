'use client'

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { Filter, MapPin, Building2, X, GraduationCap } from 'lucide-react'
import PriceRangeSlider from '@/app/components/atoms/PriceRange'
import { useQuery } from '@tanstack/react-query'
import { getShowCourses } from '@/app/lib/api/get-courses'
import { getLocalities } from '@/app/lib/api/get-localites'
import { ACADEMIC_LEVEL, isProfissionalizanteLevel } from '@/app/lib/academic-level'

interface FiltersPanelProps {
  city: string
  state: string
  modality: string
  academicLevel?: string
  courseName?: string  
  courseSuffix?: string  
  onModalityChange: (modality: string) => void
  onCitySelect: (city: string, state: string) => void
  onAcademicLevelChange?: (level: string) => void
  priceRange: [number, number]
  onPriceChange: (range: [number, number]) => void
  onCourseSelect: (courseNameClean: string, courseNameFull: string) => void
  onClose?: () => void
}

const FiltersPanel: React.FC<FiltersPanelProps> = React.memo(({
  city,
  state,
  modality,
  academicLevel = 'GRADUACAO',
  courseName,
  courseSuffix,
  onModalityChange,
  onCitySelect,
  onAcademicLevelChange,
  priceRange,
  onPriceChange,
  onCourseSelect,
  onClose,
}) => {
  const [searchCourse, setSearchCourse] = useState('')
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false)
  const courseInputRef = useRef<HTMLInputElement>(null)
  const courseInitializedRef = useRef(false)
  const isUserTypingRef = useRef(false)
  
  const [searchCity, setSearchCity] = useState('')
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  const cityInputRef = useRef<HTMLInputElement>(null)
  const cityInitializedRef = useRef(false)
  const isUserTypingCityRef = useRef(false)

  // Inicializar e atualizar com a cidade atual
  useEffect(() => {
    // Não atualizar se o usuário estiver digitando
    if (isUserTypingCityRef.current) {
      return
    }
    
    if (city && state) {
      const newCityValue = `${city} - ${state}`
      if (searchCity !== newCityValue) {
        setSearchCity(newCityValue)
        cityInitializedRef.current = true
      }
    }
  }, [city, state, searchCity])

  // Inicializar e atualizar com o curso atual (juntar c + cn)
  useEffect(() => {
    // Não atualizar se o usuário estiver digitando
    if (isUserTypingRef.current) {
      return
    }
    
    // Calcular o valor esperado da URL
    let expectedValue = ''
    if (courseName) {
      expectedValue = courseName
      if (courseSuffix && courseSuffix.trim()) {
        expectedValue = `${courseName} - ${courseSuffix}`
      }
    }
    
    // Só atualizar se o valor atual for diferente do esperado
    // E se o input não estiver sendo editado ativamente
    if (searchCourse !== expectedValue) {
      // Se o valor esperado mudou (props mudaram), atualizar
      // Mas não se o usuário acabou de limpar o campo
      if (expectedValue || !searchCourse) {
        setSearchCourse(expectedValue)
        courseInitializedRef.current = true
      }
    }
  }, [courseName, courseSuffix, searchCourse])
  
  const containerRef = useRef<HTMLDivElement>(null)

  // Buscar cursos para o filtro baseado no nível acadêmico
  const { data: coursesForFilter } = useQuery({
    queryFn: () => getShowCourses(academicLevel),
    queryKey: ['courses', academicLevel.toLowerCase(), 'filter'],
  })

  // Extrair apenas o nome da cidade (sem estado) para a API
  const cityNameForAPI = useMemo(() => {
    if (!searchCity) return ''
    // Se tiver " - " (espaço, hífen, espaço), pegar apenas a parte antes
    const parts = searchCity.split(' - ')
    return parts[0].trim()
  }, [searchCity])

  // Buscar cidades (enviar apenas o nome da cidade, sem estado)
  const { data: citiesForFilter } = useQuery({
    queryFn: () => getLocalities(cityNameForAPI),
    queryKey: ['cities', 'filter', cityNameForAPI],
    enabled: cityNameForAPI.length >= 3,
  })

  // Função para remover acentos
  const removeAcentos = useCallback((str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  }, [])

  // Filtrar cursos baseado no input (sem acentos)
  // Se não houver texto digitado, mostrar todos os cursos
  // Se houver texto, filtrar pelos cursos que contêm o texto
  const courseOptions = useMemo(() => {
    if (!coursesForFilter) return []
    
    // Se não houver texto digitado ou tiver menos de 3 caracteres, mostrar todos os cursos
    if (!searchCourse || searchCourse.length < 3) {
      return coursesForFilter
        .slice(0, 50) // Limitar a 50 cursos para performance
        .map((course: { id: string; name: string; slug?: string }) => ({
          id: course.id,
          name: course.name,
          slug: course.slug || '',
        }))
    }
    
    // Se houver texto, filtrar
    const searchNormalized = removeAcentos(searchCourse)
    return coursesForFilter
      .filter((course: { id: string; name: string; slug?: string }) => removeAcentos(course.name).includes(searchNormalized))
      .slice(0, 50) // Limitar a 50 cursos para performance
      .map((course: { id: string; name: string; slug?: string }) => ({
        id: course.id,
        name: course.name,
        slug: course.slug || '',
      }))
  }, [coursesForFilter, searchCourse, removeAcentos])

  // Opções de cidades (filtrar sem acentos)
  const cityOptions = useMemo(() => {
    if (!citiesForFilter?.data || !searchCity || searchCity.length < 3) return []
    
    const searchNormalized = removeAcentos(searchCity)
    return citiesForFilter.data
      .filter((locality: { city: string; state: string }) => {
        const cityNormalized = removeAcentos(locality.city)
        const stateNormalized = removeAcentos(locality.state)
        const fullText = `${locality.city} - ${locality.state}`
        const fullTextNormalized = removeAcentos(fullText)
        return cityNormalized.includes(searchNormalized) || 
               stateNormalized.includes(searchNormalized) ||
               fullTextNormalized.includes(searchNormalized)
      })
      .slice(0, 10)
      .map((locality: { city: string; state: string }) => ({
        city: locality.city,
        state: locality.state,
      }))
  }, [citiesForFilter, searchCity, removeAcentos])

  // Função para remover sufixo do curso
  const removeCourseSuffix = useCallback((name: string) => {
    return name
      .replace(/ - (Bacharelado|Licenciatura|Tecn[oó]logo)$/i, '')
      .trim()
  }, [])

  // Função para extrair apenas o sufixo do curso
  const extractCourseSuffix = useCallback((name: string): string => {
    const match = name.match(/ - (Bacharelado|Licenciatura|Tecn[oó]logo)$/i)
    return match ? match[1] : ''
  }, [])

  // Handler para mudança no input de curso
  const handleCourseInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    isUserTypingRef.current = true
    setSearchCourse(value)
    // Manter o dropdown aberto quando há cursos disponíveis
    if (coursesForFilter && coursesForFilter.length > 0) {
      setIsCourseDropdownOpen(true)
    } else {
      setIsCourseDropdownOpen(false)
    }
    // Resetar a flag após um pequeno delay para permitir que o useEffect funcione novamente
    setTimeout(() => {
      isUserTypingRef.current = false
    }, 100)
  }, [coursesForFilter])

  // Handler para mudança no input de cidade
  const handleCityInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    isUserTypingCityRef.current = true
    setSearchCity(value)
    if (value.length >= 3) {
      setIsCityDropdownOpen(true)
    } else {
      setIsCityDropdownOpen(false)
    }
    // Resetar a flag após um pequeno delay para permitir que o useEffect funcione novamente
    setTimeout(() => {
      isUserTypingCityRef.current = false
    }, 100)
  }, [])

  // Handler para seleção de curso
  const handleCourseSelect = useCallback((option: { id: string; name: string; slug: string }) => {
    const courseNameClean = removeCourseSuffix(option.name)
    const courseSuffix = extractCourseSuffix(option.name) // Extrair apenas o sufixo
    isUserTypingRef.current = false // Resetar flag ao selecionar
    setSearchCourse(option.name)
    setIsCourseDropdownOpen(false)
    // Passar apenas o sufixo como courseNameFull (será usado como cn na URL)
    onCourseSelect(courseNameClean, courseSuffix)
    
    // Manter foco no input
    setTimeout(() => {
      if (courseInputRef.current) {
        courseInputRef.current.focus()
      }
    }, 0)
  }, [removeCourseSuffix, extractCourseSuffix, onCourseSelect])

  // Handler para seleção de cidade
  const handleCitySelect = useCallback((option: { city: string; state: string }) => {
    isUserTypingCityRef.current = false // Resetar flag ao selecionar
    setSearchCity(`${option.city} - ${option.state}`)
    setIsCityDropdownOpen(false)
    onCitySelect(option.city, option.state)
    
    // Manter foco no input
    setTimeout(() => {
      if (cityInputRef.current) {
        cityInputRef.current.focus()
      }
    }, 0)
  }, [onCitySelect])

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsCourseDropdownOpen(false)
        setIsCityDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const formatModalidade = (value: string): string => {
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

  const labelMono =
    'font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-2 mb-3'
  const inputBase =
    'w-full pl-10 pr-10 py-2.5 bg-white border border-hairline rounded-full text-[14px] text-ink-900 placeholder:text-ink-300 focus:outline-none focus:border-ink-900 focus:ring-2 focus:ring-bolsa-secondary/15 transition-colors'
  const dropdownBase =
    'absolute z-[9999] w-full mt-2 bg-white border border-hairline rounded-2xl shadow-[0_30px_60px_-30px_rgba(11,31,60,0.25)] max-h-[280px] overflow-auto py-1'

  return (
    <aside
      ref={containerRef}
      className="bg-white border border-hairline rounded-2xl p-5 md:p-6"
      aria-label="Filtros de busca"
    >
      <div className="flex items-baseline justify-between hairline-b pb-3 mb-5">
        <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700 inline-flex items-center gap-2">
          <Filter size={12} />
          Filtros
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Fechar filtros"
            className="lg:hidden p-1.5 -mr-1 text-ink-500 hover:text-ink-900 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Curso */}
        <div>
          <label className={labelMono}>
            <GraduationCap size={11} />
            Curso
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300 pointer-events-none">
              <GraduationCap size={16} />
            </span>
            <input
              ref={courseInputRef}
              type="text"
              value={searchCourse}
              onChange={handleCourseInputChange}
              onFocus={() => {
                if (courseOptions.length > 0) setIsCourseDropdownOpen(true)
              }}
              className={inputBase}
              placeholder="Digite o curso"
              autoComplete="off"
            />
            {searchCourse && (
              <button
                type="button"
                onClick={() => {
                  setSearchCourse('')
                  setIsCourseDropdownOpen(false)
                  onCourseSelect('', '')
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-700 transition-colors"
                aria-label="Limpar curso"
              >
                <X size={14} />
              </button>
            )}
            {isCourseDropdownOpen && courseOptions.length > 0 && (
              <ul className={dropdownBase}>
                {courseOptions.map((option) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        courseInputRef.current?.focus()
                      }}
                      onClick={() => handleCourseSelect(option)}
                      className="block w-full text-left px-4 py-2.5 text-[14px] text-ink-700 hover:bg-paper-warm hover:text-ink-900 transition-colors"
                    >
                      {option.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {isCourseDropdownOpen && courseOptions.length === 0 && (
              <div className={dropdownBase}>
                <p className="px-4 py-3 text-[13px] text-ink-500">Nenhum curso encontrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Cidade */}
        <div className="hairline-t pt-6">
          <label className={labelMono}>
            <MapPin size={11} />
            Cidade
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300 pointer-events-none">
              <MapPin size={16} />
            </span>
            <input
              ref={cityInputRef}
              type="text"
              value={searchCity}
              onChange={handleCityInputChange}
              onFocus={() => {
                if (searchCity.length >= 3) setIsCityDropdownOpen(true)
              }}
              className={inputBase}
              placeholder="Digite a cidade"
              autoComplete="off"
            />
            {searchCity && (
              <button
                type="button"
                onClick={() => {
                  setSearchCity('')
                  setIsCityDropdownOpen(false)
                  onCitySelect('', '')
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-700 transition-colors"
                aria-label="Limpar cidade"
              >
                <X size={14} />
              </button>
            )}
            {isCityDropdownOpen && cityOptions.length > 0 && searchCity.length >= 3 && (
              <ul className={dropdownBase}>
                {cityOptions.map((option, index) => (
                  <li key={`${option.city}-${option.state}-${index}`}>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        cityInputRef.current?.focus()
                      }}
                      onClick={() => handleCitySelect(option)}
                      className="block w-full text-left px-4 py-2.5 text-[14px] text-ink-700 hover:bg-paper-warm hover:text-ink-900 transition-colors"
                    >
                      <span className="font-medium">{option.city}</span>{' '}
                      <span className="text-ink-500">— {option.state}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {isCityDropdownOpen && cityOptions.length === 0 && searchCity.length >= 3 && (
              <div className={dropdownBase}>
                <p className="px-4 py-3 text-[13px] text-ink-500">Nenhuma cidade encontrada</p>
              </div>
            )}
          </div>
        </div>

        {/* Modalidade */}
        <div className="hairline-t pt-6">
          <label className={labelMono}>
            <Building2 size={11} />
            Modalidade
          </label>
          <div className="space-y-1">
            {['EAD', 'PRESENCIAL', 'SEMIPRESENCIAL'].map((mode) => {
              const modeFormatted = formatModalidade(mode)
              const isChecked = !!(
                modality &&
                modality.trim() &&
                modality.toUpperCase() === mode.toUpperCase()
              )
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onModalityChange(mode)}
                  aria-pressed={isChecked}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-[14px] flex items-center gap-3 transition-all ${
                    isChecked
                      ? 'bg-paper-warm text-ink-900 font-medium'
                      : 'text-ink-700 hover:bg-paper-warm/60'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isChecked ? 'border-bolsa-secondary' : 'border-ink-300'
                    }`}
                  >
                    {isChecked && (
                      <span className="w-1.5 h-1.5 rounded-full bg-bolsa-secondary" />
                    )}
                  </span>
                  {modeFormatted}
                </button>
              )
            })}
          </div>
        </div>

        {/* Nível acadêmico */}
        {onAcademicLevelChange && (
          <div className="hairline-t pt-6">
            <label className={labelMono}>
              <GraduationCap size={11} />
              Nível acadêmico
            </label>
            <div className="space-y-1">
              {[
                ACADEMIC_LEVEL.GRADUACAO,
                ACADEMIC_LEVEL.POS_GRADUACAO,
                ACADEMIC_LEVEL.CURSO_PROFISSIONALIZANTE,
              ].map((level) => {
                const label =
                  level === ACADEMIC_LEVEL.GRADUACAO
                    ? 'Graduação'
                    : level === ACADEMIC_LEVEL.POS_GRADUACAO
                    ? 'Pós-graduação'
                    : 'Profissionalizante'
                const isChecked =
                  academicLevel === level ||
                  (level === ACADEMIC_LEVEL.CURSO_PROFISSIONALIZANTE &&
                    isProfissionalizanteLevel(academicLevel))
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onAcademicLevelChange(level)}
                    aria-pressed={isChecked}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-[14px] flex items-center gap-3 transition-all ${
                      isChecked
                        ? 'bg-paper-warm text-ink-900 font-medium'
                        : 'text-ink-700 hover:bg-paper-warm/60'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isChecked ? 'border-bolsa-secondary' : 'border-ink-300'
                      }`}
                    >
                      {isChecked && (
                        <span className="w-1.5 h-1.5 rounded-full bg-bolsa-secondary" />
                      )}
                    </span>
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Faixa de preço */}
        <div className="hairline-t pt-6">
          <div className="flex items-baseline justify-between mb-3">
            <span className={labelMono.replace(' mb-3', '')}>R$ Faixa de preço</span>
            <span className="font-mono num-tabular text-[10px] text-ink-500">
              R${priceRange[0]} – R${priceRange[1]}
            </span>
          </div>
          <PriceRangeSlider value={priceRange} onChange={onPriceChange} />
        </div>
      </div>
    </aside>
  )
})

FiltersPanel.displayName = 'FiltersPanel'

export default FiltersPanel

