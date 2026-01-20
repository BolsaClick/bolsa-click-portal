import { tartarus } from './axios'

export interface ValidateCpfParams {
  cpf: string
  system?: string
  offerSource?: string
  academicLevel?: string
}

export interface ValidateCpfResponse {
  inscriptionAllowed: boolean
  haveAnotherInscriptionInCycle: boolean
  message: string
}

/**
 * Valida se um CPF pode ser cadastrado
 * @param cpf - CPF do candidato (apenas números)
 * @param system - Sistema (padrão: "DC")
 * @param offerSource - Origem da oferta (opcional)
 * @param academicLevel - Nível acadêmico (opcional)
 * @returns Resposta da validação com informações sobre se pode cadastrar
 */
export async function validateCpf(
  cpf: string,
  system: string = 'DC',
  offerSource?: string,
  academicLevel?: string
): Promise<ValidateCpfResponse> {
  // Remover formatação do CPF
  const cleanCpf = cpf.replace(/\D/g, '')

  if (cleanCpf.length !== 11) {
    throw new Error('CPF inválido')
  }

  const params: Record<string, string> = {
    cpf: cleanCpf,
    system,
  }

  if (offerSource) {
    params.offerSource = offerSource
  }

  if (academicLevel) {
    params.academicLevel = academicLevel
  }

  const response = await tartarus.get<ValidateCpfResponse>('cogna/courses/can-create-inscription', {
    params,
  })

  return response.data
}

