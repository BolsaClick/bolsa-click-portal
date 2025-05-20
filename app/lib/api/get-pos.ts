import { api } from "./axios"

interface CourseResponse {
  id: string
  name: string
  courseIds: string[]
}
export async function getShowPos() {
  const response = await api.get<CourseResponse[]>('/core/showCoursePos')
  return response.data
}
