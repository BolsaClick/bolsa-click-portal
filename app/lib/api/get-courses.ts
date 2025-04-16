import { api } from "./axios"

interface CourseResponse {
  id: string
  name: string
  courseIds: string[]
}
export async function getShowCourses() {
  const response = await api.get<CourseResponse[]>('/core/showCourse')
  return response.data
}
