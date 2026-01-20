'use client'

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { Filter, MapPin, Building2, X, GraduationCap } from 'lucide-react'
import PriceRangeSlider from '@/app/components/atoms/PriceRange'
import { useQuery } from '@tanstack/react-query'
import { getShowCourses } from '@/app/lib/api/get-courses'
import { getLocalities } from '@/app/lib/api/get-localites'

interface FiltersPanelProps {
  city: string
  state: string
  modality: string
  academicLevel?: string
  courseName?: string  
  courseSuffix?: string  
  onModalityChange: (modality: string) => void
  onCitySelect: (city: string, state: string) => void
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
  priceRange,
  onPriceChange,
  onCourseSelect,
  onClose,
}) => {
  const [searchCourse, setSearchCourse] = useState('')
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false)
  const courseInputRef = useRef<HTMLInputElement>(null)
  const courseInitializedRef = useRef(false)
  
  const [searchCity, setSearchCity] = useState('')
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  const cityInputRef = useRef<HTMLInputElement>(null)
  const cityInitializedRef = useRef(false)

  // Inicializar e atualizar com a cidade atual
  useEffect(() => {
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
    if (courseName) {
      let newCourseValue = courseName
      // Se tiver sufixo (cn), juntar com o nome do curso
      if (courseSuffix && courseSuffix.trim()) {
        newCourseValue = `${courseName} - ${courseSuffix}`
      }
      
      if (searchCourse !== newCourseValue) {
        setSearchCourse(newCourseValue)
        courseInitializedRef.current = true
      }
    } else if (!courseName && searchCourse) {
      // Se não tiver curso na URL mas tiver no input, limpar
      setSearchCourse('')
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
  const courseOptions = useMemo(() => {
    if (!coursesForFilter || !searchCourse || searchCourse.length < 3) return []
    
    const searchNormalized = removeAcentos(searchCourse)
    return coursesForFilter
      .filter((course: { id: string; name: string; slug?: string }) => removeAcentos(course.name).includes(searchNormalized))
      .slice(0, 10)
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
    setSearchCourse(value)
    if (value.length >= 3) {
      setIsCourseDropdownOpen(true)
    } else {
      setIsCourseDropdownOpen(false)
    }
  }, [])

  // Handler para mudança no input de cidade
  const handleCityInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchCity(value)
    if (value.length >= 3) {
      setIsCityDropdownOpen(true)
    } else {
      setIsCityDropdownOpen(false)
    }
  }, [])

  // Handler para seleção de curso
  const handleCourseSelect = useCallback((option: { id: string; name: string; slug: string }) => {
    const courseNameClean = removeCourseSuffix(option.name)
    const courseSuffix = extractCourseSuffix(option.name) // Extrair apenas o sufixo
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

  return (
    <div ref={containerRef} className="bg-white rounded-xl shadow-card p-6 sticky top-32">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Filter size={18} className="text-emerald-500 mr-2" />
          <h2 className="font-bold text-lg">Filtros</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-neutral-500 hover:text-neutral-700"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Course Search Filter */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center">
            <GraduationCap size={16} className="text-primary-500 mr-2" />
            Buscar Curso
          </h3>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              <GraduationCap size={20} />
            </div>
            <input
              ref={courseInputRef}
              type="text"
              value={searchCourse}
              onChange={handleCourseInputChange}
              onFocus={() => {
                if (searchCourse.length >= 3) {
                  setIsCourseDropdownOpen(true)
                }
              }}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-secondary focus:border-bolsa-secondary outline-none transition-colors"
              placeholder="Digite o curso (mín. 3 letras)"
              autoComplete="off"
            />
            {isCourseDropdownOpen && courseOptions.length > 0 && searchCourse.length >= 3 && (
              <ul className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[300px] overflow-auto">
                {courseOptions.map((option) => (
                  <li
                    key={option.id}
                    className="px-5 py-3 hover:bg-emerald-500 hover:text-white cursor-pointer text-zinc-400"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      if (courseInputRef.current) {
                        courseInputRef.current.focus()
                      }
                    }}
                    onClick={() => handleCourseSelect(option)}
                  >
                    {option.name}
                  </li>
                ))}
              </ul>
            )}
            {isCourseDropdownOpen && courseOptions.length === 0 && searchCourse.length >= 3 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                <div className="px-5 py-3 text-gray-500">
                  Nenhum curso encontrado
                </div>
              </div>
            )}
          </div>
        </div>

        {/* City Filter */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center">
            <MapPin size={16} className="text-primary-500 mr-2" />
            Buscar Cidade
          </h3>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              <MapPin size={20} />
            </div>
            <input
              ref={cityInputRef}
              type="text"
              value={searchCity}
              onChange={handleCityInputChange}
              onFocus={() => {
                if (searchCity.length >= 3) {
                  setIsCityDropdownOpen(true)
                }
              }}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-secondary focus:border-bolsa-secondary outline-none transition-colors"
              placeholder="Digite a cidade (mín. 3 letras)"
              autoComplete="off"
            />
            {isCityDropdownOpen && cityOptions.length > 0 && searchCity.length >= 3 && (
              <ul className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[300px] overflow-auto">
                {cityOptions.map((option, index) => (
                  <li
                    key={`${option.city}-${option.state}-${index}`}
                    className="px-5 py-3 hover:bg-emerald-500 hover:text-white cursor-pointer text-zinc-400"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      if (cityInputRef.current) {
                        cityInputRef.current.focus()
                      }
                    }}
                    onClick={() => handleCitySelect(option)}
                  >
                    {option.city} - {option.state}
                  </li>
                ))}
              </ul>
            )}
            {isCityDropdownOpen && cityOptions.length === 0 && searchCity.length >= 3 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                <div className="px-5 py-3 text-gray-500">
                  Nenhuma cidade encontrada
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modality Filter */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center">
            <Building2 size={16} className="text-primary-500 mr-2" />
            Modalidade
          </h3>
          <div className="space-y-2">
            {['EAD', 'PRESENCIAL', 'SEMIPRESENCIAL'].map((mode) => {
              const modeFormatted = formatModalidade(mode)
              // Só marcar como checked se houver modalidade e for igual
              const isChecked = !!(modality && modality.trim() && modality.toUpperCase() === mode.toUpperCase())
              
              return (
                <label key={mode} className="flex items-center">
                  <input
                    type="radio"
                    name="modality"
                    checked={isChecked}
                    onChange={() => onModalityChange(mode)}
                    className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-neutral-700">{modeFormatted}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center">
            <span className="text-primary-500 mr-2">R$</span>
            Faixa de Preço
          </h3>
          <div className="space-y-4">
            <PriceRangeSlider
              value={priceRange}
              onChange={onPriceChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
})

FiltersPanel.displayName = 'FiltersPanel'

export default FiltersPanel

