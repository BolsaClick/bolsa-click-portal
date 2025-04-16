/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useSearchParams, useRouter } from 'next/navigation'
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import Container from '@/app/components/atoms/Container'
import Skeleton from '@/app/components/atoms/Skeleton'
import CourseCard from '@/app/components/atoms/CourseCard'
import { CourseJsonLd } from 'next-seo'
import React from 'react'

export default function CoursesClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { handleSubmit, setValue } = useForm()

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
    <Container>
      
      {filteredCourses.length > 0 && (
        <section aria-label="Cursos com bolsa">
          <h1 className="text-2xl md:text-3xl font-bold text-bolsa-primary text-center mt-10">
            {courseName
              ? `Cursos de ${courseName} com até 80% de desconto${city && state ? ` em ${city} - ${state}` : ''}`
              : 'Todos os cursos com bolsa de estudo disponíveis'}
          </h1>
        </section>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {filteredCourses.length === 0 && !isLoading && (
          <div className="text-center w-full flex justify-center items-center flex-col h-screen text-gray-700">
            <p className="text-lg font-semibold mb-4">
              Infelizmente, não encontramos cursos disponíveis para a modalidade &quot;{modalidade}&quot;.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Mas não se preocupe, você pode explorar outras modalidades:
            </p>
            <ul className="space-y-2">
              {['distancia', 'presencial', 'semipresencial'].map((tipo) => {
                const url = `/cursos?modalidade=${tipo}&course=${courseId}&courseName=${encodeURIComponent(courseName)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`
                return (
                  <li key={tipo}>
                    <a href={url} className="text-blue-500 hover:underline capitalize">
                      {tipo === 'distancia' ? 'A distância' : tipo === 'presencial' ? 'Presencial' : 'Semipresencial'}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
        <div className="mt-10 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 12 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="bg-white shadow-lg rounded-lg overflow-hidden w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <Skeleton width="48px" height="48px" round />
                  <Skeleton width="64px" />
                </div>
                <Skeleton width="75%" />
                <div className="flex mt-2 justify-between items-center mb-4 text-sm text-gray-500">
                  <div className="flex flex-col w-3/4">
                    <Skeleton height="16px" className="mb-2" />
                    <Skeleton height="16px" width="75%" className="mb-2" />
                  </div>
                  <Skeleton height="16px" width="96px" />
                </div>
                <div className="flex justify-start gap-2 items-center mb-4">
                  <Skeleton height="24px" width="96px" />
                </div>
                <div className="flex justify-center mt-4">
                  <Skeleton height="40px" width="160px" />
                </div>
              </div>
            ))
            : filteredCourses.map((course: any, index: number) => (
              <React.Fragment key={`fragment-${course.id || index}`}>
              <CourseCard
                course={course}
                courseName={courseName || course.courseName}
                setFormData={setValue}
                triggerSubmit={handleSubmit(onSubmit)}
              />
              <CourseJsonLd
                courseName={course.courseName}
                description={`Bolsa de estudo para o curso de ${course.courseName} em ${course.unitCity} - ${course.unitState}`}
                provider={{
                  name: 'Bolsa Click',
                  url: 'https://www.bolsaclick.com.br',
                }}
              />
            </React.Fragment>
            ))}
        </div>
      </form>
    </Container>
  )
}
