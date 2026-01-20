import { tartarus } from "./axios"

interface CourseResponse {
  id: string
  name: string
  slug: string
  academicLevel: string
  createdAt: string
  updatedAt: string
}

export async function getShowCourses(academicLevel?: string) {
  const params = academicLevel ? { academicLevel } : {}
  const response = await tartarus.get<CourseResponse[]>('/courses', { params })
  
  const sortedData = response.data.sort((a, b) => 
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
  )
  
  return sortedData
}