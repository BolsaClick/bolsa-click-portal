/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useQuery } from '@tanstack/react-query'
import debounce from 'lodash.debounce'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { ComboBox } from '../ComboBox'
import { useRouter } from 'next/navigation'
import { getShowCourses } from '@/app/lib/api/get-courses'
import { getLocalities } from '@/app/lib/api/get-localites'
import { ModalitySelect } from '../../atoms/ModalitySelect'
import { GraduationCap, MapPin } from 'lucide-react'
import { useGeoLocation } from '@/app/context/GeoLocationContext'
import { ACADEMIC_LEVEL } from '@/app/lib/academic-level'
import { useLastSearch } from '@/app/lib/personalization/hooks'

type FormValues = {
  modalidade: 'EAD' | 'PRESENCIAL' | 'SEMIPRESENCIAL'
  course: { name: string; id: string; slug: string }
  city: { state: string; city: string }
  levels: 'graduacao' | 'pos' | 'profissionalizante'
}

const educationLevels: { levels: FormValues['levels']; label: string }[] = [
  { levels: 'graduacao', label: 'Graduação' },
  { levels: 'pos', label: 'Pós-graduação' },
  { levels: 'profissionalizante', label: 'Profissionalizante' }
]
const Filter = () => {
  const navigate = useRouter()
  const { city: geoCity, state: geoState } = useGeoLocation()
  const { saveSearch } = useLastSearch()
  const [searchCity, setSearchCity] = useState('')
  const [activeTab, setActiveTab] = useState<FormValues['levels']>(() => {
    if (typeof window !== 'undefined') {
      const savedLevel = localStorage.getItem('selectedLevel')
      if (savedLevel === 'tecnico') {
        return 'profissionalizante'
      }
      if (savedLevel === 'graduacao' || savedLevel === 'pos' || savedLevel === 'profissionalizante') {
        return savedLevel
      }
      return 'graduacao'
    }
    return 'graduacao'
  })

  const academicLevelMap: Record<FormValues['levels'], string> = {
    graduacao: ACADEMIC_LEVEL.GRADUACAO,
    pos: ACADEMIC_LEVEL.POS_GRADUACAO,
    profissionalizante: ACADEMIC_LEVEL.CURSO_PROFISSIONALIZANTE,
  }


  const handleLevelChange = (level: FormValues['levels']) => {
    setActiveTab(level)
    localStorage.setItem('selectedLevel', level)
    setValue('levels', level)

    setValue('course', { id: '', name: '', slug: '' })
  }
  const { control, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      modalidade: 'EAD',
      levels: activeTab,
      course: { name: '', id: '', slug: '' },
      city: { state: '', city: '' },
    },
  })

  // Preencher cidade/estado padrão com a localização da API de cidades (por IP), igual ao filtro da home
  useEffect(() => {
    if (geoCity && geoState) {
      setValue('city', { city: geoCity, state: geoState })
    }
  }, [geoCity, geoState, setValue])

  const { data: graduationCourses } = useQuery({
    queryFn: () => getShowCourses(academicLevelMap.graduacao),
    queryKey: ['courses', 'graduacao'],
    enabled: activeTab === 'graduacao',
  })

  const { data: postCourses } = useQuery({
    queryFn: () => getShowCourses(academicLevelMap.pos),
    queryKey: ['courses', 'pos'],
    enabled: activeTab === 'pos',
  })

  const { data: profissionalizanteCourses } = useQuery({
    queryFn: () => getShowCourses(academicLevelMap.profissionalizante),
    queryKey: ['courses', 'profissionalizante'],
    enabled: activeTab === 'profissionalizante',
  })

  const { data: responseCity } = useQuery({
    queryKey: ['cities', searchCity],
    queryFn: () => getLocalities(searchCity),
    enabled: !!searchCity,
  })
  const cityOptions =
    responseCity?.data?.map((city: any) => ({
      state: city.state,
      city: city.city,
    })) || []

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");


  const rawCourses = activeTab === 'graduacao'
    ? graduationCourses
    : activeTab === 'pos'
      ? postCourses
      : activeTab === 'profissionalizante'
        ? profissionalizanteCourses
        : []

  const courseOptions =
    rawCourses?.map((course: any) => ({
      id: course.id,
      name: course.name,
      slug: course.slug || slugify(course.name.replace(/ - (Bacharelado|Tecn[oó]logo)$/, '')),
    })) || []

  const removeCourseSuffix = (name: string) => {
    return name
      .replace(/ - (Bacharelado|Licenciatura|Tecn[oó]logo)$/i, '')
      .trim()
  }

  // Verificar se o curso tem sufixo (Bacharelado, Licenciatura, Tecnólogo)
  const hasCourseSuffix = (name: string): boolean => {
    return / - (Bacharelado|Licenciatura|Tecn[oó]logo)$/i.test(name)
  }

  // Extrair apenas o sufixo do curso (Bacharelado, Licenciatura, Tecnólogo)
  const extractCourseSuffix = (name: string): string => {
    const match = name.match(/ - (Bacharelado|Licenciatura|Tecn[oó]logo)$/i)
    return match ? match[1] : ''
  }

  // Converter valores do ModalitySelect para o formato esperado
  const convertModalityToAPI = (value: string): FormValues['modalidade'] => {
    const lower = value.toLowerCase()
    if (lower === 'distancia') return 'EAD'
    if (lower === 'presencial') return 'PRESENCIAL'
    if (lower === 'semipresencial') return 'SEMIPRESENCIAL'
    return value.toUpperCase() as FormValues['modalidade']
  }

  // Converter valores da API para o formato do ModalitySelect
  const convertModalityFromAPI = (value: string): string => {
    const upper = value.toUpperCase()
    if (upper === 'EAD') return 'distancia'
    if (upper === 'PRESENCIAL') return 'presencial'
    if (upper === 'SEMIPRESENCIAL') return 'semipresencial'
    return value.toLowerCase()
  }

  const onSubmit = (data: FormValues) => {

    const city = data.city.city || 'São Paulo'
    const state = data.city.state || 'SP'

    const courseNameClean = data.course.name ? removeCourseSuffix(data.course.name) : ''

    // Construir URL com parâmetros - 'c' sempre primeiro se existir
    const params: string[] = [];
    
    // Só adiciona o parâmetro 'c' se o curso estiver preenchido (sem sufixos para SEO)
    if (courseNameClean && courseNameClean.trim()) {
      params.push(`c=${encodeURIComponent(courseNameClean)}`);
    }
    
    // Adicionar apenas o sufixo do curso (Bacharelado, Licenciatura, Tecnólogo) no cn
    // Só adiciona cn se o curso tiver sufixo
    if (data.course.name && data.course.name.trim() && hasCourseSuffix(data.course.name)) {
      const suffix = extractCourseSuffix(data.course.name)
      if (suffix) {
        params.push(`cn=${encodeURIComponent(suffix)}`);
      }
    }
    
    // Adicionar os outros parâmetros
    params.push(`cidade=${encodeURIComponent(city)}`);
    params.push(`estado=${encodeURIComponent(state)}`);
    
    // Garantir que a modalidade está no formato correto (EAD, PRESENCIAL, SEMIPRESENCIAL)
    const modalidadeFormatada = convertModalityToAPI(data.modalidade)
    params.push(`modalidade=${encodeURIComponent(modalidadeFormatada)}`);
    
    // Adicionar nível acadêmico para diferenciar graduação, pós e profissionalizante
    const nivel = academicLevelMap[activeTab]
    params.push(`nivel=${nivel}`);

    // Salvar última busca pra personalização (gated por consent)
    saveSearch({
      course: courseNameClean || undefined,
      city: city || undefined,
      state: state || undefined,
      modality: modalidadeFormatada,
      level: nivel,
    })

    navigate.push(`/curso/resultado?${params.join('&')}`);
  }

  const handleCityChange = debounce((value) => {
    setSearchCity(value)
  }, 300)

  const renderLevelTabs = () => (
    <div className="grid grid-cols-3 border-b border-hairline">
      {educationLevels.map((level, idx) => {
        const isActive = activeTab === level.levels
        const isLast = idx === educationLevels.length - 1
        return (
          <button
            key={level.levels}
            className={`relative flex-1 min-w-0 py-3.5 px-1.5 sm:py-5 sm:px-4 text-center text-[10px] sm:text-[13px] leading-tight tracking-[0.06em] sm:tracking-wide font-medium font-mono uppercase transition-colors whitespace-nowrap overflow-hidden text-ellipsis
              ${!isLast ? 'border-r border-hairline' : ''}
              ${isActive ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900'}`}
            onClick={() => handleLevelChange(level.levels)}
            type="button"
          >
            {level.label}
            <span
              className={`absolute -bottom-px left-0 right-0 h-[2px] bg-ink-900 transition-transform duration-300 origin-center ${
                isActive ? 'scale-x-100' : 'scale-x-0'
              }`}
            />
          </button>
        )
      })}
    </div>
  )



  const showModality = activeTab === 'graduacao'

  const renderSearchForm = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className={`grid grid-cols-1 gap-4 ${showModality ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        <div className="w-full">
          <ComboBox
            key={`course-${activeTab}`}
            control={control}
            name="course"
            options={courseOptions}
            icon={<GraduationCap size={20} />}
            placeholder="Digite o curso"
          />
        </div>

        <div className="w-full">
          <ComboBox
            control={control}
            name="city"
            options={cityOptions}
            placeholder="Digite uma cidade"
            icon={<MapPin size={20} />}
            onInputChange={(inputValue) => handleCityChange(inputValue)}
          />
        </div>
        {showModality && (
          <div className="w-full">
            <ModalitySelect
              value={convertModalityFromAPI(watch('modalidade'))}
              onChange={(value) => setValue('modalidade', convertModalityToAPI(value))}
              variant="default"
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        className="group relative w-full md:w-auto md:self-end px-7 py-3.5 bg-ink-900 hover:bg-bolsa-secondary text-white font-semibold text-[14px] tracking-wide rounded-full transition-colors duration-300"
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          Buscar bolsas
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
        </span>
      </button>
    </form>
  )

  return (
    <div className="container mx-auto px-4 z-40 relative">
      <div className="max-w-4xl mx-auto w-full bg-white border border-hairline rounded-2xl shadow-[0_30px_60px_-30px_rgba(11,31,60,0.18)]">
        {/* Cabeçalho navy editorial */}
        <div className="bg-bolsa-primary px-6 md:px-8 py-6 md:py-7 text-white rounded-t-2xl">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-bolsa-secondary text-white">
              <GraduationCap size={16} />
            </span>
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/70">
              Busca de bolsas
            </span>
          </div>
          <h2 className="font-display text-xl md:text-[26px] leading-tight font-semibold mb-1.5">
            Encontre sua bolsa em segundos
          </h2>
          <p className="text-white/75 text-[13px] md:text-[14px] max-w-xl leading-relaxed">
            Escolha o nível, digite o curso e a cidade. A gente compara as faculdades parceiras
            e mostra a melhor bolsa pra você.
          </p>
        </div>

        {/* Tabs e form */}
        <div className="bg-white">
          {renderLevelTabs()}
          <div className="p-6 md:p-8">
            {renderSearchForm()}
          </div>
        </div>
      </div>
    </div>
  )
}
export default Filter
