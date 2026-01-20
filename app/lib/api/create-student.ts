import { elysium } from './axios'

export interface CreateStudentRequest {
  name: string
  cpf: string
  email: string
  phone: string
  courseNames: string[]
}

export interface CreateStudentResponse {
  id?: string
  message?: string
  success?: boolean
}

/**
 * Cadastra um estudante na API Elysium
 * @param studentData - Dados do estudante
 * @returns Resposta da API
 */
export async function createStudent(studentData: CreateStudentRequest): Promise<CreateStudentResponse> {
  try {
    const response = await elysium.post<CreateStudentResponse>('/students', studentData)
    return response.data
  } catch (error: unknown) {
    console.error('Erro ao cadastrar estudante:', error)
    throw error
  }
}

