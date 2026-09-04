import { isAxiosError } from 'axios'
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

export interface CanCreateInscriptionResponse {
  inscriptionAllowed: boolean
  message?: string
}

// Removida função mapDayToPortuguese - os dias devem ser enviados em inglês

/**
 * Extrai a mensagem de erro real vinda da Cogna (via Tartarus) de um erro do
 * axios, em vez do texto genérico ("Request failed with status code 400").
 */
export function getCognaErrorMessage(error: unknown): string | undefined {
  if (!isAxiosError(error)) return undefined
  const data = error.response?.data as
    | { cognaError?: { message?: string }; message?: string }
    | undefined
  return data?.cognaError?.message ?? data?.message
}

/**
 * Detalhe bruto do erro pra telemetria (checkout_inscription_failed): mensagens
 * como "Não foi possível criar a inscrição" são genéricas — a causa real
 * costuma estar no corpo/status da resposta. Trunca pra não estourar o evento.
 */
export function getCognaErrorDetails(error: unknown): { status?: number; body?: string } {
  if (!isAxiosError(error)) return {}
  let body: string | undefined
  try {
    body = JSON.stringify(error.response?.data)?.slice(0, 800)
  } catch {
    body = undefined
  }
  return { status: error.response?.status, body }
}

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
 * Verifica na Cogna se o CPF já possui inscrição ativa para essa oferta,
 * ANTES de criar a inscrição de fato — trava de duplicidade no checkout.
 * `idDMH` é o mesmo id usado em `offers.firstOption.idDMH` no
 * create-inscription (offerDetails.dmhId), não o idDmhElastic (esse é
 * específico do marketplace ATHENAS, endpoint separado).
 *
 * Chamada pensada para "fail-open": deixe o caller decidir o que fazer se a
 * request falhar (rede/timeout/5xx) — não travar o candidato por uma falha
 * de infraestrutura numa pré-checagem. A Cogna valida de novo, com força,
 * no próprio create-inscription.
 */
export async function canCreateInscription(
  cpf: string,
  idDMH: string,
  system: string = 'DC'
): Promise<CanCreateInscriptionResponse> {
  const cleanCpf = cpf.replace(/\D/g, '')
  const response = await tartarus.get<CanCreateInscriptionResponse>(
    'cogna/courses/can-create-inscription',
    { params: { cpf: cleanCpf, system, idDMH } }
  )
  return response.data
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
    /** Fonte do catálogo vinda no topo do detalhe da oferta (ATHENAS, COSMOS…). */
    source?: string
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
      // Fonte do catálogo. O `dmhSource` é nulo em todo o catálogo COSMOS
      // (100% dos profissionalizantes), e sem o fallback abaixo a inscrição
      // saía declarada como ATHENAS — informação errada, já que a própria
      // oferta responde `source: "COSMOS"`. O padrão ATHENAS fica por último,
      // para não mudar o comportamento de quem não manda fonte nenhuma.
      offerSource: offerDetails.dmhSource?.source || offerDetails.source || 'ATHENAS',
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

