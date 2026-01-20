/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useQuery } from '@tanstack/react-query'
import debounce from 'lodash.debounce'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '../../atoms/Button'
import { ComboBox } from '../ComboBox'
import { useRouter } from 'next/navigation'
import { getShowCourses } from '@/app/lib/api/get-courses'
import { getLocalities } from '@/app/lib/api/get-localites'
import { ModalitySelect } from '../../atoms/ModalitySelect'
import { GraduationCap, MapPin } from 'lucide-react'

type FormValues = {
  modalidade: 'EAD' | 'PRESENCIAL' | 'SEMIPRESENCIAL'
  course: { name: string; id: string; slug: string }
  city: { state: string; city: string }
  levels: 'graduacao' | 'pos' | 'tecnico'
}

const educationLevels: { levels: FormValues['levels']; label: string }[] = [
  { levels: 'graduacao', label: 'Graduação' },
  { levels: 'pos', label: 'Pós-graduação' },
  { levels: 'tecnico', label: 'Técnico' }
]
const Filter = () => {
  const navigate = useRouter()
  const [searchCity, setSearchCity] = useState('')
  const [activeTab, setActiveTab] = useState<FormValues['levels']>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('selectedLevel') as FormValues['levels']) || 'graduacao'
    }
    return 'graduacao'
  })

  const academicLevelMap: Record<FormValues['levels'], string> = {
    graduacao: 'GRADUACAO',
    pos: 'POS_GRADUACAO',
    tecnico: 'TECNICO',
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

  const { data: tecnicoCourses } = useQuery({
    queryFn: () => getShowCourses(academicLevelMap.tecnico),
    queryKey: ['courses', 'tecnico'],
    enabled: activeTab === 'tecnico',
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
      : activeTab === 'tecnico'
        ? tecnicoCourses
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
    
    // Adicionar nível acadêmico para diferenciar graduação, pós e técnico
    if (activeTab === 'pos') {
      params.push(`nivel=POS_GRADUACAO`);
    } else if (activeTab === 'tecnico') {
      params.push(`nivel=TECNICO`);
    } else {
      params.push(`nivel=GRADUACAO`);
    }
    
    navigate.push(`/curso/resultado?${params.join('&')}`);
  }

  const handleCityChange = debounce((value) => {
    setSearchCity(value)
  }, 300)

  const renderLevelTabs = () => (
    <div className="grid grid-cols-3 border-b border-gray-300">
      {educationLevels.map((level) => {
        const isDisabled = level.levels === 'tecnico'

        return (
          <button
            key={level.levels}
            className={`flex-1 py-4 px-6 text-center font-medium text-nowrap transition-colors
            ${activeTab === level.levels
                ? 'text-bolsa-secondary/90 border-b-2 border-bolsa-secondary'
                : isDisabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            onClick={() => {
              if (!isDisabled) handleLevelChange(level.levels)
            }}
            type="button"
            disabled={isDisabled}
          >
            {level.label}
          </button>
        )
      })}
    </div>
  )



  const renderSearchForm = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="w-full ">
          <ComboBox
            key={`course-${activeTab}`}
            control={control}
            name="course"
            options={courseOptions}
            icon={<GraduationCap size={20} />}
            placeholder="Digite o curso"
          />
        </div>

        <div className="w-full ">
          <ComboBox
            control={control}
            name="city"
            options={cityOptions}
            placeholder="Digite uma cidade"
            icon={<MapPin size={20} />}

            onInputChange={(inputValue) => handleCityChange(inputValue)}
          />
        </div>
        <div className="w-full">
          {activeTab === 'graduacao' && (
            <ModalitySelect
              value={convertModalityFromAPI(watch('modalidade'))}
              onChange={(value) => setValue('modalidade', convertModalityToAPI(value))}
              variant="default"
            />
          )}

        </div>


      </div>

      <Button
        type="submit"
        variant='secondary'
        className='transition-colors shadow-md  bg-bolsa-secondary hover:bg-bolsa-secondary/80 text-white font-medium'
      >
        Buscar Bolsas
      </Button>
    </form>
  )
  return (

    <div
      className={` container mx-auto px-4 z-40`}
    >
      <div className="max-w-4xl mx-auto  w-full rounded-lg top-0 left-0 right-0 bg-white shadow-md z-40 transition-transform duration-300 -translate-y-24 md:-translate-y-32 ">
        {renderLevelTabs()}
        <div className='p-4'>
          {renderSearchForm()}
        </div>
      </div>
    </div>
  )
}
export default Filter
