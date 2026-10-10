import { z } from 'zod'
import { validarCPF } from '@/utils/cpf-validate'

/**
 * Captação mínima do candidato — o MESMO schema nos dois checkouts (Cogna e
 * Estácio). Extraído sem alteração de `app/checkout/matricula/
 * MatriculaCheckoutClient.tsx`, que é o fluxo mais maduro: já tinha zod,
 * validação testada em produção e os fixes de 08/10 (birthDate travando o
 * envio em silêncio).
 *
 * Os 5 campos são os que o parceiro cruza com a Receita + contato. O que cada
 * parceiro exige além disso NÃO entra aqui: vai no adaptador de payload
 * (`partner-payload.ts`) ou, no caso do endereço da Estácio, num bloco próprio
 * do checkout dela — ver o comentário em `buildAthenaEnrollment`.
 */
export const candidateSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  name: z
    .string()
    .min(3, 'Informe o nome completo')
    .transform((val) => val.trim()),
  cpf: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 11, 'CPF inválido')
    .refine((val) => validarCPF(val), { message: 'CPF inválido' }),
  // DD-MM-AAAA (é o formato que a Cogna recebe; a Athena recebe ISO, ver
  // `birthDateToIso`).
  birthDate: z
    .string()
    .refine(
      (val) => {
        const regex = /^\d{2}-\d{2}-\d{4}$/
        if (!regex.test(val)) return false
        const [day, month, year] = val.split('-').map(Number)
        const birth = new Date(year, month - 1, day)
        if (
          birth.getFullYear() !== year ||
          birth.getMonth() !== month - 1 ||
          birth.getDate() !== day
        ) return false
        const today = new Date()
        if (year < 1930 || year > today.getFullYear()) return false
        let age = today.getFullYear() - year
        const hadBirthday =
          today.getMonth() > birth.getMonth() ||
          (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate())
        if (!hadBirthday) age--
        return age >= 15
      },
      { message: 'Data de nascimento inválida. O candidato deve ter mais de 15 anos.' }
    ),
  phone: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine(
      (val) => val.length === 11 && val[2] === '9',
      'Informe um celular válido no formato (99) 99999-9999'
    ),
})

/** Valores como saem do formulário (antes do transform do zod). */
export type CandidateFormValues = z.input<typeof candidateSchema>
/** Valores validados (CPF e telefone só com dígitos, nome aparado). */
export type CandidateData = z.output<typeof candidateSchema>

export const CANDIDATE_DEFAULT_VALUES: CandidateFormValues = {
  email: '',
  name: '',
  cpf: '',
  birthDate: '',
  phone: '',
}

/** "31-12-2000" → "2000-12-31" (formato do CreateEnrollmentDto da Athena). */
export function birthDateToIso(ddmmyyyy: string): string | undefined {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(ddmmyyyy)
  return match ? `${match[3]}-${match[2]}-${match[1]}` : undefined
}

export const maskCpf = (value: string) =>
  value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')

export const maskBirthDate = (value: string) =>
  value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1-$2')
    .replace(/(\d{2})-(\d{2})(\d)/, '$1-$2-$3')
    .slice(0, 10)

export const maskCep = (value: string) =>
  value
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2')
