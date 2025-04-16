/* eslint-disable @typescript-eslint/no-explicit-any */
import { cogna } from "./axios"


export interface Address {
  bairro: string
  cep: string
  complemento: string
  logradouro: string
  municipio: string
  numero: number
  uf: string
}

export interface PersonalData {
  nome: string
  rg: string
  sexo: string
  cpf: string
  celular: string
  dataNascimento: string
  email: string
  necessidadesEspeciais: any[]
  endereco: Address
}

export interface Enem {
  isUsed: boolean
}

export interface CourseOffer {
  offerId: string
  offerBusinessKey: string
  shift: string
  subscriptionValue: string
  montlyFeeFrom: string
  montlyFeeTo: string
  expiredAt: string
  weekday: string
  classTimeStart: string
  classTimeEnd: string
  brand: string
  course: string
  courseId: string
  unit: string
  unitId: string
  unitAddress: string
  unitCity: string
  unitState: string
  modality: string
  viewShift: string
  lateEnrollment: boolean
  cityId: string
  stateId: string
  degree: string
  promoter: string
  id: string
  type: string
}

export interface Enrollment {
  aceiteTermo: boolean
  anoConclusao: number
  enem: Enem
  receberEmail: boolean
  receberSMS: boolean
  receberWhatsApp: boolean
  courseOffer: CourseOffer
}

export interface CreateStudent {
  dadosPessoais: PersonalData
  inscricao: Enrollment
  promoterId: string
  idSalesChannel: number
  canal: string
}

export async function createStudentCogna(studentData: CreateStudent) {
  try {
    const response = await cogna.post(
      'candidate/v2/storeCandidateWeb',
      studentData,
    )
    return response.data
  } catch (error) {
    console.error('Error creating student:', error)
    throw error
  }
}
