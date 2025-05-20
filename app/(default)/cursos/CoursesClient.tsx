/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useSearchParams, useRouter } from 'next/navigation'
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import Container from '@/app/components/atoms/Container'
import React, { useState } from 'react'
import CourseCardNew from '@/app/components/CourseCardNew'
import { ArrowLeft,  LayoutGrid, LayoutList } from 'lucide-react'

export default function CoursesClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { handleSubmit, setValue } = useForm()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const modalidade = searchParams.get('modalidade') || ''
  const courseId = searchParams.get('course') || ''
  const courseName = searchParams.get('courseName') || ''
  const city = searchParams.get('city') || ''
  const state = searchParams.get('state') || ''

  const { data: showCourses, isLoading } = useQuery({
    queryFn: () => getShowFiltersCourses(modalidade, courseId, city, state),
    queryKey: ['courses', modalidade, courseId, city, state],
  })

  const coursesHere = showCourses?.courses || []

  const filteredCourses = coursesHere.reduce((acc: any[], course: any) => {
    const pushUnique = (arr: any[], data: any, modality: string) => {
      if (!arr.some((item) => item.courseId === course.courseId && item.modality === modality)) {
        arr.push({ ...data, courseName: course.courseName })
      }
    }

    if (!courseName) {
      if (course.distancia) pushUnique(acc, course.distancia.data[0], 'A distância')
      if (course.presencial) pushUnique(acc, course.presencial.data[0], 'Presencial')
      if (course.semipresencial) pushUnique(acc, course.semipresencial.data[0], 'Semipresencial')
    } else {
      if (course.distancia) acc.push(...course.distancia.data.map((unit: any) => ({ ...unit, courseName: course.courseName })))
      if (course.presencial) acc.push(...course.presencial.data.map((unit: any) => ({ ...unit, courseName: course.courseName })))
      if (course.semipresencial) acc.push(...course.semipresencial.data.map((unit: any) => ({ ...unit, courseName: course.courseName })))
    }

    return acc
  }, [])

  const onSubmit = (data: any) => {
    localStorage.setItem('selectedCourse', JSON.stringify(data))
    router.push('/checkout/')
  }

  return (
    <div className='pb-6'>
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

           
          </div>
        </div>
      </header>
    <Container>
      
      {filteredCourses.length > 0 && (
        <section aria-label="Cursos com bolsa Bolsa Click" className='pb-6'>
          <h1 className="text-2xl md:text-3xl font-bold text-bolsa-primary text-center mt-10">
            Todos os cursos com bolsa de estudo disponíveis
          </h1>
        </section>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>

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
                {filteredCourses.map((course: any, index: number) => (
                  <CourseCardNew
                    key={index}
                    courseName={course.courseName}
                    course={course}
                    setFormData={setValue}
                    viewMode={viewMode}
                    triggerSubmit={handleSubmit(onSubmit)}
                  />
                ))}
              </div>
            )}

      </form>
    </Container>
    </div>
  )
}
