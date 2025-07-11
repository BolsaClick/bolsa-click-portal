 
import CoursesClient from './CoursesClient'
import { Suspense } from 'react'

export default function CursosPage() {
  return (
    <Suspense fallback={<div className="p-4 text-gray-500">Carregando cursos...</div>}>
      <CoursesClient />
    </Suspense>
  )
}
