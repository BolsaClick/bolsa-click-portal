import { tartarus } from "./axios"


interface City {
  city: string
  state: string
}

interface GetCitiesResponse {
  data: City[]
}

export async function getLocalities(city: string) {
  const response = await tartarus.get<GetCitiesResponse>(
    `cogna/courses/locations?search=${city}`,
  )
  return response.data
}
