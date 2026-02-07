export interface CreateLeadRequest {
  name: string
  cpf: string
  email: string
  phone: string
  courseNames?: string[]
  courseId?: string
  courseName?: string
  institutionName?: string
  modalidade?: string
}

export interface CreateLeadResponse {
  lead?: {
    id: string
    name: string
    cpf: string
    email: string
    phone: string
    courseNames: string[]
    courseId: string | null
    courseName: string | null
    institutionName: string | null
    modalidade: string | null
    status: string
    createdAt: string
  }
  message?: string
  error?: string
}

/**
 * Cadastra um lead (interessado) na API interna
 * Substitui a chamada para o Elysium
 * @param leadData - Dados do lead
 * @returns Resposta da API
 */
export async function createLead(leadData: CreateLeadRequest): Promise<CreateLeadResponse> {
  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao cadastrar lead')
    }

    return data
  } catch (error: unknown) {
    console.error('Erro ao cadastrar lead:', error)
    throw error
  }
}
