'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCoursesByKeyword } from '@/app/lib/api/get-courses-by-keyword'
import { useGeoLocation } from '@/app/context/GeoLocationContext'

export default function BuscarCursos() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q')
  const [loading, setLoading] = useState(true)

  const { state, town } = useGeoLocation()

  useEffect(() => {
    const fetchAndRedirect = async () => {
      if (!query) return

      // fallback fixo
      const defaultCity = 'São Paulo'
      const defaultState = 'SP'

      // pega localização do hook (se disponível)
      const city = town || defaultCity
      const uf = state || defaultState

      try {
        const results = await getCoursesByKeyword(query)

        if (results && results.length > 0) {
          const course = results[0]
          const url = `/cursos?modalidade=${course.modality}&course=${course.courseId}&courseName=${encodeURIComponent(course.courseName)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(uf)}`
          router.replace(url)
        } else {
          router.replace(`/cursos?q=${query}`)
        }
      } catch (err) {
        console.error('Erro ao buscar curso:', err)
        router.replace(`/cursos?q=${query}`)
      } finally {
        setLoading(false)
      }
    }

    fetchAndRedirect()
  }, [query, router, state, town])

  return (
    <div className="flex justify-center items-center h-screen">
      {loading ? (
        <p className="text-gray-600 text-lg">
          Procurando cursos para <strong>{query}</strong>...
        </p>
      ) : (
        <p className="text-gray-600 text-lg">
          Redirecionando para cursos correspondentes...
        </p>
      )}
    </div>
  )
}
