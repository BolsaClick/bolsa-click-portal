import { tartarus } from './axios'

export interface CreateInscriptionRequest {
  inscription: {
    acceptTerms: boolean
    acceptReceiveEmail: boolean
    acceptReceiveSMS: boolean
    acceptReceiveWhatsApp: boolean
    graduationYear: number
    offers: {
      firstOption: {
        idDMH: string
        businessKey: string
        selectedDay?: string[]
        academicLevel: string
        ingressType: string[]
      }
    }
    offerSource: string
    /** Pós-graduação: id da parcela escolhida e dia de vencimento */
    paymentMethod?: { id: string; dueDay: string; voucher?: string; voucherId?: number }
  }
  personalData: {
    name: string
    cpf: string
    gender: string
    highSchoolGraduationYear: number
    rg: string
    birthDate: string
    email: string
    mobile: string
    address: {
      street: string
      number: string
      complement?: string
      neighborhood: string
      zipCode: string
      state: string
      city: string
    }
  }
}

export interface CreateInscriptionResponse {
  id?: string
  message?: string
  success?: boolean
}

// Removida função mapDayToPortuguese - os dias devem ser enviados em inglês

/**
 * Cria uma inscrição no Tartarus
 * @param inscriptionData - Dados da inscrição
 * @param promoterId - ID do promotor
 * @param system - Sistema (padrão: "DC")
 * @returns Resposta da API
 */
export async function createInscription(
  inscriptionData: CreateInscriptionRequest,
  promoterId: string,
  system: string = 'DC'
): Promise<CreateInscriptionResponse> {
  try {
    const params = {
      promoterId,
      system,
    }

    const response = await tartarus.post<CreateInscriptionResponse>(
      'cogna/courses/create-inscription',
      inscriptionData,
      { params }
    )

    return response.data
  } catch (error: unknown) {
    console.error('Erro ao criar inscrição:', error)
    throw error
  }
}

/**
 * Helper para construir o payload de inscrição
 */
export function buildInscriptionPayload(
  formData: {
    name: string
    cpf: string
    gender: string
    schoolYear: string
    rg: string
    birthDate: string
    email: string
    phone: string
    address: string
    addressNumber: string
    neighborhood?: string
    city?: string
    state?: string
    cep: string
  },
  offerDetails: {
    dmhId?: string
    businessKey?: string
    dmhSource?: {
      businessKey?: string
      source?: string
    }
    academicLevel?: string
    /** Tipos de ingresso (ex.: ["ISENTO_VESTIBULAR"] para pós; ["VESTIBULAR"] para graduação). Se mais de um, enviar todos. */
    ingressType?: string[]
    schedules?: Array<{
      day: string
      startHour: string
      endHour: string
    }>
    shift?: string
  },
  paymentMethod?: { id: string; dueDay: string; voucher?: string; voucherId?: number }
): CreateInscriptionRequest {
  // Limpar formatação
  const cleanCpf = formData.cpf.replace(/\D/g, '')
  const cleanPhone = formData.phone.replace(/\D/g, '')
  const cleanCep = formData.cep.replace(/\D/g, '')
  
  // Converter data de DD-MM-YYYY para YYYY-MM-DD
  const [day, month, year] = formData.birthDate.split('-')
  const formattedBirthDate = `${year}-${month}-${day}`

  // Converter ano de conclusão
  const graduationYear = formData.schoolYear ? parseInt(formData.schoolYear, 10) : new Date().getFullYear()

  // Mapear gênero
  const genderMap: Record<string, string> = {
    masculino: 'M',
    feminino: 'F',
    outro: 'O',
  }
  const gender = genderMap[formData.gender] || 'M'

  // Mapear dias selecionados (só se não for VIRTUAL) - manter em inglês
  let selectedDay: string[] | undefined
  if (offerDetails.shift !== 'VIRTUAL' && offerDetails.schedules && offerDetails.schedules.length > 0) {
    // Remover duplicatas e manter em inglês (MONDAY, TUESDAY, etc.)
    const uniqueDays = Array.from(new Set(offerDetails.schedules.map((schedule) => schedule.day)))
    selectedDay = uniqueDays
  }

  return {
    inscription: {
      acceptTerms: true,
      acceptReceiveEmail: true,
      acceptReceiveSMS: true,
      acceptReceiveWhatsApp: true,
      graduationYear,
      offers: {
        firstOption: {
          idDMH: offerDetails.dmhId || '',
          // businessKey pode vir de: dmhSource.businessKey, businessKey direto, ou dmhId como fallback
          businessKey: offerDetails.dmhSource?.businessKey || offerDetails.businessKey || offerDetails.dmhId || '',
          selectedDay,
          academicLevel: offerDetails.academicLevel || 'GRADUACAO',
          // Pós: ISENTO_VESTIBULAR (ou os que vierem em offerDetails.ingressType). Graduação: VESTIBULAR. Se tiver mais de um, enviar todos.
          ingressType:
            offerDetails.ingressType && offerDetails.ingressType.length > 0
              ? offerDetails.ingressType
              : offerDetails.academicLevel === 'POS_GRADUACAO'
                ? ['ISENTO_VESTIBULAR']
                : ['VESTIBULAR'],
        },
      },
      offerSource: offerDetails.dmhSource?.source || 'ATHENAS',
      ...(paymentMethod && { paymentMethod }),
    },
    personalData: {
      name: formData.name,
      cpf: cleanCpf,
      gender,
      highSchoolGraduationYear: graduationYear,
      rg: formData.rg.replace(/[^a-zA-Z0-9]/g, ''),
      birthDate: formattedBirthDate,
      email: formData.email,
      mobile: cleanPhone,
      address: {
        street: formData.address,
        number: formData.addressNumber,
        complement: formData.neighborhood || '',
        neighborhood: formData.neighborhood || '',
        zipCode: cleanCep,
        state: formData.state || '',
        city: formData.city || '',
      },
    },
  }
}

