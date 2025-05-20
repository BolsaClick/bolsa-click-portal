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
import { getShowPos } from '@/app/lib/api/get-pos'

type FormValues = {
  modalidade: 'distancia' | 'presencial' | 'semipresencial'
  course: { name: string; id: string, courseIds: string[] }
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

  const handleLevelChange = (level: FormValues['levels']) => {
    setActiveTab(level)
    localStorage.setItem('selectedLevel', level)
    setValue('levels', level)

     setValue('course', { id: '', name: '', courseIds: [] })
  }
  const { control, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      modalidade: 'distancia',
      levels: activeTab,
         course: { name: '', id: '', courseIds: [] },
      city: { state: '', city: '' },
    },
  })


const { data: graduationCourses } = useQuery({
  queryFn: getShowCourses,
  queryKey: ['courses', 'graduacao'],
  enabled: activeTab === 'graduacao',
})

const { data: postCourses } = useQuery({
  queryFn: getShowPos,
  queryKey: ['courses', 'pos'],
  enabled: activeTab === 'pos',
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
  : []

const courseOptions =
  rawCourses?.map((course: any) => ({
    id: course.id,
    name: course.name,
    courseIds: course.courseIds,
    slug: slugify(course.name.replace(/ - (Bacharelado|Tecn[oó]logo)$/, '')),
  })) || []

const onSubmit = (data: FormValues) => {
  const courseSlug = slugify(data.course.name.replace(/ - (Bacharelado|Tecn[oó]logo)$/i, ''))
const normalizeCourseName = (name: string) => {
  return name
    .replace(/ - (Bacharelado|Tecn[oó]logo)$/i, '') 
    .replace(/\s+/g, ' ') 
    .trim()
    .toLowerCase()
    .replace(/(^\w{1})|(\s+\w{1})/g, (l) => l.toUpperCase()) 
}
  const citySlug = slugify(data.city.city)
  const courseNameCookie = normalizeCourseName(data.course.name)

  localStorage.setItem('searchParams', JSON.stringify({
    courseId: data.course.id,
    courseIdExternal: data.course.courseIds?.[0]
,    courseName: data.course.name,
    city: data.city.city,
    state: data.city.state,
    modalidade: data.modalidade
  }))



  document.cookie = `courseName=${encodeURIComponent(courseNameCookie)}; path=/`
  document.cookie = `modalidade=${encodeURIComponent(data.modalidade)}; path=/`
  document.cookie = `city=${encodeURIComponent(data.city.city)}; path=/`
  document.cookie = `state=${encodeURIComponent(data.city.state)}; path=/`

if (activeTab === 'pos') {
  navigate.push(`/cursos/resultado/pos/${courseSlug}/${citySlug}`); 
} else {
  navigate.push(`/cursos/resultado/${data.modalidade}/${courseSlug}/${citySlug}`);
}
console.log(data)
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
        <div className="w-full ">
          {activeTab === 'graduacao' && (
          <ModalitySelect
            value={watch('modalidade')}
            onChange={(value) => setValue('modalidade', value as FormValues['modalidade'])}
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
