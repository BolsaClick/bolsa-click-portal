import { api } from './axios'

interface CourseSearchResponse {
  courseId: string
  courseName: string
  modality: string
  unitCity: string
  unitState: string
}

export async function getCoursesByKeyword(keyword: string): Promise<CourseSearchResponse[]> {
  const response = await api.get<{ courses: CourseSearchResponse[] }>(
    `/core/search?q=${encodeURIComponent(keyword)}`
  )
  return response.data.courses
}
