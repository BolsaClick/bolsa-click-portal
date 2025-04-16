import { api } from "./axios"

export async function getShowFiltersCourses(
  modalidade: string,
  courseId: string,
  city: string,
  state: string,
) {
  const response = await api.get('core/showCourseFilter', {
    params: {
      modalidade,
      courseId,
      city,
      state,
    },
  })
  return response.data
}
