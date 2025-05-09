/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from '@/app/components/atoms/Container'
import CourseCard from '@/app/components/atoms/CourseCard'
import { CourseJsonLd } from 'next-seo'
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import React from 'react'

async function getCourseIdBySlug(slug: string): Promise<string> {
  const response = await fetch('https://api.inovit.io/api/core/showCourse', {
    next: { revalidate: 3600 },
  })
  const courses = await response.json()
  const found = courses.find((c: any) =>
    c.name.toLowerCase().replace(/\s+/g, '-') === slug
  )
  return found?.courseId || ''
}

export default async function CursosPage({
  params,
}: {
  params: { slug: string; modalidade: string; cidadeEstado: string }
}) {
  const [cityRaw, state] = params.cidadeEstado.split('-')
  const city = decodeURIComponent(cityRaw)
  const slug = decodeURIComponent(params.slug)
  const modalidade = decodeURIComponent(params.modalidade)

  const courseName = slug.replace(/-/g, ' ')
  const courseId = await getCourseIdBySlug(slug)

  const data = await getShowFiltersCourses(modalidade, courseId, city, state)
  const coursesHere = data?.courses || []

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

  return (
    <Container>
      {filteredCourses.length > 0 && (
        <section aria-label="Cursos com bolsa">
          <h1 className="text-2xl md:text-3xl font-bold text-bolsa-primary text-center mt-10">
            Cursos de {courseName} com até 80% de desconto em {city} - {state}
          </h1>
        </section>
      )}

      {filteredCourses.length === 0 ? (
        <div className="text-center w-full flex justify-center items-center flex-col h-screen text-gray-700">
          <p className="text-lg font-semibold mb-4">
            Infelizmente, não encontramos cursos disponíveis para a modalidade &quot;{modalidade}&quot;.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Mas não se preocupe, você pode explorar outras modalidades:
          </p>
          <ul className="space-y-2">
            {['distancia', 'presencial', 'semipresencial'].map((tipo) => {
              const url = `/cursos/${slug}/${tipo}/${params.cidadeEstado}`
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
      ) : (
        <form>
          <div className="mt-10 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course: any, index: number) => (
              <React.Fragment key={`fragment-${course.id || index}`}>
                <CourseCard
                  course={course}
                  courseName={courseName || course.courseName}
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
      )}
    </Container>
  )
}
