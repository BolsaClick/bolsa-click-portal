/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useQuery } from '@tanstack/react-query'
import debounce from 'lodash.debounce'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '../../atoms/Button'
import { Title } from '../../molecules/Title'
import { ComboBox } from '../ComboBox'
import { useRouter } from 'next/navigation'
import { getShowCourses } from '@/app/lib/api/get-courses'
import { getLocalities } from '@/app/lib/api/get-localites'

type FormValues = {
  modalidade: 'distancia' | 'presencial' | 'semipresencial'
  course: { name: ''; id: '' }
  city: { state: string; city: string }
}

const Filter = () => {
  const navigate = useRouter()
  const [searchCity, setSearchCity] = useState('')

  const { control, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      modalidade: 'distancia',
      course: { name: '', id: '' },
      city: { state: '', city: '' },
    },
  })
  const modalidade = watch('modalidade')

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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="bg-bolsa-white py-11 mt-10 flex flex-col px-10 w-full lg:-mt-14 gap-8 rounded-lg z-40 mb-8 relative">
        <div className="flex items-center text-center flex-col lg:flex-row gap-4 justify-between">
          <div className="hidden sm:flex">
            <Title>O que você está buscando?</Title>
          </div>

          <div className="flex gap-4 lg:w-auto w-full items-center justify-center">
            <div className="overflow-x-auto flex gap-4 w-full sm:w-auto">
              <Controller
                name="modalidade"
                control={control}
                render={({ field }) => (
                  <>
                    <Button
                      onClick={() => field.onChange('distancia')}
                      variant={
                        modalidade === 'distancia' ? 'primary' : 'tertiary'
                      }
                      className="flex-shrink-0 lg:w-auto"
                    >
                      A distância
                    </Button>
                    <Button
                      onClick={() => field.onChange('presencial')}
                      variant={
                        modalidade === 'presencial' ? 'primary' : 'tertiary'
                      }
                      className="flex-shrink-0 lg:w-auto"
                    >
                      Presencial
                    </Button>
                    <Button
                      onClick={() => field.onChange('semipresencial')}
                      variant={
                        modalidade === 'semipresencial' ? 'primary' : 'tertiary'
                      }
                      className="flex-shrink-0 lg:w-auto"
                    >
                      Semipresencial
                    </Button>
                  </>
                )}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between flex-col lg:flex-row items-center gap-8 w-full ">
            <div className="w-full">
              <ComboBox
                control={control}
                name="course"
                options={courseOptions}
                placeholder="Digite o curso"
              />
            </div>
            <div className="w-full">
              <ComboBox
                control={control}
                name="city"
                options={cityOptions}
                placeholder="Digite uma cidade"
                onInputChange={(inputValue) => handleCityChange(inputValue)}
              />
            </div>
            <Button type="submit" variant="secondary" className="w-3/5">
              Buscar
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default Filter
