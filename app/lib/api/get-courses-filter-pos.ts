import { cogna } from "./axios"

export async function getShowFiltersCoursesPos(courseId: string) {
  const response = await cogna.get(
    `offers/showOffersByCourseByLocality/${courseId}/9314/all?app=DC`,
    {
      params: {
        courseId,
      },
    },
  )
  return response.data
}
