import { api } from "./axios"

export interface CreateMarketing {
  email: string
  city: string
  state: string
  courseId: string
  courseName: string
  brand: string
  modality: string
  unitId: string
  cpf: string
  phone: string
  name: string
  firstName: string
  offerId: string
  typeCourse: string
  paid: string
  cep: string
  channel: string
}

export async function postMarketing(studentData: CreateMarketing) {
  try {
    const response = await api.post('/marketing/subscribe', studentData)
    return response.data
  } catch (error) {
    console.error('Error creating student:', error)
    throw error
  }
}
