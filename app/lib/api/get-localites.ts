import { api } from "./axios"


interface City {
  city: string
  state: string
}

interface GetCitiesResponse {
  data: City[]
}

export async function getLocalities(city: string) {
  const response = await api.get<GetCitiesResponse>(
    `core/getLocalities?q=${city}`,
  )
  return response.data
}
