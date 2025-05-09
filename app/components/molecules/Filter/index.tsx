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
  modalidade: 'distancia' | 'presencial' | 'semipresencial'
  course: { name: string; id: string }
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
  }
  const { control, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      modalidade: 'distancia',
      levels: activeTab,
      course: { name: '', id: '' },
      city: { state: '', city: '' },
    },
  })


  const { data: showCourses } = useQuery({
    queryFn: getShowCourses,
    queryKey: ['courses'],
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

  const courseOptions =
    showCourses?.map((course: any) => ({
      id: course.id,
      name: course.name,
    })) || []

  const onSubmit = (data: FormValues) => {
    navigate.push(
      `/cursos?modalidade=${data.modalidade}&course=${data.course.id}&courseName=${data.course.name}&city=${data.city.city}&state=${data.city.state}`,
    )
  }
  const handleCityChange = debounce((value) => {
    setSearchCity(value)
  }, 300)

  const renderLevelTabs = () => (
    <div className={`grid grid-cols-3 border-b  border-gray-300`}>
      {educationLevels.map((level) => (
        <button
          key={level.levels}
          className={`flex-1 py-4 px-6 text-center font-medium text-nowrap transition-colors ${activeTab === level.levels
            ? 'text-bolsa-secondary/90 border-b-2 border-bolsa-secondary'
            : 'text-gray-600 hover:text-emerald-600'
            }`}
          onClick={() => handleLevelChange(level.levels)}
          type="button"
        >
          {level.label}
        </button>
      ))}
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
          <ModalitySelect
            value={watch('modalidade')}
            onChange={(value) => setValue('modalidade', value as FormValues['modalidade'])}
            variant="default"
          />
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
